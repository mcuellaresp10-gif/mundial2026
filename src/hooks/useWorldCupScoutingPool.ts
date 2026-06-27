"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTeams, useFixtures } from "@/hooks/usePartidos";
import {
  getWorldCupGoalkeepersForTeams,
  getWorldCupPlayerStatsPool,
} from "@/services/apiFootball";
import {
  buildScoutingProfiles,
  computePoolAverages,
  profilesForPosition,
  type ScoutingProfile,
} from "@/utils/worldCupScoutingMetrics";
import type { ScoutingPosition } from "@/config/positionMetricProfiles";
import type { Player } from "@/types";
import { CACHE_TTL_MS, DEFAULT_SEASON } from "@/lib/utils";
import { isFixtureStarted, getPlayerStatsRefreshMs } from "@/lib/liveRefresh";
import { getClientTournamentPhase } from "@/services/clientTournamentPhase";

function mergePlayerRows(primary: Player[], extra: Player[]): Player[] {
  if (!extra.length) return primary;
  const byId = new Map(primary.map((p) => [p.player.id, p]));
  for (const p of extra) {
    const existing = byId.get(p.player.id);
    if (!existing) {
      byId.set(p.player.id, p);
      continue;
    }
    if ((p.statistics?.length ?? 0) >= (existing.statistics?.length ?? 0)) {
      byId.set(p.player.id, p);
    }
  }
  return [...byId.values()];
}

export interface WorldCupScoutingPoolOptions {
  /** Porteros no salen bien en topscorers; cargar solo si hace falta (p. ej. pestaña G). */
  loadGoalkeepers?: boolean;
}

export function useWorldCupScoutingPool(
  enabled = true,
  options: WorldCupScoutingPoolOptions = {}
) {
  const loadGoalkeepers = options.loadGoalkeepers ?? false;
  const { data: teams } = useTeams();
  const { data: fixtures = [] } = useFixtures();
  const teamIds = useMemo(() => teams?.map((t) => t.id) ?? [], [teams]);

  const tournamentStarted =
    getClientTournamentPhase() === "live" ||
    fixtures.some((f) => isFixtureStarted(f.fixture.status.short));

  const liveRefreshMs = getPlayerStatsRefreshMs(fixtures) || undefined;
  const staleTime = liveRefreshMs ?? CACHE_TTL_MS;

  const { data: wcPool = [], isLoading: poolLoading } = useQuery({
    queryKey: ["worldCupPlayerStatsPool", "scouting", DEFAULT_SEASON, tournamentStarted ? "live" : "pre"],
    queryFn: () => getWorldCupPlayerStatsPool(),
    enabled,
    staleTime,
    refetchInterval: liveRefreshMs ?? false,
  });

  const { data: gkPool = [], isFetching: gkFetching } = useQuery({
    queryKey: ["worldCupGoalkeeperPool", "scouting", DEFAULT_SEASON, teamIds.join(",")],
    queryFn: () => getWorldCupGoalkeepersForTeams(teamIds),
    enabled: enabled && loadGoalkeepers && teamIds.length > 0,
    staleTime,
    refetchInterval: liveRefreshMs ?? false,
  });

  const mergedPlayers: Player[] = useMemo(
    () => mergePlayerRows(wcPool, gkPool),
    [wcPool, gkPool]
  );

  const profiles: ScoutingProfile[] = useMemo(
    () => buildScoutingProfiles(mergedPlayers),
    [mergedPlayers]
  );

  const profilesById = useMemo(() => {
    const map = new Map<number, ScoutingProfile>();
    for (const p of profiles) map.set(p.playerId, p);
    return map;
  }, [profiles]);

  const averagesByPosition = useMemo(() => {
    const out: Partial<Record<ScoutingPosition, ReturnType<typeof computePoolAverages>>> = {};
    for (const pos of ["G", "D", "M", "F"] as ScoutingPosition[]) {
      out[pos] = computePoolAverages(profilesForPosition(profiles, pos));
    }
    return out as Record<ScoutingPosition, ReturnType<typeof computePoolAverages>>;
  }, [profiles]);

  return {
    players: mergedPlayers,
    profiles,
    profilesById,
    averagesByPosition,
    isLoading: poolLoading && profiles.length === 0,
    isEnriching: gkFetching && wcPool.length > 0,
    isReady: profiles.length > 0,
  };
}

export function useScoutingProfile(playerId: number, enabled = true) {
  const { profilesById, profiles, isLoading, isReady } = useWorldCupScoutingPool(enabled);
  const profile = profilesById.get(playerId) ?? null;
  return { profile, profiles, isLoading, isReady };
}
