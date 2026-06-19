"use client";

import { useMemo } from "react";
import { useFixtures, useStandings } from "@/hooks/usePartidos";
import { projectLiveGroupStandings } from "@/utils/liveStandings";

/** Standings oficiales + proyección en vivo desde marcadores de fase de grupos. */
export function useGroupStandings() {
  const { data: official = [], isLoading, isFetching } = useStandings();
  const { data: fixtures = [] } = useFixtures();

  const projection = useMemo(
    () => projectLiveGroupStandings(official, fixtures),
    [official, fixtures]
  );

  return {
    standings: projection.standings,
    liveGroupLetters: projection.liveGroupLetters,
    isProjected: projection.isProjected,
    isLoading,
    isFetching,
  };
}
