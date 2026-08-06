import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Menu, X } from "lucide-react";
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

export function VitrineNav() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
      <nav className="container mx-auto grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 px-4 py-3 lg:flex lg:justify-between">
        <a href="#accueil" className="flex min-w-0 items-center gap-2">
          <img src={logo} alt="Logo SUPER@PPRENANT-I" className="h-9 w-9 shrink-0 rounded-md object-cover" />
          <span className="truncate text-base font-bold text-primary">SUPER@PPRENANT-I</span>
        </a>

        <ul className="hidden items-center gap-6 lg:flex">
          {LINKS.map((l) => (
            <li key={l.href}>
              <a
                href={l.href}
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
              >
                {l.label}
              </a>
            </li>
          ))}
        </ul>

        <div className="hidden lg:block">
          <Button asChild>
            <Link to="/">Se connecter</Link>
          </Button>
        </div>

        <button
          type="button"
          aria-label="Ouvrir le menu"
          onClick={() => setOpen((v) => !v)}
          className="shrink-0 rounded-md border p-2 text-primary lg:hidden"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </nav>

      {open ? (
        <div className="border-t bg-card lg:hidden">
          <ul className="container mx-auto flex flex-col px-4 py-2">
            {LINKS.map((l) => (
              <li key={l.href}>
                <a
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className="block py-2 text-sm font-medium text-muted-foreground hover:text-primary"
                >
                  {l.label}
                </a>
              </li>
            ))}
            <li className="py-3">
              <Button asChild className="w-full">
                <Link to="/">Se connecter</Link>
              </Button>
            </li>
          </ul>
        </div>
      ) : null}
    </header>
  );
}
