import { createFileRoute } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";

export const Route = createFileRoute("/dashboard/parent/catalogue")({
  component: () => (
    <div className="p-6 space-y-4">
      <h1 className="text-3xl font-bold text-primary">Catalogue des encadreurs</h1>
      <Card className="p-8 text-center text-muted-foreground">
        🚧 Le système de matching sera activé dans la prochaine itération (Phase 2).
      </Card>
    </div>
  ),
});
