import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
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

declare global {
  interface Window {
    openKkiapayWidget?: (opts: any) => void;
    addSuccessListener?: (cb: (resp: any) => void) => void;
    addFailedListener?: (cb: (resp: any) => void) => void;
  }
}

function loadKkiapayScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined") return reject(new Error("SSR"));
    if (window.openKkiapayWidget) return resolve();
    const existing = document.querySelector('script[data-kkiapay]') as HTMLScriptElement | null;
    if (existing) { existing.addEventListener("load", () => resolve()); return; }
    const s = document.createElement("script");
    s.src = "https://cdn.kkiapay.me/k.js";
    s.async = true;
    s.dataset.kkiapay = "1";
    s.onload = () => resolve();
    s.onerror = () => reject(new Error("Impossible de charger KKiaPay"));
    document.head.appendChild(s);
  });
}

function ParentPaiements() {
  const { user } = useAuth();
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const currentPaiementId = useRef<string | null>(null);

  const refresh = () => {
    if (!user) return;
    supabase.from("paiements").select("*").eq("user_id", user.id).order("created_at", { ascending: false })
      .then(({ data }) => setRows(data ?? []));
  };

  useEffect(() => { refresh(); }, [user]);

  useEffect(() => {
    let mounted = true;
    loadKkiapayScript().then(() => {
      if (!mounted) return;
      window.addSuccessListener?.(async (resp: any) => {
        const transactionId = resp?.transactionId ?? resp?.id;
        const paiement_id = currentPaiementId.current;
        if (!transactionId || !paiement_id) return;
        toast.loading("Vérification du paiement…", { id: "kkiapay-verify" });
        const { data, error } = await supabase.functions.invoke("kkiapay-verify", {
          body: { paiement_id, transactionId },
        });
        toast.dismiss("kkiapay-verify");
        if (error || !data?.ok) {
          toast.error("Paiement non confirmé.");
        } else {
          toast.success(`Paiement réussi ! ${PACK_CREDITS} crédits ajoutés.`);
        }
        refresh();
      });
      window.addFailedListener?.((resp: any) => {
        console.warn("KKiaPay failed", resp);
        toast.error("Paiement échoué ou annulé.");
        refresh();
      });
    }).catch((e) => console.error(e));
    return () => { mounted = false; };
  }, [user]);

  const buy = async () => {
    if (!user) return;
    setLoading(true);
    const { data, error } = await supabase.functions.invoke("kkiapay-init", {
      body: { montant: PACK_PRICE, type: "pack_contacts_parent", metadata: { credits: PACK_CREDITS } },
    });
    setLoading(false);
    if (error || !data?.public_key || !data?.paiement_id) {
      toast.error("Impossible d'initier le paiement.");
      return;
    }
    currentPaiementId.current = data.paiement_id;
    if (!window.openKkiapayWidget) {
      toast.error("Widget KKiaPay non chargé. Rechargez la page.");
      return;
    }
    window.openKkiapayWidget({
      amount: data.amount,
      key: data.public_key,
      sandbox: data.sandbox,
      position: "center",
      theme: "#1e40af",
      name: data.customer.fullname,
      email: data.customer.email,
      phone: data.customer.phone,
      data: data.paiement_id,
    });
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold text-primary">Paiements</h1>

      <Card className="p-6 bg-hero text-white border-0">
        <h2 className="text-xl font-bold mb-1">Pack {PACK_CREDITS} contacts</h2>
        <p className="text-white/85 text-sm mb-4">Débloquez {PACK_CREDITS} encadreurs pour {PACK_PRICE.toLocaleString()} FCFA.</p>
        <Button onClick={buy} disabled={loading} className="bg-accent text-accent-foreground hover:opacity-90">
          {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <CreditCard className="h-4 w-4 mr-2" />}
          Payer via KKiaPay
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
