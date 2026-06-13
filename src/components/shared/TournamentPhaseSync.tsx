"use client";

import { useEffect } from "react";
import { useFixtures, useStandings } from "@/hooks/usePartidos";
import { setClientTournamentPhase } from "@/services/clientTournamentPhase";
import { getTournamentPhase, isWorldCupLive } from "@/services/tournamentPhase";
import { hasAnyStartedFixture, shouldPollFixtures } from "@/lib/liveRefresh";
import { loadSnapshot } from "@/services/snapshotStore";

/** Sincroniza fase pre/live según standings, fixtures en vivo y precarga snapshot en pre-Mundial. */
export function TournamentPhaseSync() {
  const { data: standings = [] } = useStandings();
  const { data: fixtures = [] } = useFixtures();

  useEffect(() => {
    const fromStandings = getTournamentPhase(standings);
    const fromFixtures = hasAnyStartedFixture(fixtures) ? "live" : "pre";
    const fromKickoff = shouldPollFixtures(fixtures) ? "live" : "pre";
    const phase =
      fromStandings === "live" || fromFixtures === "live" || fromKickoff === "live"
        ? "live"
        : "pre";
    setClientTournamentPhase(phase);
    if (phase === "pre") {
      loadSnapshot();
    }
  }, [standings, fixtures]);

  return null;
}
