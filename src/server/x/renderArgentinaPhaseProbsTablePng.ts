import sharp from "sharp";
import { translateTeamName } from "@/utils/teamNames";
import { formatArgentinaPct } from "@/utils/argentinaSeasonSimulation";

export interface ArgentinaPhaseImageRow {
  teamName: string;
  zone: "A" | "B";
  rank: number;
  probPlayoffs: number;
  probQuarter: number;
  probChampion: number;
}

export interface ArgentinaPhaseImageOptions {
  jornada: number;
  phase: "apertura" | "clausura";
  simulations?: number;
  maxPlayed?: number;
}

function escapeXml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function shortName(name: string): string {
  const t = translateTeamName(name);
  if (/independ\.?\s*rivadavia/i.test(t)) return "Ind. Rivadavia";
  if (/argentinos/i.test(t)) return "Argentinos";
  if (/estudiantes/i.test(t)) return "Estudiantes";
  if (/gimnasia/i.test(t)) return "Gimnasia";
  if (/newells/i.test(t)) return "Newell's";
  if (/defensa/i.test(t)) return "Defensa";
  if (/instituto/i.test(t)) return "Instituto";
  if (/sarmiento/i.test(t)) return "Sarmiento";
  if (/barracas/i.test(t)) return "Barracas";
  if (/atletico tucuman|atlético tucumán/i.test(t)) return "Atl. Tucumán";
  return t;
}

function barWidth(value: number, maxW: number): number {
  return Math.max(0, Math.min(maxW, value * maxW));
}

export function buildArgentinaPhaseProbsTableSvg(
  rows: ArgentinaPhaseImageRow[],
  opts: ArgentinaPhaseImageOptions
): string {
  const sorted = [...rows].sort((a, b) => {
    if (a.zone !== b.zone) return a.zone.localeCompare(b.zone);
    return a.rank - b.rank;
  });
  const phaseLabel = opts.phase === "apertura" ? "Apertura" : "Clausura";
  const sims = opts.simulations ?? 1000;
  const pj = opts.maxPlayed ?? opts.jornada;

  const width = 980;
  const padX = 28;
  const headerH = 92;
  const rowH = 34;
  const height = headerH + 36 + sorted.length * rowH + 28;

  const colZone = padX;
  const colRank = padX + 36;
  const colTeam = padX + 70;
  const colPlay = 360;
  const colQ = 560;
  const colChamp = 760;
  const barMax = 110;

  const bg = "#0b1220";
  const card = "#121a2b";
  const text = "#e8eef7";
  const muted = "#8b9bb4";
  const gold = "#d4a017";
  const barTrack = "#1e2a3d";
  const barFill = "#c9a227";

  const rowsSvg = sorted
    .map((r, i) => {
      const y = headerH + 36 + i * rowH;
      const name = escapeXml(shortName(r.teamName));
      const p = formatArgentinaPct(r.probPlayoffs, { maxPlayed: pj });
      const q = formatArgentinaPct(r.probQuarter, { maxPlayed: pj });
      const c = formatArgentinaPct(r.probChampion, { maxPlayed: pj });
      const stripe = i % 2 === 0 ? "rgba(255,255,255,0.03)" : "transparent";
      return `
      <rect x="${padX}" y="${y}" width="${width - padX * 2}" height="${rowH}" fill="${stripe}"/>
      <text x="${colZone}" y="${y + 22}" fill="${gold}" font-size="12" font-family="Segoe UI, Arial, sans-serif">${r.zone}</text>
      <text x="${colRank}" y="${y + 22}" fill="${muted}" font-size="12" font-family="Segoe UI, Arial, sans-serif">${r.rank}</text>
      <text x="${colTeam}" y="${y + 22}" fill="${text}" font-size="13" font-weight="600" font-family="Segoe UI, Arial, sans-serif">${name}</text>
      <rect x="${colPlay}" y="${y + 13}" width="${barMax}" height="8" rx="4" fill="${barTrack}"/>
      <rect x="${colPlay}" y="${y + 13}" width="${barWidth(r.probPlayoffs, barMax)}" height="8" rx="4" fill="${barFill}"/>
      <text x="${colPlay + barMax + 8}" y="${y + 21}" fill="${text}" font-size="11" font-family="Consolas, monospace">${escapeXml(p)}</text>
      <rect x="${colQ}" y="${y + 13}" width="${barMax}" height="8" rx="4" fill="${barTrack}"/>
      <rect x="${colQ}" y="${y + 13}" width="${barWidth(r.probQuarter, barMax)}" height="8" rx="4" fill="${barFill}"/>
      <text x="${colQ + barMax + 8}" y="${y + 21}" fill="${text}" font-size="11" font-family="Consolas, monospace">${escapeXml(q)}</text>
      <rect x="${colChamp}" y="${y + 13}" width="${barMax}" height="8" rx="4" fill="${barTrack}"/>
      <rect x="${colChamp}" y="${y + 13}" width="${barWidth(r.probChampion, barMax)}" height="8" rx="4" fill="${barFill}"/>
      <text x="${colChamp + barMax + 8}" y="${y + 21}" fill="${text}" font-size="11" font-family="Consolas, monospace">${escapeXml(c)}</text>`;
    })
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <rect width="100%" height="100%" fill="${bg}"/>
  <rect x="16" y="16" width="${width - 32}" height="${height - 32}" rx="16" fill="${card}"/>
  <text x="${padX}" y="48" fill="${text}" font-size="22" font-weight="700" font-family="Segoe UI, Arial, sans-serif">Liga Argentina — Probabilidades · ${escapeXml(phaseLabel)}</text>
  <text x="${padX}" y="72" fill="${muted}" font-size="13" font-family="Segoe UI, Arial, sans-serif">2 zonas · top 8 a octavos · Jornada ${opts.jornada} · ${pj} PJ · ${sims} sims</text>
  <text x="${colZone}" y="${headerH + 22}" fill="${gold}" font-size="11" font-weight="700" font-family="Segoe UI, Arial, sans-serif">Z</text>
  <text x="${colRank}" y="${headerH + 22}" fill="${gold}" font-size="11" font-weight="700" font-family="Segoe UI, Arial, sans-serif">#</text>
  <text x="${colTeam}" y="${headerH + 22}" fill="${gold}" font-size="11" font-weight="700" font-family="Segoe UI, Arial, sans-serif">EQUIPO</text>
  <text x="${colPlay}" y="${headerH + 22}" fill="${gold}" font-size="11" font-weight="700" font-family="Segoe UI, Arial, sans-serif">OCTAVOS</text>
  <text x="${colQ}" y="${headerH + 22}" fill="${gold}" font-size="11" font-weight="700" font-family="Segoe UI, Arial, sans-serif">CUARTOS</text>
  <text x="${colChamp}" y="${headerH + 22}" fill="${gold}" font-size="11" font-weight="700" font-family="Segoe UI, Arial, sans-serif">CAMPEÓN</text>
  ${rowsSvg}
</svg>`;
}

export async function renderArgentinaPhaseProbsTablePng(
  rows: ArgentinaPhaseImageRow[],
  opts: ArgentinaPhaseImageOptions
): Promise<Buffer> {
  const svg = buildArgentinaPhaseProbsTableSvg(rows, opts);
  return sharp(Buffer.from(svg)).png().toBuffer();
}
