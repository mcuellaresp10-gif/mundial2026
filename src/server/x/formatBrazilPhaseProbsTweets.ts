import { translateTeamName } from "@/utils/teamNames";
import { BRAZIL_LIBERTADORES_SPOTS } from "@/utils/brazilSeasonSimulation";

export interface BrazilPhaseTweetRow {
  teamName: string;
  probLibertadores: number;
  probChampion: number;
  probRelegation: number;
}

export function formatPct1(value: number): string {
  return `${(Math.max(0, Math.min(1, value)) * 100).toFixed(1)}%`;
}

function shortName(name: string): string {
  const t = translateTeamName(name);
  if (/palmeiras/i.test(t)) return "Palmeiras";
  if (/flamengo/i.test(t)) return "Flamengo";
  if (/corinthians/i.test(t)) return "Corinthians";
  if (/sao paulo|são paulo/i.test(t)) return "São Paulo";
  if (/internacional/i.test(t)) return "Internacional";
  if (/atletico[- ]?mg|atlético[- ]?mg/i.test(t)) return "Atl. Mineiro";
  if (/atletico[- ]?pr|athletico/i.test(t)) return "Athletico-PR";
  if (/botafogo/i.test(t)) return "Botafogo";
  if (/fluminense/i.test(t)) return "Fluminense";
  if (/gremio|grêmio/i.test(t)) return "Grêmio";
  if (/santos/i.test(t)) return "Santos";
  if (/vasco/i.test(t)) return "Vasco";
  if (/cruzeiro/i.test(t)) return "Cruzeiro";
  if (/bahia/i.test(t)) return "Bahia";
  if (/fortaleza/i.test(t)) return "Fortaleza";
  return t;
}

export function formatBrazilLibertadoresListTweet(
  rows: BrazilPhaseTweetRow[],
  jornada: number
): string {
  const top = [...rows]
    .sort((a, b) => b.probLibertadores - a.probLibertadores)
    .slice(0, BRAZIL_LIBERTADORES_SPOTS);

  const lines = [
    `Brasileirão — Prob. de clasificar a Libertadores (G6) — Fecha ${jornada}:`,
    "",
    "Según la simulación, estos serían los 6 con más chances:",
    ...top.map((r, i) => `${i + 1}. ${shortName(r.teamName)}`),
  ];
  const text = lines.join("\n");
  return text.length > 280 ? text.slice(0, 277) + "…" : text;
}

export function formatBrazilLibertadoresPctTweet(
  rows: BrazilPhaseTweetRow[]
): string {
  const top = [...rows]
    .sort((a, b) => b.probLibertadores - a.probLibertadores)
    .slice(0, BRAZIL_LIBERTADORES_SPOTS);
  const lines = [
    "Prob. Libertadores (G6):",
    ...top.map(
      (r, i) =>
        `${i + 1}. ${shortName(r.teamName)} ${formatPct1(r.probLibertadores)}`
    ),
  ];
  const text = lines.join("\n");
  return text.length > 280 ? text.slice(0, 277) + "…" : text;
}

export function buildBrazilPhaseProbsThread(
  rows: BrazilPhaseTweetRow[],
  jornada: number
): string[] {
  if (rows.length === 0) return [];
  return [
    formatBrazilLibertadoresListTweet(rows, jornada),
    formatBrazilLibertadoresPctTweet(rows),
  ];
}

export function formatTelegramBrazilPhasePreview(
  rows: BrazilPhaseTweetRow[],
  dayKey: string,
  jornada: number
): string {
  const top = [...rows]
    .sort((a, b) => b.probLibertadores - a.probLibertadores)
    .slice(0, 10);
  return [
    `📋 *Borrador X — Brasileirão (tabla anual)*`,
    `_Fecha ${jornada} · ${dayKey}_`,
    "",
    "Top por prob. Libertadores (G6):",
    ...top.map(
      (r, i) =>
        `${i + 1}. ${shortName(r.teamName)} — ${formatPct1(r.probLibertadores)}`
    ),
    "",
    "_Reglas: todos contra todos · G4/G6 Liberta · Z4 descenso._",
    "_Al publicar se adjunta la imagen de la tabla._",
  ].join("\n");
}
