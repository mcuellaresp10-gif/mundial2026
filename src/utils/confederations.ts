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
    .toLowerCase()
    .trim();
}

const COUNTRY_TO_CONFED: Record<string, Confederation> = {
  // UEFA
  albania: "UEFA", andorra: "UEFA", armenia: "UEFA", austria: "UEFA", azerbaijan: "UEFA",
  belarus: "UEFA", belgium: "UEFA", "bosnia and herzegovina": "UEFA", "bosnia & herzegovina": "UEFA",
  bulgaria: "UEFA", croatia: "UEFA", cyprus: "UEFA", "czech republic": "UEFA", czechia: "UEFA",
  denmark: "UEFA", england: "UEFA", estonia: "UEFA", "faroe islands": "UEFA", finland: "UEFA",
  france: "UEFA", georgia: "UEFA", germany: "UEFA", gibraltar: "UEFA", greece: "UEFA",
  hungary: "UEFA", iceland: "UEFA", ireland: "UEFA", israel: "UEFA", italy: "UEFA",
  kazakhstan: "UEFA", kosovo: "UEFA", latvia: "UEFA", liechtenstein: "UEFA", lithuania: "UEFA",
  luxembourg: "UEFA", malta: "UEFA", moldova: "UEFA", montenegro: "UEFA", netherlands: "UEFA",
  "north macedonia": "UEFA", "northern ireland": "UEFA", norway: "UEFA", poland: "UEFA",
  portugal: "UEFA", romania: "UEFA", russia: "UEFA", "san marino": "UEFA", scotland: "UEFA",
  serbia: "UEFA", slovakia: "UEFA", slovenia: "UEFA", spain: "UEFA", sweden: "UEFA",
  switzerland: "UEFA", turkey: "UEFA", turkiye: "UEFA", ukraine: "UEFA", wales: "UEFA",
  // CONMEBOL
  argentina: "CONMEBOL", bolivia: "CONMEBOL", brazil: "CONMEBOL", chile: "CONMEBOL",
  colombia: "CONMEBOL", ecuador: "CONMEBOL", paraguay: "CONMEBOL", peru: "CONMEBOL",
  uruguay: "CONMEBOL", venezuela: "CONMEBOL",
  // CONCACAF
  canada: "CONCACAF", "costa rica": "CONCACAF", cuba: "CONCACAF", curacao: "CONCACAF",
  "el salvador": "CONCACAF", guatemala: "CONCACAF", haiti: "CONCACAF", honduras: "CONCACAF",
  jamaica: "CONCACAF", mexico: "CONCACAF", panama: "CONCACAF", "trinidad and tobago": "CONCACAF",
  usa: "CONCACAF", "united states": "CONCACAF",
  // CAF
  algeria: "CAF", angola: "CAF", benin: "CAF", botswana: "CAF", "burkina faso": "CAF",
  burundi: "CAF", cameroon: "CAF", "cape verde": "CAF", "central african republic": "CAF",
  chad: "CAF", comoros: "CAF", congo: "CAF", "dr congo": "CAF", "democratic republic of the congo": "CAF",
  djibouti: "CAF", egypt: "CAF", "equatorial guinea": "CAF", eritrea: "CAF", eswatini: "CAF",
  ethiopia: "CAF", gabon: "CAF", gambia: "CAF", ghana: "CAF", guinea: "CAF",
  "guinea-bissau": "CAF", "ivory coast": "CAF", "cote d'ivoire": "CAF", kenya: "CAF",
  lesotho: "CAF", liberia: "CAF", libya: "CAF", madagascar: "CAF", malawi: "CAF",
  mali: "CAF", mauritania: "CAF", mauritius: "CAF", morocco: "CAF", mozambique: "CAF",
  namibia: "CAF", niger: "CAF", nigeria: "CAF", rwanda: "CAF", senegal: "CAF",
  seychelles: "CAF", "sierra leone": "CAF", somalia: "CAF", "south africa": "CAF",
  "south sudan": "CAF", sudan: "CAF", tanzania: "CAF", togo: "CAF", tunisia: "CAF",
  uganda: "CAF", zambia: "CAF", zimbabwe: "CAF",
  // AFC
  afghanistan: "AFC", australia: "AFC", bahrain: "AFC", bangladesh: "AFC", bhutan: "AFC",
  brunei: "AFC", cambodia: "AFC", china: "AFC", "chinese taipei": "AFC", "hong kong": "AFC",
  india: "AFC", indonesia: "AFC", iran: "AFC", iraq: "AFC", japan: "AFC", jordan: "AFC",
  kuwait: "AFC", kyrgyzstan: "AFC", laos: "AFC", lebanon: "AFC", macau: "AFC",
  malaysia: "AFC", maldives: "AFC", mongolia: "AFC", myanmar: "AFC", nepal: "AFC",
  "north korea": "AFC", oman: "AFC", pakistan: "AFC", palestine: "AFC", philippines: "AFC",
  qatar: "AFC", "saudi arabia": "AFC", singapore: "AFC", "south korea": "AFC",
  "korea republic": "AFC", "republic of korea": "AFC", "sri lanka": "AFC", syria: "AFC",
  tajikistan: "AFC", thailand: "AFC", "timor-leste": "AFC", turkmenistan: "AFC",
  uae: "AFC", "united arab emirates": "AFC", uzbekistan: "AFC", vietnam: "AFC", yemen: "AFC",
  // OFC
  "american samoa": "OFC", "cook islands": "OFC", fiji: "OFC", "new caledonia": "OFC",
  "new zealand": "OFC", "papua new guinea": "OFC", samoa: "OFC", "solomon islands": "OFC",
  tahiti: "OFC", tonga: "OFC", vanuatu: "OFC",
};

export function getConfederation(countryOrTeamName: string): Confederation {
  const key = normalizeKey(countryOrTeamName);
  return COUNTRY_TO_CONFED[key] ?? "UEFA";
}

export function buildTeamConfederationMap(
  teams: { id: number; name: string; country: string }[]
): Map<number, Confederation> {
  const map = new Map<number, Confederation>();
  for (const t of teams) {
    map.set(t.id, getConfederation(t.country || t.name));
  }
  return map;
}
