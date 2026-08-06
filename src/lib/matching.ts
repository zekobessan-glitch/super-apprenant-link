import { CLASSES_PRIMAIRE, CLASSES_COLLEGE, CLASSES_LYCEE } from "./constants";

export type Niveau = "primaire" | "college" | "lycee";

export function classeToNiveau(classe: string): Niveau | null {
  if (CLASSES_PRIMAIRE.includes(classe)) return "primaire";
  if (CLASSES_COLLEGE.includes(classe)) return "college";
  if (CLASSES_LYCEE.includes(classe)) return "lycee";
  return null;
}

export interface MatchInputApprenant {
  zone: string;
  niveau: Niveau;
  classe: string;
  serie?: string | null;
  matieres: string[];
  profil_apprentissage?: string | null;
}

export interface MatchInputEncadreur {
  zone: string;
  niveaux: Niveau[];
  classes_primaire: string[];
  classes_college: string[];
  classes_lycee: string[];
  series_lycee: string[];
  matieres_college: string[];
  matieres_lycee: string[];
  profil_pedagogique?: string | null;
}

/**
 * Score de matching 0-100.
 * - Zone : 25 pts (résidence identique)
 * - Niveau : 20 pts (encadreur enseigne ce niveau)
 * - Classe : 15 pts (classe précise prise en charge)
 * - Série (lycée) : 10 pts
 * - Matières : 20 pts (au moins 1 commune, +5 par matière)
 * - Profil pédagogique : 10 pts (compatibilité visuel/auditif/kinesthésique)
 */
export function computeMatchScore(
  app: MatchInputApprenant,
  enc: MatchInputEncadreur
): number {
  let score = 0;

  // La zone de résidence est éliminatoire : pas de proposition hors zone.
  if (app.zone !== enc.zone) return 0;
  score += 25;

  if (enc.niveaux.includes(app.niveau)) score += 20;
  else return Math.round(score); // niveau incompatible : on s'arrête tôt

  const classes =
    app.niveau === "primaire"
      ? enc.classes_primaire
      : app.niveau === "college"
      ? enc.classes_college
      : enc.classes_lycee;
  if (classes.includes(app.classe)) score += 15;

  if (app.niveau === "lycee" && app.serie && enc.series_lycee.includes(app.serie)) {
    score += 10;
  }

  if (app.niveau !== "primaire") {
    const encMat = app.niveau === "college" ? enc.matieres_college : enc.matieres_lycee;
    const common = app.matieres.filter((m) => encMat.includes(m));
    if (common.length > 0) score += Math.min(20, 10 + common.length * 5);
  } else {
    score += 20; // primaire : pas de matière spécifique
  }

  if (app.profil_apprentissage && enc.profil_pedagogique && app.profil_apprentissage === enc.profil_pedagogique) {
    score += 10;
  }

  return Math.min(100, Math.round(score));
}
