import sharp from "sharp";
import { translateTeamName } from "@/utils/teamNames";
import { formatPct, type ForecastMatchTweetInput } from "@/server/x/formatForecastTweets";

const W = 1200;
const H = 720;
const FONT = "Segoe UI, Arial, sans-serif";

const C = {
  bgTop: "#0F172A",
  bgBot: "#080c16",
  panel: "#1F2937",
  panelStroke: "#334155",
  gold: "#FCD116",
  goldDim: "#EAB308",
  text: "#FAFAFA",
  muted: "#94A3B8",
  home: "#FCD116",
  draw: "#64748B",
  away: "#10B981",
  hole: "#0B1220",
  favPanel: "#162032",
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

function sliceWithGap(
  cx: number,
  cy: number,
  rOut: number,
  rIn: number,
  start: number,
  sweep: number,
  color: string
): string {
  const GAP = 3.2;
  if (sweep < 0.4) return "";
  if (sweep >= 359.5) {
    return [
      `<circle cx="${cx}" cy="${cy}" r="${rOut}" fill="${color}"/>`,
      `<circle cx="${cx}" cy="${cy}" r="${rIn}" fill="${C.bgBot}"/>`,
    ].join("\n");
  }
  const gap = sweep > GAP * 2 + 2 ? GAP : 0;
  return donutSlice(cx, cy, rOut, rIn, start + gap / 2, start + sweep - gap / 2, color);
}

function outcomeSweeps(homePct: number, drawPct: number, awayPct: number) {
  const total =
    Math.max(0, homePct) + Math.max(0, drawPct) + Math.max(0, awayPct) || 1;
  const homeSweep = (Math.max(0, homePct) / total) * 360;
  const awaySweep = (Math.max(0, awayPct) / total) * 360;
  const drawSweep = (Math.max(0, drawPct) / total) * 360;
  return { homeSweep, awaySweep, drawSweep };
}

function donutPctLabel(
  cx: number,
  cy: number,
  r: number,
  angle: number,
  text: string,
  size: number
): string {
  const p = polar(cx, cy, r, angle);
  return `<text x="${p.x}" y="${p.y + size * 0.35}" text-anchor="middle" fill="${C.text}" stroke="${C.hole}" stroke-width="4" paint-order="stroke" font-size="${size}" font-weight="800" font-family="${FONT}">${text}</text>`;
}

/**
 * Local a la izquierda, visitante a la derecha, empate abajo.
 * Parte desde las 12 para que el favorito local no quede del lado del visita.
 */
function matchupDonut(
  cx: number,
  cy: number,
  rOut: number,
  rIn: number,
  home: { pct: number; color: string },
  draw: { pct: number; color: string },
  away: { pct: number; color: string }
): string {
  const { homeSweep, awaySweep, drawSweep } = outcomeSweeps(
    home.pct,
    draw.pct,
    away.pct
  );
  return [
    sliceWithGap(cx, cy, rOut, rIn, 360 - homeSweep, homeSweep, home.color),
    sliceWithGap(cx, cy, rOut, rIn, 0, awaySweep, away.color),
    sliceWithGap(cx, cy, rOut, rIn, awaySweep, drawSweep, draw.color),
  ].join("\n");
}

function rgbToHsl(r: number, g: number, b: number): { h: number; s: number; l: number } {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  const d = max - min;
  if (d === 0) return { h: 0, s: 0, l };
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h = 0;
  if (max === r) h = (g - b) / d + (g < b ? 6 : 0);
  else if (max === g) h = (b - r) / d + 2;
  else h = (r - g) / d + 4;
  return { h: h / 6, s, l };
}

function hslToRgb(h: number, s: number, l: number): [number, number, number] {
  const hue2rgb = (p: number, q: number, t: number) => {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1 / 6) return p + (q - p) * 6 * t;
    if (t < 1 / 2) return q;
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
    return p;
  };
  if (s === 0) {
    const v = l * 255;
    return [v, v, v];
  }
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;
  return [
    hue2rgb(p, q, h + 1 / 3) * 255,
    hue2rgb(p, q, h) * 255,
    hue2rgb(p, q, h - 1 / 3) * 255,
  ];
}

function toHex(r: number, g: number, b: number): string {
  return `#${[r, g, b]
    .map((x) => Math.max(0, Math.min(255, Math.round(x))).toString(16).padStart(2, "0"))
    .join("")}`;
}

/** Ajusta el color del escudo para que se lea sobre el navy. */
function liftForDarkBg(r: number, g: number, b: number): string {
  const hsl = rgbToHsl(r, g, b);
  let { h, s, l } = hsl;
  if (l < 0.36) l = 0.42;
  if (l > 0.78) l = 0.66;
  if (s < 0.28) s = Math.min(0.58, s + 0.22);
  const [nr, ng, nb] = hslToRgb(h, s, l);
  return toHex(nr, ng, nb);
}

