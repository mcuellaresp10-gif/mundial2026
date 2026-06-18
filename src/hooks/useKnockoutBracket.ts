"use client";

import { useMemo } from "react";
import { useStandings } from "@/hooks/usePartidos";
import { resolveKnockoutBracket } from "@/utils/knockoutBracket";

export function useKnockoutBracket() {
  const { data: standings = [], isLoading } = useStandings();

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
