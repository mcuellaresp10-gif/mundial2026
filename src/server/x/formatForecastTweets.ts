import { translateTeamName } from "@/utils/teamNames";

export interface ForecastMatchTweetInput {
  homeName: string;
  awayName: string;
  winHome: number;
  draw: number;
  winAway: number;
  /** Etiqueta corta p. ej. "Libertadores" / "Sudamericana". */
  competition?: string;
}

export function formatPct(value: number): string {
  return `${(Math.max(0, Math.min(1, value)) * 100).toFixed(1)}%`;
}

export function formatForecastHeader(
  title = "Partidos de hoy de Liga BetPlay",
  dayLabel?: string
): string {
  if (dayLabel) return `${title}\n${dayLabel}`;
  return title;
}

/** Un tuit por partido (≤280). */
export function formatForecastMatchTweet(input: ForecastMatchTweetInput): string {
  const home = translateTeamName(input.homeName);
  const away = translateTeamName(input.awayName);
  const lines: string[] = [];
  if (input.competition) lines.push(input.competition);
  lines.push(
    `${home}🆚 ${away}`,
    `▪️Victoria ${home}: ${formatPct(input.winHome)}`,
    `▪️Empate: ${formatPct(input.draw)}`,
    `▪️Victoria ${away}: ${formatPct(input.winAway)}`
  );
  const text = lines.join("\n");

  if (text.length > 280) {
    return text.slice(0, 277) + "…";
  }
  return text;
}

export function buildForecastThread(
  matches: ForecastMatchTweetInput[],
  options?: { title?: string; dayLabel?: string }
): string[] {
  if (matches.length === 0) return [];
  const title = options?.title ?? "Partidos de hoy de Liga BetPlay";
  const header = formatForecastHeader(title, options?.dayLabel);
  const first = `${header}\n\n${formatForecastMatchTweet(matches[0])}`;
  const root = first.length > 280 ? first.slice(0, 277) + "…" : first;
  if (matches.length === 1) return [root];
  return [root, ...matches.slice(1).map(formatForecastMatchTweet)];
}

/** Preview multiparte para Telegram (sin límite 280 por bloque). */
export function formatTelegramForecastPreview(
  matches: ForecastMatchTweetInput[],
  dayKey: string,
  title = "Partidos de hoy de Liga BetPlay"
): string {
  const lines = [`📋 *Borrador X — ${title}*`, `_${dayKey}_`, ""];
  matches.forEach((m, i) => {
    const home = translateTeamName(m.homeName);
    const away = translateTeamName(m.awayName);
    const comp = m.competition ? ` (${m.competition})` : "";
    lines.push(`*${i + 1})* ${home}🆚 ${away}${comp}`);
    lines.push(`▪️Victoria ${home}: ${formatPct(m.winHome)}`);
    lines.push(`▪️Empate: ${formatPct(m.draw)}`);
    lines.push(`▪️Victoria ${away}: ${formatPct(m.winAway)}`);
    lines.push("");
  });
  lines.push("_Nada se publica en X hasta que apruebes._");
  return lines.join("\n").trim();
}
