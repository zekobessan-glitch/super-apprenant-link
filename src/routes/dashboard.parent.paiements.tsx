import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CreditCard, Loader2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/dashboard/parent/paiements")({
  component: ParentPaiements,
});

const PACK_PRICE = 5000;
const PACK_CREDITS = 3;

function ParentPaiements() {
  const { user } = useAuth();
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) return;
    supabase.from("paiements").select("*").eq("user_id", user.id).order("created_at", { ascending: false })
      .then(({ data }) => setRows(data ?? []));
  }, [user]);

  const buy = async () => {
    setLoading(true);
    const { data, error } = await supabase.functions.invoke("fedapay-create-payment", {
      body: { montant: PACK_PRICE, type: "pack_contacts_parent", metadata: { credits: PACK_CREDITS } },
    });
    setLoading(false);
    if (error || !data?.payment_url) {
      toast.error("Impossible d'initier le paiement. Vérifiez la configuration FedaPay.");
      return;
    }
    window.location.href = data.payment_url;
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold text-primary">Paiements</h1>

      <Card className="p-6 bg-hero text-white border-0">
        <h2 className="text-xl font-bold mb-1">Pack {PACK_CREDITS} contacts</h2>
        <p className="text-white/85 text-sm mb-4">Débloquez {PACK_CREDITS} encadreurs pour {PACK_PRICE.toLocaleString()} FCFA.</p>
        <Button onClick={buy} disabled={loading} className="bg-accent text-accent-foreground hover:opacity-90">
          {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <CreditCard className="h-4 w-4 mr-2" />}
          Acheter via FedaPay
        </Button>
      </Card>

      <div className="space-y-3">
        <h2 className="font-semibold">Historique</h2>
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
