import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/dashboard/encadreur/paiements")({
  component: EncPaiements,
});

function EncPaiements() {
  const { user } = useAuth();
  const [rows, setRows] = useState<any[]>([]);
  useEffect(() => {
    if (!user) return;
    supabase.from("paiements").select("*").eq("user_id", user.id).order("created_at", { ascending: false })
      .then(({ data }) => setRows(data ?? []));
  }, [user]);

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-3xl font-bold text-primary">Historique des paiements</h1>
      <div className="space-y-3">
        {rows.map((r) => (
          <Card key={r.id} className="p-4 flex justify-between items-center">
            <div>
              <div className="font-medium">{r.type}</div>
              <div className="text-xs text-muted-foreground">{new Date(r.created_at).toLocaleString()}</div>
            </div>
            <div className="text-right">
              <div className="font-bold">{r.montant.toLocaleString()} FCFA</div>
              <Badge variant={r.statut === "reussi" ? "default" : "outline"}>{r.statut}</Badge>
            </div>
          </Card>
        ))}
        {rows.length === 0 && <Card className="p-6 text-center text-muted-foreground">Aucun paiement.</Card>}
      </div>
    </div>
  );
}
