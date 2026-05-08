import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Phone, Mail } from "lucide-react";

export const Route = createFileRoute("/dashboard/parent/correspondances")({
  component: ParentCorrespondances,
});

function ParentCorrespondances() {
  const { user } = useAuth();
  const [rows, setRows] = useState<any[]>([]);
  useEffect(() => {
    if (!user) return;
    supabase.from("correspondances")
      .select("*, encadreur:profiles!correspondances_encadreur_id_fkey(nom, prenoms, email, telephone)")
      .eq("parent_id", user.id)
      .order("created_at", { ascending: false })
      .then(({ data }) => setRows(data ?? []));
  }, [user]);

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-3xl font-bold text-primary">Mes contacts</h1>
      <div className="grid md:grid-cols-2 gap-4">
        {rows.map((r) => (
          <Card key={r.id} className="p-5 space-y-2">
            <div className="flex justify-between">
              <h3 className="font-bold">{r.encadreur?.nom} {r.encadreur?.prenoms}</h3>
              <Badge variant={r.contact_debloque ? "default" : "outline"}>{r.statut}</Badge>
            </div>
            {r.contact_debloque && (
              <div className="text-sm space-y-1 pt-2 border-t">
                <div className="flex items-center gap-2"><Phone className="h-3.5 w-3.5 text-primary" /> {r.encadreur?.telephone}</div>
                <div className="flex items-center gap-2"><Mail className="h-3.5 w-3.5 text-primary" /> {r.encadreur?.email}</div>
              </div>
            )}
          </Card>
        ))}
        {rows.length === 0 && <Card className="p-6 col-span-full text-center text-muted-foreground">Aucun contact.</Card>}
      </div>
    </div>
  );
}
