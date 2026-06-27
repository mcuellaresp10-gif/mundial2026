"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTeams, useFixtures } from "@/hooks/usePartidos";
import { useAllPlayers } from "@/hooks/useJugadores";
import { getWorldCupPlayerStatsPool } from "@/services/apiFootball";
import { mergeWorldCupPoolIntoSquads } from "@/utils/onceIdealRatings";
import {
  buildScoutingProfiles,
  computePoolAverages,
  profilesForPosition,
  type ScoutingProfile,
} from "@/utils/worldCupScoutingMetrics";
import type { ScoutingPosition } from "@/config/positionMetricProfiles";
import type { Player } from "@/types";
import { CACHE_TTL_MS } from "@/lib/utils";
import { isFixtureStarted, getPlayerStatsRefreshMs } from "@/lib/liveRefresh";
import { getClientTournamentPhase } from "@/services/clientTournamentPhase";

export function useWorldCupScoutingPool(enabled = true) {
  const { data: teams } = useTeams();
  const { data: fixtures = [] } = useFixtures();
  const teamIds = useMemo(() => teams?.map((t) => t.id) ?? [], [teams]);

  const tournamentStarted =
    getClientTournamentPhase() === "live" ||
    fixtures.some((f) => isFixtureStarted(f.fixture.status.short));

  const liveRefreshMs = getPlayerStatsRefreshMs(fixtures) || undefined;
  const staleTime = liveRefreshMs ?? CACHE_TTL_MS;

  const { data: squads = [], isLoading: squadsLoading } = useAllPlayers(
    teamIds,
    false,
    enabled && teamIds.length > 0,
    liveRefreshMs
  );

  const { data: wcPool = [], isLoading: poolLoading } = useQuery({
    queryKey: ["worldCupPlayerStatsPool", "scouting", tournamentStarted ? "live" : "pre"],
    queryFn: () => getWorldCupPlayerStatsPool(),
    enabled: enabled && teamIds.length > 0,
    staleTime,
    refetchInterval: liveRefreshMs ?? false,
  });

  const mergedPlayers: Player[] = useMemo(() => {
    if (!squads.length) return wcPool;
    return mergeWorldCupPoolIntoSquads(squads, wcPool);
  }, [squads, wcPool]);

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
    isLoading: squadsLoading || poolLoading,
    isReady: profiles.length > 0,
  };
}

export function useScoutingProfile(playerId: number, enabled = true) {
  const { profilesById, profiles, isLoading, isReady } = useWorldCupScoutingPool(enabled);
  const profile = profilesById.get(playerId) ?? null;
  return { profile, profiles, isLoading, isReady };
}
