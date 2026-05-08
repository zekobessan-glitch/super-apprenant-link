import { createFileRoute } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";

export const Route = createFileRoute("/dashboard/parent/correspondances")({
  component: () => (
    <div className="p-6 space-y-4">
      <h1 className="text-3xl font-bold text-primary">Mes contacts</h1>
      <Card className="p-8 text-center text-muted-foreground">Aucun contact pour le moment.</Card>
    </div>
  ),
});
