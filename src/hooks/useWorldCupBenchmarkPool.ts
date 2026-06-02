"use client";

import { useEffect, useMemo, useState } from "react";
import { useQuery, useQueryClient, type QueryClient } from "@tanstack/react-query";
import { useTeams } from "@/hooks/usePartidos";
import { getRadarBenchmarkPool } from "@/services/apiFootball";
import {
  getCachedRadarPool,
  getStaleCachedRadarPool,
  setCachedRadarPool,
} from "@/services/radarBenchmarkCache";
import type { Player } from "@/types";

export const RADAR_BENCHMARK_STALE_MS = 4 * 60 * 60 * 1000;

function teamKey(teamIds: number[]): string {
  return [...teamIds].sort((a, b) => a - b).join(",");
}

export function radarBenchmarkQueryKey(teamIds: number[]) {
  return ["radarBenchmarkPool", teamKey(teamIds)] as const;
}

export async function fetchRadarBenchmarkPool(teamIds: number[]): Promise<Player[]> {
  const { loadSnapshot, getSnapshotRadarPool } = await import("@/services/snapshotStore");
  await loadSnapshot();
  const fromSnap = await getSnapshotRadarPool();
  if (fromSnap?.length) return fromSnap;

  const cached = await getCachedRadarPool();
  if (cached?.length) return cached;

  try {
    const fresh = await getRadarBenchmarkPool(teamIds);
    if (fresh.length > 0) await setCachedRadarPool(fresh);
    return fresh;
  } catch (error) {
    const stale = await getStaleCachedRadarPool();
    if (stale?.length) return stale;
    throw error;
  }
}

export function prefetchRadarBenchmarkPool(
  queryClient: QueryClient,
  teamIds: number[]
) {
  if (teamIds.length === 0) return Promise.resolve();
  return queryClient.prefetchQuery({
    queryKey: radarBenchmarkQueryKey(teamIds),
    queryFn: () => fetchRadarBenchmarkPool(teamIds),
    staleTime: RADAR_BENCHMARK_STALE_MS,
  });
}

/**
 * Pool de jugadores convocados al Mundial para benchmark del radar.
 * Usa IndexedDB (7 días) + React Query; fetch paralelo en la primera carga.
 */
export function useWorldCupBenchmarkPool(enabled = true) {
  const { data: teams = [], isLoading: loadingTeams } = useTeams();
  const teamIds = useMemo(() => teams.map((t) => t.id), [teams]);
  const key = teamKey(teamIds);

  const [idbPool, setIdbPool] = useState<Player[] | null>(null);

  useEffect(() => {
    if (!enabled) return;
    let cancelled = false;
    (async () => {
      const { loadSnapshot, getSnapshotRadarPool } = await import(
        "@/services/snapshotStore"
      );
      await loadSnapshot();
      const snap = await getSnapshotRadarPool();
      if (!cancelled && snap?.length) setIdbPool(snap);
      const idb = await getCachedRadarPool();
      if (!cancelled && idb?.length && !snap?.length) setIdbPool(idb);
    })();
    return () => {
      cancelled = true;
    };
  }, [enabled, key]);

  const {
    data: players = idbPool ?? [],
    isLoading: loadingPlayers,
    isFetching,
    isPlaceholderData,
  } = useQuery({
    queryKey: radarBenchmarkQueryKey(teamIds),
    queryFn: () => fetchRadarBenchmarkPool(teamIds),
    enabled: enabled && teamIds.length > 0,
    staleTime: RADAR_BENCHMARK_STALE_MS,
    gcTime: 24 * 60 * 60 * 1000,
    placeholderData: idbPool ?? undefined,
  });

  const hasAnyPool = players.length > 0;
  const isLoading =
    loadingTeams || (loadingPlayers && !hasAnyPool && !idbPool);

  return {
    players,
    isLoading,
    isFetching,
    isReady: hasAnyPool,
    isRevalidating: isFetching && hasAnyPool,
    isPlaceholderData: isPlaceholderData ?? false,
    teamCount: teams.length,
  };
}

/** Prefetch en background (p. ej. al abrir perfil de jugador). */
export function usePrefetchRadarBenchmark() {
  const queryClient = useQueryClient();
  const { data: teams = [] } = useTeams();

  useEffect(() => {
    const ids = teams.map((t) => t.id);
    if (ids.length === 0) return;
    prefetchRadarBenchmarkPool(queryClient, ids);
  }, [teams, queryClient]);
}
