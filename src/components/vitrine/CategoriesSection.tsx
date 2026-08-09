import { Link } from "@tanstack/react-router";
import { ArrowRight, Search } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SectionHeading } from "./SectionHeading";
import parentImg from "@/assets/vitrine-parent.jpg";
import encadreurImg from "@/assets/vitrine-encadreur.jpg";
import eleveAsset from "@/assets/vitrine-eleve-new.jpg.asset.json";

const eleveImg = eleveAsset.url;

const CATEGORIES = [
  {
    image: parentImg,
    alt: "Mère et fils ivoiriens consultant la plateforme sur un ordinateur portable",
    role: "Parent",
    title: "Rechercher un encadreur",
    steps: [
      "Créez le profil de votre enfant : zone, classe, série et matières.",
      "Répondez au questionnaire de profil d'apprentissage (9 questions).",
      "Ouvrez « Catalogue des encadreurs » : seuls les profils compatibles s'affichent.",
      "Débloquez le contact pour lancer la mise en relation.",
    ],
  },
  {
    image: encadreurImg,
    alt: "Jeune enseignant africain écrivant des mathématiques au tableau",
    role: "Encadreur",
    title: "Trouver des apprenants",
    steps: [
      "Renseignez diplôme, expérience, zone, niveaux, classes et matières.",
      "Complétez le questionnaire de profil pédagogique (6 questions).",
      "Attendez la validation de votre dossier par l'administration.",
      "Consultez « Catalogue des apprenants » et proposez votre encadrement.",
    ],
  },
  {
    image: eleveImg,
    alt: "Élève africaine souriante tenant ses livres dans la cour de l'école",
    role: "Élève",
    title: "Suivre son parcours",
    steps: [
      "Accédez au tableau de bord depuis le compte parent.",
      "Consultez vos correspondances et l'encadreur retenu.",
      "Recevez les notifications dans le menu « Messages ».",
      "Contactez l'équipe via le menu « Support » en cas de besoin.",
    ],
  },
];

export function CategoriesSection() {
  return (
    <section id="recherche" className="bg-secondary/50 py-16 md:py-20">
      <div className="container mx-auto px-4">
        <div className="grid gap-6 md:grid-cols-[minmax(0,1fr)_auto] md:items-end">
          <SectionHeading
            eyebrow="Comment rechercher"
            title="Une recherche adaptée à chaque profil"
            description="Parent, encadreur ou élève : la plateforme filtre automatiquement les résultats selon la zone de résidence, la classe et les matières."
          />
          <Link
            to="/connexion"
            className="inline-flex items-center text-sm font-semibold text-primary hover:underline"
          >
            Accéder à la plateforme <ArrowRight className="ml-1 h-4 w-4" />
          </Link>
        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {CATEGORIES.map((cat) => (
            <Card
              key={cat.role}
              className="group overflow-hidden p-0 shadow-soft transition-all hover:-translate-y-1 hover:shadow-elegant"
            >
              <div className="relative h-48 overflow-hidden">
                <img
                  src={cat.image}
                  alt={cat.alt}
                  loading="lazy"
                  width={1200}
                  height={900}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <Badge className="absolute left-4 top-4 bg-accent text-accent-foreground">
                  {cat.role}
                </Badge>
              </div>
              <div className="space-y-4 p-6">
                <h3 className="flex items-center gap-2 text-lg font-bold text-foreground">
                  <Search className="h-4 w-4 shrink-0 text-primary" />
                  {cat.title}
                </h3>
                <ol className="space-y-3">
                  {cat.steps.map((step, i) => (
                    <li key={step} className="flex gap-3 text-sm text-muted-foreground">
                      <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-primary text-[11px] font-bold text-primary-foreground">
                        {i + 1}
                      </span>
                      <span className="leading-relaxed">{step}</span>
                    </li>
                  ))}
                </ol>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
