"use client";

import { useMemo } from "react";
import { useQueries } from "@tanstack/react-query";
import { useFixtures, useStandings } from "./usePartidos";
import { getH2H } from "@/services/apiFootball";
import {
  getUniqueGroupPairs,
  pairKey,
  resolveGroupContext,
  simulateClassificationProbability,
  type ClassificationSimResult,
  type H2HMap,
} from "@/utils/groupClassification";

export function useClasificacionProb(teamId?: number) {
  const { data: standings = [], isLoading: loadingStandings } = useStandings();
  const { data: fixtures = [], isLoading: loadingFixtures } = useFixtures();

  const groupContext = useMemo(() => {
    if (!teamId) return null;
    return resolveGroupContext(standings, fixtures, teamId);
  }, [standings, fixtures, teamId]);

  const teamName = useMemo(() => {
    if (!groupContext || !teamId) return "";
    return (
      groupContext.groupStandings.find((s) => s.team.id === teamId)?.team.name ??
      ""
    );
  }, [groupContext, teamId]);

  const pairs = useMemo(() => {
    if (!groupContext) return [];
    return getUniqueGroupPairs(groupContext.groupStandings.map((s) => s.team.id));
  }, [groupContext]);

  const h2hQueries = useQueries({
    queries: pairs.map(([a, b]) => ({
      queryKey: ["h2h", a, b],
      queryFn: () => getH2H(a, b),
      enabled: !!teamId && pairs.length > 0,
      staleTime: 4 * 60 * 60 * 1000,
    })),
  });

  const h2hMap: H2HMap = useMemo(() => {
    const map: H2HMap = new Map();
    pairs.forEach(([a, b], i) => {
      map.set(pairKey(a, b), h2hQueries[i]?.data ?? []);
    });
    return map;
  }, [pairs, h2hQueries]);

  const isLoadingH2H = h2hQueries.some((q) => q.isLoading);
  const isLoading = loadingStandings || loadingFixtures || isLoadingH2H;

  const result: ClassificationSimResult | null = useMemo(() => {
    if (!teamId || !groupContext || isLoadingH2H) return null;
    return simulateClassificationProbability(
      teamId,
      groupContext.groupStandings,
      groupContext.groupFixturesForSim,
      h2hMap,
      {
        isPreTournament: groupContext.isPreTournament,
        pendingMatchesPerTeam: groupContext.pendingMatchesPerTeam,
        teamName,
      }
    );
  }, [teamId, groupContext, h2hMap, isLoadingH2H, teamName]);

  return {
    probability: result?.probability ?? null,
    result,
    isLoading,
    groupLabel: groupContext?.groupLabel ?? null,
    pendingMatchesPerTeam: groupContext?.pendingMatchesPerTeam ?? 0,
    isPreTournament: groupContext?.isPreTournament ?? false,
    hasCalendar: (groupContext?.groupFixturesForSim.length ?? 0) > 0,
  };
}