function dominantColorFromRgba(data: Buffer): string | null {
  const buckets = new Map<number, { w: number; r: number; g: number; b: number }>();
  for (let i = 0; i < data.length; i += 4) {
    const a = data[i + 3] ?? 0;
    if (a < 160) continue;
    const r = data[i] ?? 0;
    const g = data[i + 1] ?? 0;
    const b = data[i + 2] ?? 0;
    const { h, s, l } = rgbToHsl(r, g, b);
    if (l > 0.93 || l < 0.07 || s < 0.12) continue;
    const key = Math.round(h * 18) % 18;
    const weight = (a / 255) * s * (1 - Math.abs(l - 0.45));
    const prev = buckets.get(key);
    if (prev) {
      prev.w += weight;
      prev.r += r * weight;
      prev.g += g * weight;
      prev.b += b * weight;
    } else {
      buckets.set(key, { w: weight, r: r * weight, g: g * weight, b: b * weight });
    }
  }
  let best: { w: number; r: number; g: number; b: number } | null = null;
  for (const bucket of buckets.values()) {
    if (!best || bucket.w > best.w) best = bucket;
  }
  if (!best || best.w < 1) return null;
  return liftForDarkBg(best.r / best.w, best.g / best.w, best.b / best.w);
}

async function loadLogo(
  url?: string
): Promise<{ uri: string | null; color: string | null }> {
  if (!url) return { uri: null, color: null };
  try {
    const res = await fetch(url);
    if (!res.ok) return { uri: null, color: null };
    const buf = Buffer.from(await res.arrayBuffer());
    const raw = await sharp(buf)
      .resize(64, 64, {
        fit: "contain",
        background: { r: 0, g: 0, b: 0, alpha: 0 },
      })
      .ensureAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true });
    const color = dominantColorFromRgba(raw.data);
    const png = await sharp(buf)
      .resize(108, 108, {
        fit: "contain",
        background: { r: 0, g: 0, b: 0, alpha: 0 },
      })
      .png()
      .toBuffer();
    return { uri: `data:image/png;base64,${png.toString("base64")}`, color };
  } catch {
    return { uri: null, color: null };
  }
}

function teamMark(logo: string | null, cx: number, cy: number, r = 48): string {
  if (logo) {
    return `<image href="${logo}" x="${cx - r}" y="${cy - r}" width="${r * 2}" height="${r * 2}" />`;
  }
  return `<circle cx="${cx}" cy="${cy}" r="${r - 6}" fill="${C.panel}" stroke="${C.panelStroke}" stroke-width="2"/>`;
}

