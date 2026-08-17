import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Crown, Lock, Phone, Mail, MapPin, BookOpen, Loader2, AlertTriangle } from "lucide-react";
import { computeMatchScore } from "@/lib/matching";
import { ZONES } from "@/lib/constants";
import { toast } from "sonner";

export const Route = createFileRoute("/dashboard/encadreur/catalogue")({
  component: EncadreurCatalogue,
});

const MAX_CONTACTS = 5;
const PRICE_CONTACT = 5000;

function EncadreurCatalogue() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [encadreur, setEncadreur] = useState<any>(null);
  const [apprenants, setApprenants] = useState<any[]>([]);
  const [debloques, setDebloques] = useState<Set<string>>(new Set());
  const [unlocking, setUnlocking] = useState<string | null>(null);


  const reload = async () => {
    if (!user) return;
    const [{ data: enc }, { data: apps }, { data: corr }] = await Promise.all([
      supabase.from("encadreurs").select("*").eq("profile_id", user.id).maybeSingle(),
      supabase.from("public_apprenants" as any).select("*"),
      supabase.from("correspondances").select("apprenant_id, parent_id, contact_debloque").eq("encadreur_id", user.id),
    ]);
    setEncadreur(enc);
    const unlockedAppIds = (corr ?? []).filter((c) => c.contact_debloque && c.apprenant_id).map((c) => c.apprenant_id!);
    let nameMap: Record<string, any> = {};
    let parentMap: Record<string, any> = {};
    if (unlockedAppIds.length > 0) {
      const { data: fullApps } = await supabase.from("apprenants").select("id, nom, prenoms, parent_id").in("id", unlockedAppIds);
      nameMap = Object.fromEntries((fullApps ?? []).map((a) => [a.id, a]));
      const parentIds = (fullApps ?? []).map((a) => a.parent_id);
      if (parentIds.length) {
        const { data: parents } = await supabase.from("profiles").select("id, nom, prenoms, email, telephone").in("id", parentIds);
        parentMap = Object.fromEntries((parents ?? []).map((p) => [p.id, p]));
      }
    }
    setApprenants((apps ?? []).map((a: any) => {
      const full = nameMap[a.id];
      return { ...a, nom: full?.nom ?? "—", prenoms: full?.prenoms ?? "", profiles: full ? parentMap[full.parent_id] : undefined };
    }));
    setDebloques(new Set(unlockedAppIds));
    setLoading(false);
  };

  useEffect(() => { reload(); }, [user]);

  // Retour depuis le checkout GeniusPay
  useEffect(() => {
    if (typeof window === "undefined" || !user) return;
    const params = new URLSearchParams(window.location.search);
    const reference = params.get("gp_ref") || sessionStorage.getItem("gp_ref_enc");
    if (!reference) return;
    sessionStorage.removeItem("gp_ref_enc");
    (async () => {
      toast.loading("Vérification du paiement…", { id: "gp-verify" });
      const { data, error } = await supabase.functions.invoke("geniuspay-verify", { body: { reference } });
      toast.dismiss("gp-verify");
      if (error) toast.error("Vérification impossible pour le moment.");
      else if (data?.status === "reussi") toast.success("Contact débloqué !");
      else if (data?.status === "en_attente") toast.info("Paiement en attente de confirmation.");
      else toast.error("Paiement échoué ou annulé.");
      window.history.replaceState({}, "", window.location.pathname);
      reload();
    })();
  }, [user]);


  const sorted = useMemo(() => {
    if (!encadreur) return [];
    return apprenants
      .map((a) => ({
        app: a,
        score: computeMatchScore(
          { zone: a.zone_residence, niveau: a.niveau, classe: a.classe, serie: a.serie, matieres: a.matieres ?? [], profil_apprentissage: a.profil_apprentissage },
          {
            zone: encadreur.zone_residence,
            niveaux: encadreur.niveaux ?? [],
            classes_primaire: encadreur.classes_primaire ?? [],
            classes_college: encadreur.classes_college ?? [],
            classes_lycee: encadreur.classes_lycee ?? [],
            series_lycee: encadreur.series_lycee ?? [],
            matieres_college: encadreur.matieres_college ?? [],
            matieres_lycee: encadreur.matieres_lycee ?? [],
            profil_pedagogique: encadreur.profil_pedagogique,
          }
        ),
      }))
      .filter((x) => x.score > 0)
      .sort((a, b) => b.score - a.score);
  }, [encadreur, apprenants]);

  const unlock = async (a: any) => {
    if (!user || !encadreur) return;
    if (debloques.size >= MAX_CONTACTS) {
      toast.error(`Limite de ${MAX_CONTACTS} contacts atteinte.`);
      return;
    }
    if (!encadreur.premium) {
      // Paiement GeniusPay (checkout hébergé)
      setUnlocking(a.id);
      const returnUrl = `${window.location.origin}${window.location.pathname}`;
      const { data, error } = await supabase.functions.invoke("geniuspay-init", {
        body: {
          montant: PRICE_CONTACT,
          type: "contact_unique_encadreur",
          description: "Déblocage d'un contact parent",
          metadata: { apprenant_id: a.id, parent_id: a.parent_id },
          success_url: returnUrl,
          error_url: returnUrl,
        },
      });
      setUnlocking(null);
      if (error || !data?.checkout_url) {
        toast.error("Impossible d'initier le paiement. Vérifiez la configuration GeniusPay.");
        return;
      }
      sessionStorage.setItem("gp_ref_enc", data.reference);
      window.location.href = data.checkout_url;
      return;
    }


    // Premium : déblocage direct
    setUnlocking(a.id);
    const { error } = await supabase.from("correspondances").upsert({
      encadreur_id: user.id,
      parent_id: a.parent_id,
      apprenant_id: a.id,
      statut: "debloquee",
      initiateur: "encadreur",
      contact_debloque: true,
    }, { onConflict: "encadreur_id,parent_id,apprenant_id" });
    if (error) { setUnlocking(null); return toast.error(error.message); }
    await supabase.from("notifications").insert({
      user_id: a.parent_id,
      titre: "Nouvel encadreur intéressé",
      message: `Un encadreur a manifesté son intérêt pour ${a.prenoms} ${a.nom}.`,
    });
    toast.success("Contact débloqué !");
    setUnlocking(null);
    reload();
  };

  if (loading) return <div className="p-6"><Loader2 className="h-4 w-4 animate-spin" /></div>;
  if (!encadreur) return <div className="p-6"><Card className="p-6">Profil encadreur incomplet.</Card></div>;

  return (
    <div className="p-6 space-y-4">
      <div className="flex flex-wrap justify-between gap-3 items-start">
        <div>
          <h1 className="text-3xl font-bold text-primary">Catalogue des apprenants</h1>
          <p className="text-muted-foreground">{sorted.length} apprenant(s) compatible(s)</p>
        </div>
        <Card className="px-4 py-2 bg-brand text-white border-0">
          <div className="text-xs opacity-80">Contacts débloqués</div>
          <div className="text-xl font-bold">{debloques.size}/{MAX_CONTACTS}</div>
        </Card>
      </div>

      {!encadreur.premium && (
        <Card className="p-4 bg-accent/10 border-accent/30 flex gap-3 items-start">
          <AlertTriangle className="h-5 w-5 text-accent shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="font-medium">Compte standard — paiement par contact</p>
            <p className="text-muted-foreground">Chaque déblocage de contact coûte {PRICE_CONTACT.toLocaleString()} FCFA via GeniusPay. Devenez Premium en suivant la formation Super Apprenant.</p>
          </div>
        </Card>
      )}

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {sorted.map(({ app, score }) => {
          const isDebloque = debloques.has(app.id);
          return (
            <Card key={app.id} className="p-5 shadow-soft space-y-3">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold">{app.prenoms} {app.nom}</h3>
                  <p className="text-xs text-muted-foreground">{app.age} ans • {app.classe}{app.serie ? ` ${app.serie}` : ""}</p>
                </div>
                <Badge className="bg-brand text-white">{score}%</Badge>
              </div>
              <div className="text-sm text-muted-foreground space-y-1">
                <div className="flex items-start gap-1"><MapPin className="h-3.5 w-3.5 mt-0.5" /> {ZONES[app.zone_residence as keyof typeof ZONES] ?? app.zone_residence}</div>
                {app.matieres?.length > 0 && (
                  <div className="flex items-start gap-1"><BookOpen className="h-3.5 w-3.5 mt-0.5" /> {app.matieres.join(", ")}</div>
                )}
              </div>
              {app.profil_apprentissage && <Badge variant="outline">Profil {app.profil_apprentissage}</Badge>}

              {isDebloque ? (
                <div className="bg-muted/50 rounded-lg p-3 text-sm space-y-1">
                  <div className="font-medium">{app.profiles?.nom} {app.profiles?.prenoms} (parent)</div>
                  <div className="flex items-center gap-2"><Phone className="h-3.5 w-3.5 text-primary" /> {app.profiles?.telephone}</div>
                  <div className="flex items-center gap-2"><Mail className="h-3.5 w-3.5 text-primary" /> {app.profiles?.email}</div>
                </div>
              ) : (
                <Button onClick={() => unlock(app)} disabled={unlocking === app.id || debloques.size >= MAX_CONTACTS} className="w-full bg-brand text-white">
                  {unlocking === app.id ? <Loader2 className="h-4 w-4 animate-spin" /> : encadreur.premium ? <><Crown className="h-4 w-4 mr-2" /> Débloquer (gratuit)</> : <><Lock className="h-4 w-4 mr-2" /> {PRICE_CONTACT.toLocaleString()} FCFA</>}
                </Button>
              )}
            </Card>
          );
        })}
        {sorted.length === 0 && <Card className="p-6 col-span-full text-center text-muted-foreground">Aucun apprenant compatible pour le moment.</Card>}
      </div>
    </div>
  );
}
