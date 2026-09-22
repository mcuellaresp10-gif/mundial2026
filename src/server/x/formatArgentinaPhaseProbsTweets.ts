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

function clampTweet(text: string): string {
  return text.length > 280 ? text.slice(0, 277) + "…" : text;
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
  if (/velez|vélez/i.test(t)) return "Vélez";
  if (/boca/i.test(t)) return "Boca";
  if (/river/i.test(t)) return "River";
  if (/rosario/i.test(t)) return "Rosario";
  if (/belgrano/i.test(t)) return "Belgrano";
  if (/lanus|lanús/i.test(t)) return "Lanús";
  if (/huracan|huracán/i.test(t)) return "Huracán";
  if (/independiente/i.test(t)) return "Independiente";
  if (/racing/i.test(t)) return "Racing";
  if (/san lorenzo/i.test(t)) return "San Lorenzo";
  if (/taller/i.test(t)) return "Talleres";
  if (/union|unión/i.test(t)) return "Unión";
  if (/platense/i.test(t)) return "Platense";
  if (/banfield/i.test(t)) return "Banfield";
  if (/godoy/i.test(t)) return "Godoy Cruz";
  if (/aldosivi/i.test(t)) return "Aldosivi";
  return t;
}

function pickZone(rows: ArgentinaPhaseTweetRow[], z: "A" | "B") {
  return [...rows]
    .filter((r) => r.zone === z)
    .sort((a, b) => b.probPlayoffs - a.probPlayoffs)
    .slice(0, ARGENTINA_ZONE_QUALIFYING_SPOTS);
}

/** Zona A sola (≤280). La imagen lleva el detalle. */
export function formatArgentinaZoneATweet(
  rows: ArgentinaPhaseTweetRow[],
  jornada: number,
  phase: "apertura" | "clausura"
): string {
  const phaseLabel = phase === "apertura" ? "Apertura" : "Clausura";
  const a = pickZone(rows, "A");
  return clampTweet(
    [
      `Liga Argentina (${phaseLabel}) — Prob. octavos · J${jornada}`,
      "",
      "Zona A (top 8):",
      ...a.map((r, i) => `${i + 1}. ${shortName(r.teamName)}`),
    ].join("\n")
  );
}

/** Zona B sola (≤280). */
export function formatArgentinaZoneBTweet(rows: ArgentinaPhaseTweetRow[]): string {
  const b = pickZone(rows, "B");
  return clampTweet(
    [
      "Zona B (top 8):",
      ...b.map((r, i) => `${i + 1}. ${shortName(r.teamName)}`),
    ].join("\n")
  );
}

/** Reply con % de los 8 más altos (mezcla zonas). */
export function formatArgentinaPlayoffsPctTweet(
  rows: ArgentinaPhaseTweetRow[]
): string {
  const top = [...rows]
    .sort((a, b) => b.probPlayoffs - a.probPlayoffs)
    .slice(0, 8);
  return clampTweet(
    [
      "Prob. octavos:",
      ...top.map(
        (r, i) =>
          `${i + 1}. ${shortName(r.teamName)} (Z${r.zone}) ${formatPct1(r.probPlayoffs)}`
      ),
    ].join("\n")
  );
}

/** @deprecated Preferir formatArgentinaZoneATweet; se mantiene por compat. */
export function formatArgentinaPlayoffsListTweet(
  rows: ArgentinaPhaseTweetRow[],
  jornada: number,
  phase: "apertura" | "clausura"
): string {
  return formatArgentinaZoneATweet(rows, jornada, phase);
}

export function buildArgentinaPhaseProbsThread(
  rows: ArgentinaPhaseTweetRow[],
  jornada: number,
  phase: "apertura" | "clausura"
): string[] {
  if (rows.length === 0) return [];
  return [
    formatArgentinaZoneATweet(rows, jornada, phase),
    formatArgentinaZoneBTweet(rows),
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
  const a = pickZone(rows, "A");
  const b = pickZone(rows, "B");
  return [
    `📋 *Borrador X — Playoffs Liga Argentina (${phaseLabel})*`,
    `_Jornada ${jornada} · ${dayKey}_`,
    "",
    "*Zona A* (prob. octavos):",
    ...a.map(
      (r, i) =>
        `${i + 1}. ${shortName(r.teamName)} — ${formatPct1(r.probPlayoffs)}`
    ),
    "",
    "*Zona B* (prob. octavos):",
    ...b.map(
      (r, i) =>
        `${i + 1}. ${shortName(r.teamName)} — ${formatPct1(r.probPlayoffs)}`
    ),
    "",
    "_Hilo X: Zona A → Zona B → % · + imagen._",
    "_Reglas LPF 2026: 2 zonas × top 8 → eliminación directa._",
  ].join("\n");
}