export async function renderForecastMatchPng(
  match: ForecastMatchTweetInput,
  options?: { awayColor?: string }
): Promise<Buffer> {
  const home = translateTeamName(match.homeName);
  const away = translateTeamName(match.awayName);
  const [homeLogo, awayLogo] = await Promise.all([
    loadLogo(match.homeLogo),
    loadLogo(match.awayLogo),
  ]);
  const homeColor = homeLogo.color ?? C.home;
  const awayColor = options?.awayColor ?? awayLogo.color ?? C.away;
  const xgHome = match.xgHome ?? 0;
  const xgAway = match.xgAway ?? 0;
  const scores = (match.topScores ?? []).slice(0, 3);
  const league = competitionLabel(match.competition);

  const outcomes = [
    { key: "local", label: "Local", sub: fitName(home), pct: match.winHome, color: homeColor },
    { key: "draw", label: "Empate", sub: "Tablas", pct: match.draw, color: C.draw },
    { key: "away", label: "Visita", sub: fitName(away), pct: match.winAway, color: awayColor },
  ];
  const favorite = outcomes.reduce((a, b) => (b.pct > a.pct ? b : a));

  const cx = 600;
  const cy = 318;
  const rOut = 148;
  const rIn = 94;
  const slices = matchupDonut(
    cx,
    cy,
    rOut,
    rIn,
    { pct: match.winHome, color: homeColor },
    { pct: match.draw, color: C.draw },
    { pct: match.winAway, color: awayColor }
  );
  const { homeSweep, awaySweep, drawSweep } = outcomeSweeps(
    match.winHome,
    match.draw,
    match.winAway
  );
  const labelR = (rOut + rIn) / 2;
  const homeLabel =
    homeSweep >= 22
      ? donutPctLabel(
          cx,
          cy,
          labelR,
          360 - homeSweep / 2,
          formatPct(match.winHome),
          favorite.key === "local" ? 26 : 18
        )
      : "";
  const awayLabel =
    awaySweep >= 22
      ? donutPctLabel(
          cx,
          cy,
          labelR,
          awaySweep / 2,
          formatPct(match.winAway),
          favorite.key === "away" ? 26 : 18
        )
      : "";
  const drawLabel =
    drawSweep >= 22
      ? donutPctLabel(
          cx,
          cy,
          labelR,
          awaySweep + drawSweep / 2,
          formatPct(match.draw),
          favorite.key === "draw" ? 26 : 16
        )
      : "";

  const legend = outcomes
    .map((o, i) => {
      const x = 78 + i * 348;
      const fav = o.key === favorite.key;
      const stroke = fav ? C.gold : C.panelStroke;
      const fill = fav ? C.favPanel : C.panel;
      return `
      <rect x="${x}" y="500" width="328" height="96" rx="16" fill="${fill}" stroke="${stroke}" stroke-width="${fav ? 2 : 1}"/>
      <rect x="${x + 14}" y="522" width="7" height="52" rx="3" fill="${o.color}"/>
      <text x="${x + 36}" y="548" fill="${C.text}" font-size="32" font-weight="800" font-family="${FONT}">${formatPct(o.pct)}</text>
      <text x="${x + 36}" y="576" fill="${o.color}" font-size="15" font-weight="700" font-family="${FONT}" letter-spacing="1.4">${escapeXml(o.label.toUpperCase())}</text>
      <text x="${x + 306}" y="548" text-anchor="end" fill="${C.muted}" font-size="13" font-family="${FONT}">${escapeXml(o.sub)}</text>`;
    })
    .join("");

  const scoreCells = scores
    .map((s, i) => {
      const x = 120 + i * 320;
      return `
      <text x="${x}" y="678" fill="${C.text}" font-size="26" font-weight="800" font-family="${FONT}">${s.home}–${s.away}</text>
      <text x="${x + 86}" y="678" fill="${C.gold}" font-size="20" font-weight="700" font-family="${FONT}">${formatPct(s.prob)}</text>`;
    })
    .join("");

  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${C.bgTop}"/>
      <stop offset="50%" stop-color="#1e293b"/>
      <stop offset="100%" stop-color="${C.bgBot}"/>
    </linearGradient>
    <radialGradient id="glowHome" cx="20%" cy="45%" r="45%">
      <stop offset="0%" stop-color="${homeColor}" stop-opacity="0.16"/>
      <stop offset="100%" stop-color="${homeColor}" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="glowAway" cx="82%" cy="20%" r="40%">
      <stop offset="0%" stop-color="${awayColor}" stop-opacity="0.14"/>
      <stop offset="100%" stop-color="${awayColor}" stop-opacity="0"/>
    </radialGradient>
    <clipPath id="card">
      <rect width="${W}" height="${H}" rx="28"/>
    </clipPath>
  </defs>
  <g clip-path="url(#card)">
  <rect width="${W}" height="${H}" fill="url(#bg)"/>
  <rect width="${W}" height="${H}" fill="url(#glowHome)"/>
  <rect width="${W}" height="${H}" fill="url(#glowAway)"/>
  <rect x="0" y="0" width="${W}" height="8" fill="${C.gold}"/>

  <text x="40" y="48" fill="${C.gold}" font-size="20" font-weight="800" font-family="${FONT}">@MundialAnalisis</text>
  <text x="1160" y="40" text-anchor="end" fill="${C.text}" font-size="15" font-weight="700" font-family="${FONT}">SIMULACIÓN 1X2</text>
  <text x="1160" y="62" text-anchor="end" fill="${C.muted}" font-size="13" font-family="${FONT}">${escapeXml(league)}</text>
  <line x1="40" y1="76" x2="1160" y2="76" stroke="${C.panelStroke}" stroke-width="1"/>

  ${teamMark(homeLogo.uri, 168, 168, 46)}
  <text x="168" y="242" text-anchor="middle" fill="${C.text}" font-size="22" font-weight="800" font-family="${FONT}">${escapeXml(fitName(home, 16))}</text>
  <text x="168" y="266" text-anchor="middle" fill="${homeColor}" font-size="13" font-weight="700" font-family="${FONT}" letter-spacing="1.6">LOCAL</text>
  <text x="168" y="292" text-anchor="middle" fill="${C.muted}" font-size="15" font-family="${FONT}">xG ${xgHome.toFixed(2)}</text>

  ${teamMark(awayLogo.uri, 1032, 168, 46)}
  <text x="1032" y="242" text-anchor="middle" fill="${C.text}" font-size="22" font-weight="800" font-family="${FONT}">${escapeXml(fitName(away, 16))}</text>
  <text x="1032" y="266" text-anchor="middle" fill="${awayColor}" font-size="13" font-weight="700" font-family="${FONT}" letter-spacing="1.6">VISITANTE</text>
  <text x="1032" y="292" text-anchor="middle" fill="${C.muted}" font-size="15" font-family="${FONT}">xG ${xgAway.toFixed(2)}</text>

  <circle cx="${cx}" cy="${cy}" r="168" fill="${C.bgTop}" stroke="${C.panelStroke}" stroke-width="1"/>
  ${slices}
  <circle cx="${cx}" cy="${cy}" r="${rIn - 2}" fill="${C.hole}"/>
  ${homeLabel}
  ${awayLabel}
  ${drawLabel}

  ${legend}

  <text x="78" y="640" fill="${C.muted}" font-size="12" font-weight="700" font-family="${FONT}" letter-spacing="1.8">MARCADORES MÁS PROBABLES</text>
  ${scoreCells || `<text x="120" y="678" fill="${C.muted}" font-size="16" font-family="${FONT}">Sin marcadores disponibles</text>`}
  <text x="1122" y="678" text-anchor="end" fill="${C.muted}" font-size="12" font-family="${FONT}">@MundialAnalisis</text>
  </g>
</svg>`;

  return sharp(Buffer.from(svg)).png().toBuffer();
}
