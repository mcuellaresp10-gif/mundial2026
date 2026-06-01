import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const LEAGUE_ID = 1;
export const DEFAULT_SEASON = 2026;
export const PLAYER_STAT_SEASONS = [2025, 2026] as const;
export const PLAYER_STAT_SEASON_LABEL = "2025/2026";
export const COLOMBIA_TEAM_NAME = "Colombia";
export const CACHE_TTL_MS = 4 * 60 * 60 * 1000;
