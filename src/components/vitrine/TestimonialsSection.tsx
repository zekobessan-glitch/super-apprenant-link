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
    <section id="temoignages" className="bg-[#c5d8f7] py-16 md:py-20 overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <SectionHeading
            align="center"
            eyebrow="Ils nous font confiance"
            title="Des familles accompagnées. Des résultats concrets."
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
                  <Card className="flex h-full flex-col gap-5 rounded-[2rem] border-0 bg-white p-8 shadow-soft transition-all duration-300 hover:-translate-y-2 hover:shadow-elegant">
                    <Quote className="h-8 w-8 shrink-0 text-[#fba100]" />
                    <p className="flex-1 text-sm leading-relaxed text-black/80">
                      {t.text}
                    </p>
                    <div>
                      <p className="text-sm font-bold text-[#004d00]">
                        {t.name}
                      </p>
                      <p className="text-xs text-muted-foreground">{t.role}</p>
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
            className="absolute left-0 top-1/2 z-10 hidden -translate-x-1/2 -translate-y-1/2 rounded-full bg-white p-3 text-[#004d00] shadow-elegant transition-all hover:scale-110 hover:bg-[#004d00] hover:text-white md:block"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            type="button"
            aria-label="Témoignage suivant"
            onClick={next}
            className="absolute right-0 top-1/2 z-10 hidden translate-x-1/2 -translate-y-1/2 rounded-full bg-white p-3 text-[#004d00] shadow-elegant transition-all hover:scale-110 hover:bg-[#004d00] hover:text-white md:block"
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
                  : "w-2.5 bg-[#004d00]/30 hover:bg-[#004d00]/50"
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
