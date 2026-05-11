import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trash2, Eye, UserPlus } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/dashboard/admin/users")({
  component: AdminUsers,
});

interface Row {
  id: string;
  nom: string;
  prenoms: string;
  email: string;
  telephone: string;
  role: string | null;
}

function Field({ label, value }: { label: string; value: any }) {
  if (value === null || value === undefined || value === "" || (Array.isArray(value) && value.length === 0)) return null;
  const display = Array.isArray(value)
    ? value.join(", ")
    : typeof value === "boolean"
    ? value ? "Oui" : "Non"
    : String(value);
  return (
    <div className="grid grid-cols-3 gap-2 py-1.5 border-b border-border/50 text-sm">
      <div className="font-medium text-muted-foreground">{label}</div>
      <div className="col-span-2 break-words">{display}</div>
    </div>
  );
}

function AdminUsers() {
  const [rows, setRows] = useState<Row[]>([]);
  const [selected, setSelected] = useState<Row | null>(null);
  const [details, setDetails] = useState<any>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ nom: "", prenoms: "", email: "", telephone: "", password: "", role: "admin" as "admin" | "encadreur" | "parent" });

  const load = async () => {
    const { data: profiles } = await supabase.from("profiles").select("id, nom, prenoms, email, telephone");
    const { data: roles } = await supabase.from("user_roles").select("user_id, role");
    const map = new Map(roles?.map((r) => [r.user_id, r.role]));
    setRows((profiles ?? []).map((p) => ({ ...p, role: map.get(p.id) ?? null })));
  };

  useEffect(() => { load(); }, []);

  const openDetails = async (r: Row) => {
    setSelected(r);
    setDetails(null);
    setLoadingDetails(true);
    const { data: profile } = await supabase.from("profiles").select("*").eq("id", r.id).maybeSingle();
    let extra: any = {};
    if (r.role === "encadreur") {
      const { data: enc } = await supabase.from("encadreurs").select("*").eq("profile_id", r.id).maybeSingle();
      extra.encadreur = enc;
    } else if (r.role === "parent") {
      const { data: apprenants } = await supabase.from("apprenants").select("*").eq("parent_id", r.id);
      extra.apprenants = apprenants ?? [];
    }
    setDetails({ profile, ...extra });
    setLoadingDetails(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Supprimer cet utilisateur ?")) return;
    const { error } = await supabase.from("profiles").delete().eq("id", id);
    if (error) toast.error(error.message);
    else { toast.success("Supprimé"); load(); }
  };

  const handleCreate = async () => {
    if (!form.email || !form.password || !form.nom || !form.prenoms) {
      toast.error("Renseignez tous les champs obligatoires");
      return;
    }
    setCreating(true);
    const { data, error } = await supabase.functions.invoke("admin-create-user", { body: form });
    setCreating(false);
    if (error || (data as any)?.error) {
      toast.error((data as any)?.error ?? error?.message ?? "Erreur");
      return;
    }
    toast.success("Utilisateur créé");
    setCreateOpen(false);
    setForm({ nom: "", prenoms: "", email: "", telephone: "", password: "", role: "admin" });
    load();
  };

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-primary">Utilisateurs</h1>
        <Button onClick={() => setCreateOpen(true)}><UserPlus className="h-4 w-4" /> Ajouter</Button>
      </div>
      <Card className="overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nom</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Téléphone</TableHead>
              <TableHead>Rôle</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((r) => (
              <TableRow key={r.id} className="cursor-pointer hover:bg-muted/50" onClick={() => openDetails(r)}>
                <TableCell>{r.nom} {r.prenoms}</TableCell>
                <TableCell>{r.email}</TableCell>
                <TableCell>{r.telephone}</TableCell>
                <TableCell>
                  <Badge variant={r.role === "admin" ? "default" : "secondary"}>{r.role ?? "—"}</Badge>
                </TableCell>
                <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                  <Button size="icon" variant="ghost" onClick={() => openDetails(r)}>
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button size="icon" variant="ghost" onClick={() => handleDelete(r.id)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {rows.length === 0 && (
              <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground py-8">Aucun utilisateur</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </Card>

      <Dialog open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selected?.nom} {selected?.prenoms}
              {selected?.role && <Badge className="ml-2" variant="secondary">{selected.role}</Badge>}
            </DialogTitle>
          </DialogHeader>
          {loadingDetails && <div className="py-8 text-center text-muted-foreground">Chargement…</div>}
          {details && (
            <div className="space-y-6">
              <section>
                <h3 className="font-semibold text-primary mb-2">Profil</h3>
                <Field label="Nom" value={details.profile?.nom} />
                <Field label="Prénoms" value={details.profile?.prenoms} />
                <Field label="Nom d'utilisateur" value={details.profile?.username} />
                <Field label="Email" value={details.profile?.email} />
                <Field label="Téléphone" value={details.profile?.telephone} />
                <Field label="Profession" value={details.profile?.profession} />
                <Field label="Zone de résidence" value={details.profile?.zone_residence} />
                <Field label="Photo" value={details.profile?.photo_url} />
                <Field label="Inscrit le" value={details.profile?.created_at ? new Date(details.profile.created_at).toLocaleString() : null} />
              </section>

              {details.encadreur && (
                <section>
                  <h3 className="font-semibold text-primary mb-2">Informations encadreur</h3>
                  <Field label="Genre" value={details.encadreur.genre} />
                  <Field label="Zone de résidence" value={details.encadreur.zone_residence} />
                  <Field label="Dernier diplôme" value={details.encadreur.dernier_diplome} />
                  <Field label="Expérience pro" value={details.encadreur.experience_pro} />
                  <Field label="Détail expérience" value={details.encadreur.experience_detail} />
                  <Field label="Niveaux" value={details.encadreur.niveaux} />
                  <Field label="Classes primaire" value={details.encadreur.classes_primaire} />
                  <Field label="Classes collège" value={details.encadreur.classes_college} />
                  <Field label="Disciplines collège" value={details.encadreur.matieres_college} />
                  <Field label="Classes lycée" value={details.encadreur.classes_lycee} />
                  <Field label="Séries lycée" value={details.encadreur.series_lycee} />
                  <Field label="Disciplines lycée" value={details.encadreur.matieres_lycee} />
                  <Field label="Motivation" value={details.encadreur.motivation} />
                  <Field label="Profil pédagogique" value={details.encadreur.profil_pedagogique} />
                  <Field label="Formation validée" value={details.encadreur.formation_validee} />
                  <Field label="Formation Super Apprenant" value={details.encadreur.formation_super_apprenant} />
                  <Field label="Premium" value={details.encadreur.premium} />
                </section>
              )}

              {details.apprenants && details.apprenants.length > 0 && (
                <section>
                  <h3 className="font-semibold text-primary mb-2">Apprenants ({details.apprenants.length})</h3>
                  {details.apprenants.map((a: any, i: number) => (
                    <div key={a.id} className="mb-4 p-3 rounded-lg bg-muted/40">
                      <div className="font-medium mb-2">Apprenant {i + 1} — {a.nom} {a.prenoms}</div>
                      <Field label="Âge" value={a.age} />
                      <Field label="Niveau" value={a.niveau} />
                      <Field label="Classe" value={a.classe} />
                      <Field label="Série" value={a.serie} />
                      <Field label="Matières" value={a.matieres} />
                      <Field label="Profil d'apprentissage" value={a.profil_apprentissage} />
                      <Field label="Zone de résidence" value={a.zone_residence} />
                    </div>
                  ))}
                </section>
              )}

              {details.apprenants && details.apprenants.length === 0 && selected?.role === "parent" && (
                <p className="text-sm text-muted-foreground">Aucun apprenant enregistré.</p>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
