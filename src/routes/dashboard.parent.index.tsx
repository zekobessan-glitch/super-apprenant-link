import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { Card } from "@/components/ui/card";
import { GraduationCap, Lock } from "lucide-react";

export const Route = createFileRoute("/dashboard/parent/")({
  component: ParentHome,
});

function ParentHome() {
  const { user } = useAuth();
  const [credits, setCredits] = useState(0);
  const [matches, setMatches] = useState(0);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data: c } = await supabase.from("contacts_credits").select("credits_restants").eq("parent_id", user.id).maybeSingle();
      setCredits(c?.credits_restants ?? 0);
      const { count } = await supabase.from("correspondances").select("*", { count: "exact", head: true }).eq("parent_id", user.id);
      setMatches(count ?? 0);
    })();
  }, [user]);

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-primary">Tableau de bord parent</h1>
        <p className="text-muted-foreground">Trouvez le meilleur encadreur pour votre enfant</p>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <Card className="p-5 shadow-soft">
          <div className="bg-brand text-white inline-flex p-2.5 rounded-lg mb-3"><GraduationCap className="h-5 w-5" /></div>
          <div className="text-2xl font-bold">{matches}</div>
          <div className="text-sm text-muted-foreground">Encadreurs en relation</div>
        </Card>
        <Card className="p-5 shadow-soft">
          <div className="bg-accent-gradient text-foreground inline-flex p-2.5 rounded-lg mb-3"><Lock className="h-5 w-5" /></div>
          <div className="text-2xl font-bold">{credits}</div>
          <div className="text-sm text-muted-foreground">Crédits contact restants</div>
        </Card>
      </div>
      <Card className="p-5 bg-muted/30 border-dashed">
        <h3 className="font-semibold mb-2">Comment ça marche</h3>
        <ul className="text-sm text-muted-foreground space-y-1 list-disc pl-5">
          <li>5000 FCFA = pack de 3 contacts encadreurs</li>
          <li>Cliquez sur « Contacter » dans le catalogue pour utiliser un crédit</li>
        </ul>
      </Card>
    </div>
  );
}
