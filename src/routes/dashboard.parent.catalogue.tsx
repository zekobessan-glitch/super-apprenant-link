import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Crown, Lock, MapPin, GraduationCap, Loader2, MessageCircle, CheckCircle2, BookOpen, Brain } from "lucide-react";
import { computeMatchScore, classeToNiveau } from "@/lib/matching";
import { ZONES } from "@/lib/constants";
import { toast } from "sonner";

export const Route = createFileRoute("/dashboard/parent/catalogue")({
  component: ParentCatalogue,
});

function ParentCatalogue() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [apprenant, setApprenant] = useState<any>(null);
  const [encadreurs, setEncadreurs] = useState<any[]>([]);
  const [credits, setCredits] = useState(0);
  const [debloques, setDebloques] = useState<Set<string>>(new Set());
  const [unlocking, setUnlocking] = useState<string | null>(null);

  const reload = async () => {
    if (!user) return;
    const [
      { data: app },
      { data: encs },
      { data: cred },
      { data: corr },
    ] = await Promise.all([
      supabase.from("apprenants").select("*").eq("parent_id", user.id).maybeSingle(),
      supabase.from("public_encadreurs" as any).select("*"),
      supabase.from("contacts_credits").select("credits_restants").eq("parent_id", user.id).maybeSingle(),
      supabase.from("correspondances").select("encadreur_id, contact_debloque").eq("parent_id", user.id),
    ]);
    setApprenant(app);
    const profileIds = (encs ?? []).map((e: any) => e.profile_id);
    const { data: pubProfiles } = profileIds.length
      ? await supabase.from("public_profiles" as any).select("id, nom, prenoms, photo_url").in("id", profileIds)
      : { data: [] as any[] };
    const profMap: Record<string, any> = Object.fromEntries((pubProfiles ?? []).map((p: any) => [p.id, p]));
    const unlockedIds = (corr ?? []).filter((c) => c.contact_debloque).map((c) => c.encadreur_id);
    setEncadreurs((encs ?? []).map((e: any) => ({
      ...e,
      profiles: profMap[e.profile_id] ?? {},
    })));
    setCredits(cred?.credits_restants ?? 0);
    setDebloques(new Set(unlockedIds));
    setLoading(false);
  };

  useEffect(() => { reload(); }, [user]);

  const sorted = useMemo(() => {
    if (!apprenant) return [];
    return encadreurs
      .map((e) => ({
        enc: e,
        score: computeMatchScore(
          {
            zone: apprenant.zone_residence,
            niveau: apprenant.niveau,
            classe: apprenant.classe,
            serie: apprenant.serie,
            matieres: apprenant.matieres ?? [],
            profil_apprentissage: apprenant.profil_apprentissage,
          },
          {
            zone: e.zone_residence,
            niveaux: e.niveaux ?? [],
            classes_primaire: e.classes_primaire ?? [],
            classes_college: e.classes_college ?? [],
            classes_lycee: e.classes_lycee ?? [],
            series_lycee: e.series_lycee ?? [],
            matieres_college: e.matieres_college ?? [],
            matieres_lycee: e.matieres_lycee ?? [],
            profil_pedagogique: e.profil_pedagogique,
          }
        ),
      }))
      .filter((x) => x.score >= 30)
      .sort((a, b) => b.score - a.score);
  }, [apprenant, encadreurs]);

  const unlock = async (enc: any) => {
    if (!user) return;
    if (credits < 1) {
      toast.error("Aucun crédit disponible. Achetez un pack pour débloquer ce contact.");
      return;
    }
    setUnlocking(enc.profile_id);
    const { error } = await supabase.from("correspondances").upsert({
      parent_id: user.id,
      encadreur_id: enc.profile_id,
      apprenant_id: apprenant.id,
      statut: "debloquee",
      initiateur: "parent",
      contact_debloque: true,
    }, { onConflict: "encadreur_id,parent_id,apprenant_id" });

    if (error) { setUnlocking(null); return toast.error(error.message); }

    await supabase.from("contacts_credits").update({ credits_restants: credits - 1 }).eq("parent_id", user.id);
    const encNom = `${enc.profiles?.prenoms ?? ""} ${enc.profiles?.nom ?? ""}`.trim();
    await supabase.from("notifications").insert([
      {
        user_id: enc.profile_id,
        titre: "Nouveau parent intéressé",
        message: `Un parent a payé pour débloquer votre contact et souhaite être contacté pour ${apprenant.prenoms} ${apprenant.nom} (${apprenant.classe}).`,
        lien: "/dashboard/encadreur/correspondances",
      },
      {
        user_id: user.id,
        titre: "Demande envoyée",
        message: `Votre demande a bien été transmise${encNom ? ` à ${encNom}` : ""}. L'encadreur vous contactera prochainement.`,
        lien: "/dashboard/parent/correspondances",
      },
    ]);
    toast.success("Contact débloqué ! L'encadreur a été notifié.");
    setUnlocking(null);
    reload();
  };

  if (loading) return <div className="p-6 flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin" /> Chargement...</div>;
  if (!apprenant) return <div className="p-6"><Card className="p-6">Aucun apprenant enregistré.</Card></div>;

  return (
    <div className="p-6 space-y-4">
      <div className="flex flex-wrap justify-between gap-3 items-start">
        <div>
          <h1 className="text-3xl font-bold text-primary">Catalogue des encadreurs</h1>
          <p className="text-muted-foreground">
            {sorted.length} encadreur(s) compatible(s) avec {apprenant.prenoms} {apprenant.nom}
          </p>
        </div>
        <Card className="px-4 py-2 bg-accent-gradient text-accent-foreground border-0">
          <div className="text-xs">Crédits restants</div>
          <div className="text-xl font-bold">{credits}</div>
        </Card>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {sorted.map(({ enc, score }) => {
          const isDebloque = debloques.has(enc.profile_id);
          return (
            <Card key={enc.id} className="p-5 shadow-soft space-y-3">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold">{enc.profiles?.nom} {enc.profiles?.prenoms}</h3>
                  <p className="text-xs text-muted-foreground capitalize">{enc.genre}</p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <Badge className="bg-brand text-white">{score}% match</Badge>
                  {enc.premium && <Badge className="bg-accent text-accent-foreground gap-1"><Crown className="h-3 w-3" /> Premium</Badge>}
                </div>
              </div>
              <div className="text-sm text-muted-foreground space-y-1">
                <div className="flex items-start gap-1"><MapPin className="h-3.5 w-3.5 mt-0.5" /> {ZONES[enc.zone_residence as keyof typeof ZONES] ?? enc.zone_residence}</div>
                <div className="flex items-start gap-1"><GraduationCap className="h-3.5 w-3.5 mt-0.5" /> {enc.dernier_diplome}</div>
              </div>
              {(() => {
                const niveau = apprenant?.niveau;
                const matieres: string[] = niveau === "college"
                  ? (enc.matieres_college ?? [])
                  : niveau === "lycee"
                  ? (enc.matieres_lycee ?? [])
                  : Array.from(new Set([...(enc.matieres_college ?? []), ...(enc.matieres_lycee ?? [])]));
                if (!matieres.length) return null;
                return (
                  <div className="text-sm text-muted-foreground flex items-start gap-1">
                    <BookOpen className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                    <span>{matieres.join(", ")}</span>
                  </div>
                );
              })()}
              <div className="flex flex-wrap gap-1">
                {enc.niveaux?.map((n: string) => <Badge key={n} variant="outline" className="text-xs capitalize">{n}</Badge>)}
              </div>
              {enc.profil_pedagogique && (
                <div className="text-sm text-muted-foreground flex items-start gap-1">
                  <Brain className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                  <span className="capitalize">Profil pédagogique : {enc.profil_pedagogique}</span>
                </div>
              )}
              {isDebloque ? (
                <div className="bg-muted/50 rounded-lg p-3 text-sm flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                  <span>Demande envoyée. L'encadreur vous contactera prochainement.</span>
                </div>
              ) : (
                <Button
                  onClick={() => unlock(enc)}
                  disabled={unlocking === enc.profile_id || credits < 1}
                  className="w-full bg-brand text-white"
                >
                  {unlocking === enc.profile_id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : credits < 1 ? (
                    <><Lock className="h-4 w-4 mr-2" /> Achetez un pack pour contacter</>
                  ) : (
                    <><MessageCircle className="h-4 w-4 mr-2" /> Contacter</>
                  )}
                </Button>
              )}
            </Card>
          );
        })}
        {sorted.length === 0 && <Card className="p-6 col-span-full text-center text-muted-foreground">Aucun encadreur compatible pour le moment.</Card>}
      </div>
    </div>
  );
}
