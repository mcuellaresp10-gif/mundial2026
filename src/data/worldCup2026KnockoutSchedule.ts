/** Fechas oficiales FIFA (día local → 18:00 UTC como referencia de calendario). */
export const KNOCKOUT_MATCH_DATES: Record<number, string> = {
  73: "2026-06-28T18:00:00+00:00",
  74: "2026-06-29T18:00:00+00:00",
  75: "2026-06-29T20:00:00+00:00",
  76: "2026-06-29T18:00:00+00:00",
  77: "2026-06-30T21:00:00+00:00",
  78: "2026-06-30T17:00:00+00:00",
  79: "2026-06-30T23:00:00+00:00",
  80: "2026-07-01T16:00:00+00:00",
  81: "2026-07-01T22:00:00+00:00",
  82: "2026-07-01T20:00:00+00:00",
  83: "2026-07-02T23:00:00+00:00",
  84: "2026-07-02T19:00:00+00:00",
  85: "2026-07-03T03:00:00+00:00",
  86: "2026-07-03T22:00:00+00:00",
  87: "2026-07-04T01:30:00+00:00",
  88: "2026-07-03T18:00:00+00:00",
  89: "2026-07-04T21:00:00+00:00",
  90: "2026-07-04T17:00:00+00:00",
  91: "2026-07-05T20:00:00+00:00",
  92: "2026-07-05T22:00:00+00:00",
  93: "2026-07-06T19:00:00+00:00",
  94: "2026-07-07T00:00:00+00:00",
  95: "2026-07-07T16:00:00+00:00",
  96: "2026-07-07T20:00:00+00:00",
  97: "2026-07-09T20:00:00+00:00",
  98: "2026-07-10T19:00:00+00:00",
  99: "2026-07-11T21:00:00+00:00",
  100: "2026-07-12T01:00:00+00:00",
  101: "2026-07-14T19:00:00+00:00",
  102: "2026-07-15T19:00:00+00:00",
  103: "2026-07-18T21:00:00+00:00",
  104: "2026-07-19T19:00:00+00:00",
};

/** Ciudades sede FIFA por partido eliminatorio (M73–M104). */
export const KNOCKOUT_MATCH_CITIES: Record<number, string> = {
  73: "Los Angeles",
  74: "Boston",
  75: "Monterrey",
  76: "Houston",
  77: "Nueva York",
  78: "Dallas",
  79: "Ciudad de México",
  80: "Atlanta",
  81: "San Francisco",
  82: "Seattle",
  83: "Toronto",
  84: "Los Angeles",
  85: "Vancouver",
  86: "Miami",
  87: "Kansas City",
  88: "Dallas",
  89: "Filadelfia",
  90: "Houston",
  91: "Nueva York",
  92: "Ciudad de México",
  93: "Dallas",
  94: "Seattle",
  95: "Atlanta",
  96: "Vancouver",
  97: "Boston",
  98: "Los Angeles",
  99: "Miami",
  100: "Kansas City",
  101: "Dallas",
  102: "Atlanta",
  103: "Miami",
  104: "Nueva York",
};

export function getKnockoutMatchCity(matchId: number): string {
  return KNOCKOUT_MATCH_CITIES[matchId] ?? "";
}

export function getKnockoutMatchDate(matchId: number): string {
  return KNOCKOUT_MATCH_DATES[matchId] ?? "2026-07-01T18:00:00+00:00";
}

/** Fecha + ciudad para cabecera del cuadro (prioriza fixture API si existe). */
export function getKnockoutMatchMeta(
  matchId: number,
  fixture?: { date: string; venue?: { city?: string | null; name?: string | null } }
): { date: string; city: string } {
  const date = fixture?.date ?? getKnockoutMatchDate(matchId);
  const city =
    fixture?.venue?.city?.trim() ||
    fixture?.venue?.name?.trim() ||
    getKnockoutMatchCity(matchId);
  return { date, city };
}
