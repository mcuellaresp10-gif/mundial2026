"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { buildOnceIdealFromCandidates } from "@/utils/calculations";
import type { FormationType, OnceIdealPlayer } from "@/types";
import { useTeams, useFixtures } from "./usePartidos";
import { useAllPlayers } from "./useJugadores";
import { isFixtureStarted, getPlayerStatsRefreshMs } from "@/lib/liveRefresh";
import { getClientTournamentPhase } from "@/services/clientTournamentPhase";
import { getWorldCupPlayerStatsPool } from "@/services/apiFootball";
import { CACHE_TTL_MS } from "@/lib/utils";
import {
  buildCandidatesFromPlayers,
  mergeWorldCupPoolIntoSquads,
} from "@/utils/onceIdealRatings";
import {
  filterCandidatesByConfederation,
  type ConfederationFilter,
} from "@/utils/onceIdealConfederation";

export function useOnceIdeal(
  formation: FormationType = "4-3-3",
  confederation: ConfederationFilter = "all"
) {
  const { data: teams } = useTeams();
  const { data: fixtures = [] } = useFixtures();

  const teamIds = useMemo(() => teams?.map((t) => t.id) ?? [], [teams]);

  const tournamentStarted =
    getClientTournamentPhase() === "live" ||
    fixtures.some((f) => isFixtureStarted(f.fixture.status.short));

  const liveRefreshMs = getPlayerStatsRefreshMs(fixtures) || undefined;
  const staleTime = liveRefreshMs ?? CACHE_TTL_MS;

  const { data: players, isLoading: squadsLoading } = useAllPlayers(
    teamIds,
    false,
    teamIds.length > 0,
    liveRefreshMs
  );

  const { data: wcPool = [], isLoading: poolLoading } = useQuery({
    queryKey: ["worldCupPlayerStatsPool", tournamentStarted ? "live" : "pre"],
    queryFn: () => getWorldCupPlayerStatsPool(),
    enabled: teamIds.length > 0,
    staleTime,
    refetchInterval: liveRefreshMs ?? false,
  });

  const onceIdeal: OnceIdealPlayer[] = useMemo(() => {
    if (!players?.length) return [];
    const merged = mergeWorldCupPoolIntoSquads(players, wcPool);
    const candidates = filterCandidatesByConfederation(
      buildCandidatesFromPlayers(merged),
      confederation
    );
    return buildOnceIdealFromCandidates(candidates, formation);
  }, [players, wcPool, formation, confederation]);

  const averageRating = useMemo(() => {
    if (onceIdeal.length === 0) return 0;
    return Math.round((onceIdeal.reduce((s, p) => s + p.rating, 0) / onceIdeal.length) * 10) / 10;
  }, [onceIdeal]);

  return { onceIdeal, averageRating, isLoading: squadsLoading || poolLoading };
}
