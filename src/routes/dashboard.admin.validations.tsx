import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Eye } from "lucide-react";

export const Route = createFileRoute("/dashboard/admin/validations")({
  component: Validations,
});

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

function Validations() {
  const [rows, setRows] = useState<any[]>([]);
  const [selected, setSelected] = useState<any>(null);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [motif, setMotif] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const load = async () => {
    const { data } = await supabase
      .from("encadreurs")
      .select("*, profiles(nom, prenoms, email, telephone, username, profession, zone_residence, created_at)")
      .eq("formation_super_apprenant", true);
    setRows(data ?? []);
  };

  useEffect(() => { load(); }, []);

  const validate = async (id: string, profile_id: string) => {
    const { error } = await supabase
      .from("encadreurs")
      .update({ formation_validee: true, premium: true })
      .eq("id", id);
    if (error) return toast.error(error.message);
    await supabase.from("notifications").insert({
      user_id: profile_id,
      titre: "Statut Premium activé",
      message: "Votre formation Super Apprenant a été validée. Vous bénéficiez désormais d'un accès Premium.",
    });
    toast.success("Encadreur validé en Premium");
    setSelected(null);
    load();
  };

  const reject = async () => {
    if (!selected) return;
    if (!motif.trim()) return toast.error("Veuillez saisir un motif");
    setSubmitting(true);
    const { error } = await supabase
      .from("encadreurs")
      .update({ formation_super_apprenant: false, formation_validee: false, premium: false })
      .eq("id", selected.id);
    if (error) { setSubmitting(false); return toast.error(error.message); }
    await supabase.from("notifications").insert({
      user_id: selected.profile_id,
      titre: "Demande non acceptée",
      message: `Votre demande de validation Super Apprenant n'a pas été acceptée.\n\nMotif : ${motif.trim()}`,
    });
    toast.success("Demande refusée");
    setSubmitting(false);
    setRejectOpen(false);
    setMotif("");
    setSelected(null);
    load();
  };

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-3xl font-bold text-primary">Validations encadreurs</h1>
      <p className="text-muted-foreground">Encadreurs ayant déclaré la formation Super Apprenant</p>
      <div className="grid md:grid-cols-2 gap-4">
        {rows.map((r) => (
          <Card key={r.id} className="p-5 flex justify-between items-start gap-3">
            <div>
              <h3 className="font-semibold">{r.profiles?.nom} {r.profiles?.prenoms}</h3>
              <p className="text-sm text-muted-foreground">{r.profiles?.email}</p>
              <div className="flex gap-2 mt-2">
                {r.formation_validee ? <Badge className="bg-accent text-accent-foreground">Premium</Badge> : <Badge variant="outline">À valider</Badge>}
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <Button size="sm" variant="outline" onClick={() => setSelected(r)}>
                <Eye className="h-4 w-4 mr-1" /> Voir détails
              </Button>
            </div>
          </Card>
        ))}
        {rows.length === 0 && <p className="text-muted-foreground">Aucune demande de validation.</p>}
      </div>

      <Dialog open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selected?.profiles?.nom} {selected?.profiles?.prenoms}
              {selected?.formation_validee && <Badge className="ml-2 bg-accent text-accent-foreground">Premium</Badge>}
            </DialogTitle>
          </DialogHeader>
          {selected && (
            <div className="space-y-6">
              <section>
                <h3 className="font-semibold text-primary mb-2">Profil</h3>
                <Field label="Nom" value={selected.profiles?.nom} />
                <Field label="Prénoms" value={selected.profiles?.prenoms} />
                <Field label="Nom d'utilisateur" value={selected.profiles?.username} />
                <Field label="Email" value={selected.profiles?.email} />
                <Field label="Téléphone" value={selected.profiles?.telephone} />
                <Field label="Profession" value={selected.profiles?.profession} />
                <Field label="Zone de résidence" value={selected.profiles?.zone_residence} />
                <Field label="Inscrit le" value={selected.profiles?.created_at ? new Date(selected.profiles.created_at).toLocaleString() : null} />
              </section>
              <section>
                <h3 className="font-semibold text-primary mb-2">Profil encadreur</h3>
                <Field label="Genre" value={selected.genre} />
                <Field label="Zone de résidence" value={selected.zone_residence} />
                <Field label="Dernier diplôme" value={selected.dernier_diplome} />
                <Field label="Expérience pro" value={selected.experience_pro} />
                <Field label="Détail expérience" value={selected.experience_detail} />
                <Field label="Niveaux" value={selected.niveaux} />
                <Field label="Classes primaire" value={selected.classes_primaire} />
                <Field label="Classes collège" value={selected.classes_college} />
                <Field label="Disciplines collège" value={selected.matieres_college} />
                <Field label="Classes lycée" value={selected.classes_lycee} />
                <Field label="Séries lycée" value={selected.series_lycee} />
                <Field label="Disciplines lycée" value={selected.matieres_lycee} />
                <Field label="Motivation" value={selected.motivation} />
                <Field label="Profil pédagogique" value={selected.profil_pedagogique} />
                <Field label="Formation Super Apprenant déclarée" value={selected.formation_super_apprenant} />
                <Field label="Formation validée" value={selected.formation_validee} />
                <Field label="Premium" value={selected.premium} />
              </section>
            </div>
          )}
          <DialogFooter>
            {selected && !selected.formation_validee && (
              <>
                <Button variant="destructive" onClick={() => reject(selected.id, selected.profile_id)}>
                  Ne pas accepter
                </Button>
                <Button onClick={() => validate(selected.id, selected.profile_id)} className="bg-brand text-white">
                  Valider en Premium
                </Button>
              </>
            )}
            <Button variant="ghost" onClick={() => setSelected(null)}>Fermer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
