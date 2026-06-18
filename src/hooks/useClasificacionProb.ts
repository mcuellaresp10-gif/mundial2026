"use client";

import { useMemo } from "react";
import { resolveGroupContext, type ClassificationSimResult } from "@/utils/groupClassification";
import { useFixtures, useStandings } from "./usePartidos";
import { useTournamentClassificationProbs } from "./useTournamentClassificationProbs";

export function useClasificacionProb(teamId?: number) {
  const { data: standings = [], isLoading: loadingStandings } = useStandings();
  const { data: fixtures = [], isLoading: loadingFixtures } = useFixtures();
  const { probMap, isLoading: loadingProbs, groups } = useTournamentClassificationProbs();

  const groupContext = useMemo(() => {
    if (!teamId) return null;
    return resolveGroupContext(standings, fixtures, teamId);
  }, [standings, fixtures, teamId]);

  const outcomes = teamId ? probMap.get(teamId) : undefined;

  const result: ClassificationSimResult | null = useMemo(() => {
    if (!teamId || !groupContext || !outcomes) return null;
    return {
      probability: outcomes.probClassify,
      probFirst: outcomes.probFirst,
      probSecond: outcomes.probSecond,
      probBestThird: outcomes.probBestThird,
      probClassify: outcomes.probClassify,
      simulations: groups.length > 0 ? 1000 : 0,
      qualifiedCount: 0,
      pendingMatchesPerTeam: groupContext.pendingMatchesPerTeam,
      method: "monte_carlo",
    };
  }, [teamId, groupContext, outcomes, groups.length]);

  const isLoading = loadingStandings || loadingFixtures || loadingProbs;

  return {
    probability: result?.probability ?? null,
    result,
    outcomes: outcomes ?? null,
    isLoading,
    groupLabel: groupContext?.groupLabel ?? null,
    pendingMatchesPerTeam: groupContext?.pendingMatchesPerTeam ?? 0,
    isPreTournament: groupContext?.isPreTournament ?? false,
    hasCalendar: (groupContext?.groupFixturesForSim.length ?? 0) > 0,
  };
}
