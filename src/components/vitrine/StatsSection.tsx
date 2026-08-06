import { MapPin, Users, BookOpen, Award } from "lucide-react";

const STATS = [
  { icon: MapPin, value: "11", label: "Zones couvertes" },
  { icon: Users, value: "150+", label: "Encadreurs qualifiés" },
  { icon: BookOpen, value: "20+", label: "Matières enseignées" },
  { icon: Award, value: "98%", label: "Parents satisfaits" },
];

export function StatsSection() {
  return (
    <section className="bg-secondary py-12">
      <div className="container mx-auto grid grid-cols-2 gap-6 px-4 lg:grid-cols-4 lg:divide-x lg:divide-border">
        {STATS.map(({ icon: Icon, value, label }) => (
          <div key={label} className="flex min-w-0 items-center justify-center gap-3 px-2">
            <Icon className="h-8 w-8 shrink-0 text-primary" />
            <div className="min-w-0">
              <p className="text-2xl font-bold text-foreground md:text-3xl">{value}</p>
              <p className="truncate text-xs text-muted-foreground md:text-sm">{label}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
