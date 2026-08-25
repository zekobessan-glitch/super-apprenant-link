import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { SectionHeading } from "./SectionHeading";
import { Check, ArrowRight, HeadphonesIcon, Gift, Star } from "lucide-react";

const PLANS = [
  {
    id: "encadreur",
    name: "Encadreur",
    badge: "Par contact",
    description: "Débloquez le contact des parents/élèves qui correspondent à votre profil.",
    price: "5 000 FCFA",
    period: "par contact débloqué",
    oldPrice: "",
    cta: "Créer mon profil",
    href: "/connexion",
    features: [
      "Inscription 100 % gratuite",
      "Profil pédagogique détaillé",
      "Matching par zone, classe et matières",
      "Coordonnées de l'apprenant après déblocage",
      "Paiement sécurisé via GeniusPay",
    ],
    bonus: {
      icon: Star,
      title: "Premium : contacts gratuits",
      text: "Suivez la formation Super Apprenant et débloquez vos contacts sans frais.",
    },
  },
  {
    id: "parent",
    name: "Parent / Élève",
    badge: "Pack 3 contacts",
    description: "Débloquez le contact des encadreurs vérifiés et suivez le parcours.",
    price: "5 000 FCFA",
    period: "le pack de 3 contacts",
    oldPrice: "",
    cta: "Débloquer un contact",
    href: "/connexion",
    features: [
      "3 crédits de contact inclus",
      "Accès aux encadreurs vérifiés",
      "Matching par zone, classe et matières",
      "Contact sécurisé et direct",
      "Suivi du parcours sur le tableau de bord",
    ],
    bonus: {
      icon: Gift,
      title: "Crédits valables sans limite",
      text: "Utilisez vos 3 crédits quand vous le souhaitez depuis votre tableau de bord.",
    },
  },
];


export function PricingSection() {
  return (
    <section id="tarifs" className="relative overflow-hidden bg-[#0d2233] py-16 md:py-24">
      {/* halos décoratifs */}
      <div className="pointer-events-none absolute -left-40 top-0 h-96 w-96 rounded-full bg-[#0056b3]/25 blur-[140px]" />
      <div className="pointer-events-none absolute -right-40 bottom-0 h-96 w-96 rounded-full bg-[#fba100]/20 blur-[140px]" />

      <div className="container relative z-10 mx-auto px-4">
        <div className="mx-auto max-w-3xl text-center">
          <SectionHeading
            align="center"
            eyebrow="Nos tarifs"
            title="Des prix simples, sans surprise."
            description="Choisissez le profil qui vous correspond : inscription gratuite pour les encadreurs, paiement à la mise en relation pour les familles."
            className="[&_[data-eyebrow]]:text-[#fba100] [&_h2]:text-white [&_p]:text-white/80"
          />
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-2 lg:max-w-5xl lg:mx-auto">
          {PLANS.map((plan) => {
            const BonusIcon = plan.bonus.icon;
            return (
              <div
                key={plan.id}
                className="flex flex-col rounded-[2rem] border border-white/10 bg-[#111820] p-6 transition-all hover:-translate-y-2 hover:border-[#fba100]/40 hover:shadow-elegant md:p-8"
              >
                {/* header */}
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-xl font-bold text-white md:text-2xl">{plan.name}</h3>
                    <p className="mt-1 text-sm text-white/60">{plan.description}</p>
                  </div>
                  <span className="rounded-full bg-[#22c55e]/15 px-3 py-1 text-xs font-bold text-[#22c55e] ring-1 ring-[#22c55e]/30">
                    {plan.badge}
                  </span>
                </div>

                {/* divider */}
                <div className="my-6 h-px w-full border-t border-dashed border-white/15" />

                {/* prix */}
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-extrabold tracking-tight text-white md:text-5xl">
                    {plan.price}
                  </span>
                  <span className="text-sm font-medium text-white/50">{plan.period}</span>
                </div>
                <p className="mt-1 text-sm text-white/40 line-through">{plan.oldPrice}</p>

                {/* CTA */}
                <Button
                  asChild
                  className="mt-6 h-12 w-full rounded-full bg-[#f5f0e8] text-black font-bold hover:bg-white transition-all"
                >
                  <Link to={plan.href} className="inline-flex items-center justify-center gap-2">
                    {plan.cta}
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>

                {/* features */}
                <ul className="mt-8 grid gap-3 sm:grid-cols-2">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2 text-sm text-white/80">
                      <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-[#fba100]" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* bonus */}
                <div className="mt-8 rounded-2xl border border-dashed border-white/10 bg-[#0b0f14]/60 p-4">
                  <div className="flex items-start gap-3">
                    <div className="grid h-9 w-9 place-items-center rounded-full bg-[#fba100]/15 text-[#fba100]">
                      <BonusIcon className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-[#fba100]">{plan.bonus.title}</p>
                      <p className="mt-0.5 text-xs leading-relaxed text-white/60">
                        {plan.bonus.text}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* support direct */}
        <div className="mx-auto mt-12 max-w-2xl rounded-2xl border border-[#22c55e]/20 bg-[#0b0f14]/60 p-5 text-center backdrop-blur-sm">
          <div className="flex items-center justify-center gap-2 text-[#22c55e]">
            <HeadphonesIcon className="h-4 w-4" />
            <span className="text-sm font-bold">Support direct inclus</span>
          </div>
          <p className="mt-1 text-xs text-white/60">
            Une question, un besoin spécifique — écrivez-nous et une vraie personne vous répond sous 24 h.
          </p>
        </div>
      </div>
    </section>
  );
}
