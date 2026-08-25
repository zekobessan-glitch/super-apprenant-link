import { useCallback, useEffect, useState } from "react";
import { Star, ChevronLeft, ChevronRight, Zap } from "lucide-react";
import { Card } from "@/components/ui/card";
import { SectionHeading } from "./SectionHeading";


const TESTIMONIALS = [
  {
    text: "En deux jours, nous avons trouvé un encadreur de notre zone pour la classe de 3e. Les notes de mon fils ont nettement progressé.",
    name: "Aïcha Koné",
    role: "Parent, Abobo",
    highlight: "Encadreur trouvé en 2 jours",
  },
  {
    text: "Le profil pédagogique m'a permis d'être mis en relation avec des élèves qui correspondent vraiment à ma méthode d'enseignement.",
    name: "Yao Konan",
    role: "Encadreur, Bouaké",
    highlight: "Mise en relation ciblée",
  },
  {
    text: "Simple, sérieux et transparent. Le suivi par notifications et le support répondent rapidement à nos questions.",
    name: "Fatou Diarra",
    role: "Parent, Yamoussoukro",
    highlight: "Support réactif",
  },
  {
    text: "J'ai pu suivre le parcours de ma fille directement depuis le tableau de bord. L'encadreur est compétent et très à l'écoute.",
    name: "Marie-Thérèse Amani",
    role: "Parent, Cocody",
    highlight: "Suivi en temps réel",
  },
  {
    text: "La validation du dossier et la mise en relation sont rapides. Super Apprenant m'aide à trouver des apprenants sans difficulté.",
    name: "Kouamé Brou",
    role: "Encadreur, Korhogo",
    highlight: "Dossier validé rapidement",
  },
];


export function TestimonialsSection() {
  const [current, setCurrent] = useState(0);
  const [itemsPerView, setItemsPerView] = useState(3);

  useEffect(() => {
    const update = () => {
      setItemsPerView(window.innerWidth < 768 ? 1 : 3);
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  const maxIndex = Math.max(0, TESTIMONIALS.length - itemsPerView);
  const next = useCallback(() => {
    setCurrent((c) => (c >= maxIndex ? 0 : c + 1));
  }, [maxIndex]);
  const prev = useCallback(() => {
    setCurrent((c) => (c <= 0 ? maxIndex : c - 1));
  }, [maxIndex]);

  useEffect(() => {
    const id = setInterval(next, 6000);
    return () => clearInterval(id);
  }, [next]);

  return (
    <section id="temoignages" className="relative overflow-hidden bg-[#0b0f14] py-16 md:py-20">
      {/* halos colorés en arrière-plan */}
      <div className="pointer-events-none absolute -left-32 top-0 h-80 w-80 rounded-full bg-[#0056b3]/30 blur-[120px]" />
      <div className="pointer-events-none absolute -right-24 top-10 h-80 w-80 rounded-full bg-[#fba100]/20 blur-[120px]" />

      <div className="container relative z-10 mx-auto px-4">
        <div className="text-center mb-12">
          <SectionHeading
            align="center"
            eyebrow="Ils nous font confiance"
            title="Des familles accompagnées. Des résultats concrets."
            className="[&_h2]:text-white"
          />
        </div>

        <div className="relative">
          {/* Carousel track */}
          <div className="overflow-hidden">
            <div
              className="flex transition-transform duration-700 ease-out will-change-transform"
              style={{
                transform: `translateX(-${current * (100 / itemsPerView)}%)`,
              }}
            >
              {TESTIMONIALS.map((t) => (
                <div
                  key={t.name}
                  className="w-full flex-shrink-0 px-3 md:w-1/3"
                >
                  <Card className="flex h-full flex-col gap-4 rounded-2xl border border-white/10 bg-[#111820] p-7 shadow-soft transition-all duration-300 hover:-translate-y-2 hover:border-[#fba100]/40">
                    {/* étoiles */}
                    <div className="flex gap-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} className="h-4 w-4 fill-[#fba100] text-[#fba100]" />
                      ))}
                    </div>

                    {/* badge résultat */}
                    <span className="inline-flex w-fit items-center gap-1.5 rounded-full border border-[#22c55e]/40 bg-[#22c55e]/10 px-3 py-1 text-xs font-semibold text-[#22c55e]">
                      <Zap className="h-3.5 w-3.5" />
                      {t.highlight}
                    </span>

                    <p className="flex-1 text-sm leading-relaxed text-white/75">
                      « {t.text} »
                    </p>

                    <div className="mt-2 flex items-center gap-3 border-t border-white/10 pt-4">
                      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-base font-bold leading-none text-white/70">
                        ”
                      </span>
                      <div>
                        <p className="text-sm font-bold text-white">{t.name}</p>
                        <p className="text-xs text-white/50">{t.role}</p>
                      </div>
                    </div>
                  </Card>
                </div>
              ))}
            </div>
          </div>

          {/* Navigation arrows */}
          <button
            type="button"
            aria-label="Témoignage précédent"
            onClick={prev}
            className="absolute left-0 top-1/2 z-10 hidden -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/10 bg-[#111820] p-3 text-white shadow-elegant transition-all hover:scale-110 hover:bg-[#fba100] hover:text-black md:block"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            type="button"
            aria-label="Témoignage suivant"
            onClick={next}
            className="absolute right-0 top-1/2 z-10 hidden translate-x-1/2 -translate-y-1/2 rounded-full border border-white/10 bg-[#111820] p-3 text-white shadow-elegant transition-all hover:scale-110 hover:bg-[#fba100] hover:text-black md:block"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>

        {/* Dots */}
        <div className="mt-8 flex justify-center gap-2">
          {Array.from({ length: maxIndex + 1 }).map((_, i) => (
            <button
              key={i}
              type="button"
              aria-label={`Aller au témoignage ${i + 1}`}
              onClick={() => setCurrent(i)}
              className={`h-2.5 rounded-full transition-all ${
                i === current
                  ? "w-7 bg-[#fba100]"
                  : "w-2.5 bg-white/25 hover:bg-white/50"
              }`}
            />
          ))}
        </div>

      </div>
    </section>
  );
}
