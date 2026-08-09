import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Menu, X, Search, MapPin, Phone, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import logo from "@/assets/logo.jpg";

const LINKS = [
  { label: "Accueil", href: "#accueil" },
  { label: "À propos", href: "#a-propos" },
  { label: "Activités", href: "#activites" },
  { label: "Recherche", href: "#recherche" },
  { label: "Processus", href: "#processus" },
  { label: "Témoignages", href: "#temoignages" },
  { label: "Contact", href: "#contact" },
];

const INFOS = [
  { icon: MapPin, label: "Siège :", value: "Abidjan, Côte d'Ivoire" },
  { icon: Phone, label: "Téléphone :", value: "+225 07 47 26 25 77" },
  { icon: Mail, label: "E-mail :", value: "contact@superapprenant-i.com" },
];

export function VitrineNav() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/85">
      {/* Bandeau d'informations */}
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-4 py-3 lg:grid-cols-[auto_repeat(3,minmax(0,1fr))] lg:gap-8">
          <a href="#accueil" className="flex min-w-0 items-center gap-2">
            <img
              src={logo}
              alt="Logo SUPER@PPRENANT-I"
              className="h-11 w-11 shrink-0 rounded-full object-cover ring-2 ring-primary/20"
            />
            <span className="truncate text-sm font-extrabold text-primary sm:text-base lg:hidden xl:inline">
              SUPER@PPRENANT-I
            </span>
          </a>

          {INFOS.map((info, i) => (
            <div
              key={info.label}
              className={`hidden min-w-0 items-start gap-2 lg:flex ${i > 0 ? "lg:border-l lg:border-border lg:pl-8" : ""}`}
            >
              <info.icon className="mt-1 h-4 w-4 shrink-0 text-accent" />
              <div className="min-w-0">
                <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">{info.label}</p>
                <p className="truncate text-sm font-bold text-primary">{info.value}</p>
              </div>
            </div>
          ))}

          <button
            type="button"
            aria-label="Ouvrir le menu"
            onClick={() => setOpen((v) => !v)}
            className="justify-self-end rounded-md border p-2 text-primary lg:hidden"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Barre de navigation en pilule */}
      <div className="container mx-auto hidden px-4 pb-4 lg:block">
        <div className="flex items-center gap-3">
          <nav className="flex flex-1 items-center rounded-full bg-primary px-8 py-3.5 shadow-lg">
            <ul className="flex flex-wrap items-center gap-7">
              {LINKS.map((l) => (
                <li key={l.href}>
                  <a
                    href={l.href}
                    className="text-sm font-bold uppercase tracking-wide text-primary-foreground/90 transition-colors hover:text-primary-foreground"
                  >
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <button
            type="button"
            aria-label="Rechercher"
            onClick={() => {
              document.querySelector("#recherche")?.scrollIntoView({ behavior: "smooth" });
            }}
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-accent text-accent-foreground shadow-lg transition-transform hover:scale-105"
          >
            <Search className="h-5 w-5" />
          </button>

          <Button asChild size="lg" className="h-12 shrink-0 rounded-full px-7 font-bold shadow-lg">
            <Link to="/connexion">Se connecter</Link>
          </Button>
        </div>
      </div>

      {open ? (
        <div className="border-t bg-card lg:hidden">
          <ul className="container mx-auto flex flex-col px-4 py-2">
            {LINKS.map((l) => (
              <li key={l.href}>
                <a
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className="block py-2 text-sm font-semibold uppercase text-muted-foreground hover:text-primary"
                >
                  {l.label}
                </a>
              </li>
            ))}
            {INFOS.map((info) => (
              <li key={info.label} className="flex items-center gap-2 py-1 text-sm text-muted-foreground">
                <info.icon className="h-4 w-4 shrink-0 text-accent" />
                <span className="truncate font-semibold text-primary">{info.value}</span>
              </li>
            ))}
            <li className="py-3">
              <Button asChild className="w-full rounded-full">
                <Link to="/connexion">Se connecter</Link>
              </Button>
            </li>
          </ul>
        </div>
      ) : null}
    </header>
  );
}
