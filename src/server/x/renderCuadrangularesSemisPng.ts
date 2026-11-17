import sharp from "sharp";
import { translateTeamName } from "@/utils/teamNames";
import { formatPct1 } from "@/server/x/formatPhaseProbsTweets";
import type { CuadrangularSemisTeamProbs } from "@/utils/betPlaySeasonSimulation";

const W = 1200;
const H = 820;
const FONT = "Segoe UI, Arial, sans-serif";

const C = {
  bg: "#0B1220",
  panel: "#121a2b",
  panelAlt: "#162032",
  stroke: "#2a364a",
  gold: "#FCD116",
  goldSoft: "#3a3218",
  text: "#FAFAFA",
  muted: "#94A3B8",
  groupA: "#FCD116",
  groupB: "#7DD3FC",
  barTrack: "#0a101c",
  champFill: "#1a160c",
};

function escapeXml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function shortName(name: string): string {
  const t = translateTeamName(name);
  if (/atletico nacional/i.test(t)) return "Nacional";
  if (/independiente medellin|independiente medellín/i.test(t)) return "Medellín";
  if (/independiente santa fe|santa fe/i.test(t)) return "Santa Fe";
  if (/america de cali|américa de cali/i.test(t)) return "América";
  if (/atletico bucaramanga|atlético bucaramanga/i.test(t)) return "Bucaramanga";
  if (/deportivo cali/i.test(t)) return "Dep. Cali";
  if (/once caldas/i.test(t)) return "Once Caldas";
  if (/millonarios/i.test(t)) return "Millonarios";
  return t.length > 14 ? `${t.slice(0, 13)}…` : t;
}

