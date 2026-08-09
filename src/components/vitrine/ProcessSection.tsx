import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { SectionHeading } from "./SectionHeading";

const STEPS = [
  { title: "Inscription", text: "Créez votre compte parent/élève ou encadreur en quelques minutes." },
  { title: "Questionnaire", text: "Le profil d'apprentissage ou pédagogique est calculé automatiquement." },
  { title: "Compatibilité", text: "Zone, classe et matières doivent correspondre pour apparaître." },
  { title: "Mise en relation", text: "Débloquez le contact et échangez en toute sécurité." },
  { title: "Suivi", text: "Notifications, messages et support tout au long de l'année." },
];

export function ProcessSection() {
  return (
    <section id="processus" className="bg-background py-16 md:py-20">
      <div className="container mx-auto grid gap-10 px-4 lg:grid-cols-[minmax(0,340px)_minmax(0,1fr)] lg:items-center">
        <div className="space-y-6">
          <SectionHeading
            eyebrow="Notre processus"
            title="Cinq étapes, zéro approximation."
            description="Un parcours simple et transparent, du premier clic jusqu'au suivi de l'encadrement."
          />
          <Button asChild>
            <Link to="/connexion">Créer mon compte</Link>
          </Button>
        </div>

        <ol className="relative grid gap-8 sm:grid-cols-2 lg:grid-cols-5 lg:gap-4">
          <span className="absolute left-4 top-0 hidden h-full w-px bg-border sm:block lg:left-0 lg:top-5 lg:h-px lg:w-full" />
          {STEPS.map((s, i) => (
            <li key={s.title} className="relative flex gap-4 lg:block lg:text-center">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[#fba100] text-sm font-bold text-white shadow-soft lg:mx-auto">
                {i + 1}
              </span>
              <div className="min-w-0 lg:mt-4">
                <h3 className="text-sm font-bold text-foreground">{s.title}</h3>
                <p className="mt-1 text-xs leading-relaxed text-black">{s.text}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
