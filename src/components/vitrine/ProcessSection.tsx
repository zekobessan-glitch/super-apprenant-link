import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { SectionHeading } from "./SectionHeading";
import { UserPlus, ClipboardList, Filter, Handshake, Bell } from "lucide-react";

const STEPS = [
  {
    label: "Étape 1 — Inscription",
    title: "Créez votre compte",
    text: "Créez votre compte parent/élève ou encadreur en quelques minutes.",
    footer: "Disponible pour tous les profils",
    icon: UserPlus,
    iconBg: "bg-gradient-to-br from-[#3b82f6] to-[#1d4ed8]",
  },
  {
    label: "Étape 2 — Questionnaire",
    title: "Remplissez le profil",
    text: "Le profil d'apprentissage ou pédagogique est calculé automatiquement.",
    footer: "Algorithme de compatibilité",
    icon: ClipboardList,
    iconBg: "bg-gradient-to-br from-[#f59e0b] to-[#d97706]",
  },
  {
    label: "Étape 3 — Compatibilité",
    title: "Comparez les critères",
    text: "Zone, classe et matières doivent correspondre pour apparaître.",
    footer: "Zone / Classe / Matières",
    icon: Filter,
    iconBg: "bg-gradient-to-br from-[#06b6d4] to-[#0891b2]",
  },
  {
    label: "Étape 4 — Mise en relation",
    title: "Débloquez le contact",
    text: "Débloquez le contact et échangez en toute sécurité.",
    footer: "Paiement sécurisé",
    icon: Handshake,
    iconBg: "bg-gradient-to-br from-[#f97316] to-[#ea580c]",
  },
  {
    label: "Étape 5 — Suivi",
    title: "Restez accompagné",
    text: "Notifications, messages et support tout au long de l'année.",
    footer: "Support tout au long de l'année",
    icon: Bell,
    iconBg: "bg-gradient-to-br from-[#8b5cf6] to-[#7c3aed]",
  },
];

export function ProcessSection() {
  return (
    <section id="processus" className="bg-[#0d2233] py-16 md:py-24">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-3xl text-center">
          <SectionHeading
            align="center"
            eyebrow="Notre processus"
            title="Cinq étapes, zéro approximation."
            description="Un parcours simple et transparent, du premier clic jusqu'au suivi de l'encadrement."
            className="[&_[data-eyebrow]]:text-[#fba100] [&_h2]:text-white [&_p]:text-white/80"
          />
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {STEPS.map((s) => {
            const Icon = s.icon;
            return (
              <div
                key={s.label}
                className="group flex flex-col rounded-[2rem] border border-white/10 bg-[#0b0f14] p-6 transition-all hover:-translate-y-2 hover:border-[#fba100]/40 hover:shadow-elegant"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`grid h-10 w-10 place-items-center rounded-full ${s.iconBg} shadow-soft`}
                  >
                    <Icon className="h-5 w-5 text-white" />
                  </div>
                  <p className="font-mono text-[11px] font-bold uppercase tracking-wider text-[#fba100]">
                    {s.label}
                  </p>
                </div>

                <h3 className="mt-5 text-lg font-bold text-white">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-white/70">{s.text}</p>

                <div className="my-5 h-px w-full bg-white/10" />

                <p className="mt-auto text-xs font-medium text-white/50">{s.footer}</p>
              </div>
            );
          })}
        </div>

        <div className="mt-12 flex justify-center md:mt-16">
          <Button asChild className="bg-[#fba100] text-black hover:bg-[#ff8c1a]">
            <Link to="/connexion">Créer mon compte</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}

