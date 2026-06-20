/**
 * Fuerza efectiva por selección (0–100) para simulación.
 * Fuente principal: ranking FIFA; forma de grupo con peso conservador (25%).
 */
import { getFifaRank, getStrengthFromFifaRanking } from "@/data/fifaRankings";

export const FIFA_STRENGTH_WEIGHT = 0.75;
export const FORM_STRENGTH_WEIGHT = 0.25;
export const FORM_SCALE_K = 1.1;

export function normalizeTeamName(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

export function getPriorStrengthByName(teamName: string): number {
  return getStrengthFromFifaRanking(teamName);
}

export function isColombiaTeam(teamName: string): boolean {
  return normalizeTeamName(teamName).includes("colombia");
}

export function scaleFormStrength(
  standingPoints: number,
  goalsFor: number,
  goalsAgainst: number
): number {
  const gd = goalsFor - goalsAgainst;
  const formRaw = standingPoints * 3 + gd + goalsFor * 0.15;
  return Math.min(95, Math.max(35, 50 + formRaw * FORM_SCALE_K));
}

/** Fuerza efectiva: 75% FIFA + 25% forma (pre-torneo = solo FIFA). */
export function getEffectiveTeamStrength(
  teamName: string,
  standingPoints: number,
  gamesPlayed: number,
  goalsFor: number,
  goalsAgainst: number,
  isPreTournament: boolean
): number {
  const fifaStrength = getStrengthFromFifaRanking(teamName);

  if (isPreTournament || gamesPlayed === 0) {
    return fifaStrength;
  }

  const formScaled = scaleFormStrength(standingPoints, goalsFor, goalsAgainst);
  return fifaStrength * FIFA_STRENGTH_WEIGHT + formScaled * FORM_STRENGTH_WEIGHT;
}

export function getFifaStrengthGap(teamAName: string, teamBName: string): number {
  return (
    getStrengthFromFifaRanking(teamAName) - getStrengthFromFifaRanking(teamBName)
  );
}

export function isEliteClash(teamAName: string, teamBName: string): boolean {
  return getFifaRank(teamAName) <= 15 && getFifaRank(teamBName) <= 15;
}

export function getTeamPriorStrength(
  teamName: string,
  standingPoints: number,
  gamesPlayed: number,
  goalsFor: number,
  goalsAgainst: number,
  isPreTournament: boolean
): number {
  return getEffectiveTeamStrength(
    teamName,
    standingPoints,
    gamesPlayed,
    goalsFor,
    goalsAgainst,
    isPreTournament
  );
}
