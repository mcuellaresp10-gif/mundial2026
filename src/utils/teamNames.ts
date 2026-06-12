/** Nombres de selecciones en español (claves normalizadas en minúsculas sin acentos). */
const TEAM_NAMES_ES: Record<string, string> = {
  algeria: "Argelia",
  argentina: "Argentina",
  australia: "Australia",
  austria: "Austria",
  belgium: "Bélgica",
  "bosnia & herzegovina": "Bosnia y Herzegovina",
  "bosnia and herzegovina": "Bosnia y Herzegovina",
  brazil: "Brasil",
  canada: "Canadá",
  "cape verde": "Cabo Verde",
  "cape verde islands": "Cabo Verde",
  chile: "Chile",
  china: "China",
  colombia: "Colombia",
  "congo dr": "República Democrática del Congo",
  "dr congo": "República Democrática del Congo",
  "democratic republic of the congo": "República Democrática del Congo",
  "costa rica": "Costa Rica",
  croatia: "Croacia",
  curacao: "Curazao",
  "czech republic": "República Checa",
  czechia: "República Checa",
  ecuador: "Ecuador",
  egypt: "Egipto",
  england: "Inglaterra",
  france: "Francia",
  germany: "Alemania",
  ghana: "Ghana",
  greece: "Grecia",
  haiti: "Haití",
  honduras: "Honduras",
  iran: "Irán",
  iraq: "Irak",
  ireland: "Irlanda",
  israel: "Israel",
  italy: "Italia",
  "ivory coast": "Costa de Marfil",
  "cote d'ivoire": "Costa de Marfil",
  "côte d'ivoire": "Costa de Marfil",
  jamaica: "Jamaica",
  japan: "Japón",
  jordan: "Jordania",
  mexico: "México",
  morocco: "Marruecos",
  netherlands: "Países Bajos",
  "new zealand": "Nueva Zelanda",
  "northern ireland": "Irlanda del Norte",
  norway: "Noruega",
  panama: "Panamá",
  paraguay: "Paraguay",
  peru: "Perú",
  poland: "Polonia",
  portugal: "Portugal",
  qatar: "Catar",
  "saudi arabia": "Arabia Saudita",
  scotland: "Escocia",
  senegal: "Senegal",
  serbia: "Serbia",
  "south africa": "Sudáfrica",
  "south korea": "Corea del Sur",
  "korea republic": "Corea del Sur",
  "republic of korea": "Corea del Sur",
  spain: "España",
  sweden: "Suecia",
  switzerland: "Suiza",
  tunisia: "Túnez",
  turkey: "Turquía",
  turkiye: "Turquía",
  usa: "Estados Unidos",
  "united states": "Estados Unidos",
  uruguay: "Uruguay",
  uzbekistan: "Uzbekistán",
  venezuela: "Venezuela",
  wales: "Gales",
};

function normalizeTeamNameKey(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/&/g, "and")
    .replace(/\s+/g, " ")
    .trim();
}

/** Devuelve el nombre de la selección en español para mostrar en la UI. */
export function translateTeamName(name: string): string {
  if (!name) return name;
  const key = normalizeTeamNameKey(name);
  return TEAM_NAMES_ES[key] ?? name;
}

/** Busca por nombre en inglés o español (p. ej. filtros y búsqueda global). */
export function teamNameMatchesQuery(name: string, query: string): boolean {
  const q = query.toLowerCase().trim();
  if (!q) return true;
  const original = name.toLowerCase();
  const translated = translateTeamName(name).toLowerCase();
  return original.includes(q) || translated.includes(q);
}

/** Etiqueta de partido con nombres en español. */
export function formatFixtureTeamsLabel(home: string, away: string): string {
  return `${translateTeamName(home)} vs ${translateTeamName(away)}`;
}
