/** Utilidades de fase del partido (grupos vs eliminatoria). */

import type { BracketRound } from "@/data/worldCup2026Bracket";
import type { StandingTeam } from "@/types";

export function isKnockoutFixtureRound(round: string): boolean {
  if (/Group Stage|Group\s+[A-L]\b/i.test(round)) return false;
  return /Round of|Final|Quarter|Semi|3rd Place|Third Place|8th Finals/i.test(round);
}

export function isGroupStageFixtureRound(round: string): boolean {
  return /Group Stage|Group\s+[A-L]\b/i.test(round);
}

/** Etiqueta corta para la métrica de probabilidad en tarjetas. */
export function getNextMatchProbShortLabel(round: string): string {
  if (/Round of 16|8th Finals|Round of sixteen/i.test(round)) return "Prob. octavos";
  if (/Round of 32|Round of thirty-two/i.test(round)) return "Prob. 16avos";
  if (/Quarter[- ]finals?/i.test(round)) return "Prob. cuartos";
  if (/Semi[- ]finals?/i.test(round)) return "Prob. semifinal";
  if (/3rd Place|Third Place/i.test(round)) return "Prob. 3er puesto";
  if (/Final/i.test(round) && !/Semi|Quarter|Round|3rd|Third/i.test(round)) return "Prob. final";
  if (isGroupStageFixtureRound(round)) return "Prob. victoria";
  return "Prob. próximo partido";
}

/** Probabilidad de avanzar en eliminatoria (victoria + empate → prórroga/penales). */
export function knockoutAdvanceProbability(win: number, draw: number): number {
  return win + draw;
}

/** El equipo completó la fase de grupos en plaza directa (1º o 2º). */
export function isTeamGroupStageComplete(standing: StandingTeam | null | undefined): boolean {
  if (!standing) return false;
  return standing.all.played >= 3 && standing.rank <= 2;
}

/** El equipo clasificó como uno de los mejores terceros. */
export function isTeamQualifiedAsBestThird(
  standing: StandingTeam | null | undefined,
  bestThirdTeamIds?: Iterable<number>
): boolean {
  if (!standing || standing.rank !== 3 || !bestThirdTeamIds) return false;
  for (const id of bestThirdTeamIds) {
    if (id === standing.team.id) return true;
  }
  return false;
}

/** Ocultar probabilidad de clasificar grupal cuando la plaza ya está asegurada. */
export function shouldHideGroupClassification(
  standing: StandingTeam | null | undefined,
  pendingGroupMatches: number,
  options?: { bestThirdTeamIds?: Iterable<number> }
): boolean {
  if (!standing) return false;
  if (isTeamGroupStageComplete(standing)) return true;
  if (isTeamQualifiedAsBestThird(standing, options?.bestThirdTeamIds)) return true;
  if (pendingGroupMatches === 0 && standing.rank <= 2 && standing.all.played >= 2) return true;
  return false;
}

/** Etiqueta corta a partir de la ronda del cuadro FIFA. */
export function getBracketRoundProbShortLabel(round: BracketRound | "round_of_32"): string {
  switch (round) {
    case "round_of_32":
      return "Prob. 16avos";
    case "round_of_16":
      return "Prob. octavos";
    case "quarterfinal":
      return "Prob. cuartos";
    case "semifinal":
      return "Prob. semifinal";
    case "third_place":
      return "Prob. 3er puesto";
    case "final":
      return "Prob. final";
  }
}

/** Cadena de ronda compatible con `getNextMatchProbShortLabel`. */
export function bracketRoundToFixtureRound(round: BracketRound | "round_of_32"): string {
  switch (round) {
    case "round_of_32":
      return "Round of 32";
    case "round_of_16":
      return "Round of 16";
    case "quarterfinal":
      return "Quarter-finals";
    case "semifinal":
      return "Semi-finals";
    case "third_place":
      return "3rd Place Final";
    case "final":
      return "Final";
  }
}
