import { CLASSES_PRIMAIRE, CLASSES_COLLEGE, CLASSES_LYCEE } from "./constants";

export type Niveau = "primaire" | "college" | "lycee";

/** Normalise une zone ("Zone 6", "zone_6", "zone6") -> "zone6" parmi les 11 zones. */
export function normalizeZone(zone: string | null | undefined): string | null {
  if (!zone) return null;
  const m = String(zone).toLowerCase().replace(/[\s_-]/g, "").match(/^zone(\d{1,2})$/);
  if (!m) return null;
  const n = Number(m[1]);
  if (!Number.isInteger(n) || n < 1 || n > 11) return null;
  return `zone${n}`;
}

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
 * Critères éliminatoires (score 0 si non respectés) :
 * - Zone de résidence identique
 * - Niveau + classe de l'apprenant pris en charge par l'encadreur
 * - Matières de l'apprenant incluses dans celles de l'encadreur (collège/lycée)
 * Bonus : série lycée (10 pts), profil pédagogique (10 pts).
 */
export function computeMatchScore(
  app: MatchInputApprenant,
  enc: MatchInputEncadreur
): number {
  // 1) Zone de résidence : critère n°1, strictement éliminatoire
  const zoneApp = normalizeZone(app.zone);
  const zoneEnc = normalizeZone(enc.zone);
  if (!zoneApp || !zoneEnc || zoneApp !== zoneEnc) return 0;
  let score = 30;

  // 2) Niveau + classe : éliminatoires
  if (!enc.niveaux.includes(app.niveau)) return 0;
  score += 15;

  const classes =
    app.niveau === "primaire"
      ? enc.classes_primaire
      : app.niveau === "college"
      ? enc.classes_college
      : enc.classes_lycee;
  if (!classes.includes(app.classe)) return 0;
  score += 20;

  // 3) Matières : éliminatoires (toutes celles de l'apprenant doivent être couvertes)
  if (app.niveau !== "primaire") {
    const encMat = app.niveau === "college" ? enc.matieres_college : enc.matieres_lycee;
    const demandees = app.matieres ?? [];
    if (demandees.length > 0) {
      const toutesCouvertes = demandees.every((m) => encMat.includes(m));
      if (!toutesCouvertes) return 0;
    }
    score += 25;
  } else {
    score += 25; // primaire : pas de matière spécifique
  }

  // Bonus
  if (app.niveau === "lycee" && app.serie && enc.series_lycee.includes(app.serie)) {
    score += 10;
  }
  if (app.profil_apprentissage && enc.profil_pedagogique && app.profil_apprentissage === enc.profil_pedagogique) {
    score += 10;
  }

  return Math.min(100, Math.round(score));
}

