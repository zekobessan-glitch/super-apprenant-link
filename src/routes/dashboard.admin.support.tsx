import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LifeBuoy } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/dashboard/admin/support")({
  component: AdminSupportPage,
});

function AdminSupportPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [drafts, setDrafts] = useState<Record<string, string>>({});

  const load = async () => {
    setLoading(true);
    const { data: msgs } = await supabase
      .from("support_messages")
      .select("*")
      .order("created_at", { ascending: false });
    const ids = Array.from(new Set((msgs ?? []).map((m) => m.user_id)));
    let profilesMap: Record<string, any> = {};
    if (ids.length) {
      const { data: profs } = await supabase.from("profiles").select("id, nom, prenoms, email").in("id", ids);
      profilesMap = Object.fromEntries((profs ?? []).map((p) => [p.id, p]));
    }
    setItems((msgs ?? []).map((m) => ({ ...m, profile: profilesMap[m.user_id] })));
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const respond = async (id: string, user_id: string) => {
    const reponse = drafts[id]?.trim();
    if (!reponse) return;
    const { error } = await supabase
      .from("support_messages")
      .update({ reponse_admin: reponse, statut: "resolu", admin_id: (await supabase.auth.getUser()).data.user?.id })
      .eq("id", id);
    if (error) {
      toast.error("Erreur");
      return;
    }
    await supabase.from("notifications").insert({
      user_id,
      titre: "Réponse à votre demande de support",
      message: reponse.slice(0, 200),
      lien: "/dashboard/support",
    });
    toast.success("Réponse envoyée");
    setDrafts((d) => ({ ...d, [id]: "" }));
    load();
  };

  const changeStatut = async (id: string, statut: string) => {
    await supabase.from("support_messages").update({ statut }).eq("id", id);
    load();
  };

  const statutColor = (s: string) =>
    s === "resolu" ? "bg-green-500" : s === "en_cours" ? "bg-yellow-500" : "bg-accent";

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-primary flex items-center gap-2">
          <LifeBuoy className="h-7 w-7" /> Support
        </h1>
        <p className="text-muted-foreground">Demandes des utilisateurs</p>
      </div>

      {loading ? (
        <div className="text-muted-foreground">Chargement…</div>
      ) : items.length === 0 ? (
        <Card className="p-8 text-center text-muted-foreground">Aucune demande</Card>
      ) : (
        <div className="space-y-3">
          {items.map((it) => (
            <Card key={it.id} className="p-4 space-y-3">
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div>
                  <div className="font-semibold">{it.sujet}</div>
                  <div className="text-xs text-muted-foreground">
                    {it.profile?.prenoms} {it.profile?.nom} · {it.profile?.email}
                  </div>
                  <div className="text-xs text-muted-foreground">{new Date(it.created_at).toLocaleString()}</div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={`${statutColor(it.statut)} text-white`}>{it.statut}</Badge>
                  <Select value={it.statut} onValueChange={(v) => changeStatut(it.id, v)}>
                    <SelectTrigger className="h-8 w-32"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ouvert">Ouvert</SelectItem>
                      <SelectItem value="en_cours">En cours</SelectItem>
                      <SelectItem value="resolu">Résolu</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="text-sm whitespace-pre-wrap bg-muted p-3 rounded-md">{it.message}</div>
              {it.reponse_admin && (
                <div className="p-3 bg-primary/5 border border-primary/20 rounded-md text-sm whitespace-pre-wrap">
                  <div className="text-xs font-semibold text-primary mb-1">Votre réponse</div>
                  {it.reponse_admin}
                </div>
              )}
              <div className="space-y-2">
                <Textarea
                  placeholder="Écrire une réponse…"
                  value={drafts[it.id] ?? ""}
                  onChange={(e) => setDrafts((d) => ({ ...d, [it.id]: e.target.value }))}
                  rows={3}
                />
                <Button size="sm" onClick={() => respond(it.id, it.user_id)} disabled={!drafts[it.id]?.trim()}>
                  Envoyer la réponse
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
