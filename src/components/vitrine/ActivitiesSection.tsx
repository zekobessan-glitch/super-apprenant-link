import { BookOpen, GraduationCap, Users, Sparkles, ShieldCheck } from "lucide-react";
import { Card } from "@/components/ui/card";
import { SectionHeading } from "./SectionHeading";

const ACTIVITIES = [
  {
    icon: BookOpen,
    title: "Cours de soutien",
    text: "Encadrement à domicile dans toutes les matières, du primaire au lycée, selon le programme officiel.",
    iconGradient: "bg-gradient-to-br from-[#0056b3] via-[#0077e6] to-[#4facfe]",
    cardGradient: "from-[#0056b3]/5 via-[#0077e6]/5 to-transparent",
  },
  {
    icon: Sparkles,
    title: "Profil d'apprentissage",
    text: "Un questionnaire identifie automatiquement la manière dont l'enfant apprend le mieux.",
    iconGradient: "bg-gradient-to-br from-[#fba100] via-[#ffbd2e] to-[#ffe259]",
    cardGradient: "from-[#fba100]/5 via-[#ffbd2e]/5 to-transparent",
  },
  {
    icon: GraduationCap,
    title: "Profil pédagogique",
    text: "Chaque encadreur est évalué pour connaître sa méthode d'enseignement dominante.",
    iconGradient: "bg-gradient-to-br from-[#0056b3] via-[#3a8bc2] to-[#00d2ff]",
    cardGradient: "from-[#0056b3]/5 via-[#00d2ff]/5 to-transparent",
  },
  {
    icon: Users,
    title: "Mise en relation ciblée",
    text: "Zone, classe et matières doivent correspondre : seuls les profils compatibles s'affichent.",
    iconGradient: "bg-gradient-to-br from-[#ff7e5f] via-[#f59e0b] to-[#fba100]",
    cardGradient: "from-[#ff7e5f]/5 via-[#fba100]/5 to-transparent",
  },
  {
    icon: ShieldCheck,
    title: "Encadreurs validés",
    text: "Diplômes, expérience et formation Super Apprenant vérifiés par l'administration.",
    iconGradient: "bg-gradient-to-br from-[#0056b3] via-[#6a11cb] to-[#9b59b6]",
    cardGradient: "from-[#0056b3]/5 via-[#9b59b6]/5 to-transparent",
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

        <div className="mt-20 grid gap-x-5 gap-y-20 sm:grid-cols-2 lg:grid-cols-5">
          {ACTIVITIES.map(({ icon: Icon, title, text, iconGradient, cardGradient }) => (
            <div key={title} className="group relative pt-12">
              {/* arche verte */}
              <div className="absolute left-1/2 top-0 z-0 h-24 w-24 -translate-x-1/2 rounded-full bg-primary" />
              {/* pastille avec dégradé */}
              <div
                className={`absolute left-1/2 top-3 z-20 flex h-16 w-16 -translate-x-1/2 items-center justify-center rounded-full ${iconGradient} shadow-soft transition-transform group-hover:scale-110`}
              >
                <Icon className="h-8 w-8 text-white" />
              </div>
              <Card className="relative z-10 flex h-full flex-col items-center gap-3 overflow-hidden rounded-3xl bg-gradient-to-b px-5 pb-7 pt-12 text-center shadow-soft transition-all group-hover:-translate-y-1 group-hover:shadow-elegant">
                <div className={`absolute inset-0 bg-gradient-to-b ${cardGradient} opacity-60 pointer-events-none`} />
                <h3 className="relative z-10 text-base font-extrabold text-[#fba100]">{title}</h3>
                <p className="relative z-10 text-sm leading-relaxed text-black">{text}</p>
              </Card>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}

