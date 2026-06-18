import type { Fixture, Player, StandingsGroup, Team } from "@/types";
import type { WorldCupSnapshot } from "@/types/snapshot";
import { radarPoolEntriesToPlayers } from "./radarBenchmarkCache";

const SNAPSHOT_URL =
  process.env.NEXT_PUBLIC_SNAPSHOT_URL ?? "/data/snapshot/worldcup-snapshot.json";

let memoryCache: WorldCupSnapshot | null = null;
let loadPromise: Promise<WorldCupSnapshot | null> | null = null;
let loadAttempted = false;

export function isSnapshotLoaded(): boolean {
  return memoryCache != null && memoryCache.players.length > 0;
}

export async function loadSnapshot(force = false): Promise<WorldCupSnapshot | null> {
  if (typeof window === "undefined") return null;
  if (memoryCache && !force) return memoryCache;
  if (loadPromise && !force) return loadPromise;

  loadPromise = (async () => {
    try {
      const res = await fetch(SNAPSHOT_URL, { cache: force ? "no-cache" : "default" });
      if (!res.ok) return null;
      const data = (await res.json()) as WorldCupSnapshot;
      if (!data?.players?.length) return null;
      memoryCache = data;
      return data;
    } catch {
      return null;
    } finally {
      loadAttempted = true;
    }
  })();

  return loadPromise;
}

export function hasAttemptedSnapshotLoad(): boolean {
  return loadAttempted;
}

export function clearSnapshotMemoryCache(): void {
  memoryCache = null;
  loadPromise = null;
  loadAttempted = false;
}

export async function getSnapshotTeams(): Promise<Team[] | null> {
  const snap = await loadSnapshot();
  return snap?.teams ?? null;
}

export async function getSnapshotFixtures(): Promise<Fixture[] | null> {
  const snap = await loadSnapshot();
  return snap?.fixtures ?? null;
}

/** Catálogo completo de partidos (sin gate de fase) — base estructural en sesión live. */
export async function getSnapshotCatalogFixtures(): Promise<Fixture[]> {
  return (await getSnapshotFixtures()) ?? [];
}

export async function getSnapshotStandings(): Promise<StandingsGroup[] | null> {
  const snap = await loadSnapshot();
  return snap?.standings ?? null;
}

export async function getSnapshotPlayers(teamIds?: number[]): Promise<Player[] | null> {
  const snap = await loadSnapshot();
  if (!snap?.players.length) return null;
  if (!teamIds?.length) return snap.players;
  const ids = new Set(teamIds);
  return snap.players.filter((p) => p.nationalTeam && ids.has(p.nationalTeam.id));
}

export async function getSnapshotPlayer(playerId: number): Promise<Player | null> {
  const snap = await loadSnapshot();
  return snap?.players.find((p) => p.player.id === playerId) ?? null;
}

export async function getSnapshotRadarPool(): Promise<Player[] | null> {
  const snap = await loadSnapshot();
  if (!snap?.radarPool?.length) return null;
  return radarPoolEntriesToPlayers(snap.radarPool);
}

export async function getSnapshotMeta(): Promise<WorldCupSnapshot["meta"] | null> {
  const snap = await loadSnapshot();
  return snap?.meta ?? null;
}
