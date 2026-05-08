import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";

export function NotificationsBell() {
  const { user } = useAuth();
  const [notifs, setNotifs] = useState<any[]>([]);

  const load = async () => {
    if (!user) return;
    const { data } = await supabase.from("notifications").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(10);
    setNotifs(data ?? []);
  };

  useEffect(() => {
    load();
    if (!user) return;
    const ch = supabase.channel(`notifs:${user.id}`).on(
      "postgres_changes",
      { event: "INSERT", schema: "public", table: "notifications", filter: `user_id=eq.${user.id}` },
      () => load()
    ).subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [user]);

  const unread = notifs.filter((n) => !n.lu).length;
  const markRead = async (id: string) => {
    await supabase.from("notifications").update({ lu: true }).eq("id", id);
    load();
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-foreground relative">
          <Bell className="h-5 w-5" />
          {unread > 0 && <Badge className="absolute -top-1 -right-1 bg-accent text-accent-foreground h-5 min-w-5 p-0 flex items-center justify-center text-xs">{unread}</Badge>}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0 max-h-96 overflow-auto">
        <div className="p-3 border-b font-semibold">Notifications</div>
        {notifs.length === 0 ? (
          <div className="p-6 text-center text-sm text-muted-foreground">Aucune notification</div>
        ) : (
          notifs.map((n) => (
            <div
              key={n.id}
              onClick={() => !n.lu && markRead(n.id)}
              className={`p-3 border-b cursor-pointer hover:bg-muted ${!n.lu ? "bg-accent/5" : ""}`}
            >
              <div className="font-medium text-sm">{n.titre}</div>
              <div className="text-xs text-muted-foreground">{n.message}</div>
              <div className="text-[10px] text-muted-foreground mt-1">{new Date(n.created_at).toLocaleString()}</div>
            </div>
          ))
        )}
      </PopoverContent>
    </Popover>
  );
}
