"use client";

import { useEffect } from "react";
import { useStandings } from "@/hooks/usePartidos";
import { setClientTournamentPhase } from "@/services/clientTournamentPhase";
import { getTournamentPhase } from "@/services/tournamentPhase";
import { loadSnapshot } from "@/services/snapshotStore";

/** Sincroniza fase pre/live según standings API y precarga snapshot en pre-Mundial. */
export function TournamentPhaseSync() {
  const { data: standings = [] } = useStandings();

  useEffect(() => {
    const phase = getTournamentPhase(standings);
    setClientTournamentPhase(phase);
    if (phase === "pre") {
      loadSnapshot();
    }
  }, [standings]);

  return null;
}
