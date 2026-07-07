/** Utilidades de fase del partido (grupos vs eliminatoria). */

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
