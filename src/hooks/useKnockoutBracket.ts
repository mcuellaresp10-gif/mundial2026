"use client";

import { useMemo } from "react";
import { useGroupStandings } from "@/hooks/useGroupStandings";
import { useFixtures } from "@/hooks/usePartidos";
import { resolveKnockoutBracket } from "@/utils/knockoutBracket";

export function useKnockoutBracket() {
  const { standings, fairPlayByTeam, isLoading } = useGroupStandings();
  const { data: fixtures = [] } = useFixtures();

  const bracket = useMemo(
    () =>
      standings.length > 0
        ? resolveKnockoutBracket(standings, { fixtures, fairPlay: fairPlayByTeam })
        : null,
    [standings, fixtures, fairPlayByTeam]
  );

  return {
    bracket,
    isLoading,
    hasData: standings.length > 0,
  };
}
