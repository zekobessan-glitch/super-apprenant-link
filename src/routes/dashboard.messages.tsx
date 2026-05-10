import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bell, CheckCheck } from "lucide-react";

export const Route = createFileRoute("/dashboard/messages")({
  component: MessagesPage,
});

function MessagesPage() {
  const { user } = useAuth();
  const [notifs, setNotifs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    if (!user) return;
    setLoading(true);
    const { data } = await supabase
      .from("notifications")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    setNotifs(data ?? []);
    setLoading(false);
  };

  useEffect(() => {
    load();
    if (!user) return;
    const ch = supabase
      .channel(`notifs-page:${user.id}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "notifications", filter: `user_id=eq.${user.id}` },
        () => load()
      )
      .subscribe();
    return () => {
      supabase.removeChannel(ch);
    };
  }, [user]);

  const markRead = async (id: string) => {
    await supabase.from("notifications").update({ lu: true }).eq("id", id);
    load();
  };

  const markAllRead = async () => {
    if (!user) return;
    await supabase.from("notifications").update({ lu: true }).eq("user_id", user.id).eq("lu", false);
    load();
  };

  const unread = notifs.filter((n) => !n.lu).length;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-3xl font-bold text-primary flex items-center gap-2">
            <Bell className="h-7 w-7" /> Messages
          </h1>
          <p className="text-muted-foreground">Toutes vos notifications</p>
        </div>
        <div className="flex items-center gap-3">
          {unread > 0 && <Badge className="bg-accent text-accent-foreground">{unread} non lue{unread > 1 ? "s" : ""}</Badge>}
          <Button variant="outline" size="sm" onClick={markAllRead} disabled={unread === 0}>
            <CheckCheck className="h-4 w-4 mr-1" /> Tout marquer comme lu
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="text-center text-muted-foreground py-12">Chargement…</div>
      ) : notifs.length === 0 ? (
        <Card className="p-12 text-center text-muted-foreground">
          <Bell className="h-12 w-12 mx-auto mb-3 opacity-30" />
          Aucune notification pour le moment
        </Card>
      ) : (
        <div className="space-y-3">
          {notifs.map((n) => (
            <Card
              key={n.id}
              onClick={() => !n.lu && markRead(n.id)}
              className={`p-4 cursor-pointer transition-colors hover:bg-muted/50 ${!n.lu ? "border-l-4 border-l-accent bg-accent/5" : ""}`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="font-semibold">{n.titre}</div>
                  <div className="text-sm text-muted-foreground mt-1">{n.message}</div>
                  <div className="text-xs text-muted-foreground mt-2">
                    {new Date(n.created_at).toLocaleString()}
                  </div>
                </div>
                {!n.lu && <Badge className="bg-accent text-accent-foreground">Nouveau</Badge>}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
