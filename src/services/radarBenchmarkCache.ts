import type { Player, PlayerStatistics } from "@/types";
import { getIndexedCache, setIndexedCache, getStaleIndexedCache } from "./cache";

const RADAR_POOL_CACHE_KEY = "radar_benchmark_pool_v1";
const RADAR_POOL_TTL_MS = 7 * 24 * 60 * 60 * 1000;

export interface RadarPoolEntry {
  id: number;
  position: string;
  club: PlayerStatistics | null;
}

export function buildRadarPoolEntries(players: Player[]): RadarPoolEntry[] {
  return toCacheEntries(players);
}

function toCacheEntries(players: Player[]): RadarPoolEntry[] {
  const entries: RadarPoolEntry[] = [];
  for (const p of players) {
    const club = p.statBundle?.club ?? p.statistics[0] ?? null;
    if (!club || (club.games.minutes ?? 0) < 1) continue;
    entries.push({
      id: p.player.id,
      position: club.games.position ?? "M",
      club,
    });
  }
  return entries;
}

export function radarPoolEntriesToPlayers(entries: RadarPoolEntry[]): Player[] {
  return entries.map((e) => ({
    player: {
      id: e.id,
      name: "",
      firstname: "",
      lastname: "",
      age: null,
      birth: { date: null, place: null, country: null },
      nationality: null,
      height: null,
      weight: null,
      injured: false,
      photo: "",
    },
    statistics: e.club ? [e.club] : [],
    statBundle: { club: e.club, national: null, worldCup: null },
  }));
}

export async function getCachedRadarPool(): Promise<Player[] | null> {
  const entries = await getIndexedCache<RadarPoolEntry[]>(RADAR_POOL_CACHE_KEY);
  if (!entries?.length) return null;
  return radarPoolEntriesToPlayers(entries);
}

export async function getStaleCachedRadarPool(): Promise<Player[] | null> {
  const entries = await getStaleIndexedCache<RadarPoolEntry[]>(RADAR_POOL_CACHE_KEY);
  if (!entries?.length) return null;
  return radarPoolEntriesToPlayers(entries);
}

export async function setCachedRadarPool(players: Player[]): Promise<void> {
  const entries = toCacheEntries(players);
  if (entries.length === 0) return;
  await setIndexedCache(RADAR_POOL_CACHE_KEY, entries, RADAR_POOL_TTL_MS);
}
