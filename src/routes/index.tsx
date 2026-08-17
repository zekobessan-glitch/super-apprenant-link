import { createFileRoute } from "@tanstack/react-router";
import { Footer } from "@/components/Footer";
import { VitrineNav } from "@/components/vitrine/VitrineNav";
import { VitrineHero } from "@/components/vitrine/VitrineHero";
import { ActivitiesSection } from "@/components/vitrine/ActivitiesSection";
import { StatsSection } from "@/components/vitrine/StatsSection";
import { CategoriesSection } from "@/components/vitrine/CategoriesSection";
import { ProcessSection } from "@/components/vitrine/ProcessSection";
import { TestimonialsSection } from "@/components/vitrine/TestimonialsSection";
import { ContactSection } from "@/components/vitrine/ContactSection";
import { SectionHeading } from "@/components/vitrine/SectionHeading";
import { Reveal } from "@/components/vitrine/Reveal";
import { VitrineAuthPopup } from "@/components/vitrine/VitrineAuthPopup";

const TITLE = "SUPER@PPRENANT-I — Encadrement scolaire en Côte d'Ivoire";
const DESC =
  "Découvrez nos activités et apprenez à rechercher un encadreur, un apprenant ou suivre son parcours selon votre profil.";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESC },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESC },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: VitrinePage,
});

function VitrinePage() {
  return (
    <div className="flex min-h-screen flex-col">
      <VitrineNav />
      <main className="flex-1">
        <VitrineHero />
        <Reveal>
          <ActivitiesSection />
        </Reveal>
        <Reveal>
          <StatsSection />
        </Reveal>

        <Reveal>
          <section id="a-propos" className="bg-background py-16 md:py-20">
            <div className="container mx-auto grid gap-8 px-4 lg:grid-cols-2 lg:items-center">
              <SectionHeading
                eyebrow="Qui sommes-nous"
                title="Une plateforme ivoirienne dédiée à la réussite scolaire"
                description="SUPER@PPRENANT-I connecte les familles à des encadreurs vérifiés dans 11 zones du pays. Notre algorithme de compatibilité croise la zone de résidence, la classe, la série et les matières pour ne proposer que des profils réellement pertinents."
              />
              <blockquote className="rounded-xl border-l-4 border-accent bg-secondary/60 p-6 text-sm italic leading-relaxed text-muted-foreground md:text-base">
                « Instruis l'enfant selon la voie qu'il doit suivre, et quand il sera vieux, il ne
                s'en détournera pas. »
                <footer className="mt-3 text-xs font-semibold not-italic uppercase tracking-wider text-primary">
                  Proverbes 22 : 6
                </footer>
              </blockquote>
            </div>
          </section>
        </Reveal>

        <Reveal>
          <CategoriesSection />
        </Reveal>
        <Reveal>
          <ProcessSection />
        </Reveal>
        <Reveal>
          <TestimonialsSection />
        </Reveal>
        <Reveal>
          <ContactSection />
        </Reveal>
      </main>

      <Footer />
    </div>
  );
}
