import { translateTeamName } from "@/utils/teamNames";

export interface ForecastMatchTweetInput {
  homeName: string;
  awayName: string;
  winHome: number;
  draw: number;
  winAway: number;
}

export function formatPct(value: number): string {
  return `${(Math.max(0, Math.min(1, value)) * 100).toFixed(1)}%`;
}

export function formatForecastHeader(dayLabel?: string): string {
  if (dayLabel) return `Partidos de hoy de Liga BetPlay\n${dayLabel}`;
  return "Partidos de hoy de Liga BetPlay";
}

/** Un tuit por partido (≤280). */
export function formatForecastMatchTweet(input: ForecastMatchTweetInput): string {
  const home = translateTeamName(input.homeName);
  const away = translateTeamName(input.awayName);
  const text = [
    `${home}🆚 ${away}`,
    `▪️Victoria ${home}: ${formatPct(input.winHome)}`,
    `▪️Empate: ${formatPct(input.draw)}`,
    `▪️Victoria ${away}: ${formatPct(input.winAway)}`,
  ].join("\n");

  if (text.length > 280) {
    return text.slice(0, 277) + "…";
  }
  return text;
}

export function buildForecastThread(
  matches: ForecastMatchTweetInput[],
  dayLabel?: string
): string[] {
  if (matches.length === 0) return [];
  const header = formatForecastHeader(dayLabel);
  // Un solo partido → un solo tuit (cabecera + probs), sin hilo.
  if (matches.length === 1) {
    const combined = `${header}\n\n${formatForecastMatchTweet(matches[0])}`;
    return [combined.length > 280 ? combined.slice(0, 277) + "…" : combined];
  }
  return [header, ...matches.map(formatForecastMatchTweet)];
}

/** Preview multiparte para Telegram (sin límite 280 por bloque). */
export function formatTelegramForecastPreview(
  matches: ForecastMatchTweetInput[],
  dayKey: string
): string {
  const lines = [
    `📋 *Borrador X — Partidos de hoy de Liga BetPlay*`,
    `_${dayKey}_`,
    "",
  ];
  matches.forEach((m, i) => {
    const home = translateTeamName(m.homeName);
    const away = translateTeamName(m.awayName);
    lines.push(`*${i + 1})* ${home}🆚 ${away}`);
    lines.push(`▪️Victoria ${home}: ${formatPct(m.winHome)}`);
    lines.push(`▪️Empate: ${formatPct(m.draw)}`);
    lines.push(`▪️Victoria ${away}: ${formatPct(m.winAway)}`);
    lines.push("");
  });
  lines.push("_Nada se publica en X hasta que apruebes._");
  return lines.join("\n").trim();
}
