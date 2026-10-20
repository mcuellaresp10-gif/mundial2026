import sharp from "sharp";
import { translateTeamName } from "@/utils/teamNames";
import { formatPct, type ForecastMatchTweetInput } from "@/server/x/formatForecastTweets";

const W = 1200;
const H = 720;
const FONT = "Segoe UI, Arial, sans-serif";

const C = {
  bgTop: "#1a1710",
  bgBot: "#0c0b09",
  panel: "#211d16",
  panelStroke: "#3a3428",
  gold: "#FCD116",
  goldDim: "#c9a227",
  cream: "#F5E6C8",
  muted: "#a89878",
  home: "#FCD116",
  draw: "#8a7d68",
  away: "#E07A5F",
};

function escapeXml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function competitionLabel(competition?: string): string {
  const c = (competition ?? "").toLowerCase();
  if (c.includes("sudamericana") || c.includes("sudaca")) return "Copa Sudamericana";
  if (c.includes("libertadores")) return "Copa Libertadores";
  if (c.includes("brasil") || c.includes("brasileir")) return "Brasileirão Serie A";
  if (
    c.includes("argentina") ||
    c.includes("apertura") ||
    c.includes("clausura") ||
    c.includes("liga profesional")
  ) {
    return "Liga Profesional Argentina";
  }
  return "Liga BetPlay Dimayor";
}

function fitName(name: string, max = 18): string {
  if (name.length <= max) return name;
  return `${name.slice(0, max - 1).trimEnd()}…`;
}

function polar(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return {
    x: +(cx + r * Math.cos(rad)).toFixed(2),
    y: +(cy + r * Math.sin(rad)).toFixed(2),
  };
}

function donutSlice(
  cx: number,
  cy: number,
  rOut: number,
  rIn: number,
  a0: number,
  a1: number,
  color: string
): string {
  const sweep = Math.max(0, Math.min(359.9, a1 - a0));
  if (sweep < 0.35) return "";
  const large = sweep > 180 ? 1 : 0;
  const p1 = polar(cx, cy, rOut, a0);
  const p2 = polar(cx, cy, rOut, a0 + sweep);
  const p3 = polar(cx, cy, rIn, a0 + sweep);
  const p4 = polar(cx, cy, rIn, a0);
  return `<path d="M ${p1.x} ${p1.y} A ${rOut} ${rOut} 0 ${large} 1 ${p2.x} ${p2.y} L ${p3.x} ${p3.y} A ${rIn} ${rIn} 0 ${large} 0 ${p4.x} ${p4.y} Z" fill="${color}"/>`;
}

function donutSlices(
  cx: number,
  cy: number,
  rOut: number,
  rIn: number,
  slices: { pct: number; color: string }[]
): string {
  const total = slices.reduce((s, x) => s + Math.max(0, x.pct), 0) || 1;
  const GAP = 3.2;
  let angle = 0;
  const parts: string[] = [];
  for (const slice of slices) {
    const sweep = (Math.max(0, slice.pct) / total) * 360;
    if (sweep < 0.4) {
      angle += sweep;
      continue;
    }
    if (sweep >= 359.5) {
      parts.push(
        `<circle cx="${cx}" cy="${cy}" r="${rOut}" fill="${slice.color}"/>`,
        `<circle cx="${cx}" cy="${cy}" r="${rIn}" fill="${C.bgBot}"/>`
      );
      return parts.join("\n");
    }
    const gap = sweep > GAP * 2 + 2 ? GAP : 0;
    parts.push(
      donutSlice(cx, cy, rOut, rIn, angle + gap / 2, angle + sweep - gap / 2, slice.color)
    );
    angle += sweep;
  }
  return parts.join("\n");
}

async function logoDataUri(url?: string): Promise<string | null> {
  if (!url) return null;
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const buf = Buffer.from(await res.arrayBuffer());
    const png = await sharp(buf)
      .resize(108, 108, {
        fit: "contain",
        background: { r: 0, g: 0, b: 0, alpha: 0 },
      })
      .png()
      .toBuffer();
    return `data:image/png;base64,${png.toString("base64")}`;
  } catch {
    return null;
  }
}

function teamMark(logo: string | null, cx: number, cy: number, r = 48): string {
  if (logo) {
    return `<image href="${logo}" x="${cx - r}" y="${cy - r}" width="${r * 2}" height="${r * 2}" />`;
  }
  return `<circle cx="${cx}" cy="${cy}" r="${r - 6}" fill="${C.panel}" stroke="${C.panelStroke}" stroke-width="2"/>`;
}

