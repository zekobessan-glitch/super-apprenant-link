import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import heroImage from "@/assets/vitrine-hero.jpg";

export function VitrineHero() {
  return (
    <section id="accueil" className="relative overflow-hidden">
      <img
        src={heroImage}
        alt="Encadreur ivoirien aidant deux enfants à faire leurs devoirs"
        width={1600}
        height={1000}
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div className="absolute inset-0 bg-linear-to-r from-primary/95 via-primary/80 to-primary/30" />

      <div className="container relative mx-auto px-4 py-20 md:py-28">
        <div className="max-w-2xl space-y-6 text-primary-foreground">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">
            Encadrement scolaire · Côte d'Ivoire
          </p>
          <h1 className="text-4xl font-bold leading-tight md:text-5xl lg:text-6xl">
            Chaque jour plus fort à l'école.
          </h1>
          <p className="max-w-xl text-base leading-relaxed text-primary-foreground/85 md:text-lg">
            SUPER@PPRENANT-I met en relation les parents et les élèves avec des encadreurs
            qualifiés, sélectionnés selon la zone de résidence, la classe, les matières et le
            profil d'apprentissage de chaque enfant.
          </p>
          <div className="flex flex-wrap gap-3">
            <Button asChild size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90">
              <Link to="/">
                Commencer maintenant <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="border-primary-foreground/40 bg-transparent text-primary-foreground hover:bg-primary-foreground/10"
            >
              <a href="#recherche">Comment ça marche</a>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
