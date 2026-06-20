/**
 * Ranking FIFA (posición mundial, menor = mejor) para selecciones del Mundial 2026.
 * Actualizable sin tocar la lógica de simulación.
 */

function normalizeTeamName(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

/** Posición FIFA aproximada por nombre normalizado (mayo 2026). */
const FIFA_RANK_BY_NAME: Record<string, number> = {
  argentina: 1,
  france: 2,
  spain: 3,
  england: 4,
  brazil: 5,
  portugal: 6,
  netherlands: 7,
  belgium: 8,
  germany: 9,
  croatia: 10,
  morocco: 11,
  colombia: 12,
  uruguay: 13,
  italy: 14,
  usa: 15,
  "united states": 15,
  mexico: 16,
  japan: 17,
  switzerland: 18,
  senegal: 19,
  iran: 20,
  denmark: 21,
  "korea republic": 22,
  "south korea": 22,
  ecuador: 23,
  austria: 24,
  australia: 25,
  ukraine: 26,
  turkey: 27,
  poland: 28,
  serbia: 29,
  canada: 30,
  wales: 31,
  scotland: 32,
  "ivory coast": 33,
  "cote d'ivoire": 33,
  sweden: 34,
  ghana: 35,
  chile: 36,
  "saudi arabia": 37,
  nigeria: 38,
  paraguay: 39,
  peru: 40,
  hungary: 41,
  czechia: 42,
  "czech republic": 42,
  romania: 43,
  norway: 44,
  cameroon: 45,
  qatar: 46,
  "costa rica": 47,
  panama: 48,
  jamaica: 49,
  tunisia: 50,
  algeria: 51,
  egypt: 52,
  bolivia: 53,
  venezuela: 54,
  honduras: 55,
  iraq: 56,
  china: 57,
  "new zealand": 58,
  "south africa": 59,
  greece: 60,
  finland: 61,
  ireland: 62,
  slovenia: 63,
  slovakia: 64,
  "north macedonia": 65,
  albania: 66,
  bosnia: 67,
  israel: 68,
  georgia: 69,
  uzbekistan: 70,
  jordan: 71,
  uae: 72,
  haiti: 73,
  curacao: 74,
  zambia: 75,
  congo: 76,
  "congo dr": 76,
  "dr congo": 76,
  "democratic republic of the congo": 76,
  mali: 77,
  "burkina faso": 78,
  burkina: 78,
  "cape verde": 79,
  cape: 79,
  angola: 80,
  kazakhstan: 81,
  iceland: 82,
  oman: 83,
  bahrain: 84,
  kuwait: 85,
  india: 86,
  thailand: 87,
  vietnam: 88,
  indonesia: 89,
  philippines: 90,
  malaysia: 91,
  singapore: 92,
  guatemala: 93,
  "el salvador": 94,
  nicaragua: 95,
  cuba: 96,
  syria: 97,
  lebanon: 98,
  palestine: 99,
  yemen: 100,
};

const DEFAULT_FIFA_RANK = 70;

export function getFifaRank(teamName: string): number {
  const key = normalizeTeamName(teamName);
  if (FIFA_RANK_BY_NAME[key] != null) return FIFA_RANK_BY_NAME[key];
  for (const [name, rank] of Object.entries(FIFA_RANK_BY_NAME)) {
    if (key.includes(name) || name.includes(key)) return rank;
  }
  return DEFAULT_FIFA_RANK;
}

/** Convierte posición FIFA (1 = mejor) a fuerza 0–100 para simulaciones. */
export function strengthFromFifaRank(rank: number): number {
  if (rank <= 0) return 62;
  const strength = 95 - (rank - 1) * 0.48;
  return Math.min(95, Math.max(38, Math.round(strength * 10) / 10));
}

export function getStrengthFromFifaRanking(teamName: string): number {
  return strengthFromFifaRank(getFifaRank(teamName));
}
