import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { LifeBuoy, Send } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/dashboard/support")({
  component: SupportPage,
});

function SupportPage() {
  const { user } = useAuth();
  const [sujet, setSujet] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    if (!user) return;
    setLoading(true);
    const { data } = await supabase
      .from("support_messages")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    setItems(data ?? []);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, [user]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sujet.trim() || !message.trim()) return;
    setSending(true);
    const { error } = await supabase.from("support_messages").insert({
      user_id: user!.id,
      sujet: sujet.trim(),
      message: message.trim(),
    });
    setSending(false);
    if (error) {
      toast.error("Erreur lors de l'envoi");
      return;
    }
    toast.success("Message envoyé à l'administration");
    setSujet("");
    setMessage("");
    load();
  };

  const statutColor = (s: string) =>
    s === "resolu" ? "bg-green-500" : s === "en_cours" ? "bg-yellow-500" : "bg-accent";

  return (
    <div className="p-6 space-y-6 max-w-3xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold text-primary flex items-center gap-2">
          <LifeBuoy className="h-7 w-7" /> Support
        </h1>
        <p className="text-muted-foreground">Contactez l'administration</p>
      </div>

      <Card className="p-6">
        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="text-sm font-medium">Sujet</label>
            <Input value={sujet} onChange={(e) => setSujet(e.target.value)} required maxLength={150} placeholder="Objet de votre demande" />
          </div>
          <div>
            <label className="text-sm font-medium">Message</label>
            <Textarea value={message} onChange={(e) => setMessage(e.target.value)} required rows={5} maxLength={2000} placeholder="Décrivez votre demande…" />
          </div>
          <Button type="submit" disabled={sending}>
            <Send className="h-4 w-4 mr-2" /> {sending ? "Envoi…" : "Envoyer"}
          </Button>
        </form>
      </Card>

      <div className="space-y-3">
        <h2 className="text-xl font-semibold">Mes demandes</h2>
        {loading ? (
          <div className="text-muted-foreground">Chargement…</div>
        ) : items.length === 0 ? (
          <Card className="p-8 text-center text-muted-foreground">Aucune demande pour le moment</Card>
        ) : (
          items.map((it) => (
            <Card key={it.id} className="p-4 space-y-2">
              <div className="flex items-start justify-between gap-3">
                <div className="font-semibold">{it.sujet}</div>
                <Badge className={`${statutColor(it.statut)} text-white`}>{it.statut}</Badge>
              </div>
              <div className="text-sm text-muted-foreground whitespace-pre-wrap">{it.message}</div>
              <div className="text-xs text-muted-foreground">{new Date(it.created_at).toLocaleString()}</div>
              {it.reponse_admin && (
                <div className="mt-2 p-3 bg-muted rounded-md">
                  <div className="text-xs font-semibold text-primary mb-1">Réponse de l'administration</div>
                  <div className="text-sm whitespace-pre-wrap">{it.reponse_admin}</div>
                </div>
              )}
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
