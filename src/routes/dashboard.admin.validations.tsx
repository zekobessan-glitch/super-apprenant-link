import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

export const Route = createFileRoute("/dashboard/admin/validations")({
  component: Validations,
});

function Validations() {
  const [rows, setRows] = useState<any[]>([]);

  const load = async () => {
    const { data } = await supabase
      .from("encadreurs")
      .select("id, profile_id, formation_super_apprenant, formation_validee, premium, profiles(nom, prenoms, email)")
      .eq("formation_super_apprenant", true);
    setRows(data ?? []);
  };

  useEffect(() => { load(); }, []);

  const validate = async (id: string, profile_id: string) => {
    const { error } = await supabase
      .from("encadreurs")
      .update({ formation_validee: true, premium: true })
      .eq("id", id);
    if (error) return toast.error(error.message);
    await supabase.from("notifications").insert({
      user_id: profile_id,
      titre: "Statut Premium activé",
      message: "Votre formation Super Apprenant a été validée. Vous bénéficiez désormais d'un accès Premium.",
    });
    toast.success("Encadreur validé en Premium");
    load();
  };

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-3xl font-bold text-primary">Validations encadreurs</h1>
      <p className="text-muted-foreground">Encadreurs ayant déclaré la formation Super Apprenant</p>
      <div className="grid md:grid-cols-2 gap-4">
        {rows.map((r) => (
          <Card key={r.id} className="p-5 flex justify-between items-start gap-3">
            <div>
              <h3 className="font-semibold">{r.profiles?.nom} {r.profiles?.prenoms}</h3>
              <p className="text-sm text-muted-foreground">{r.profiles?.email}</p>
              <div className="flex gap-2 mt-2">
                {r.formation_validee ? <Badge className="bg-accent text-accent-foreground">Premium</Badge> : <Badge variant="outline">À valider</Badge>}
              </div>
            </div>
            {!r.formation_validee && (
              <Button size="sm" onClick={() => validate(r.id, r.profile_id)} className="bg-brand text-white">
                Valider
              </Button>
            )}
          </Card>
        ))}
        {rows.length === 0 && <p className="text-muted-foreground">Aucune demande de validation.</p>}
      </div>
    </div>
  );
}
