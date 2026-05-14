import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, BookOpen, MapPin, GraduationCap, Phone, Mail } from "lucide-react";
import { ZONES } from "@/lib/constants";

export const Route = createFileRoute("/dashboard/parent/correspondances")({
  component: ParentCorrespondances,
});

function ParentCorrespondances() {
  const { user } = useAuth();
  const [rows, setRows] = useState<any[]>([]);
  const [encMap, setEncMap] = useState<Record<string, any>>({});
  const [apprenant, setApprenant] = useState<any>(null);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const [{ data: corrs }, { data: app }] = await Promise.all([
        supabase
          .from("correspondances")
          .select("*, encadreur:profiles!correspondances_encadreur_id_fkey(nom, prenoms, telephone, email)")
          .eq("parent_id", user.id)
          .order("created_at", { ascending: false }),
        supabase.from("apprenants").select("niveau").eq("parent_id", user.id).maybeSingle(),
      ]);
      setRows(corrs ?? []);
      setApprenant(app);
      const encIds = (corrs ?? []).map((c: any) => c.encadreur_id);
      if (encIds.length) {
        const { data: encs } = await supabase
          .from("public_encadreurs" as any)
          .select("profile_id, zone_residence, dernier_diplome, matieres_college, matieres_lycee, niveaux")
          .in("profile_id", encIds);
        setEncMap(Object.fromEntries((encs ?? []).map((e: any) => [e.profile_id, e])));
      }
    })();
  }, [user]);

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-3xl font-bold text-primary">Mes contacts</h1>
      <div className="grid md:grid-cols-2 gap-4">
        {rows.map((r) => {
          const enc = encMap[r.encadreur_id];
          const niveau = apprenant?.niveau;
          const matieres: string[] = enc
            ? niveau === "college"
              ? enc.matieres_college ?? []
              : niveau === "lycee"
              ? enc.matieres_lycee ?? []
              : Array.from(new Set([...(enc.matieres_college ?? []), ...(enc.matieres_lycee ?? [])]))
            : [];
          return (
            <Card key={r.id} className="p-5 space-y-2">
              <div className="flex justify-between">
                <h3 className="font-bold">{r.encadreur?.nom} {r.encadreur?.prenoms}</h3>
                <Badge variant={r.contact_debloque ? "default" : "outline"}>{r.statut}</Badge>
              </div>
              {enc && (
                <div className="text-sm text-muted-foreground space-y-1">
                  <div className="flex items-start gap-1"><MapPin className="h-3.5 w-3.5 mt-0.5" /> {ZONES[enc.zone_residence as keyof typeof ZONES]?.split("(")[0]}</div>
                  {enc.dernier_diplome && <div className="flex items-start gap-1"><GraduationCap className="h-3.5 w-3.5 mt-0.5" /> {enc.dernier_diplome}</div>}
                  {matieres.length > 0 && (
                    <div className="flex items-start gap-1"><BookOpen className="h-3.5 w-3.5 mt-0.5 shrink-0" /> <span>{matieres.join(", ")}</span></div>
                  )}
                  {enc.niveaux?.length > 0 && (
                    <div className="flex flex-wrap gap-1 pt-1">
                      {enc.niveaux.map((n: string) => <Badge key={n} variant="outline" className="text-xs capitalize">{n}</Badge>)}
                    </div>
                  )}
                </div>
              )}
              {r.contact_debloque ? (
                <div className="text-sm space-y-1 pt-2 border-t">
                  {r.encadreur?.telephone && <div className="flex items-center gap-2"><Phone className="h-3.5 w-3.5 text-primary" /> {r.encadreur.telephone}</div>}
                  {r.encadreur?.email && <div className="flex items-center gap-2"><Mail className="h-3.5 w-3.5 text-primary" /> {r.encadreur.email}</div>}
                  <div className="flex items-start gap-2 text-muted-foreground">
                    <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                    <span>Demande envoyée. L'encadreur vous contactera prochainement.</span>
                  </div>
                </div>
              ) : null}
            </Card>
          );
        })}
        {rows.length === 0 && <Card className="p-6 col-span-full text-center text-muted-foreground">Aucun contact.</Card>}
      </div>
    </div>
  );
}
