import { Quote } from "lucide-react";
import { Card } from "@/components/ui/card";
import { SectionHeading } from "./SectionHeading";

const TESTIMONIALS = [
  {
    text: "En deux jours, nous avons trouvé un encadreur de notre zone pour la classe de 3e. Les notes de mon fils ont nettement progressé.",
    name: "Aïcha Koné",
    role: "Parent, Abobo",
  },
  {
    text: "Le profil pédagogique m'a permis d'être mis en relation avec des élèves qui correspondent vraiment à ma méthode d'enseignement.",
    name: "Yao Konan",
    role: "Encadreur, Bouaké",
  },
  {
    text: "Simple, sérieux et transparent. Le suivi par notifications et le support répondent rapidement à nos questions.",
    name: "Fatou Diarra",
    role: "Parent, Yamoussoukro",
  },
];

export function TestimonialsSection() {
  return (
    <section id="temoignages" className="bg-secondary/50 py-16 md:py-20">
      <div className="container mx-auto grid gap-10 px-4 lg:grid-cols-[minmax(0,320px)_minmax(0,1fr)]">
        <SectionHeading
          eyebrow="Ils nous font confiance"
          title="Des familles accompagnées. Des résultats concrets."
        />
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {TESTIMONIALS.map((t) => (
            <Card key={t.name} className="flex flex-col gap-4 p-6 shadow-soft transition-shadow hover:shadow-elegant">
              <Quote className="h-6 w-6 shrink-0 text-accent" />
              <p className="text-sm leading-relaxed text-muted-foreground">{t.text}</p>
              <div className="mt-auto">
                <p className="text-sm font-bold text-foreground">{t.name}</p>
                <p className="text-xs text-muted-foreground">{t.role}</p>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
