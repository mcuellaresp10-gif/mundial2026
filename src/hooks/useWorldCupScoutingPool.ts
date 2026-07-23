"use client";

import { useMemo } from "react";
import { useQueries, useQuery } from "@tanstack/react-query";
import { useFixtures } from "@/hooks/usePartidos";
import { useActiveLeague } from "@/hooks/useActiveLeague";
import {
  getLeagueGoalkeepersForTeams,
  getLeaguePlayerStatsPool,
  getTeams,
} from "@/services/apiFootball";
import {
  buildScoutingProfiles,
  computePoolAverages,
  profilesForPosition,
  SCOUTING_MIN_LEAGUE_MINUTES,
  SCOUTING_MIN_WC_MINUTES,
  type ScoutingProfile,
} from "@/utils/worldCupScoutingMetrics";
import { mergePlayerPoolsAcrossLeagues } from "@/utils/mergePlayerPoolsAcrossLeagues";
import type { ScoutingPosition } from "@/config/positionMetricProfiles";
import type { Player } from "@/types";
import { CACHE_TTL_MS, LEAGUE_ID } from "@/lib/utils";
import { isFixtureStarted, getPlayerStatsRefreshMs } from "@/lib/liveRefresh";

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
  const { league, leagues, leagueIds, season, isMulti } = useActiveLeague();
  const { data: fixtures = [] } = useFixtures();

  const hasStartedFixtures = fixtures.some((f) =>
    isFixtureStarted(f.fixture.status.short)
  );

  const liveRefreshMs = getPlayerStatsRefreshMs(fixtures) || undefined;
  const staleTime = liveRefreshMs ?? CACHE_TTL_MS;
  const minMinutes =
    leagueIds.length === 1 && leagueIds[0] === LEAGUE_ID
      ? SCOUTING_MIN_WC_MINUTES
      : SCOUTING_MIN_LEAGUE_MINUTES;

  const poolKey = leagueIds.join(",");
  const seasonKey = leagues.map((l) => l.defaultSeason).join(",");

  const poolQueries = useQueries({
    queries: leagues.map((l) => ({
      queryKey: [
        "leaguePlayerStatsPool",
        "scouting",
        l.id,
        l.defaultSeason,
        hasStartedFixtures ? "live" : "pre",
      ],
      queryFn: () => getLeaguePlayerStatsPool(l.id, l.defaultSeason),
      enabled,
      staleTime,
      refetchInterval: liveRefreshMs ?? false,
    })),
  });

  const poolsReady = poolQueries.every((q) => !q.isLoading || (q.data?.length ?? 0) > 0);
  const poolLoading = poolQueries.some((q) => q.isLoading) && !poolsReady;
  const poolDataKey = poolQueries.map((q) => q.dataUpdatedAt).join("|");

  const leaguePools = useMemo(
    () =>
      leagues.map((l, i) => ({
        league: l,
        players: poolQueries[i]?.data ?? [],
      })),
    // poolQueries data identity changes per fetch; poolDataKey is a stable string.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [poolKey, seasonKey, poolDataKey]
  );

  const { data: gkPools = [], isFetching: gkFetching } = useQuery({
    queryKey: [
      "leagueGoalkeeperPool",
      "scouting-multi",
      poolKey,
      seasonKey,
    ],
    queryFn: async () => {
      const results = await Promise.all(
        leagues.map(async (l) => {
          const leagueTeams = await getTeams(l.defaultSeason, l.id);
          const ids = leagueTeams.map((t) => t.id);
          const players = await getLeagueGoalkeepersForTeams(
            ids,
            l.id,
            l.defaultSeason
          );
          return { league: l, players };
        })
      );
      return results;
    },
    enabled: enabled && loadGoalkeepers && leagues.length > 0,
    staleTime,
    refetchInterval: liveRefreshMs ?? false,
  });

  const fieldMerged = useMemo(
    () => mergePlayerPoolsAcrossLeagues(leaguePools),
    [leaguePools]
  );

  const gkMerged = useMemo(
    () => mergePlayerPoolsAcrossLeagues(gkPools),
    [gkPools]
  );

  const mergedPlayers: Player[] = useMemo(
    () => mergePlayerRows(fieldMerged, gkMerged),
    [fieldMerged, gkMerged]
  );

  const profiles: ScoutingProfile[] = useMemo(
    () => buildScoutingProfiles(mergedPlayers, league.id, league.defaultSeason),
    [mergedPlayers, league.id, league.defaultSeason]
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

  const selectionLabel = useMemo(
    () =>
      isMulti
        ? leagues.map((l) => l.shortName).join(" + ")
        : league.shortName,
    [isMulti, leagues, league.shortName]
  );

  return {
    league,
    leagues,
    leagueIds,
    season,
    isMulti,
    selectionLabel,
    minMinutes,
    players: mergedPlayers,
    profiles,
    profilesById,
    averagesByPosition,
    isLoading: poolLoading && profiles.length === 0,
    isEnriching: gkFetching && fieldMerged.length > 0,
    isReady: profiles.length > 0,
  };
}

export function useScoutingProfile(playerId: number, enabled = true) {
  const { profilesById, profiles, isLoading, isReady } = useWorldCupScoutingPool(enabled);
  const profile = profilesById.get(playerId) ?? null;
  return { profile, profiles, isLoading, isReady };
}
