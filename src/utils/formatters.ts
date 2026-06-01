import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import { getRatingColor } from "./colors";

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
  const match = round.match(/Group\s+([A-H])/i);
  if (match) return `Grupo ${match[1]}`;
  if (/Round of 16|8th Finals/i.test(round)) return "Octavos";
  if (/Quarter/i.test(round)) return "Cuartos";
  if (/Semi/i.test(round)) return "Semis";
  if (/Final/i.test(round) && !/Semi/i.test(round)) return "Final";
  return round;
}

export function debounce<T extends (...args: unknown[]) => void>(fn: T, ms: number): T {
  let timer: ReturnType<typeof setTimeout>;
  return ((...args: unknown[]) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), ms);
  }) as T;
}
