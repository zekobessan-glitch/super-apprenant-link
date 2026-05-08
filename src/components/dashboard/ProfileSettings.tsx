import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export function ProfilePage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) return;
    supabase.from("profiles").select("*").eq("id", user.id).maybeSingle()
      .then(({ data }) => setProfile(data));
  }, [user]);

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
    if (error) toast.error(error.message); else toast.success("Profil mis à jour");
  };

  if (!profile) return <div className="p-6">Chargement…</div>;

  return (
    <div className="p-6 max-w-2xl space-y-4">
      <h1 className="text-3xl font-bold text-primary">Mon profil</h1>
      <Card className="p-6 space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div><Label>Nom</Label><Input value={profile.nom ?? ""} onChange={(e) => setProfile({ ...profile, nom: e.target.value })} /></div>
          <div><Label>Prénoms</Label><Input value={profile.prenoms ?? ""} onChange={(e) => setProfile({ ...profile, prenoms: e.target.value })} /></div>
        </div>
        <div><Label>Nom d'utilisateur</Label><Input value={profile.username ?? ""} onChange={(e) => setProfile({ ...profile, username: e.target.value })} /></div>
        <div><Label>Email</Label><Input value={profile.email ?? ""} disabled /></div>
        <div><Label>Téléphone</Label><Input value={profile.telephone ?? ""} onChange={(e) => setProfile({ ...profile, telephone: e.target.value })} /></div>
        <Button onClick={save} disabled={saving} className="bg-brand text-white">{saving ? "Enregistrement..." : "Enregistrer"}</Button>
      </Card>
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
