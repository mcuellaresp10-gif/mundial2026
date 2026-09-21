import sharp from "sharp";
import { translateTeamName } from "@/utils/teamNames";
import { formatBetPlayPct } from "@/utils/betPlaySeasonSimulation";

export interface PhaseProbsImageRow {
  teamName: string;
  probCuadrangulares: number;
  probFinal: number;
  probChampion: number;
}

export interface PhaseProbsImageOptions {
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

function shortTeamName(name: string): string {
  const t = translateTeamName(name);
  if (/atletico nacional/i.test(t)) return "Nacional";
  if (/independiente medellin/i.test(t) || /independiente medellín/i.test(t)) {
    return "Medellín";
  }
  if (/aguilas doradas|águilas doradas/i.test(t)) return "Aguilas Doradas";
  if (/deportes tolima/i.test(t)) return "Tolima";
  if (/america de cali|américa de cali/i.test(t)) return "América de Cali";
  if (/internacional de bogota|internacional de bogotá/i.test(t)) {
    return "Internacional";
  }
  return t;
}

function barWidth(value: number, maxW: number): number {
  return Math.max(0, Math.min(maxW, value * maxW));
}

/** SVG de la tabla (estilo oscuro similar a Tablas). */
export function buildPhaseProbsTableSvg(
  rows: PhaseProbsImageRow[],
  opts: PhaseProbsImageOptions
): string {
  const sorted = [...rows].sort(
    (a, b) => b.probCuadrangulares - a.probCuadrangulares
  );
  const phaseLabel = opts.phase === "apertura" ? "Apertura" : "Clausura";
  const sims = opts.simulations ?? 1000;
  const pj = opts.maxPlayed ?? opts.jornada;

  const width = 920;
  const padX = 28;
  const headerH = 92;
  const rowH = 36;
  const height = headerH + 36 + sorted.length * rowH + 28;

  const colRank = padX;
  const colTeam = padX + 40;
  const colQuad = 340;
  const colFinal = 540;
  const colChamp = 740;
  const barMax = 120;

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
      const name = escapeXml(shortTeamName(r.teamName));
      const q = formatBetPlayPct(r.probCuadrangulares, { maxPlayed: pj });
      const f = formatBetPlayPct(r.probFinal, { maxPlayed: pj });
      const c = formatBetPlayPct(r.probChampion, { maxPlayed: pj });
      const stripe = i % 2 === 0 ? "rgba(255,255,255,0.03)" : "transparent";
      return `
      <rect x="${padX}" y="${y}" width="${width - padX * 2}" height="${rowH}" fill="${stripe}"/>
      <text x="${colRank}" y="${y + 24}" fill="${muted}" font-size="13" font-family="Segoe UI, Arial, sans-serif">${i + 1}</text>
      <text x="${colTeam}" y="${y + 24}" fill="${text}" font-size="14" font-weight="600" font-family="Segoe UI, Arial, sans-serif">${name}</text>
      <rect x="${colQuad}" y="${y + 14}" width="${barMax}" height="8" rx="4" fill="${barTrack}"/>
      <rect x="${colQuad}" y="${y + 14}" width="${barWidth(r.probCuadrangulares, barMax)}" height="8" rx="4" fill="${barFill}"/>
      <text x="${colQuad + barMax + 8}" y="${y + 22}" fill="${text}" font-size="12" font-family="Consolas, monospace">${escapeXml(q)}</text>
      <rect x="${colFinal}" y="${y + 14}" width="${barMax}" height="8" rx="4" fill="${barTrack}"/>
      <rect x="${colFinal}" y="${y + 14}" width="${barWidth(r.probFinal, barMax)}" height="8" rx="4" fill="${barFill}"/>
      <text x="${colFinal + barMax + 8}" y="${y + 22}" fill="${text}" font-size="12" font-family="Consolas, monospace">${escapeXml(f)}</text>
      <rect x="${colChamp}" y="${y + 14}" width="${barMax}" height="8" rx="4" fill="${barTrack}"/>
      <rect x="${colChamp}" y="${y + 14}" width="${barWidth(r.probChampion, barMax)}" height="8" rx="4" fill="${barFill}"/>
      <text x="${colChamp + barMax + 8}" y="${y + 22}" fill="${text}" font-size="12" font-family="Consolas, monospace">${escapeXml(c)}</text>`;
    })
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <rect width="100%" height="100%" fill="${bg}"/>
  <rect x="16" y="16" width="${width - 32}" height="${height - 32}" rx="16" fill="${card}"/>
  <text x="${padX}" y="48" fill="${text}" font-size="22" font-weight="700" font-family="Segoe UI, Arial, sans-serif">Liga BetPlay — Probabilidades por fase · ${escapeXml(phaseLabel)}</text>
  <text x="${padX}" y="72" fill="${muted}" font-size="13" font-family="Segoe UI, Arial, sans-serif">Fútbol Américas · Jornada ${opts.jornada} · ${pj} PJ · ${sims} sims</text>
  <text x="${colRank}" y="${headerH + 22}" fill="${gold}" font-size="11" font-weight="700" font-family="Segoe UI, Arial, sans-serif">#</text>
  <text x="${colTeam}" y="${headerH + 22}" fill="${gold}" font-size="11" font-weight="700" font-family="Segoe UI, Arial, sans-serif">EQUIPO</text>
  <text x="${colQuad}" y="${headerH + 22}" fill="${gold}" font-size="11" font-weight="700" font-family="Segoe UI, Arial, sans-serif">CUADRANGULARES</text>
  <text x="${colFinal}" y="${headerH + 22}" fill="${gold}" font-size="11" font-weight="700" font-family="Segoe UI, Arial, sans-serif">FINAL</text>
  <text x="${colChamp}" y="${headerH + 22}" fill="${gold}" font-size="11" font-weight="700" font-family="Segoe UI, Arial, sans-serif">CAMPEÓN</text>
  ${rowsSvg}
</svg>`;
}

/** PNG listo para subir a X. */
export async function renderPhaseProbsTablePng(
  rows: PhaseProbsImageRow[],
  opts: PhaseProbsImageOptions
): Promise<Buffer> {
  const svg = buildPhaseProbsTableSvg(rows, opts);
  return sharp(Buffer.from(svg)).png().toBuffer();
}
