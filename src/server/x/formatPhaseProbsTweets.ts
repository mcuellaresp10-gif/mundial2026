import { translateTeamName } from "@/utils/teamNames";
import { BETPLAY_QUALIFYING_SPOTS } from "@/utils/betPlaySeasonSimulation";

export interface PhaseProbsTweetRow {
  teamName: string;
  probCuadrangulares: number;
}

export function formatPct1(value: number): string {
  return `${(Math.max(0, Math.min(1, value)) * 100).toFixed(1)}%`;
}

function shortTeamName(name: string): string {
  const t = translateTeamName(name);
  // Ajustes cortos al estilo de los posts manuales.
  if (/atletico nacional/i.test(t)) return "Nacional";
  if (/independiente medellin/i.test(t) || /independiente medellín/i.test(t)) {
    return "Medellín";
  }
  if (/aguilas doradas|águilas doradas/i.test(t)) return "Aguilas Doradas";
  if (/deportes tolima/i.test(t)) return "Tolima";
  if (/america de cali|américa de cali/i.test(t)) return "América de Cali";
  return t;
}

/** Cabecera + top 8 clasificados (mismo estilo que el post manual). */
export function formatPhaseProbsListTweet(
  rows: PhaseProbsTweetRow[],
  jornada: number
): string {
  const top = [...rows]
    .sort((a, b) => b.probCuadrangulares - a.probCuadrangulares)
    .slice(0, BETPLAY_QUALIFYING_SPOTS);

  const lines = [
    `Liga Colombiana - Probabilidades de clasificar a los cuadrangulares - Jornada ${jornada}:`,
    "",
    "Según las estadísticas del torneo, estos serían los 8 clasificados por el momento:",
    ...top.map((r, i) => `${i + 1}. ${shortTeamName(r.teamName)}`),
  ];
  const text = lines.join("\n");
  return text.length > 280 ? text.slice(0, 277) + "…" : text;
}

/** Reply opcional con % de cuadrangulares del top 8. */
export function formatPhaseProbsPctTweet(rows: PhaseProbsTweetRow[]): string {
  const top = [...rows]
    .sort((a, b) => b.probCuadrangulares - a.probCuadrangulares)
    .slice(0, BETPLAY_QUALIFYING_SPOTS);

  const lines = [
    "Prob. de clasificar a cuadrangulares:",
    ...top.map(
      (r, i) =>
        `${i + 1}. ${shortTeamName(r.teamName)} ${formatPct1(r.probCuadrangulares)}`
    ),
  ];
  const text = lines.join("\n");
  return text.length > 280 ? text.slice(0, 277) + "…" : text;
}

export function buildPhaseProbsThread(
  rows: PhaseProbsTweetRow[],
  jornada: number
): string[] {
  if (rows.length === 0) return [];
  return [formatPhaseProbsListTweet(rows, jornada), formatPhaseProbsPctTweet(rows)];
}

export function formatTelegramPhaseProbsPreview(
  rows: PhaseProbsTweetRow[],
  dayKey: string,
  jornada: number
): string {
  const top = [...rows]
    .sort((a, b) => b.probCuadrangulares - a.probCuadrangulares)
    .slice(0, BETPLAY_QUALIFYING_SPOTS);

  const lines = [
    `📋 *Borrador X — Prob. cuadrangulares*`,
    `_Jornada ${jornada} · ${dayKey}_`,
    "",
    "Top 8 por probabilidad:",
    ...top.map(
      (r, i) =>
        `${i + 1}. ${shortTeamName(r.teamName)} — ${formatPct1(r.probCuadrangulares)}`
    ),
    "",
    "_Nada se publica en X hasta que apruebes._",
    "_Nota: por ahora es texto (sin imagen de la tabla)._",
  ];
  return lines.join("\n");
}
