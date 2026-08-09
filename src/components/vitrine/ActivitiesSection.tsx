import { BookOpen, GraduationCap, Users, Sparkles, ShieldCheck } from "lucide-react";
import { Card } from "@/components/ui/card";
import { SectionHeading } from "./SectionHeading";

const ACTIVITIES = [
  {
    icon: BookOpen,
    title: "Cours de soutien",
    text: "Encadrement à domicile dans toutes les matières, du primaire au lycée, selon le programme officiel.",
  },
  {
    icon: Sparkles,
    title: "Profil d'apprentissage",
    text: "Un questionnaire identifie automatiquement la manière dont l'enfant apprend le mieux.",
  },
  {
    icon: GraduationCap,
    title: "Profil pédagogique",
    text: "Chaque encadreur est évalué pour connaître sa méthode d'enseignement dominante.",
  },
  {
    icon: Users,
    title: "Mise en relation ciblée",
    text: "Zone, classe et matières doivent correspondre : seuls les profils compatibles s'affichent.",
  },
  {
    icon: ShieldCheck,
    title: "Encadreurs validés",
    text: "Diplômes, expérience et formation Super Apprenant vérifiés par l'administration.",
  },
];

export function ActivitiesSection() {
  return (
    <section id="activites" className="bg-background py-16 md:py-20">
      <div className="container mx-auto px-4">
        <SectionHeading
          eyebrow="Nos activités"
          title="Un accompagnement scolaire complet"
          description="De l'identification du profil de l'enfant jusqu'à la mise en relation avec le bon encadreur, chaque étape est pensée pour la réussite."
        />

        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-5">
          {ACTIVITIES.map(({ icon: Icon, title, text }) => (
            <Card
              key={title}
              className="group flex flex-col gap-3 p-6 shadow-soft transition-all hover:-translate-y-1 hover:shadow-elegant"
            >
              <Icon className="h-9 w-9 shrink-0 text-[#fba100] transition-transform group-hover:scale-110" />
              <h3 className="text-base font-bold text-foreground">{title}</h3>
              <p className="text-sm leading-relaxed text-black">{text}</p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