async function logoDataUri(url?: string): Promise<string | null> {
  if (!url) return null;
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const buf = Buffer.from(await res.arrayBuffer());
    const png = await sharp(buf)
      .resize(48, 48, {
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

function pill(
  x: number,
  y: number,
  w: number,
  label: string,
  fill: string,
  stroke: string,
  color: string
): string {
  return `
  <rect x="${x}" y="${y}" width="${w}" height="18" rx="9" fill="${fill}" stroke="${stroke}" stroke-width="1"/>
  <text x="${x + w / 2}" y="${y + 13}" text-anchor="middle" fill="${color}" font-size="9" font-weight="800" font-family="${FONT}" letter-spacing="0.6">${escapeXml(label)}</text>`;
}

function teamRow(
  team: CuadrangularSemisTeamProbs,
  rank: number,
  x: number,
  y: number,
  width: number,
  accent: string,
  logo: string | null,
  isLeader: boolean
): string {
  const rowH = 92;
  const name = escapeXml(shortName(team.teamName));
  const bg = rank % 2 === 0 ? C.panelAlt : C.panel;
  const mark = logo
    ? `<image href="${logo}" x="${x + 54}" y="${y + 22}" width="48" height="48" />`
    : `<circle cx="${x + 78}" cy="${y + 46}" r="20" fill="${C.barTrack}"/>`;

  let badgeX = x + 112;
  const badges: string[] = [];
  if (isLeader) {
    badges.push(pill(badgeX, y + 58, 84, "LÍDER PROY.", C.goldSoft, C.gold, C.gold));
    badgeX += 90;
  }
  if (team.isSeed) {
    badges.push(pill(badgeX, y + 58, 94, "PTO. INVISIBLE", C.goldSoft, C.gold, C.gold));
    badgeX += 100;
  }

  const finalX = x + width - 268;
  const champX = x + width - 128;
  const barW = 118;
  const filled = Math.max(5, Math.min(barW, team.probFinal * barW));
  const meta = `Proy. ${team.projectedPoints.toFixed(1)} pts`;

  return `
  <rect x="${x}" y="${y}" width="${width}" height="${rowH}" fill="${bg}"/>
  <circle cx="${x + 28}" cy="${y + 46}" r="15" fill="${C.barTrack}" stroke="${accent}" stroke-width="1.5"/>
  <text x="${x + 28}" y="${y + 51}" text-anchor="middle" fill="${C.text}" font-size="12" font-weight="800" font-family="${FONT}">${rank}</text>
  ${mark}
  <text x="${x + 112}" y="${y + 38}" fill="${C.text}" font-size="17" font-weight="800" font-family="${FONT}">${name}</text>
  ${
    badges.length > 0
      ? badges.join("\n")
      : `<text x="${x + 112}" y="${y + 62}" fill="${C.muted}" font-size="11" font-family="${FONT}">${meta}</text>`
  }
  <text x="${finalX}" y="${y + 28}" fill="${C.muted}" font-size="10" font-weight="700" font-family="${FONT}" letter-spacing="0.8">% FINAL</text>
  <text x="${finalX}" y="${y + 54}" fill="${C.text}" font-size="24" font-weight="800" font-family="${FONT}">${formatPct1(team.probFinal)}</text>
  <rect x="${finalX}" y="${y + 66}" width="${barW}" height="9" rx="4.5" fill="${C.barTrack}"/>
  <rect x="${finalX}" y="${y + 66}" width="${filled}" height="9" rx="4.5" fill="${accent}"/>
  <rect x="${champX}" y="${y + 18}" width="108" height="56" rx="12" fill="${C.champFill}" stroke="${C.gold}" stroke-width="1.5"/>
  <text x="${champX + 54}" y="${y + 40}" text-anchor="middle" fill="${C.gold}" font-size="10" font-weight="800" font-family="${FONT}">% CAMPEÓN</text>
  <text x="${champX + 54}" y="${y + 62}" text-anchor="middle" fill="${C.text}" font-size="20" font-weight="800" font-family="${FONT}">${formatPct1(team.probChampion)}</text>`;
}

function groupPanel(
  label: string,
  accent: string,
  teams: CuadrangularSemisTeamProbs[],
  logos: Map<number, string | null>,
  x: number,
  y: number,
  width: number
): string {
  const headerH = 44;
  const rowH = 92;
  const bodyH = teams.length * rowH;
  const totalH = headerH + 28 + bodyH;
  const rows = teams
    .map((t, i) =>
      teamRow(
        t,
        i + 1,
        x,
        y + headerH + 28 + i * rowH,
        width,
        accent,
        logos.get(t.teamId) ?? null,
        i === 0
      )
    )
    .join("\n");

  return `
  <rect x="${x}" y="${y}" width="${width}" height="${totalH}" rx="18" fill="${C.panel}" stroke="${C.stroke}"/>
  <path d="M ${x} ${y + headerH} L ${x} ${y + 18} Q ${x} ${y} ${x + 18} ${y} L ${x + width - 18} ${y} Q ${x + width} ${y} ${x + width} ${y + 18} L ${x + width} ${y + headerH} Z" fill="${C.goldSoft}"/>
  <text x="${x + 20}" y="${y + 28}" fill="${accent}" font-size="14" font-weight="800" font-family="${FONT}" letter-spacing="1.4">${escapeXml(label)}</text>
  <text x="${x + width - 200}" y="${y + 28}" fill="${C.muted}" font-size="10" font-weight="700" font-family="${FONT}">% FINAL</text>
  <text x="${x + width - 74}" y="${y + 28}" text-anchor="middle" fill="${C.gold}" font-size="10" font-weight="700" font-family="${FONT}">% CAMPEÓN</text>
  ${rows}`;
}

export async function renderCuadrangularesSemisPng(input: {
  groupA: CuadrangularSemisTeamProbs[];
  groupB: CuadrangularSemisTeamProbs[];
  simulations: number;
  phaseLabel?: string;
}): Promise<Buffer> {
  const phaseLabel = input.phaseLabel ?? "Clausura 2026";
  const all = [...input.groupA, ...input.groupB];
  const logos = new Map<number, string | null>();
  await Promise.all(
    all.map(async (t) => {
      logos.set(t.teamId, await logoDataUri(t.teamLogo));
    })
  );

  const gap = 24;
  const side = 36;
  const colW = (W - side * 2 - gap) / 2;
  const leftX = side;
  const rightX = side + colW + gap;
  const panelsY = 118;

  const panelA = groupPanel(
    "CUADRANGULAR A",
    C.groupA,
    input.groupA,
    logos,
    leftX,
    panelsY,
    colW
  );
  const panelB = groupPanel(
    "CUADRANGULAR B",
    C.groupB,
    input.groupB,
    logos,
    rightX,
    panelsY,
    colW
  );

  const favA = input.groupA[0];
  const favB = input.groupB[0];
  const titleFav = [...all].sort((a, b) => b.probChampion - a.probChampion)[0];
  const panelH = 44 + 28 + Math.max(input.groupA.length, input.groupB.length) * 92;
  const footerY = panelsY + panelH + 24;
  const logoA = favA ? logos.get(favA.teamId) : null;
  const logoB = favB ? logos.get(favB.teamId) : null;
  const logoT = titleFav ? logos.get(titleFav.teamId) : null;

  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#101828"/>
      <stop offset="100%" stop-color="${C.bg}"/>
    </linearGradient>
    <clipPath id="card"><rect width="${W}" height="${H}" rx="24"/></clipPath>
  </defs>
  <g clip-path="url(#card)">
  <rect width="${W}" height="${H}" fill="url(#bg)"/>
  <rect x="0" y="0" width="${W}" height="6" fill="${C.gold}"/>

  <text x="${side}" y="42" fill="${C.gold}" font-size="22" font-weight="800" font-family="${FONT}">@MundialAnalisis</text>
  <text x="${side}" y="66" fill="${C.muted}" font-size="13" font-family="${FONT}">Fútbol Américas · Monte Carlo</text>
  <text x="${W - side}" y="40" text-anchor="end" fill="${C.text}" font-size="18" font-weight="800" font-family="${FONT}">CUADRANGULARES SEMIFINALES</text>
  <text x="${W - side}" y="66" text-anchor="end" fill="${C.muted}" font-size="13" font-family="${FONT}">Liga BetPlay ${escapeXml(phaseLabel)} · ${input.simulations.toLocaleString("es-CO")} simulaciones</text>
  <line x1="${side}" y1="86" x2="${W - side}" y2="86" stroke="${C.stroke}"/>

  ${panelA}
  ${panelB}

  <rect x="${side}" y="${footerY}" width="${W - side * 2}" height="148" rx="16" fill="${C.panel}" stroke="${C.stroke}"/>
  <text x="${side + 24}" y="${footerY + 34}" fill="${C.gold}" font-size="12" font-weight="800" font-family="${FONT}" letter-spacing="1.4">GRAN FINAL MÁS PROBABLE</text>
  ${
    favA && favB
      ? `
  ${logoA ? `<image href="${logoA}" x="${side + 24}" y="${footerY + 52}" width="44" height="44"/>` : ""}
  <text x="${side + 80}" y="${footerY + 72}" fill="${C.text}" font-size="18" font-weight="800" font-family="${FONT}">${escapeXml(shortName(favA.teamName))}</text>
  <text x="${side + 80}" y="${footerY + 94}" fill="${C.groupA}" font-size="13" font-family="${FONT}">${formatPct1(favA.probFinal)} a la final</text>
  <text x="560" y="${footerY + 80}" text-anchor="middle" fill="${C.muted}" font-size="16" font-weight="800" font-family="${FONT}">VS</text>
  ${logoB ? `<image href="${logoB}" x="620" y="${footerY + 52}" width="44" height="44"/>` : ""}
  <text x="676" y="${footerY + 72}" fill="${C.text}" font-size="18" font-weight="800" font-family="${FONT}">${escapeXml(shortName(favB.teamName))}</text>
  <text x="676" y="${footerY + 94}" fill="${C.groupB}" font-size="13" font-family="${FONT}">${formatPct1(favB.probFinal)} a la final</text>`
      : ""
  }
  ${
    titleFav
      ? `
  <rect x="900" y="${footerY + 28}" width="240" height="92" rx="14" fill="${C.champFill}" stroke="${C.gold}" stroke-width="1.5"/>
  <text x="1020" y="${footerY + 52}" text-anchor="middle" fill="${C.gold}" font-size="11" font-weight="800" font-family="${FONT}" letter-spacing="1">FAVORITO AL TÍTULO</text>
  ${logoT ? `<image href="${logoT}" x="920" y="${footerY + 64}" width="32" height="32"/>` : ""}
  <text x="960" y="${footerY + 86}" fill="${C.text}" font-size="15" font-weight="800" font-family="${FONT}">${escapeXml(shortName(titleFav.teamName))}</text>
  <text x="1115" y="${footerY + 86}" text-anchor="end" fill="${C.gold}" font-size="16" font-weight="800" font-family="${FONT}">${formatPct1(titleFav.probChampion)}</text>`
      : ""
  }

  <text x="${side}" y="${H - 18}" fill="${C.muted}" font-size="11" font-family="${FONT}">Poisson + Monte Carlo · punto invisible en cabezas de serie · @MundialAnalisis</text>
  </g>
</svg>`;

  return sharp(Buffer.from(svg)).png().toBuffer();
}
