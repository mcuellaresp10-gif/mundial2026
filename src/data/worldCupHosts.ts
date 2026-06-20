import { normalizeTeamName } from "@/data/teamStrengthPriors";

/** Bonus de fuerza por ser anfitrión del Mundial 2026 (no ventaja genérica de “local” en el fixture). */
export const HOST_NATION_STRENGTH_BONUS = 1.2;

const HOST_NAMES = new Set(["usa", "united states", "canada", "mexico"]);

export function isWorldCupHostNation(teamName: string): boolean {
  const key = normalizeTeamName(teamName);
  if (HOST_NAMES.has(key)) return true;
  for (const host of HOST_NAMES) {
    if (key.includes(host) || host.includes(key)) return true;
  }
  return false;
}

export function getHostNationStrengthBonus(teamName: string): number {
  return isWorldCupHostNation(teamName) ? HOST_NATION_STRENGTH_BONUS : 0;
}
