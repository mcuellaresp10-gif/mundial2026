"use client";

import { useMemo } from "react";
import { useQuery, useQueries } from "@tanstack/react-query";
import { useFixtures } from "./usePartidos";
import { useGroupStandings } from "./useGroupStandings";
import { getH2H } from "@/services/apiFootball";
import { CACHE_TTL_MS } from "@/lib/utils";
import {
  getAllTournamentGroupPairs,
  pairKey,
  resolveAllGroupContexts,
  simulateTournamentOutcomeProbabilities,
  type H2HMap,
  type TeamOutcomeProbs,
} from "@/utils/groupClassification";
import { groupStageScoresSignature } from "@/utils/liveStandings";

export function useTournamentClassificationProbs() {
  const {
    standings,
    fairPlayByTeam,
    isLoading: loadingStandings,
  } = useGroupStandings();
  const { data: fixtures = [], isLoading: loadingFixtures } = useFixtures();

  const groups = useMemo(
    () => resolveAllGroupContexts(standings, fixtures),
    [standings, fixtures]
  );

  const pairs = useMemo(() => getAllTournamentGroupPairs(groups), [groups]);

  const h2hQueries = useQueries({
    queries: pairs.map(([a, b]) => ({
      queryKey: ["h2h", a, b],
      queryFn: () => getH2H(a, b),
      enabled: pairs.length > 0,
      staleTime: CACHE_TTL_MS,
    })),
  });

  const h2hMap: H2HMap = useMemo(() => {
    const map: H2HMap = new Map();
    pairs.forEach(([a, b], i) => {
      map.set(pairKey(a, b), h2hQueries[i]?.data ?? []);
    });
    return map;
  }, [pairs, h2hQueries]);

  const fairPlaySignature = useMemo(() => {
    let yellow = 0;
    let red = 0;
    for (const record of fairPlayByTeam.values()) {
      yellow += record.yellow;
      red += record.red;
    }
    return `${yellow}-${red}`;
  }, [fairPlayByTeam]);

  const isLoadingH2H = h2hQueries.some((q) => q.isLoading);
  const isLoading = loadingStandings || loadingFixtures || isLoadingH2H;

  const { data: probMap = new Map<number, TeamOutcomeProbs>() } = useQuery({
    queryKey: [
      "tournamentClassificationProbs",
      groups.map((g) => g.groupLabel).join(","),
      groups.map((g) =>
        g.groupStandings.map((s) => `${s.team.id}:${s.points}:${s.all.played}:${s.rank}`).join("|")
      ),
      groupStageScoresSignature(fixtures),
      fairPlaySignature,
    ],
    queryFn: () =>
      simulateTournamentOutcomeProbabilities(groups, h2hMap, fairPlayByTeam),
    enabled: groups.length > 0 && !isLoadingH2H && !loadingStandings,
    staleTime: CACHE_TTL_MS,
  });

  return {
    probMap,
    isLoading,
    groups,
  };
}
