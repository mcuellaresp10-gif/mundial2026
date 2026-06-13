/**
 * Resuelve catálogo (snapshot pre-Mundial) vs API en vivo.
 */
import { getClientTournamentPhase } from "./clientTournamentPhase";
import {
  getSnapshotFixtures,
  getSnapshotPlayer,
  getSnapshotPlayers,
  getSnapshotRadarPool,
  getSnapshotStandings,
  getSnapshotTeams,
  loadSnapshot,
} from "./snapshotStore";
import { isLiveSessionActive } from "./liveSession";
import {
  shouldUseLiveApiForScores,
  shouldUseSnapshotForCatalog,
} from "./tournamentPhase";

async function trySnapshotCatalog<T>(
  getter: () => Promise<T | null>
): Promise<T | null> {
  if (!shouldUseSnapshotForCatalog(getClientTournamentPhase())) return null;
  await loadSnapshot();
  return getter();
}

export async function resolveTeamsFromSnapshotOr<T>(
  fallback: () => Promise<T>
): Promise<T> {
  const snap = await trySnapshotCatalog(getSnapshotTeams);
  if (snap?.length) return snap as T;
  return fallback();
}

export async function resolveFixturesFromSnapshotOr<T>(
  fallback: () => Promise<T>
): Promise<T> {
  if (shouldUseLiveApiForScores(getClientTournamentPhase()) || isLiveSessionActive()) {
    return fallback();
  }
  const snap = await trySnapshotCatalog(getSnapshotFixtures);
  if (snap?.length) return snap as T;
  return fallback();
}

export async function resolveStandingsFromSnapshotOr<T>(
  fallback: () => Promise<T>
): Promise<T> {
  if (shouldUseLiveApiForScores(getClientTournamentPhase()) || isLiveSessionActive()) {
    return fallback();
  }
  const snap = await trySnapshotCatalog(getSnapshotStandings);
  if (snap?.length) return snap as T;
  return fallback();
}

export async function resolvePlayersFromSnapshotOr(
  teamIds: number[],
  fallback: () => Promise<import("@/types").Player[]>
): Promise<import("@/types").Player[]> {
  const snap = await trySnapshotCatalog(() => getSnapshotPlayers(teamIds));
  if (snap?.length) return snap;
  return fallback();
}

export async function resolvePlayerFromSnapshotOr(
  playerId: number,
  fallback: () => Promise<import("@/types").Player | null>
): Promise<import("@/types").Player | null> {
  const snap = await trySnapshotCatalog(() => getSnapshotPlayer(playerId));
  if (snap) return snap;
  return fallback();
}

export async function resolveRadarPoolFromSnapshotOr(
  fallback: () => Promise<import("@/types").Player[]>
): Promise<import("@/types").Player[]> {
  const snap = await trySnapshotCatalog(getSnapshotRadarPool);
  if (snap?.length) return snap;
  return fallback();
}
