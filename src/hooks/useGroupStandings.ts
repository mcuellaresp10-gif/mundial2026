"use client";

import { useMemo } from "react";
import { useFixtures, useStandings } from "@/hooks/usePartidos";
import { useGroupStageFairPlay } from "@/hooks/useGroupStageFairPlay";
import { projectLiveGroupStandings } from "@/utils/liveStandings";

/** Standings oficiales + proyección en vivo con desempate FIFA (H2H, fair play). */
export function useGroupStandings() {
  const { data: official = [], isLoading, isFetching } = useStandings();
  const { data: fixtures = [] } = useFixtures();
  const { fairPlayByTeam, isLoading: loadingFairPlay } = useGroupStageFairPlay(
    fixtures,
    official
  );

  const projection = useMemo(
    () =>
      projectLiveGroupStandings(official, fixtures, { fairPlay: fairPlayByTeam }),
    [official, fixtures, fairPlayByTeam]
  );

  return {
    standings: projection.standings,
    liveGroupLetters: projection.liveGroupLetters,
    isProjected: projection.isProjected,
    fairPlayByTeam,
    isLoading: isLoading || loadingFairPlay,
    isFetching,
  };
}
