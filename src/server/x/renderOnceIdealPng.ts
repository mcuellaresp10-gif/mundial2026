import sharp from "sharp";
import type { FormationType, OnceIdealPlayer } from "@/types";
import { lineupShortName } from "@/utils/lineupPlayerMeta";

const W = 1080;
const H = 1350;
const FONT = "Segoe UI, Arial, sans-serif";

const C = {
  bgTop: "#0F172A",
  bgBot: "#080c16",
  gold: "#FCD116",
  text: "#FAFAFA",
  muted: "#94A3B8",
  pitch: "#0d5c3a",
  pitchLine: "rgba(255,255,255,0.35)",
  chip: "#0B1220",
  stroke: "#334155",
};

function escapeXml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

async function photoDataUri(url?: string): Promise<string | null> {
  if (!url) return null;
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const buf = Buffer.from(await res.arrayBuffer());
    const png = await sharp(buf)
      .resize(72, 72, { fit: "cover" })
      .png()
      .toBuffer();
    return `data:image/png;base64,${png.toString("base64")}`;
  } catch {
    return null;
  }
}

function pitchSvg(x: number, y: number, w: number, h: number): string {
  const cx = x + w / 2;
  return `
  <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="28" fill="${C.pitch}"/>
  <rect x="${x + 10}" y="${y + 10}" width="${w - 20}" height="${h - 20}" rx="20" fill="none" stroke="${C.pitchLine}" stroke-width="2"/>
  <line x1="${x + 10}" y1="${y + h / 2}" x2="${x + w - 10}" y2="${y + h / 2}" stroke="${C.pitchLine}" stroke-width="2"/>
  <circle cx="${cx}" cy="${y + h / 2}" r="70" fill="none" stroke="${C.pitchLine}" stroke-width="2"/>
  <circle cx="${cx}" cy="${y + h / 2}" r="4" fill="${C.pitchLine}"/>
  <rect x="${x + w * 0.22}" y="${y + 10}" width="${w * 0.56}" height="${h * 0.16}" fill="none" stroke="${C.pitchLine}" stroke-width="2"/>
  <rect x="${x + w * 0.22}" y="${y + h - 10 - h * 0.16}" width="${w * 0.56}" height="${h * 0.16}" fill="none" stroke="${C.pitchLine}" stroke-width="2"/>
  <rect x="${x + w * 0.34}" y="${y + 10}" width="${w * 0.32}" height="${h * 0.07}" fill="none" stroke="${C.pitchLine}" stroke-width="2"/>
  <rect x="${x + w * 0.34}" y="${y + h - 10 - h * 0.07}" width="${w * 0.32}" height="${h * 0.07}" fill="none" stroke="${C.pitchLine}" stroke-width="2"/>`;
}

function playerChip(
  p: OnceIdealPlayer,
  pitchX: number,
  pitchY: number,
  pitchW: number,
  pitchH: number,
  photo: string | null,
  isMvp: boolean
): string {
  const px = pitchX + (p.gridPosition.x / 100) * pitchW;
  const py = pitchY + (p.gridPosition.y / 100) * pitchH;
  const name = escapeXml(lineupShortName(p.name));
  const rating = p.rating.toFixed(1);
  const photoNode = photo
    ? `<image href="${photo}" x="${px - 28}" y="${py - 48}" width="56" height="56" clip-path="url(#clip${p.id})"/>`
    : `<circle cx="${px}" cy="${py - 20}" r="28" fill="${C.chip}"/>`;

  return `
  <defs>
    <clipPath id="clip${p.id}"><circle cx="${px}" cy="${py - 20}" r="28"/></clipPath>
  </defs>
  <circle cx="${px}" cy="${py - 20}" r="31" fill="${isMvp ? C.gold : "#fff"}" opacity="0.9"/>
  ${photoNode}
  <rect x="${px - 34}" y="${py + 12}" width="68" height="34" rx="10" fill="${C.chip}" stroke="${isMvp ? C.gold : C.stroke}" stroke-width="${isMvp ? 2 : 1}"/>
  <text x="${px}" y="${py + 26}" text-anchor="middle" fill="${C.text}" font-size="11" font-weight="800" font-family="${FONT}">${name}</text>
  <text x="${px}" y="${py + 40}" text-anchor="middle" fill="${C.gold}" font-size="11" font-weight="800" font-family="${FONT}">${rating}</text>
  ${
    isMvp
      ? `<rect x="${px - 18}" y="${py - 58}" width="36" height="14" rx="7" fill="${C.gold}"/><text x="${px}" y="${py - 48}" text-anchor="middle" fill="#111" font-size="9" font-weight="800" font-family="${FONT}">MVP</text>`
      : ""
  }`;
}

export async function renderOnceIdealPng(input: {
  players: OnceIdealPlayer[];
  formation: FormationType;
  phaseLabel: string;
  averageRating: number;
}): Promise<Buffer> {
  const mvp = [...input.players].sort((a, b) => b.rating - a.rating)[0];
  const photos = new Map<number, string | null>();
  await Promise.all(
    input.players.map(async (p) => {
      photos.set(p.id, await photoDataUri(p.photo));
    })
  );

  const pitchX = 60;
  const pitchY = 150;
  const pitchW = W - 120;
  const pitchH = 980;

  const chips = input.players
    .map((p) =>
      playerChip(
        p,
        pitchX,
        pitchY,
        pitchW,
        pitchH,
        photos.get(p.id) ?? null,
        mvp?.id === p.id
      )
    )
    .join("\n");

  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="${C.bgTop}"/>
      <stop offset="100%" stop-color="${C.bgBot}"/>
    </linearGradient>
    <clipPath id="card"><rect width="${W}" height="${H}" rx="28"/></clipPath>
  </defs>
  <g clip-path="url(#card)">
  <rect width="${W}" height="${H}" fill="url(#bg)"/>
  <rect x="0" y="0" width="${W}" height="8" fill="${C.gold}"/>

  <text x="40" y="48" fill="${C.gold}" font-size="22" font-weight="800" font-family="${FONT}">@MundialAnalisis</text>
  <text x="40" y="74" fill="${C.muted}" font-size="13" font-family="${FONT}">Fútbol Américas · Rating ponderado por minutos</text>
  <text x="${W - 40}" y="44" text-anchor="end" fill="${C.text}" font-size="20" font-weight="800" font-family="${FONT}">ONCE IDEAL</text>
  <text x="${W - 40}" y="70" text-anchor="end" fill="${C.muted}" font-size="13" font-family="${FONT}">${escapeXml(input.phaseLabel)} · ${escapeXml(input.formation)} · media ${input.averageRating.toFixed(1)}</text>
  <line x1="40" y1="96" x2="${W - 40}" y2="96" stroke="${C.stroke}"/>

  ${pitchSvg(pitchX, pitchY, pitchW, pitchH)}
  ${chips}

  <text x="40" y="${H - 28}" fill="${C.muted}" font-size="12" font-family="${FONT}">Liga BetPlay · Todos contra todos · mín. minutos en fase · @MundialAnalisis</text>
  </g>
</svg>`;

  return sharp(Buffer.from(svg)).png().toBuffer();
}
