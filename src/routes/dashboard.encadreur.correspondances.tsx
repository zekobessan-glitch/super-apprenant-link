import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Phone, Mail } from "lucide-react";

export const Route = createFileRoute("/dashboard/encadreur/correspondances")({
  component: EncCorrespondances,
});

function EncCorrespondances() {
  const { user } = useAuth();
  const [rows, setRows] = useState<any[]>([]);
  useEffect(() => {
    if (!user) return;
    supabase.from("correspondances")
      .select("*, parent:profiles!correspondances_parent_id_fkey(nom, prenoms, email, telephone), apprenant:apprenants(nom, prenoms, classe)")
      .eq("encadreur_id", user.id)
      .order("created_at", { ascending: false })
      .then(({ data }) => setRows(data ?? []));
  }, [user]);

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-3xl font-bold text-primary">Mes correspondances</h1>
      <div className="grid md:grid-cols-2 gap-4">
        {rows.map((r) => (
          <Card key={r.id} className="p-5 space-y-2">
            <div className="flex justify-between">
              <div>
                <h3 className="font-bold">{r.parent?.nom} {r.parent?.prenoms}</h3>
                {r.apprenant && <p className="text-sm text-muted-foreground">Apprenant : {r.apprenant.prenoms} {r.apprenant.nom} — {r.apprenant.classe}</p>}
              </div>
              <Badge variant={r.contact_debloque ? "default" : "outline"}>{r.statut}</Badge>
            </div>
            {r.contact_debloque && (
              <div className="text-sm space-y-1 pt-2 border-t">
                <div className="flex items-center gap-2"><Phone className="h-3.5 w-3.5 text-primary" /> {r.parent?.telephone}</div>
                <div className="flex items-center gap-2"><Mail className="h-3.5 w-3.5 text-primary" /> {r.parent?.email}</div>
              </div>
            )}
          </Card>
        ))}
        {rows.length === 0 && <Card className="p-6 col-span-full text-center text-muted-foreground">Aucune correspondance.</Card>}
      </div>
    </div>
  );
}
