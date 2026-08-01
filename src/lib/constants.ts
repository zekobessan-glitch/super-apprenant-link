export const ZONES = {
  zone1: "Zone 1 (Anyama, Abobo, Adjamé, Attécoubé, Plateau, Cocody, Bingerville)",
  zone2: "Zone 2 (Yopougon, Songon)",
  zone3: "Zone 3 (Treichville, Marcory, Koumassi, Port-Bouët)",
  zone4: "Zone 4 (Bouaké)",
  zone5: "Zone 5 (Yamoussoukro)",
  zone6: "Zone 6 (Korhogo)",
  zone7: "Zone 7 (Daloa)",
  zone8: "Zone 8 (Man)",
  zone9: "Zone 9 (Odienné)",
  zone10: "Zone 10 (Bondoukou)",
  zone11: "Zone 11 (San Pédro)",
} as const;

export type ZoneKey = keyof typeof ZONES;

export function formatZone(zone: string | null | undefined): string {
  if (!zone) return "";
  return ZONES[zone as ZoneKey] ?? zone;
}

export const CLASSES_PRIMAIRE = ["CP1", "CP2", "CE1", "CE2", "CM1", "CM2"];
export const CLASSES_COLLEGE = ["6e", "5e", "4e", "3e"];
export const CLASSES_LYCEE = ["Seconde", "Première", "Terminale"];
export const SERIES = ["A", "C", "D"] as const;

export const MATIERES = [
  "Histoire et géographie",
  "Sciences (physiques)",
  "Sciences (vie et terre)",
  "Mathématiques",
  "Français",
  "Anglais",
  "Espagnol",
  "Allemand",
  "Philosophie",
  "Dessins d'art",
  "Musique",
  "Informatique",
];

export const ROLE_LABEL = {
  admin: "Administrateur",
  encadreur: "Encadreur",
  parent: "Parent / Élève",
} as const;
