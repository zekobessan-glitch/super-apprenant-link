import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Lock, Crown } from "lucide-react";

export const Route = createFileRoute("/dashboard/encadreur/")({
  component: EncadreurHome,
});

function EncadreurHome() {
  const { user } = useAuth();
  const [premium, setPremium] = useState(false);
  const [matches, setMatches] = useState(0);
  const [debloques, setDebloques] = useState(0);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data: enc } = await supabase.from("encadreurs").select("premium").eq("profile_id", user.id).maybeSingle();
      setPremium(!!enc?.premium);
      const { count } = await supabase.from("correspondances").select("*", { count: "exact", head: true }).eq("encadreur_id", user.id);
      setMatches(count ?? 0);
      const { count: dc } = await supabase.from("correspondances").select("*", { count: "exact", head: true }).eq("encadreur_id", user.id).eq("contact_debloque", true);
      setDebloques(dc ?? 0);
    })();
  }, [user]);

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-primary">Tableau de bord encadreur</h1>
          <p className="text-muted-foreground">Bienvenue !</p>
        </div>
        {premium && (
          <Badge className="bg-accent-gradient text-accent-foreground gap-1">
            <Crown className="h-3 w-3" /> Premium
          </Badge>
        )}
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <Card className="p-5 shadow-soft">
          <div className="bg-brand text-white inline-flex p-2.5 rounded-lg mb-3"><Users className="h-5 w-5" /></div>
          <div className="text-2xl font-bold">{matches}</div>
          <div className="text-sm text-muted-foreground">Correspondances</div>
        </Card>
        <Card className="p-5 shadow-soft">
          <div className="bg-accent-gradient text-foreground inline-flex p-2.5 rounded-lg mb-3"><Lock className="h-5 w-5" /></div>
          <div className="text-2xl font-bold">{debloques}/5</div>
          <div className="text-sm text-muted-foreground">Contacts débloqués</div>
        </Card>
      </div>
      <Card className="p-5 bg-muted/30 border-dashed">
        <h3 className="font-semibold mb-2">Comment ça marche</h3>
        <ul className="text-sm text-muted-foreground space-y-1 list-disc pl-5">
          <li>Consultez le catalogue des parents/élèves correspondant à votre profil.</li>
          <li>Premium : accès gratuit aux contacts. Sinon : 5000 FCFA par contact débloqué.</li>
          <li>Limite : 5 contacts maximum.</li>
        </ul>
      </Card>
    </div>
  );
}
