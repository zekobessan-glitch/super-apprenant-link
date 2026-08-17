import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { resendEmailLog } from "@/lib/resend-email.functions";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Mail, RefreshCw, Send } from "lucide-react";


export const Route = createFileRoute("/dashboard/admin/emails")({
  component: AdminEmailsPage,
  head: () => ({
    meta: [
      { title: "Historique des e-mails — SUPER@PPRENANT-I" },
      {
        name: "description",
        content:
          "Journal administrateur des notifications e-mail envoyées : date, utilisateur, type et statut d'envoi.",
      },
      { property: "og:title", content: "Historique des e-mails envoyés" },
      {
        property: "og:description",
        content: "Suivi des notifications e-mail de la plateforme SUPER@PPRENANT-I.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
});

type LogRow = {
  id: string;
  user_id: string | null;
  destinataire: string;
  sujet: string;
  type: string;
  statut: string;
  provider_id: string | null;
  erreur: string | null;
  created_at: string;
  profile?: { nom: string | null; prenoms: string | null; email: string | null };
};

function AdminEmailsPage() {
  const [rows, setRows] = useState<LogRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statut, setStatut] = useState("all");
  const [type, setType] = useState("all");
  const [date, setDate] = useState("");
  const [resendRow, setResendRow] = useState<LogRow | null>(null);
  const [resendMsg, setResendMsg] = useState("");
  const [sending, setSending] = useState(false);
  const doResend = useServerFn(resendEmailLog);

  const openResend = (r: LogRow) => {
    setResendRow(r);
    setResendMsg(r.sujet);
  };

  const submitResend = async () => {
    if (!resendRow || !resendMsg.trim()) return;
    setSending(true);
    try {
      await doResend({ data: { log_id: resendRow.id, message: resendMsg.trim() } });
      toast.success("E-mail renvoyé");
      setResendRow(null);
      await load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Échec du renvoi");
    } finally {
      setSending(false);
    }
  };



  const load = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("email_logs")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(500);
    const list = (data ?? []) as LogRow[];
    const ids = Array.from(new Set(list.map((r) => r.user_id).filter(Boolean))) as string[];
    let map: Record<string, any> = {};
    if (ids.length) {
      const { data: profs } = await supabase
        .from("profiles")
        .select("id, nom, prenoms, email")
        .in("id", ids);
      map = Object.fromEntries((profs ?? []).map((p) => [p.id, p]));
    }
    setRows(list.map((r) => ({ ...r, profile: r.user_id ? map[r.user_id] : undefined })));
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const types = useMemo(
    () => Array.from(new Set(rows.map((r) => r.type))).sort(),
    [rows],
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return rows.filter((r) => {
      if (statut !== "all" && r.statut !== statut) return false;
      if (type !== "all" && r.type !== type) return false;
      if (date && !r.created_at.startsWith(date)) return false;
      if (!q) return true;
      const who = `${r.profile?.prenoms ?? ""} ${r.profile?.nom ?? ""}`;
      return `${who} ${r.destinataire} ${r.sujet}`.toLowerCase().includes(q);
    });
  }, [rows, search, statut, type, date]);

  return (
    <div className="p-4 md:p-8 space-y-6">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <Mail className="h-5 w-5 text-primary" />
          <h1 className="text-2xl font-bold">Historique des e-mails</h1>
        </div>
        <Button variant="outline" size="sm" onClick={load} disabled={loading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
          Actualiser
        </Button>
      </div>

      <Card className="p-4 grid gap-3 md:grid-cols-4">
        <Input
          placeholder="Rechercher (utilisateur, e-mail, sujet)"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        <Select value={type} onValueChange={setType}>
          <SelectTrigger>
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les types</SelectItem>
            {types.map((t) => (
              <SelectItem key={t} value={t}>
                {t}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={statut} onValueChange={setStatut}>
          <SelectTrigger>
            <SelectValue placeholder="Statut" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les statuts</SelectItem>
            <SelectItem value="envoye">Envoyé</SelectItem>
            <SelectItem value="echoue">Échoué</SelectItem>
          </SelectContent>
        </Select>
      </Card>

      <Card className="p-0 overflow-x-auto">
        <table className="w-full text-sm min-w-[720px]">
          <thead className="bg-muted/50 text-left">
            <tr>
              <th className="p-3">Date</th>
              <th className="p-3">Utilisateur</th>
              <th className="p-3">Destinataire</th>
              <th className="p-3">Type</th>
              <th className="p-3">Sujet</th>
              <th className="p-3">Statut</th>
              <th className="p-3">Action</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td className="p-4 text-muted-foreground" colSpan={7}>
                  Chargement…
                </td>
              </tr>
            )}
            {!loading && filtered.length === 0 && (
              <tr>
                <td className="p-4 text-muted-foreground" colSpan={7}>
                  Aucun e-mail enregistré.
                </td>
              </tr>
            )}
            {filtered.map((r) => (
              <tr key={r.id} className="border-t align-top">
                <td className="p-3 whitespace-nowrap">
                  {new Date(r.created_at).toLocaleString("fr-FR")}
                </td>
                <td className="p-3">
                  {r.profile
                    ? `${r.profile.prenoms ?? ""} ${r.profile.nom ?? ""}`.trim() || "—"
                    : "—"}
                </td>
                <td className="p-3 break-all">{r.destinataire}</td>
                <td className="p-3">
                  <Badge variant="secondary">{r.type}</Badge>
                </td>
                <td className="p-3">
                  {r.sujet}
                  {r.erreur && (
                    <div className="text-xs text-destructive mt-1 break-words">{r.erreur}</div>
                  )}
                </td>
                <td className="p-3">
                  <Badge variant={r.statut === "envoye" ? "default" : "destructive"}>
                    {r.statut === "envoye" ? "Envoyé" : "Échoué"}
                  </Badge>
                </td>
                <td className="p-3">
                  <Button
                    variant={r.statut === "echoue" ? "default" : "outline"}
                    size="sm"
                    onClick={() => openResend(r)}
                  >
                    <Send className="h-4 w-4 mr-2" />
                    Renvoyer
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      <Dialog open={!!resendRow} onOpenChange={(o) => !o && setResendRow(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Renvoyer l'e-mail</DialogTitle>
            <DialogDescription>
              Destinataire : {resendRow?.destinataire} — Sujet : {resendRow?.sujet}
            </DialogDescription>
          </DialogHeader>
          <Textarea
            rows={6}
            value={resendMsg}
            onChange={(e) => setResendMsg(e.target.value)}
            placeholder="Contenu du message"
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setResendRow(null)} disabled={sending}>
              Annuler
            </Button>
            <Button onClick={submitResend} disabled={sending || !resendMsg.trim()}>
              {sending ? "Envoi…" : "Renvoyer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

