import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { GraduationCap, Users } from "lucide-react";
import { RegisterEncadreur } from "./RegisterEncadreur";
import { RegisterParent } from "./RegisterParent";

export function RegisterChooser() {
  const [choice, setChoice] = useState<"none" | "encadreur" | "parent">("none");

  if (choice === "encadreur") {
    return <RegisterEncadreur onBack={() => setChoice("none")} />;
  }
  if (choice === "parent") {
    return <RegisterParent onBack={() => setChoice("none")} />;
  }

  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground text-center mb-4">
        Choisissez votre profil pour commencer
      </p>
      <Card
        onClick={() => setChoice("parent")}
        className="p-4 cursor-pointer hover:border-primary hover:shadow-soft transition-all flex items-center gap-4 animate-float-slow hover:[animation-play-state:paused]"
      >
        <div className="bg-brand text-white p-3 rounded-lg">
          <Users className="h-6 w-6" />
        </div>
        <div>
          <h3 className="font-semibold">Parent / Élève</h3>
          <p className="text-xs text-muted-foreground">
            Trouvez un encadreur pour votre enfant
          </p>
        </div>
      </Card>
      <Card
        onClick={() => setChoice("encadreur")}
        className="p-4 cursor-pointer hover:border-primary hover:shadow-soft transition-all flex items-center gap-4 animate-float-slower hover:[animation-play-state:paused]"
      >
        <div className="bg-accent-gradient text-foreground p-3 rounded-lg">
          <GraduationCap className="h-6 w-6" />
        </div>
        <div>
          <h3 className="font-semibold">Encadreur</h3>
          <p className="text-xs text-muted-foreground">
            Rejoignez notre équipe d'encadrants
          </p>
        </div>
      </Card>
      <p className="text-xs text-muted-foreground text-center pt-2">
        Vous êtes administrateur ? Connectez-vous via l'onglet Connexion.
      </p>
    </div>
  );
}