export async function renderForecastMatchPng(
  match: ForecastMatchTweetInput
): Promise<Buffer> {
  const home = translateTeamName(match.homeName);
  const away = translateTeamName(match.awayName);
  const [homeLogo, awayLogo] = await Promise.all([
    logoDataUri(match.homeLogo),
    logoDataUri(match.awayLogo),
  ]);
  const xgHome = match.xgHome ?? 0;
  const xgAway = match.xgAway ?? 0;
  const scores = (match.topScores ?? []).slice(0, 3);
  const league = competitionLabel(match.competition);

  const outcomes = [
    { key: "local", label: "Local", sub: fitName(home), pct: match.winHome, color: C.home },
    { key: "draw", label: "Empate", sub: "Tablas", pct: match.draw, color: C.draw },
    { key: "away", label: "Visita", sub: fitName(away), pct: match.winAway, color: C.away },
  ];
  const favorite = outcomes.reduce((a, b) => (b.pct > a.pct ? b : a));

  const cx = 600;
  const cy = 318;
  const rOut = 148;
  const rIn = 94;
  const slices = donutSlices(
    cx,
    cy,
    rOut,
    rIn,
    outcomes.map((o) => ({ pct: o.pct, color: o.color }))
  );

  const legend = outcomes
    .map((o, i) => {
      const x = 78 + i * 348;
      const fav = o.key === favorite.key;
      const stroke = fav ? C.gold : C.panelStroke;
      const fill = fav ? "#2a2418" : C.panel;
      return `
      <rect x="${x}" y="500" width="328" height="96" rx="16" fill="${fill}" stroke="${stroke}" stroke-width="${fav ? 2 : 1}"/>
      <rect x="${x + 14}" y="522" width="7" height="52" rx="3" fill="${o.color}"/>
      <text x="${x + 36}" y="548" fill="${C.cream}" font-size="32" font-weight="800" font-family="${FONT}">${formatPct(o.pct)}</text>
      <text x="${x + 36}" y="576" fill="${o.color}" font-size="15" font-weight="700" font-family="${FONT}" letter-spacing="1.4">${escapeXml(o.label.toUpperCase())}</text>
      <text x="${x + 306}" y="548" text-anchor="end" fill="${C.muted}" font-size="13" font-family="${FONT}">${escapeXml(o.sub)}</text>`;
    })
    .join("");

  const scoreCells = scores
    .map((s, i) => {
      const x = 120 + i * 320;
      return `
      <text x="${x}" y="678" fill="${C.cream}" font-size="26" font-weight="800" font-family="${FONT}">${s.home}–${s.away}</text>
      <text x="${x + 86}" y="678" fill="${C.gold}" font-size="20" font-weight="700" font-family="${FONT}">${formatPct(s.prob)}</text>`;
    })
    .join("");

  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="${C.bgTop}"/>
      <stop offset="100%" stop-color="${C.bgBot}"/>
    </linearGradient>
    <clipPath id="card">
      <rect width="${W}" height="${H}" rx="28"/>
    </clipPath>
  </defs>
  <g clip-path="url(#card)">
  <rect width="${W}" height="${H}" fill="url(#bg)"/>
  <rect x="0" y="0" width="${W}" height="8" fill="${C.gold}"/>

  <text x="40" y="48" fill="${C.gold}" font-size="20" font-weight="800" font-family="${FONT}">@MundialAnalisis</text>
  <text x="1160" y="40" text-anchor="end" fill="${C.cream}" font-size="15" font-weight="700" font-family="${FONT}">SIMULACIÓN 1X2</text>
  <text x="1160" y="62" text-anchor="end" fill="${C.muted}" font-size="13" font-family="${FONT}">${escapeXml(league)}</text>
  <line x1="40" y1="76" x2="1160" y2="76" stroke="${C.panelStroke}" stroke-width="1"/>

  ${teamMark(homeLogo, 168, 168, 46)}
  <text x="168" y="242" text-anchor="middle" fill="${C.cream}" font-size="22" font-weight="800" font-family="${FONT}">${escapeXml(fitName(home, 16))}</text>
  <text x="168" y="266" text-anchor="middle" fill="${C.goldDim}" font-size="13" font-weight="700" font-family="${FONT}" letter-spacing="1.6">LOCAL</text>
  <text x="168" y="292" text-anchor="middle" fill="${C.muted}" font-size="15" font-family="${FONT}">xG ${xgHome.toFixed(2)}</text>

  ${teamMark(awayLogo, 1032, 168, 46)}
  <text x="1032" y="242" text-anchor="middle" fill="${C.cream}" font-size="22" font-weight="800" font-family="${FONT}">${escapeXml(fitName(away, 16))}</text>
  <text x="1032" y="266" text-anchor="middle" fill="${C.away}" font-size="13" font-weight="700" font-family="${FONT}" letter-spacing="1.6">VISITANTE</text>
  <text x="1032" y="292" text-anchor="middle" fill="${C.muted}" font-size="15" font-family="${FONT}">xG ${xgAway.toFixed(2)}</text>

  <circle cx="${cx}" cy="${cy}" r="168" fill="#16130e" stroke="${C.panelStroke}" stroke-width="1"/>
  ${slices}
  <circle cx="${cx}" cy="${cy}" r="${rIn - 2}" fill="#100e0b"/>
  <text x="${cx}" y="${cy - 8}" text-anchor="middle" fill="${C.cream}" font-size="42" font-weight="800" font-family="${FONT}">${formatPct(favorite.pct)}</text>
  <text x="${cx}" y="${cy + 22}" text-anchor="middle" fill="${favorite.color}" font-size="14" font-weight="700" font-family="${FONT}" letter-spacing="2">${escapeXml(favorite.label.toUpperCase())}</text>

  ${legend}

  <text x="78" y="640" fill="${C.muted}" font-size="12" font-weight="700" font-family="${FONT}" letter-spacing="1.8">MARCADORES MÁS PROBABLES</text>
  ${scoreCells || `<text x="120" y="678" fill="${C.muted}" font-size="16" font-family="${FONT}">Sin marcadores disponibles</text>`}
  <text x="1122" y="678" text-anchor="end" fill="${C.muted}" font-size="12" font-family="${FONT}">@MundialAnalisis</text>
  </g>
</svg>`;

  return sharp(Buffer.from(svg)).png().toBuffer();
}
