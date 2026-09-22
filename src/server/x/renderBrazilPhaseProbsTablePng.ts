import sharp from "sharp";
import { translateTeamName } from "@/utils/teamNames";
import { formatBrazilPct } from "@/utils/brazilSeasonSimulation";

export interface BrazilPhaseImageRow {
  teamName: string;
  rank: number;
  probChampion: number;
  probLibertadores: number;
  probRelegation: number;
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
  if (/atletico[- ]?mg|atlético[- ]?mg/i.test(t)) return "Atl. Mineiro";
  if (/atletico[- ]?pr|athletico/i.test(t)) return "Athletico-PR";
  if (/sao paulo|são paulo/i.test(t)) return "São Paulo";
  if (/gremio|grêmio/i.test(t)) return "Grêmio";
  return t;
}

function barWidth(value: number, maxW: number): number {
  return Math.max(0, Math.min(maxW, value * maxW));
}

export function buildBrazilPhaseProbsTableSvg(
  rows: BrazilPhaseImageRow[],
  opts: { jornada: number; simulations?: number; maxPlayed?: number }
): string {
  const sorted = [...rows].sort((a, b) => a.rank - b.rank);
  const sims = opts.simulations ?? 1000;
  const pj = opts.maxPlayed ?? opts.jornada;

  const width = 920;
  const padX = 28;
  const headerH = 92;
  const rowH = 34;
  const height = headerH + 36 + sorted.length * rowH + 28;

  const colRank = padX;
  const colTeam = padX + 40;
  const colChamp = 340;
  const colLib = 540;
  const colRel = 740;
  const barMax = 110;

  const bg = "#0b1220";
  const card = "#121a2b";
  const text = "#e8eef7";
  const muted = "#8b9bb4";
  const gold = "#d4a017";
  const barTrack = "#1e2a3d";
  const barFill = "#c9a227";
  const danger = "#c45c5c";

  const rowsSvg = sorted
    .map((r, i) => {
      const y = headerH + 36 + i * rowH;
      const name = escapeXml(shortName(r.teamName));
      const c = formatBrazilPct(r.probChampion, { maxPlayed: pj });
      const l = formatBrazilPct(r.probLibertadores, { maxPlayed: pj });
      const d = formatBrazilPct(r.probRelegation, { maxPlayed: pj });
      const stripe = i % 2 === 0 ? "rgba(255,255,255,0.03)" : "transparent";
      return `
      <rect x="${padX}" y="${y}" width="${width - padX * 2}" height="${rowH}" fill="${stripe}"/>
      <text x="${colRank}" y="${y + 22}" fill="${muted}" font-size="12" font-family="Segoe UI, Arial, sans-serif">${r.rank}</text>
      <text x="${colTeam}" y="${y + 22}" fill="${text}" font-size="13" font-weight="600" font-family="Segoe UI, Arial, sans-serif">${name}</text>
      <rect x="${colChamp}" y="${y + 13}" width="${barMax}" height="8" rx="4" fill="${barTrack}"/>
      <rect x="${colChamp}" y="${y + 13}" width="${barWidth(r.probChampion, barMax)}" height="8" rx="4" fill="${barFill}"/>
      <text x="${colChamp + barMax + 8}" y="${y + 21}" fill="${text}" font-size="11" font-family="Consolas, monospace">${escapeXml(c)}</text>
      <rect x="${colLib}" y="${y + 13}" width="${barMax}" height="8" rx="4" fill="${barTrack}"/>
      <rect x="${colLib}" y="${y + 13}" width="${barWidth(r.probLibertadores, barMax)}" height="8" rx="4" fill="${barFill}"/>
      <text x="${colLib + barMax + 8}" y="${y + 21}" fill="${text}" font-size="11" font-family="Consolas, monospace">${escapeXml(l)}</text>
      <rect x="${colRel}" y="${y + 13}" width="${barMax}" height="8" rx="4" fill="${barTrack}"/>
      <rect x="${colRel}" y="${y + 13}" width="${barWidth(r.probRelegation, barMax)}" height="8" rx="4" fill="${danger}"/>
      <text x="${colRel + barMax + 8}" y="${y + 21}" fill="${text}" font-size="11" font-family="Consolas, monospace">${escapeXml(d)}</text>`;
    })
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <rect width="100%" height="100%" fill="${bg}"/>
  <rect x="16" y="16" width="${width - 32}" height="${height - 32}" rx="16" fill="${card}"/>
  <text x="${padX}" y="48" fill="${text}" font-size="22" font-weight="700" font-family="Segoe UI, Arial, sans-serif">Brasileirão — Probabilidades de tabla</text>
  <text x="${padX}" y="72" fill="${muted}" font-size="13" font-family="Segoe UI, Arial, sans-serif">Fecha ${opts.jornada} · ${pj} PJ · ${sims} sims · G6 Libertadores · Z4 descenso</text>
  <text x="${colRank}" y="${headerH + 22}" fill="${gold}" font-size="11" font-weight="700" font-family="Segoe UI, Arial, sans-serif">#</text>
  <text x="${colTeam}" y="${headerH + 22}" fill="${gold}" font-size="11" font-weight="700" font-family="Segoe UI, Arial, sans-serif">EQUIPO</text>
  <text x="${colChamp}" y="${headerH + 22}" fill="${gold}" font-size="11" font-weight="700" font-family="Segoe UI, Arial, sans-serif">CAMPEÓN</text>
  <text x="${colLib}" y="${headerH + 22}" fill="${gold}" font-size="11" font-weight="700" font-family="Segoe UI, Arial, sans-serif">LIBERTA (G6)</text>
  <text x="${colRel}" y="${headerH + 22}" fill="${gold}" font-size="11" font-weight="700" font-family="Segoe UI, Arial, sans-serif">DESCENSO</text>
  ${rowsSvg}
</svg>`;
}

export async function renderBrazilPhaseProbsTablePng(
  rows: BrazilPhaseImageRow[],
  opts: { jornada: number; simulations?: number; maxPlayed?: number }
): Promise<Buffer> {
  const svg = buildBrazilPhaseProbsTableSvg(rows, opts);
  return sharp(Buffer.from(svg)).png().toBuffer();
}
