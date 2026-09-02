import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Users, Mail, MousePointerClick, Unlock } from "lucide-react";

export const Route = createFileRoute("/dashboard/admin/suivi")({
  component: AdminSuivi,
  head: () => ({
    meta: [
      { title: "Suivi des correspondances et e-mails" },
      {
        name: "description",
        content:
          "Statistiques de la plateforme : correspondances trouvées, e-mails envoyés, taux de conversion et détail par utilisateur.",
      },
      { property: "og:title", content: "Suivi des correspondances et e-mails" },
      {
        property: "og:description",
        content: "Correspondances trouvées, e-mails envoyés et taux de conversion par utilisateur.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
});

interface UserStat {
  id: string;
  nom: string;
  role: string;
  correspondances: number;
  debloquees: number;
  emails: number;
  emailsEchoues: number;
}

const pct = (num: number, den: number) => (den > 0 ? `${Math.round((num / den) * 100)}%` : "—");

function AdminSuivi() {
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [totals, setTotals] = useState({
    correspondances: 0,
    debloquees: 0,
    enAttente: 0,
    emails: 0,
    emailsEchoues: 0,
    alertes: 0,
    alertesParent: 0,
    alertesEncadreur: 0,
  });
  const [users, setUsers] = useState<UserStat[]>([]);

  useEffect(() => {
    (async () => {
      const [{ data: corr }, { data: logs }, { data: alerts }, { data: profiles }, { data: roles }] =
        await Promise.all([
          supabase.from("correspondances").select("parent_id, encadreur_id, contact_debloque, statut"),
          supabase.from("email_logs").select("user_id, statut"),
          supabase
            .from("correspondance_email_alerts")
            .select("parent_id, encadreur_id, parent_email_sent, encadreur_email_sent"),
          supabase.from("profiles").select("id, nom, prenoms"),
          supabase.from("user_roles").select("user_id, role"),
        ]);

      const c = corr ?? [];
      const l = logs ?? [];
      const a = alerts ?? [];

      setTotals({
        correspondances: c.length,
        debloquees: c.filter((x) => x.contact_debloque).length,
        enAttente: c.filter((x) => !x.contact_debloque).length,
        emails: l.length,
        emailsEchoues: l.filter((x) => x.statut !== "envoye").length,
        alertes: a.length,
        alertesParent: a.filter((x) => x.parent_email_sent).length,
        alertesEncadreur: a.filter((x) => x.encadreur_email_sent).length,
      });

      const roleMap = new Map((roles ?? []).map((r: any) => [r.user_id, r.role]));
      const stats = new Map<string, UserStat>();
      const ensure = (id: string) => {
        if (!stats.has(id)) {
          const p: any = (profiles ?? []).find((x: any) => x.id === id);
          stats.set(id, {
            id,
            nom: p ? `${p.prenoms} ${p.nom}`.trim() : id.slice(0, 8),
            role: roleMap.get(id) ?? "—",
            correspondances: 0,
            debloquees: 0,
            emails: 0,
            emailsEchoues: 0,
          });
        }
        return stats.get(id)!;
      };

      c.forEach((row) => {
        [row.parent_id, row.encadreur_id].forEach((id) => {
          if (!id) return;
          const s = ensure(id);
          s.correspondances += 1;
          if (row.contact_debloque) s.debloquees += 1;
        });
      });
      l.forEach((row: any) => {
        if (!row.user_id) return;
        const s = ensure(row.user_id);
        s.emails += 1;
        if (row.statut !== "envoye") s.emailsEchoues += 1;
      });

      setUsers(
        Array.from(stats.values()).sort(
          (x, y) => y.correspondances - x.correspondances || y.emails - x.emails,
        ),
      );
      setLoading(false);
    })();
  }, []);

  const filtered = useMemo(
    () =>
      users.filter(
        (u) =>
          u.nom.toLowerCase().includes(q.toLowerCase()) || u.role.toLowerCase().includes(q.toLowerCase()),
      ),
    [users, q],
  );

  const cards = [
    {
      label: "Correspondances trouvées",
      value: totals.correspondances,
      hint: `${totals.enAttente} en attente de paiement`,
      icon: Users,
    },
    {
      label: "E-mails envoyés",
      value: totals.emails,
      hint: `${totals.emailsEchoues} en échec`,
      icon: Mail,
    },
    {
      label: "Contacts débloqués",
      value: totals.debloquees,
      hint: `${pct(totals.debloquees, totals.correspondances)} des correspondances`,
      icon: Unlock,
    },
    {
      label: "Taux de conversion",
      value: pct(totals.debloquees, totals.alertes),
      hint: `${totals.alertes} alertes de correspondance`,
      icon: MousePointerClick,
    },
  ];

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-primary">Suivi de la plateforme</h1>
        <p className="text-muted-foreground">
          Correspondances trouvées, e-mails envoyés et passage à l'action, globalement et par utilisateur.
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((c) => (
          <Card key={c.label} className="p-5 shadow-soft">
            <div className="bg-brand text-white inline-flex p-2.5 rounded-lg mb-3">
              <c.icon className="h-5 w-5" />
            </div>
            <div className="text-2xl font-bold">{c.value}</div>
            <div className="text-sm text-muted-foreground">{c.label}</div>
            <div className="text-xs text-muted-foreground mt-1">{c.hint}</div>
          </Card>
        ))}
      </div>

      <Card className="p-5 shadow-soft space-y-3">
        <div className="flex flex-wrap gap-3 justify-between items-center">
          <h2 className="font-semibold">Détail par utilisateur</h2>
          <Input
            placeholder="Rechercher un utilisateur…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="max-w-xs"
          />
        </div>
        <div className="text-xs text-muted-foreground">
          Alertes e-mail envoyées : {totals.alertesParent} parents · {totals.alertesEncadreur} encadreurs.
        </div>
        {loading ? (
          <p className="text-sm text-muted-foreground">Chargement…</p>
        ) : (
          <div className="overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Utilisateur</TableHead>
                  <TableHead>Rôle</TableHead>
                  <TableHead className="text-right">Correspondances</TableHead>
                  <TableHead className="text-right">Débloquées</TableHead>
                  <TableHead className="text-right">E-mails</TableHead>
                  <TableHead className="text-right">Taux de conversion</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((u) => (
                  <TableRow key={u.id}>
                    <TableCell className="font-medium">{u.nom}</TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="capitalize">
                        {u.role}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">{u.correspondances}</TableCell>
                    <TableCell className="text-right">{u.debloquees}</TableCell>
                    <TableCell className="text-right">
                      {u.emails}
                      {u.emailsEchoues > 0 && (
                        <span className="text-destructive text-xs"> ({u.emailsEchoues} KO)</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">{pct(u.debloquees, u.correspondances)}</TableCell>
                  </TableRow>
                ))}
                {filtered.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground">
                      Aucun utilisateur trouvé.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </Card>
    </div>
  );
}
