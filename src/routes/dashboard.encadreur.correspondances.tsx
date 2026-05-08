import { createFileRoute } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";

export const Route = createFileRoute("/dashboard/encadreur/correspondances")({
  component: () => (
    <div className="p-6 space-y-4">
      <h1 className="text-3xl font-bold text-primary">Mes correspondances</h1>
      <Card className="p-8 text-center text-muted-foreground">Aucune correspondance pour le moment.</Card>
    </div>
  ),
});
