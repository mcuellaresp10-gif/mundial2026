import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import { getRatingColor } from "./colors";

export function formatShortKnockoutDate(dateStr: string): string {
  try {
    return format(parseISO(dateStr), "d MMM", { locale: es });
  } catch {
    return dateStr;
  }
}

export function formatKnockoutMatchHeader(dateStr: string, city: string): string {
  const datePart = formatShortKnockoutDate(dateStr);
  if (!city) return datePart;
  return `${datePart} · ${city}`;
}

export function formatFixtureDate(dateStr: string): string {
  try {
    return format(parseISO(dateStr), "EEE d MMM | HH:mm", { locale: es }).toUpperCase();
  } catch {
    return dateStr;
  }
}

export function formatShortDate(dateStr: string): string {
  try {
    return format(parseISO(dateStr), "d MMM yyyy", { locale: es });
  } catch {
    return dateStr;
  }
}

export function formatDayHeading(dateStr: string): string {
  try {
    return format(parseISO(dateStr), "EEEE d 'de' MMMM", { locale: es });
  } catch {
    return dateStr;
  }
}

export function formatRating(rating: number | string | null | undefined): string {
  if (rating == null || rating === "") return "N/D";
  const num = typeof rating === "string" ? parseFloat(rating) : rating;
  if (isNaN(num)) return "N/D";
  return num.toFixed(1);
}

export function parseRating(rating: number | string | null | undefined): number {
  if (rating == null || rating === "") return 0;
  const num = typeof rating === "string" ? parseFloat(rating) : rating;
  return isNaN(num) ? 0 : num;
}

export function ratingClass(rating: number | string | null | undefined): string {
  return getRatingColor(parseRating(rating));
}

export function formatStatus(short: string): string {
  const map: Record<string, string> = {
    NS: "Por jugar",
    FT: "Finalizado",
    LIVE: "En vivo",
    "1H": "1er tiempo",
    "2H": "2do tiempo",
    HT: "Descanso",
    ET: "Tiempo extra",
    BT: "Descanso (ET)",
    P: "Penales",
    INT: "Interrumpido",
    PEN: "Penales",
    PST: "Pospuesto",
    CANC: "Cancelado",
    ABD: "Abandonado",
  };
  return map[short] ?? short;
}

export function getFixtureScore(home: number | null, away: number | null, status: string): string {
  if (status === "NS") return "vs";
  if (home == null || away == null) return "-";
  return `${home} - ${away}`;
}

export function formatPosition(pos: string | null | undefined): string {
  const map: Record<string, string> = {
    G: "Portero",
    D: "Defensa",
    M: "Mediocampista",
    F: "Delantero",
    Goalkeeper: "Portero",
    Defender: "Defensa",
    Midfielder: "Mediocampista",
    Attacker: "Delantero",
  };
  if (!pos) return "N/D";
  return map[pos] ?? pos;
}

export function formatGroupFromRound(round: string): string {
  return formatRoundLabel(round);
}

export function formatRoundLabel(round: string): string {
  const groupStage = round.match(/Group Stage\s*-\s*(\d+)/i);
  if (groupStage) return `Fase de grupos · Jornada ${groupStage[1]}`;

  const groupMatch = round.match(/Group\s+([A-L])/i);
  if (groupMatch) return `Grupo ${groupMatch[1].toUpperCase()}`;

  if (/Round of 32|Round of thirty-two/i.test(round)) return "16avos de final";
  if (/Round of 16|8th Finals|Round of sixteen/i.test(round)) return "Octavos de final";
  if (/Quarter[- ]finals?/i.test(round)) return "Cuartos de final";
  if (/Semi[- ]finals?/i.test(round)) return "Semifinal";
  if (/3rd Place|Third Place/i.test(round)) return "Tercer puesto";
  if (/Final/i.test(round) && !/Semi|Quarter|Round|3rd|Third/i.test(round)) return "Final";

  return round;
}

/** Ranking olímpico: empates comparten posición; la siguiente salta (1,1,1,4…). */
export function olympicRank(
  entries: { goals: number; assists: number }[],
  value: number,
  metric: "goals" | "assists"
): number {
  const greater = entries.filter((e) => (metric === "goals" ? e.goals : e.assists) > value).length;
  return greater + 1;
}

/** Ranking olímpico cuando menos es mejor (goles encajados, GA/90). */
export function olympicRankAscending(
  entries: { goalsConceded: number; concededPer90?: number | null }[],
  value: number,
  metric: "goalsConceded" | "concededPer90"
): number {
  const getValue =
    metric === "goalsConceded"
      ? (e: { goalsConceded: number }) => e.goalsConceded
      : (e: { concededPer90?: number | null }) => e.concededPer90 ?? Infinity;
  const fewer = entries.filter((e) => getValue(e) < value).length;
  return fewer + 1;
}

export function debounce<T extends (...args: unknown[]) => void>(fn: T, ms: number): T {
  let timer: ReturnType<typeof setTimeout>;
  return ((...args: unknown[]) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), ms);
  }) as T;
}
