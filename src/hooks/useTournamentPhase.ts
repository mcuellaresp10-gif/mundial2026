"use client";

import { useMemo } from "react";
import { useStandings } from "./usePartidos";
import { getTournamentPhase, isWorldCupLive } from "@/services/tournamentPhase";
import type { TournamentPhase } from "@/types/snapshot";

export function useTournamentPhase(): {
  phase: TournamentPhase;
  isLive: boolean;
} {
  const { data: standings = [] } = useStandings();
  return useMemo(
    () => ({
      phase: getTournamentPhase(standings),
      isLive: isWorldCupLive(standings),
    }),
    [standings]
  );
}
