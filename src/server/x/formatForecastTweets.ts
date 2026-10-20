import { translateTeamName } from "@/utils/teamNames";
import { formatTeamForTweet, missingXHandleNames } from "@/server/x/xTeamHandles";

export interface ForecastMatchTweetInput {
  homeName: string;
  awayName: string;
  winHome: number;
  draw: number;
  winAway: number;
  /** Etiqueta corta p. ej. "Libertadores" / "Sudamericana". */
  competition?: string;
  homeLogo?: string;
  awayLogo?: string;
  xgHome?: number;
  xgAway?: number;
  topScores?: { home: number; away: number; prob: number }[];
}

export function formatPct(value: number): string {
  return `${(Math.max(0, Math.min(1, value)) * 100).toFixed(1)}%`;
}

export function forecastHashtag(competition?: string): string {
  const c = (competition ?? "").toLowerCase();
  if (c.includes("sudamericana") || c.includes("sudaca")) return "#Sudamericana";
  if (c.includes("libertadores")) return "#Libertadores";
  if (c.includes("brasil") || c.includes("brasileir")) return "#Brasileirao";
  if (
    c.includes("argentina") ||
    c.includes("apertura") ||
    c.includes("clausura") ||
    c.includes("liga profesional")
  ) {
    return "#LigaProfesional";
  }
  return "#LigaBetPlay";
}

export function formatForecastHeader(
  title = "Partidos de hoy de Liga BetPlay",
  dayLabel?: string
): string {
  if (dayLabel) return `${title}\n${dayLabel}`;
  return title;
}

/** Un tuit por partido (copy corto; la imagen lleva el 1X2). */
export function formatForecastMatchTweet(input: ForecastMatchTweetInput): string {
  const hashtag = forecastHashtag(input.competition);
  const home = formatTeamForTweet(input.homeName);
  const away = formatTeamForTweet(input.awayName);
  const text = `${hashtag} 🔥\n\n${home} vs ${away}\n\nLas probs aquí 👇`;
  return text.length > 280 ? text.slice(0, 277) + "…" : text;
}

/** Un post independiente por partido. */
export function buildForecastThread(
  matches: ForecastMatchTweetInput[],
  _options?: { title?: string; dayLabel?: string }
): string[] {
  if (matches.length === 0) return [];
  return matches.map(formatForecastMatchTweet);
}

/** Preview multiparte para Telegram (sin límite 280 por bloque). */
export function formatTelegramForecastPreview(
  matches: ForecastMatchTweetInput[],
  dayKey: string,
  title = "Partidos de hoy de Liga BetPlay"
): string {
  const lines = [
    `📋 *Borrador X — ${title}*`,
    `_${dayKey}_`,
    "",
    "_Un post por partido + imagen al publicar._",
    "",
  ];
  matches.forEach((m, i) => {
    const home = translateTeamName(m.homeName);
    const away = translateTeamName(m.awayName);
    const comp = m.competition ? ` (${m.competition})` : "";
    lines.push(`*${i + 1})* ${formatTeamForTweet(m.homeName)} vs ${formatTeamForTweet(m.awayName)}${comp}`);
    lines.push(`▪️Victoria ${home}: ${formatPct(m.winHome)}`);
    lines.push(`▪️Empate: ${formatPct(m.draw)}`);
    lines.push(`▪️Victoria ${away}: ${formatPct(m.winAway)}`);
    if (m.xgHome != null && m.xgAway != null) {
      lines.push(`▪️xG: ${m.xgHome.toFixed(2)} – ${m.xgAway.toFixed(2)}`);
    }
    if (m.topScores?.length) {
      const scores = m.topScores
        .map((s) => `${s.home}-${s.away} (${formatPct(s.prob)})`)
        .join(" · ");
      lines.push(`▪️Marcadores: ${scores}`);
    }
    lines.push("");
  });
  const missing = missingXHandleNames(
    matches.flatMap((m) => [m.homeName, m.awayName])
  );
  if (missing.length > 0) {
    lines.push(`_Sin @ en X (dime el handle): ${missing.join(", ")}_`);
    lines.push("");
  }
  lines.push("_Nada se publica en X hasta que apruebes._");
  return lines.join("\n").trim();
}
