import type { AmericasLeague } from "@/data/americasLeagues";
import { getLeagueById } from "@/data/americasLeagues";

/**
 * Calidad relativa de la competición para igualar PPG entre ligas/copas.
 * 1.0 = referencia (Brasileirão / Libertadores).
 * Sin esto, un 1er de Sudamericana parece más fuerte que un mid de Brasil.
 */
const LEAGUE_STRENGTH_COEFF: Record<number, number> = {
  // Domésticas top
  71: 1.0, // Brasileirão
  128: 0.88, // Liga Profesional AR
  262: 0.9, // Liga MX
  253: 0.85, // MLS
  // Domésticas CONMEBOL
  239: 0.78, // Colombia
  265: 0.8, // Chile (check id)
  281: 0.76, // Peru
  242: 0.77, // Ecuador
  268: 0.78, // Uruguay
  250: 0.74, // Paraguay
  344: 0.7, // Bolivia
  299: 0.72, // Venezuela
  72: 0.82, // Serie B BR
  // Continentales
  13: 0.97, // Libertadores
  11: 0.68, // Sudamericana — descontar fuerte vs domésticas top
  1: 1.0, // Mundial
};

/** Prior del ecosistema doméstico del club (país), 35–95. */
const COUNTRY_ECOSYSTEM_PRIOR: Record<string, number> = {
  brazil: 62,
  argentina: 55,
  mexico: 54,
  usa: 50,
  colombia: 48,
  chile: 49,
  uruguay: 50,
  ecuador: 47,
  peru: 46,
  paraguay: 45,
  bolivia: 42,
  venezuela: 43,
};

function normalizeCountry(country: string | null | undefined): string {
  return (country ?? "")
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .trim();
}

export function getLeagueStrengthCoeff(leagueId: number | null | undefined): number {
  if (leagueId == null) return 0.8;
  if (LEAGUE_STRENGTH_COEFF[leagueId] != null) return LEAGUE_STRENGTH_COEFF[leagueId];
  const league = getLeagueById(leagueId);
  if (!league) return 0.8;
  if (league.type === "domestic") {
    if (league.countryCode === "BR") return 1.0;
    if (league.countryCode === "AR") return 0.88;
    if (league.countryCode === "MX") return 0.9;
    return 0.76;
  }
  if (league.cupScope === "continental") {
    return league.id === 13 ? 0.97 : 0.68;
  }
  // Copa doméstica: un poco bajo la liga del país
  return getLeagueStrengthCoeff(
    domesticLeagueIdForCountry(league.countryCode) ?? leagueId
  ) * 0.92;
}

function domesticLeagueIdForCountry(code: string): number | null {
  const map: Record<string, number> = {
    BR: 71,
    AR: 128,
    CO: 239,
    MX: 262,
    US: 253,
  };
  return map[code] ?? null;
}

export function getDomesticEcosystemPrior(
  country: string | null | undefined
): number {
  const key = normalizeCountry(country);
  return COUNTRY_ECOSYSTEM_PRIOR[key] ?? 50;
}

export function applyCompetitionCoeff(strength: number, coeff: number): number {
  const c = Math.min(1.15, Math.max(0.45, coeff));
  return Math.min(95, Math.max(35, 50 + (strength - 50) * c));
}

/** Prioridad al elegir fila de tabla: doméstica > continental > copa local. */
export function standingSourcePriority(league: AmericasLeague | undefined): number {
  if (!league) return 0;
  if (league.type === "domestic") return 30;
  if (league.cupScope === "continental") {
    return league.id === 13 ? 20 : 12; // Lib > Sud
  }
  return 8;
}
