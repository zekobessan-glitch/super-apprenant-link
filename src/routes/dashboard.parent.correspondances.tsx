import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Clock } from "lucide-react";

export const Route = createFileRoute("/dashboard/parent/correspondances")({
  component: ParentCorrespondances,
});

function ParentCorrespondances() {
  const { user } = useAuth();
  const [rows, setRows] = useState<any[]>([]);
  useEffect(() => {
    if (!user) return;
    supabase.from("correspondances")
      .select("*, encadreur:profiles!correspondances_encadreur_id_fkey(nom, prenoms)")
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
            <div className="flex justify-between gap-2">
              <h3 className="font-bold">{r.encadreur?.nom} {r.encadreur?.prenoms}</h3>
              <Badge variant={r.contact_debloque ? "default" : "secondary"} className="shrink-0">
                {r.contact_debloque ? "Contact débloqué" : "Contact en attente de paiement"}
              </Badge>
            </div>
            {r.contact_debloque ? (
              <div className="text-sm flex items-start gap-2 pt-2 border-t text-muted-foreground">
                <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                <span>Demande envoyée. L'encadreur vous contactera prochainement.</span>
              </div>
            ) : (
              <div className="text-sm flex items-start gap-2 pt-2 border-t text-muted-foreground">
                <Clock className="h-4 w-4 text-accent mt-0.5 shrink-0" />
                <span>Votre intérêt a été transmis. Achetez un pack de contacts pour débloquer la mise en relation.</span>
              </div>
            )}
          </Card>
        ))}
        {rows.length === 0 && <Card className="p-6 col-span-full text-center text-muted-foreground">Aucun contact.</Card>}
      </div>
    </div>
  );
}
