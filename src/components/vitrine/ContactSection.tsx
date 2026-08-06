import { Link } from "@tanstack/react-router";
import { ArrowRight, Mail, MapPin, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import ctaImage from "@/assets/vitrine-hero.jpg";

export function ContactSection() {
  return (
    <section id="contact" className="bg-background">
      <div className="grid lg:grid-cols-2">
        <img
          src={ctaImage}
          alt="Encadrement scolaire à domicile en Côte d'Ivoire"
          loading="lazy"
          width={1600}
          height={1000}
          className="h-64 w-full object-cover lg:h-full"
        />
        <div className="flex items-center bg-secondary/50 px-4 py-14 md:px-10">
          <div className="w-full max-w-xl space-y-6">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
              Rejoignez-nous
            </p>
            <h2 className="text-2xl font-bold text-foreground md:text-3xl">
              Prêt à faire progresser votre enfant ?
            </h2>
            <p className="text-sm leading-relaxed text-muted-foreground md:text-base">
              Créez votre compte gratuitement, complétez le questionnaire et découvrez
              immédiatement les profils compatibles dans votre zone.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button asChild size="lg">
                <Link to="/">
                  Créer un compte <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link to="/">Se connecter</Link>
              </Button>
            </div>
            <Card className="grid gap-3 p-5 shadow-soft">
              <p className="flex items-center gap-3 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4 shrink-0 text-primary" /> Abidjan, Côte d'Ivoire
              </p>
              <p className="flex items-center gap-3 text-sm text-muted-foreground">
                <Mail className="h-4 w-4 shrink-0 text-primary" /> ekbessan@gmail.com
              </p>
              <p className="flex items-center gap-3 text-sm text-muted-foreground">
                <Phone className="h-4 w-4 shrink-0 text-primary" /> Support disponible depuis votre tableau de bord
              </p>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
}
