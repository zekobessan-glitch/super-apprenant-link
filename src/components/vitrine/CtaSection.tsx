import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";

export function CtaSection() {
  return (
    <section className="bg-background py-10 md:py-14">
      <div className="container mx-auto px-4">
        <div className="relative overflow-hidden rounded-[2.5rem] bg-[#0b0f14] px-6 py-14 text-center shadow-elegant md:px-12 md:py-20">
          {/* Glows at top */}
          <div className="pointer-events-none absolute -left-20 -top-24 h-64 w-64 rounded-full bg-primary/30 blur-[100px]" />
          <div className="pointer-events-none absolute -right-20 -top-24 h-64 w-64 rounded-full bg-accent/30 blur-[100px]" />

          {/* Dotted pattern */}
          <div
            className="pointer-events-none absolute inset-0 opacity-20"
            style={{
              backgroundImage:
                "radial-gradient(circle, rgba(255,255,255,0.25) 1px, transparent 1px)",
              backgroundSize: "24px 24px",
            }}
          />

          <div className="relative mx-auto max-w-2xl space-y-6">
            <h2 className="text-3xl font-bold leading-tight text-white md:text-5xl">
              Prêt à trouver l’encadreur idéal pour votre enfant ?
            </h2>
            <p className="mx-auto max-w-xl text-sm leading-relaxed text-white/70 md:text-base">
              Créez votre compte gratuitement, complétez le profil d’apprentissage et découvrez
              dès maintenant les encadreurs disponibles dans votre zone.
            </p>

            <div className="flex flex-col items-center justify-center gap-4 pt-2 sm:flex-row">
              <Link
                to="/connexion"
                className="inline-flex items-center gap-2 rounded-full bg-[#fba100] px-7 py-3.5 text-sm font-bold text-black shadow-lg transition-transform hover:scale-105"
              >
                Commencer maintenant
                <ArrowRight className="h-4 w-4" />
              </Link>
              <span className="text-xs text-white/50">
                Inscription rapide, sans engagement
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
