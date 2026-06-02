/**
 * Fuerza previa por selección (0–100) para simulación pre-Mundial.
 * Basado en ranking FIFA / potencial en torneo — ajustable sin cambiar la UI.
 */
const PRIOR_BY_NAME: Record<string, number> = {
  argentina: 90,
  france: 89,
  spain: 88,
  england: 87,
  brazil: 87,
  portugal: 86,
  netherlands: 85,
  belgium: 84,
  germany: 84,
  uruguay: 82,
  croatia: 81,
  morocco: 80,
  colombia: 78,
  mexico: 77,
  usa: 76,
  "united states": 76,
  ecuador: 74,
  japan: 74,
  switzerland: 74,
  senegal: 73,
  iran: 72,
  "korea republic": 72,
  "south korea": 72,
  australia: 71,
  austria: 71,
  ukraine: 70,
  poland: 69,
  serbia: 69,
  denmark: 69,
  turkey: 68,
  chile: 67,
  paraguay: 66,
  peru: 65,
  sweden: 65,
  nigeria: 64,
  hungary: 63,
  czechia: 63,
  "czech republic": 63,
  wales: 62,
  scotland: 62,
  cameroon: 61,
  "costa rica": 60,
  panama: 58,
  jamaica: 57,
  qatar: 55,
  tunisia: 55,
  algeria: 54,
  egypt: 53,
  canada: 62,
  bolivia: 52,
  venezuela: 52,
  honduras: 51,
  "saudi arabia": 58,
  iraq: 52,
  china: 50,
  "new zealand": 48,
  "south africa": 52,
  ghana: 58,
  "ivory coast": 62,
  "cote d'ivoire": 62,
  romania: 64,
  greece: 63,
  norway: 64,
  finland: 58,
  ireland: 60,
  "northern ireland": 55,
  slovenia: 58,
  slovakia: 57,
  "north macedonia": 54,
  albania: 52,
  bosnia: 54,
  israel: 56,
  georgia: 55,
  uzbekistan: 50,
  jordan: 52,
  uae: 52,
  oman: 48,
  bahrain: 46,
  kuwait: 45,
  india: 45,
  thailand: 46,
  vietnam: 47,
  indonesia: 46,
  philippines: 44,
  malaysia: 44,
  singapore: 42,
  haiti: 50,
  "trinidad and tobago": 48,
  curacao: 52,
  suriname: 46,
  guatemala: 48,
  "el salvador": 47,
  nicaragua: 44,
  cuba: 45,
  bermuda: 42,
  "puerto rico": 42,
  zambia: 52,
  "dr congo": 54,
  mali: 55,
  burkina: 52,
  "burkina faso": 52,
  cape: 50,
  "cape verde": 52,
  angola: 50,
  mozambique: 46,
  kenya: 48,
  uganda: 46,
  tanzania: 45,
  ethiopia: 44,
  namibia: 44,
  botswana: 43,
  zimbabwe: 45,
  libya: 50,
  sudan: 44,
  syria: 50,
  lebanon: 48,
  palestine: 46,
  yemen: 42,
  afghanistan: 40,
  nepal: 38,
  bangladesh: 38,
  pakistan: 40,
  mongolia: 38,
  "hong kong": 40,
  taiwan: 42,
  macau: 38,
  laos: 38,
  cambodia: 38,
  myanmar: 40,
  brunei: 36,
  bhutan: 36,
  maldives: 38,
  "sri lanka": 40,
  kyrgyzstan: 44,
  tajikistan: 44,
  turkmenistan: 42,
  kazakhstan: 48,
  belarus: 52,
  moldova: 48,
  lithuania: 50,
  latvia: 48,
  estonia: 50,
  luxembourg: 48,
  malta: 44,
  cyprus: 50,
  iceland: 54,
  faroe: 42,
  gibraltar: 38,
  andorra: 40,
  "san marino": 36,
  liechtenstein: 36,
  monaco: 38,
  vatican: 30,
};

const DEFAULT_PRIOR = 62;

function normalizeTeamName(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

export function getPriorStrengthByName(teamName: string): number {
  const key = normalizeTeamName(teamName);
  if (PRIOR_BY_NAME[key] != null) return PRIOR_BY_NAME[key];
  for (const [name, strength] of Object.entries(PRIOR_BY_NAME)) {
    if (key.includes(name) || name.includes(key)) return strength;
  }
  return DEFAULT_PRIOR;
}

export function isColombiaTeam(teamName: string): boolean {
  return normalizeTeamName(teamName).includes("colombia");
}

export function getTeamPriorStrength(
  teamName: string,
  standingPoints: number,
  gamesPlayed: number,
  goalsFor: number,
  goalsAgainst: number,
  isPreTournament: boolean
): number {
  const prior = getPriorStrengthByName(teamName);

  if (isPreTournament || gamesPlayed === 0) {
    return prior;
  }

  const gd = goalsFor - goalsAgainst;
  const formStrength = standingPoints * 3 + gd + goalsFor * 0.15;
  const formScaled = Math.min(95, Math.max(35, 50 + formStrength * 2));

  return prior * 0.3 + formScaled * 0.7;
}
