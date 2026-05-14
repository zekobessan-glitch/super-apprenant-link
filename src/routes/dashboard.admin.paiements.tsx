import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/dashboard/admin/paiements")({
  component: AdminPaiements,
});

function AdminPaiements() {
  const [rows, setRows] = useState<any[]>([]);
  useEffect(() => {
    (async () => {
      const { data: paiements, error } = await supabase
        .from("paiements")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) {
        console.error("paiements error", error);
        setRows([]);
        return;
      }
      const ids = Array.from(new Set((paiements ?? []).map((p) => p.user_id)));
      let profilesMap: Record<string, any> = {};
      if (ids.length) {
        const { data: profs } = await supabase
          .from("profiles")
          .select("id, nom, prenoms, email")
          .in("id", ids);
        profilesMap = Object.fromEntries((profs ?? []).map((p) => [p.id, p]));
      }
      setRows((paiements ?? []).map((p) => ({ ...p, profiles: profilesMap[p.user_id] })));
    })();
  }, []);
  return (
    <div className="p-6 space-y-4">
      <h1 className="text-3xl font-bold text-primary">Paiements</h1>
      <Card className="overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Utilisateur</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Montant</TableHead>
              <TableHead>Statut</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((r) => (
              <TableRow key={r.id}>
                <TableCell>{new Date(r.created_at).toLocaleDateString()}</TableCell>
                <TableCell>{r.profiles?.nom} {r.profiles?.prenoms}</TableCell>
                <TableCell>{r.type}</TableCell>
                <TableCell>{r.montant} FCFA</TableCell>
                <TableCell><Badge>{r.statut}</Badge></TableCell>
              </TableRow>
            ))}
            {rows.length === 0 && <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground py-8">Aucun paiement</TableCell></TableRow>}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
