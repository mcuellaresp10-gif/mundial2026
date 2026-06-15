export type Confederation = "UEFA" | "CONMEBOL" | "CONCACAF" | "CAF" | "AFC" | "OFC";

export const CONFEDERATION_LABELS: Record<Confederation, string> = {
  UEFA: "UEFA (Europa)",
  CONMEBOL: "CONMEBOL (Sudamérica)",
  CONCACAF: "CONCACAF (N/C América)",
  CAF: "CAF (África)",
  AFC: "AFC (Asia/Oceanía)",
  OFC: "OFC (Oceanía)",
};

export const CONFEDERATION_COLORS: Record<Confederation, string> = {
  UEFA: "#003DA5",
  CONMEBOL: "#FCD116",
  CONCACAF: "#CE1126",
  CAF: "#008751",
  AFC: "#FF6B00",
  OFC: "#00A1DE",
};

function normalizeKey(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/-/g, " ")
    .replace(/\s+/g, " ")
    .toLowerCase()
    .trim();
}

/**
 * Clasificación oficial — Mundial 2026.
 * Incluye nombres API (inglés), country con guiones y alias en español.
 */
const WORLD_CUP_2026_CONFEDERATIONS: Record<string, Confederation> = {
  // UEFA (16)
  england: "UEFA",
  inglaterra: "UEFA",
  france: "UEFA",
  francia: "UEFA",
  croatia: "UEFA",
  croacia: "UEFA",
  portugal: "UEFA",
  norway: "UEFA",
  noruega: "UEFA",
  germany: "UEFA",
  alemania: "UEFA",
  netherlands: "UEFA",
  "paises bajos": "UEFA",
  belgium: "UEFA",
  belgica: "UEFA",
  austria: "UEFA",
  spain: "UEFA",
  espana: "UEFA",
  switzerland: "UEFA",
  suiza: "UEFA",
  scotland: "UEFA",
  escocia: "UEFA",
  "czech republic": "UEFA",
  czechia: "UEFA",
  chequia: "UEFA",
  "republica checa": "UEFA",
  sweden: "UEFA",
  suecia: "UEFA",
  "bosnia and herzegovina": "UEFA",
  "bosnia & herzegovina": "UEFA",
  bosnia: "UEFA",
  "bosnia y herzegovina": "UEFA",
  turkey: "UEFA",
  turkiye: "UEFA",
  turquia: "UEFA",

  // CAF (9)
  algeria: "CAF",
  argelia: "CAF",
  "cape verde": "CAF",
  "cape verde islands": "CAF",
  "cabo verde": "CAF",
  "ivory coast": "CAF",
  "cote d'ivoire": "CAF",
  "costa de marfil": "CAF",
  egypt: "CAF",
  egipto: "CAF",
  ghana: "CAF",
  morocco: "CAF",
  marruecos: "CAF",
  "dr congo": "CAF",
  "congo dr": "CAF",
  "democratic republic of the congo": "CAF",
  "congo democratic republic": "CAF",
  "republica democratica del congo": "CAF",
  "south africa": "CAF",
  "sudáfrica": "CAF",
  sudfrica: "CAF",
  tunisia: "CAF",
  tunez: "CAF",
  senegal: "CAF",

  // AFC (9)
  "saudi arabia": "AFC",
  "arabia saudi": "AFC",
  "arabia saudita": "AFC",
  australia: "AFC",
  qatar: "AFC",
  catar: "AFC",
  uae: "AFC",
  "united arab emirates": "AFC",
  "emiratos arabes unidos": "AFC",
  iraq: "AFC",
  irak: "AFC",
  iran: "AFC",
  japan: "AFC",
  japon: "AFC",
  jordan: "AFC",
  jordania: "AFC",
  uzbekistan: "AFC",
  "south korea": "AFC",
  "korea republic": "AFC",
  "republic of korea": "AFC",
  "corea del sur": "AFC",

  // CONCACAF (6)
  canada: "CONCACAF",
  "united states": "CONCACAF",
  usa: "CONCACAF",
  "estados unidos": "CONCACAF",
  mexico: "CONCACAF",
  curacao: "CONCACAF",
  haiti: "CONCACAF",
  panama: "CONCACAF",

  // CONMEBOL (6)
  argentina: "CONMEBOL",
  brazil: "CONMEBOL",
  brasil: "CONMEBOL",
  colombia: "CONMEBOL",
  ecuador: "CONMEBOL",
  paraguay: "CONMEBOL",
  uruguay: "CONMEBOL",

  // OFC (1)
  "new zealand": "OFC",
  "nueva zelanda": "OFC",
};

export function getConfederation(countryOrTeamName: string): Confederation {
  const key = normalizeKey(countryOrTeamName);
  return WORLD_CUP_2026_CONFEDERATIONS[key] ?? "UEFA";
}

export function buildTeamConfederationMap(
  teams: { id: number; name: string; country: string }[]
): Map<number, Confederation> {
  const map = new Map<number, Confederation>();
  for (const t of teams) {
    const fromName = WORLD_CUP_2026_CONFEDERATIONS[normalizeKey(t.name)];
    const fromCountry = WORLD_CUP_2026_CONFEDERATIONS[normalizeKey(t.country)];
    map.set(t.id, fromName ?? fromCountry ?? getConfederation(t.name));
  }
  return map;
}
