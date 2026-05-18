import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { Card } from "@/components/ui/card";
import { Users, GraduationCap, CreditCard, UserCog } from "lucide-react";

export const Route = createFileRoute("/dashboard/admin/")({
  component: AdminHome,
});

function AdminHome() {
  const { user } = useAuth();
  const [profileName, setProfileName] = useState("");
  const [stats, setStats] = useState({ users: 0, encadreurs: 0, parents: 0, paiements: 0 });

  useEffect(() => {
    if (user) {
      supabase.from("profiles").select("nom,prenoms").eq("id", user.id).maybeSingle().then(({ data }) => {
        if (data) setProfileName(`${data.prenoms} ${data.nom}`);
      });
    }
  }, [user]);

  useEffect(() => {
    (async () => {
      const [{ count: users }, { count: enc }, { count: par }, { data: pay }] = await Promise.all([
        supabase.from("profiles").select("*", { count: "exact", head: true }),
        supabase.from("user_roles").select("*", { count: "exact", head: true }).eq("role", "encadreur"),
        supabase.from("user_roles").select("*", { count: "exact", head: true }).eq("role", "parent"),
        supabase.from("paiements").select("montant").eq("statut", "reussi"),
      ]);
      setStats({
        users: users ?? 0,
        encadreurs: enc ?? 0,
        parents: par ?? 0,
        paiements: pay?.reduce((s, p) => s + (p.montant ?? 0), 0) ?? 0,
      });
    })();
  }, []);

  const cards = [
    { label: "Utilisateurs", value: stats.users, icon: UserCog, color: "bg-brand" },
    { label: "Encadreurs", value: stats.encadreurs, icon: GraduationCap, color: "bg-accent-gradient" },
    { label: "Parents", value: stats.parents, icon: Users, color: "bg-brand" },
    { label: "Paiements (FCFA)", value: stats.paiements.toLocaleString(), icon: CreditCard, color: "bg-accent-gradient" },
  ];

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-primary">{profileName ? `Bonjour ${profileName}` : "Tableau de bord administrateur"}</h1>
        <p className="text-muted-foreground">Vue d'ensemble de la plateforme</p>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((c) => (
          <Card key={c.label} className="p-5 shadow-soft">
            <div className={`${c.color} text-white inline-flex p-2.5 rounded-lg mb-3`}>
              <c.icon className="h-5 w-5" />
            </div>
            <div className="text-2xl font-bold">{c.value}</div>
            <div className="text-sm text-muted-foreground">{c.label}</div>
          </Card>
        ))}
      </div>
    </div>
  );
}
