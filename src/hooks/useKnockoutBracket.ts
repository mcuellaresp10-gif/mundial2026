"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useGroupStandings } from "@/hooks/useGroupStandings";
import { useFixtures } from "@/hooks/usePartidos";
import { useTournamentClassificationProbs } from "@/hooks/useTournamentClassificationProbs";
import { resolveKnockoutBracket } from "@/utils/knockoutBracket";
import { simulateKnockoutSlotProbabilities } from "@/utils/knockoutSlotProbabilities";
import { groupStageScoresSignature } from "@/utils/liveStandings";
import { CACHE_TTL_MS } from "@/lib/utils";

export function useKnockoutBracket() {
  const { standings, fairPlayByTeam, isLoading } = useGroupStandings();
  const { data: fixtures = [] } = useFixtures();
  const { probMap, groups, h2hMap, isLoading: loadingProbs } = useTournamentClassificationProbs();

  const bracket = useMemo(
    () =>
      standings.length > 0
        ? resolveKnockoutBracket(standings, { fixtures, fairPlay: fairPlayByTeam })
        : null,
    [standings, fixtures, fairPlayByTeam]
  );

  const fairPlaySignature = useMemo(() => {
    let yellow = 0;
    let red = 0;
    for (const record of fairPlayByTeam.values()) {
      yellow += record.yellow;
      red += record.red;
    }
    return `${yellow}-${red}`;
  }, [fairPlayByTeam]);

  const { data: slotProbabilities = new Map() } = useQuery({
    queryKey: [
      "knockoutSlotProbabilities",
      groups.map((g) => g.groupLabel).join(","),
      groupStageScoresSignature(fixtures),
      fairPlaySignature,
      bracket?.annexKey,
    ],
    queryFn: () =>
      simulateKnockoutSlotProbabilities(
        standings,
        groups,
        h2hMap,
        fairPlayByTeam,
        probMap,
        bracket
      ),
    enabled: standings.length > 0 && groups.length > 0 && !loadingProbs,
    staleTime: CACHE_TTL_MS,
  });

  return {
    bracket,
    slotProbabilities,
    isLoading: isLoading || loadingProbs,
    hasData: standings.length > 0,
  };
}
