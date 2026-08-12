import { Link } from "@tanstack/react-router";
import { ArrowRight, Mail, MapPin, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { SectionHeading } from "./SectionHeading";
import ctaAsset from "@/assets/vitrine-cta.jpg.asset.json";

const ctaImage = ctaAsset.url;

const CONTACTS = [
  {
    icon: MapPin,
    label: "Adresse",
    value: "Abidjan, Côte d'Ivoire",
  },
  {
    icon: Mail,
    label: "E-mail",
    value: "kalogne.2020@gmail.com",
    href: "mailto:kalogne.2020@gmail.com",
  },
  {
    icon: Phone,
    label: "Téléphone",
    value: "+225 07 47 26 25 77",
    href: "tel:+2250747262577",
  },
];

export function ContactSection() {
  return (
    <section id="contact" className="bg-secondary/30 py-16 md:py-24">
      <div className="container mx-auto px-4">
        <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
          {/* Image */}
          <div className="relative order-2 lg:order-1">
            <div className="absolute -inset-3 rounded-[2.5rem] bg-gradient-to-br from-primary/20 via-accent/20 to-primary/10 blur-2xl" />
            <div className="relative overflow-hidden rounded-[2rem] shadow-elegant">
              <img
                src={ctaImage}
                alt="Encadrement scolaire à domicile en Côte d'Ivoire"
                loading="lazy"
                width={1600}
                height={1000}
                className="h-72 w-full object-cover lg:h-[32rem]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-primary/40 via-transparent to-transparent" />
            </div>
          </div>

          {/* Contenu */}
          <div className="order-1 lg:order-2">
            <div className="max-w-xl">
              <SectionHeading
                eyebrow="Rejoignez-nous"
                title="Prêt à faire progresser votre enfant ?"
                description="Créez votre compte gratuitement, complétez le questionnaire et découvrez immédiatement les profils compatibles dans votre zone."
              />

              <div className="mt-8 flex flex-wrap gap-3">
                <Button
                  asChild
                  size="lg"
                  className="rounded-full bg-gradient-to-r from-primary to-primary-glow px-7 font-bold shadow-elegant transition-transform hover:scale-105"
                >
                  <Link to="/connexion">
                    Créer un compte <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="rounded-full border-primary/30 px-7 font-bold text-primary hover:bg-primary hover:text-primary-foreground"
                >
                  <Link to="/connexion">Se connecter</Link>
                </Button>
              </div>

              {/* Cartes de contact */}
              <div className="mt-10 grid gap-4 sm:grid-cols-3">
                {CONTACTS.map(({ icon: Icon, label, value, href }) => (
                  <Card
                    key={label}
                    className="group relative overflow-hidden border-0 bg-card p-5 text-center shadow-soft transition-all hover:-translate-y-1 hover:shadow-elegant"
                  >
                    <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary via-accent to-primary" />
                    <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-accent transition-transform group-hover:scale-110">
                      <Icon className="h-5 w-5 text-accent-foreground" />
                    </div>
                    <p className="text-sm font-bold text-[#004d00]">{label}</p>
                    {href ? (
                      <a
                        href={href}
                        className="mt-1 block text-sm text-muted-foreground transition-colors hover:text-primary break-words"
                      >
                        {value}
                      </a>
                    ) : (
                      <p className="mt-1 text-sm text-muted-foreground break-words">{value}</p>
                    )}
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
