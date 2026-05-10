import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

function ReadField({ label, value }: { label: string; value: any }) {
  if (value === null || value === undefined || value === "" || (Array.isArray(value) && value.length === 0)) return null;
  const display = Array.isArray(value)
    ? value.join(", ")
    : typeof value === "boolean"
    ? value ? "Oui" : "Non"
    : String(value);
  return (
    <div className="grid grid-cols-3 gap-2 py-2 border-b border-border/50 text-sm">
      <div className="font-medium text-muted-foreground">{label}</div>
      <div className="col-span-2 break-words">{display}</div>
    </div>
  );
}

export function ProfilePage() {
  const { user, role } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [encadreur, setEncadreur] = useState<any>(null);
  const [apprenants, setApprenants] = useState<any[]>([]);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    if (!user) return;
    const { data: p } = await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle();
    setProfile(p);
    if (role === "encadreur") {
      const { data: e } = await supabase.from("encadreurs").select("*").eq("profile_id", user.id).maybeSingle();
      setEncadreur(e);
    } else if (role === "parent") {
      const { data: a } = await supabase.from("apprenants").select("*").eq("parent_id", user.id);
      setApprenants(a ?? []);
    }
  };

  useEffect(() => { load(); }, [user, role]);

  const save = async () => {
    if (!profile || !user) return;
    setSaving(true);
    const { error } = await supabase.from("profiles").update({
      nom: profile.nom,
      prenoms: profile.prenoms,
      telephone: profile.telephone,
      username: profile.username,
    }).eq("id", user.id);
    setSaving(false);
    if (error) toast.error(error.message);
    else { toast.success("Profil mis à jour"); setEditing(false); }
  };

  if (!profile) return <div className="p-6">Chargement…</div>;

  return (
    <div className="p-6 max-w-3xl space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-primary">Mon profil</h1>
        {role && <Badge variant="secondary" className="capitalize">{role}</Badge>}
      </div>

      <Card className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Informations personnelles</h2>
          {!editing && <Button size="sm" variant="outline" onClick={() => setEditing(true)}>Modifier</Button>}
        </div>
        {editing ? (
          <>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Nom</Label><Input value={profile.nom ?? ""} onChange={(e) => setProfile({ ...profile, nom: e.target.value })} /></div>
              <div><Label>Prénoms</Label><Input value={profile.prenoms ?? ""} onChange={(e) => setProfile({ ...profile, prenoms: e.target.value })} /></div>
            </div>
            <div><Label>Nom d'utilisateur</Label><Input value={profile.username ?? ""} onChange={(e) => setProfile({ ...profile, username: e.target.value })} /></div>
            <div><Label>Email</Label><Input value={profile.email ?? ""} disabled /></div>
            <div><Label>Téléphone</Label><Input value={profile.telephone ?? ""} onChange={(e) => setProfile({ ...profile, telephone: e.target.value })} /></div>
            <div className="flex gap-2">
              <Button onClick={save} disabled={saving} className="bg-brand text-white">{saving ? "Enregistrement..." : "Enregistrer"}</Button>
              <Button variant="ghost" onClick={() => { setEditing(false); load(); }}>Annuler</Button>
            </div>
          </>
        ) : (
          <div>
            <ReadField label="Nom" value={profile.nom} />
            <ReadField label="Prénoms" value={profile.prenoms} />
            <ReadField label="Nom d'utilisateur" value={profile.username} />
            <ReadField label="Email" value={profile.email} />
            <ReadField label="Téléphone" value={profile.telephone} />
            <ReadField label="Profession" value={profile.profession} />
            <ReadField label="Zone de résidence" value={profile.zone_residence} />
            <ReadField label="Inscrit le" value={profile.created_at ? new Date(profile.created_at).toLocaleString() : null} />
          </div>
        )}
      </Card>

      {role === "encadreur" && encadreur && (
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-3">Profil encadreur</h2>
          <ReadField label="Genre" value={encadreur.genre} />
          <ReadField label="Zone de résidence" value={encadreur.zone_residence} />
          <ReadField label="Dernier diplôme" value={encadreur.dernier_diplome} />
          <ReadField label="Expérience pro" value={encadreur.experience_pro} />
          <ReadField label="Détail expérience" value={encadreur.experience_detail} />
          <ReadField label="Niveaux" value={encadreur.niveaux} />
          <ReadField label="Classes primaire" value={encadreur.classes_primaire} />
          <ReadField label="Classes collège" value={encadreur.classes_college} />
          <ReadField label="Disciplines collège" value={encadreur.matieres_college} />
          <ReadField label="Classes lycée" value={encadreur.classes_lycee} />
          <ReadField label="Séries lycée" value={encadreur.series_lycee} />
          <ReadField label="Disciplines lycée" value={encadreur.matieres_lycee} />
          <ReadField label="Motivation" value={encadreur.motivation} />
          <ReadField label="Profil pédagogique" value={encadreur.profil_pedagogique} />
          <ReadField label="Formation validée" value={encadreur.formation_validee} />
          <ReadField label="Formation Super Apprenant" value={encadreur.formation_super_apprenant} />
          <ReadField label="Premium" value={encadreur.premium} />
        </Card>
      )}

      {role === "parent" && (
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-3">Mes apprenants ({apprenants.length})</h2>
          {apprenants.length === 0 && <p className="text-sm text-muted-foreground">Aucun apprenant enregistré.</p>}
          {apprenants.map((a, i) => (
            <div key={a.id} className="mb-4 p-3 rounded-lg bg-muted/40">
              <div className="font-medium mb-2">Apprenant {i + 1} — {a.nom} {a.prenoms}</div>
              <ReadField label="Âge" value={a.age} />
              <ReadField label="Niveau" value={a.niveau} />
              <ReadField label="Classe" value={a.classe} />
              <ReadField label="Série" value={a.serie} />
              <ReadField label="Matières" value={a.matieres} />
              <ReadField label="Profil d'apprentissage" value={a.profil_apprentissage} />
              <ReadField label="Zone de résidence" value={a.zone_residence} />
            </div>
          ))}
        </Card>
      )}
    </div>
  );
}

export function SettingsPage() {
  const [pwd, setPwd] = useState("");
  const [loading, setLoading] = useState(false);
  const change = async () => {
    if (pwd.length < 6) return toast.error("Min 6 caractères");
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password: pwd });
    setLoading(false);
    if (error) toast.error(error.message); else { toast.success("Mot de passe modifié"); setPwd(""); }
  };
  return (
    <div className="p-6 max-w-2xl space-y-4">
      <h1 className="text-3xl font-bold text-primary">Paramètres</h1>
      <Card className="p-6 space-y-4">
        <div><Label>Nouveau mot de passe</Label><Input type="password" value={pwd} onChange={(e) => setPwd(e.target.value)} /></div>
        <Button onClick={change} disabled={loading} className="bg-brand text-white">Changer le mot de passe</Button>
      </Card>
    </div>
  );
}
