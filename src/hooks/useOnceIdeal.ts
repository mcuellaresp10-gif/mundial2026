"use client";

import { useMemo } from "react";
import { buildOnceIdeal } from "@/utils/calculations";
import type { FormationType, OnceIdealPlayer } from "@/types";
import { useTeams, useFixtures } from "./usePartidos";
import { useAllPlayers } from "./useJugadores";
import { isFixtureStarted, LIVE_REFRESH_MS } from "@/lib/liveRefresh";
import { getClientTournamentPhase } from "@/services/clientTournamentPhase";

export function useOnceIdeal(formation: FormationType = "4-3-3") {
  const { data: teams } = useTeams();
  const { data: fixtures = [] } = useFixtures();

  const teamIds = useMemo(() => teams?.map((t) => t.id) ?? [], [teams]);

  const tournamentStarted =
    getClientTournamentPhase() === "live" ||
    fixtures.some((f) => isFixtureStarted(f.fixture.status.short));

  const liveRefreshMs = tournamentStarted ? LIVE_REFRESH_MS.topScorers : undefined;

  const { data: players, isLoading } = useAllPlayers(
    teamIds,
    false,
    teamIds.length > 0,
    liveRefreshMs
  );

  const onceIdeal: OnceIdealPlayer[] = useMemo(() => {
    if (!players) return [];
    return buildOnceIdeal(players, formation);
  }, [players, formation]);

  const averageRating = useMemo(() => {
    if (onceIdeal.length === 0) return 0;
    return Math.round((onceIdeal.reduce((s, p) => s + p.rating, 0) / onceIdeal.length) * 10) / 10;
  }, [onceIdeal]);

  return { onceIdeal, averageRating, isLoading };
}
