"use client";

import { useMemo } from "react";
import { useQueries, useQuery } from "@tanstack/react-query";
import { buildOnceIdealFromCandidates } from "@/utils/calculations";
import type { FormationType, OnceIdealPlayer } from "@/types";
import { useTeams, useFixtures } from "./usePartidos";
import { useAllPlayers } from "./useJugadores";
import { useActiveLeague } from "./useActiveLeague";
import { isFixtureStarted, getPlayerStatsRefreshMs } from "@/lib/liveRefresh";
import { getClientTournamentPhase } from "@/services/clientTournamentPhase";
import {
  getLeaguePlayerStatsPool,
  getWorldCupPlayerStatsPool,
} from "@/services/apiFootball";
import { CACHE_TTL_MS, WORLD_CUP_LEAGUE_ID } from "@/lib/utils";
import {
  buildCandidatesFromPlayers,
  dedupeCandidatesByBestRating,
  mergeWorldCupPoolIntoSquads,
  ONCE_IDEAL_MIN_MINUTES_TOURNAMENT,
} from "@/utils/onceIdealRatings";
import {
  filterCandidatesByLeague,
  type LeagueFilter,
} from "@/utils/onceIdealLeague";
import {
  filterCandidatesByConfederation,
  type ConfederationFilter,
} from "@/utils/onceIdealConfederation";

export function useOnceIdeal(
  formation: FormationType = "4-3-3",
  leagueFilter: LeagueFilter = "all",
  /** Solo archivo Mundial: filtro por confederación. */
  confederation: ConfederationFilter = "all"
) {
  const { league, leagues, leagueId, season, isScoped } = useActiveLeague();
  const { data: teams } = useTeams();
  const { data: fixtures = [] } = useFixtures();
  const isWorldCup = isScoped || leagueId === WORLD_CUP_LEAGUE_ID;

  const teamIds = useMemo(() => teams?.map((t) => t.id) ?? [], [teams]);

  const tournamentStarted =
    getClientTournamentPhase() === "live" ||
    fixtures.some((f) => isFixtureStarted(f.fixture.status.short));

  const liveRefreshMs = getPlayerStatsRefreshMs(fixtures) || undefined;
  const staleTime = liveRefreshMs ?? CACHE_TTL_MS;

  const { data: players, isLoading: squadsLoading } = useAllPlayers(
    teamIds,
    false,
    isWorldCup && teamIds.length > 0,
    liveRefreshMs
  );

  const { data: wcPool = [], isLoading: poolLoading } = useQuery({
    queryKey: ["worldCupPlayerStatsPool", "once-ideal", tournamentStarted ? "live" : "pre"],
    queryFn: () => getWorldCupPlayerStatsPool(),
    enabled: isWorldCup && teamIds.length > 0,
    staleTime,
    refetchInterval: liveRefreshMs ?? false,
  });

  const poolKey = leagues.map((l) => l.id).join(",");
  const seasonKey = leagues.map((l) => l.defaultSeason).join(",");

  const leaguePoolQueries = useQueries({
    queries: leagues.map((l) => ({
      queryKey: [
        "leaguePlayerStatsPool",
        "once-ideal",
        l.id,
        l.defaultSeason,
        tournamentStarted ? "live" : "pre",
      ],
      queryFn: () => getLeaguePlayerStatsPool(l.id, l.defaultSeason),
      enabled: !isWorldCup && leagues.length > 0,
      staleTime,
      refetchInterval: liveRefreshMs ?? false,
    })),
  });

  const leaguePoolDataKey = leaguePoolQueries.map((q) => q.dataUpdatedAt).join("|");
  const leaguePoolsLoading =
    !isWorldCup &&
    leaguePoolQueries.some((q) => q.isLoading) &&
    leaguePoolQueries.every((q) => (q.data?.length ?? 0) === 0);

  const onceIdeal: OnceIdealPlayer[] = useMemo(() => {
    if (isWorldCup) {
      if (!players?.length) return [];
      const merged = mergeWorldCupPoolIntoSquads(players, wcPool);
      const candidates = filterCandidatesByConfederation(
        buildCandidatesFromPlayers(merged),
        confederation
      );
      return buildOnceIdealFromCandidates(candidates, formation);
    }

    const allCandidates = leagues.flatMap((l, i) =>
      buildCandidatesFromPlayers(
        leaguePoolQueries[i]?.data ?? [],
        ONCE_IDEAL_MIN_MINUTES_TOURNAMENT,
        l.id,
        l.defaultSeason
      )
    );
    const filtered = filterCandidatesByLeague(allCandidates, leagueFilter);
    return buildOnceIdealFromCandidates(
      dedupeCandidatesByBestRating(filtered),
      formation
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    isWorldCup,
    players,
    wcPool,
    formation,
    confederation,
    leagueFilter,
    poolKey,
    seasonKey,
    leaguePoolDataKey,
  ]);

  const averageRating = useMemo(() => {
    if (onceIdeal.length === 0) return 0;
    return Math.round((onceIdeal.reduce((s, p) => s + p.rating, 0) / onceIdeal.length) * 10) / 10;
  }, [onceIdeal]);

  return {
    onceIdeal,
    averageRating,
    isLoading: isWorldCup
      ? squadsLoading || poolLoading
      : leaguePoolsLoading,
    league,
    leagues,
    leagueId,
    season,
    isWorldCup,
  };
}
