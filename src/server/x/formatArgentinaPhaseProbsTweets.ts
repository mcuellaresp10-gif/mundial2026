import { translateTeamName } from "@/utils/teamNames";
import { ARGENTINA_ZONE_QUALIFYING_SPOTS } from "@/utils/argentinaSeasonSimulation";

export interface ArgentinaPhaseTweetRow {
  teamName: string;
  zone: "A" | "B";
  probPlayoffs: number;
}

export function formatPct1(value: number): string {
  return `${(Math.max(0, Math.min(1, value)) * 100).toFixed(1)}%`;
}

function shortName(name: string): string {
  const t = translateTeamName(name);
  if (/independ\.?\s*rivadavia/i.test(t)) return "Ind. Rivadavia";
  if (/argentinos/i.test(t)) return "Argentinos";
  if (/estudiantes/i.test(t)) return "Estudiantes";
  if (/gimnasia/i.test(t)) return "Gimnasia";
  if (/newells/i.test(t)) return "Newell's";
  if (/defensa/i.test(t)) return "Defensa";
  if (/central cordoba|central córdoba/i.test(t)) return "C. Córdoba";
  if (/instituto/i.test(t)) return "Instituto";
  if (/sarmiento/i.test(t)) return "Sarmiento";
  if (/barracas/i.test(t)) return "Barracas";
  if (/atletico tucuman|atlético tucumán/i.test(t)) return "Atl. Tucumán";
  return t;
}

/** Top 8 por zona según prob. de octavos. */
export function formatArgentinaPlayoffsListTweet(
  rows: ArgentinaPhaseTweetRow[],
  jornada: number,
  phase: "apertura" | "clausura"
): string {
  const phaseLabel = phase === "apertura" ? "Apertura" : "Clausura";
  const pickZone = (z: "A" | "B") =>
    [...rows]
      .filter((r) => r.zone === z)
      .sort((a, b) => b.probPlayoffs - a.probPlayoffs)
      .slice(0, ARGENTINA_ZONE_QUALIFYING_SPOTS);

  const a = pickZone("A");
  const b = pickZone("B");

  const lines = [
    `Liga Argentina (${phaseLabel}) — Prob. de clasificar a octavos — Jornada ${jornada}:`,
    "",
    "Zona A:",
    ...a.map((r, i) => `${i + 1}. ${shortName(r.teamName)}`),
    "",
    "Zona B:",
    ...b.map((r, i) => `${i + 1}. ${shortName(r.teamName)}`),
  ];
  const text = lines.join("\n");
  return text.length > 280 ? text.slice(0, 277) + "…" : text;
}

export function formatArgentinaPlayoffsPctTweet(
  rows: ArgentinaPhaseTweetRow[]
): string {
  const top = [...rows]
    .sort((a, b) => b.probPlayoffs - a.probPlayoffs)
    .slice(0, 12);
  const lines = [
    "Prob. octavos (top):",
    ...top.map(
      (r, i) =>
        `${i + 1}. ${shortName(r.teamName)} (Z${r.zone}) ${formatPct1(r.probPlayoffs)}`
    ),
  ];
  const text = lines.join("\n");
  return text.length > 280 ? text.slice(0, 277) + "…" : text;
}

export function buildArgentinaPhaseProbsThread(
  rows: ArgentinaPhaseTweetRow[],
  jornada: number,
  phase: "apertura" | "clausura"
): string[] {
  if (rows.length === 0) return [];
  return [
    formatArgentinaPlayoffsListTweet(rows, jornada, phase),
    formatArgentinaPlayoffsPctTweet(rows),
  ];
}

export function formatTelegramArgentinaPhasePreview(
  rows: ArgentinaPhaseTweetRow[],
  dayKey: string,
  jornada: number,
  phase: "apertura" | "clausura"
): string {
  const phaseLabel = phase === "apertura" ? "Apertura" : "Clausura";
  const top = [...rows]
    .sort((a, b) => b.probPlayoffs - a.probPlayoffs)
    .slice(0, 16);
  return [
    `📋 *Borrador X — Playoffs Liga Argentina (${phaseLabel})*`,
    `_Jornada ${jornada} · ${dayKey}_`,
    "",
    "Top 16 por prob. de octavos (8 por zona en el post):",
    ...top.map(
      (r, i) =>
        `${i + 1}. ${shortName(r.teamName)} Z${r.zone} — ${formatPct1(r.probPlayoffs)}`
    ),
    "",
    "_Reglas LPF 2026: 2 zonas × top 8 → eliminación directa._",
    "_Al publicar se adjunta la imagen de la tabla._",
  ].join("\n");
}
