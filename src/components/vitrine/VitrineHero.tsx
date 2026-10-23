import { useEffect, useState, useCallback } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import heroAsset from "@/assets/hero-classe.jpg.asset.json";
import parentAsset from "@/assets/hero-encadreur.jpg.asset.json";
import eleveAsset from "@/assets/hero-eleve.jpg.asset.json";

const heroImage = heroAsset.url;
const parentImage = parentAsset.url;
const eleveImage = eleveAsset.url;

const SLIDES = [
  {
    image: heroImage,
    alt: "Encadreur ivoirien aidant deux enfants à faire leurs devoirs",
    kicker: "Encadrement scolaire · Côte d'Ivoire",
    title: "Chaque jour plus fort à l'école.",
    text: "SUPER@PPRENANT-I met en relation les parents et les élèves avec des encadreurs qualifiés, sélectionnés selon la zone de résidence, la classe, les matières et le profil d'apprentissage de chaque enfant.",
    cta: { to: "/connexion", label: "Commencer maintenant" },
  },
  {
    image: parentImage,
    alt: "Parent et enfant utilisant SUPER@PPRENANT-I à la maison",
    kicker: "Pour les parents",
    title: "Trouvez l'encadreur idéal pour votre enfant.",
    text: "Notre algorithme de compatibilité croise la zone de résidence, la classe et les matières pour vous proposer uniquement des profils réellement adaptés à votre enfant.",
    cta: { to: "/connexion", label: "Trouver un encadreur" },
  },
  {
    image: eleveImage,
    alt: "Élève ivoirien studieux avec ses cahiers",
    kicker: "Pour les élèves",
    title: "Apprenez plus vite, progressez chaque jour.",
    text: "Bénéficiez d'un encadrement personnalisé selon votre classe et vos matières, avec des encadreurs compatibles avec votre profil d'apprentissage.",
    cta: { to: "/connexion", label: "Rejoindre la plateforme" },
  },
];

export function VitrineHero() {
  const [index, setIndex] = useState(0);
  const total = SLIDES.length;

  const goTo = useCallback((i: number) => setIndex((i + total) % total), [total]);
  const next = useCallback(() => setIndex((i) => (i + 1) % total), [total]);
  const prev = useCallback(() => setIndex((i) => (i - 1 + total) % total), [total]);

  useEffect(() => {
    const id = setInterval(next, 6000);
    return () => clearInterval(id);
  }, [next, index]);

  return (
    <section id="accueil" className="relative overflow-hidden bg-brand">
      <div className="container mx-auto grid items-center gap-10 px-4 py-16 md:py-24 lg:grid-cols-2">
        {/* Colonne texte */}
        <div key={index} className="order-2 space-y-6 text-primary-foreground animate-fade-in lg:order-1">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">
            {SLIDES[index].kicker}
          </p>
          <h1 className="text-4xl font-bold leading-tight md:text-5xl lg:text-6xl">
            {SLIDES[index].title}
          </h1>
          <p className="max-w-xl text-base leading-relaxed text-primary-foreground/85 md:text-lg">
            {SLIDES[index].text}
          </p>
          <div className="flex flex-wrap gap-3">
            <Button asChild size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90">
              <Link to={SLIDES[index].cta.to}>
                {SLIDES[index].cta.label} <ArrowRight className="ml-2 h-4 w-4" />
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

          {/* Points de pagination */}
          <div className="flex gap-2 pt-2">
            {SLIDES.map((_, i) => (
              <button
                key={i}
                type="button"
                aria-label={`Aller au slide ${i + 1}`}
                onClick={() => goTo(i)}
                className={`h-2.5 rounded-full transition-all ${
                  i === index
                    ? "w-7 bg-accent"
                    : "w-2.5 bg-primary-foreground/50 hover:bg-primary-foreground"
                }`}
              />
            ))}
          </div>
        </div>

        {/* Colonne image */}
        <div className="relative order-1 lg:order-2">
          <div className="relative aspect-[4/3] overflow-hidden rounded-[2rem] shadow-elegant">
            {SLIDES.map((slide, i) => (
              <img
                key={i}
                src={slide.image}
                alt={slide.alt}
                width={1200}
                height={900}
                className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ${
                  i === index ? "opacity-100" : "opacity-0"
                }`}
                aria-hidden={i !== index}
              />
            ))}
          </div>

          {/* Flèches */}
          <button
            type="button"
            aria-label="Slide précédent"
            onClick={prev}
            className="absolute -left-3 top-1/2 z-10 -translate-y-1/2 rounded-full border border-primary-foreground/30 bg-primary p-2 text-primary-foreground shadow-soft backdrop-blur transition hover:bg-primary/90 md:-left-5"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            type="button"
            aria-label="Slide suivant"
            onClick={next}
            className="absolute -right-3 top-1/2 z-10 -translate-y-1/2 rounded-full border border-primary-foreground/30 bg-primary p-2 text-primary-foreground shadow-soft backdrop-blur transition hover:bg-primary/90 md:-right-5"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>
    </section>
  );
}
