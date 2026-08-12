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
    <section id="processus" className="bg-background py-16 md:py-24">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-3xl text-center">
          <SectionHeading
            eyebrow="Notre processus"
            title="Cinq étapes, zéro approximation."
            description="Un parcours simple et transparent, du premier clic jusqu'au suivi de l'encadrement."
          />
        </div>

        <div className="relative mt-12 md:mt-16">
          {/* Ligne de connexion desktop */}
          <div className="absolute left-0 right-0 top-10 hidden h-px bg-border md:block" />

          <ol className="relative grid gap-8 md:grid-cols-5 md:gap-6">
            {STEPS.map((s, i) => (
              <li key={s.title} className="relative flex items-start gap-4 md:block md:text-center">
                {/* Cercle numéroté */}
                <span className="relative z-10 grid h-14 w-14 shrink-0 place-items-center rounded-full bg-accent text-base font-bold text-accent-foreground shadow-soft md:mx-auto">
                  {i + 1}
                </span>

                {/* Ligne verticale mobile */}
                {i < STEPS.length - 1 && (
                  <span className="absolute left-7 top-14 h-[calc(100%-2rem)] w-px bg-border md:hidden" />
                )}

                <div className="min-w-0 pt-2 md:mt-4 md:pt-0">
                  <h3 className="text-base font-bold text-foreground">{s.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-black">{s.text}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>

        <div className="mt-12 flex justify-center md:mt-16">
          <Button asChild>
            <Link to="/connexion">Créer mon compte</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
