"use client";

import { useMemo } from "react";
import { useGroupStandings } from "@/hooks/useGroupStandings";
import { resolveKnockoutBracket } from "@/utils/knockoutBracket";

export function useKnockoutBracket() {
  const { standings, isLoading } = useGroupStandings();

  const bracket = useMemo(
    () => (standings.length > 0 ? resolveKnockoutBracket(standings) : null),
    [standings]
  );

  return {
    bracket,
    isLoading,
    hasData: standings.length > 0,
  };
}
