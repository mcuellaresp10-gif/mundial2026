"use client";

import { useEffect, useMemo, useState } from "react";
import { useQueries } from "@tanstack/react-query";
import { getFixturePlayers } from "@/services/apiFootball";
import { useFixtures } from "./usePartidos";
import { buildOnceIdealFromCandidates } from "@/utils/calculations";
import { flattenFixturePlayersTeams, listJornadasFromFixtures, pickLatestPlayedJornada } from "@/utils/onceIdealMatchday";
import { filterCandidatesByConfederation, type ConfederationFilter } from "@/utils/onceIdealConfederation";
import type { FormationType, OnceIdealPlayer } from "@/types";
import { CACHE_TTL_MS } from "@/lib/utils";
import { isFixtureStarted, LIVE_REFRESH_MS } from "@/lib/liveRefresh";
import { getClientTournamentPhase } from "@/services/clientTournamentPhase";

export function useOnceIdealJornada(
  formation: FormationType = "4-3-3",
  confederation: ConfederationFilter = "all"
) {
  const { data: fixtures = [], isLoading: fixturesLoading } = useFixtures();
  const [selectedRound, setSelectedRound] = useState<string | null>(null);

  const jornadas = useMemo(() => listJornadasFromFixtures(fixtures), [fixtures]);

  useEffect(() => {
    if (selectedRound && jornadas.some((j) => j.round === selectedRound)) return;
    const latest = pickLatestPlayedJornada(jornadas);
    setSelectedRound(latest?.round ?? jornadas[0]?.round ?? null);
  }, [jornadas, selectedRound]);

  const activeJornada = useMemo(
    () => jornadas.find((j) => j.round === selectedRound) ?? null,
    [jornadas, selectedRound]
  );

  const tournamentStarted =
    getClientTournamentPhase() === "live" ||
    fixtures.some((f) => isFixtureStarted(f.fixture.status.short));

  const hasLiveInJornada = useMemo(() => {
    if (!activeJornada) return false;
    return activeJornada.fixtures.some((f) => isFixtureStarted(f.fixture.status.short));
  }, [activeJornada]);

  const staleTime =
    tournamentStarted && hasLiveInJornada ? LIVE_REFRESH_MS.fixtureDetail : CACHE_TTL_MS;

  const fixtureIds = activeJornada?.playedFixtureIds ?? [];

  const playerQueries = useQueries({
    queries: fixtureIds.map((fixtureId) => ({
      queryKey: ["fixturePlayers", fixtureId],
      queryFn: () => getFixturePlayers(fixtureId),
      enabled: fixtureIds.length > 0,
      staleTime,
      refetchInterval: tournamentStarted && hasLiveInJornada ? staleTime : false,
    })),
  });

  const onceIdeal: OnceIdealPlayer[] = useMemo(() => {
    const groups = playerQueries
      .map((q) => q.data ?? [])
      .filter((group) => group.length > 0);
    if (groups.length === 0) return [];
    const candidates = filterCandidatesByConfederation(
      flattenFixturePlayersTeams(groups),
      confederation
    );
    return buildOnceIdealFromCandidates(candidates, formation);
  }, [playerQueries, formation, confederation]);

  const averageRating = useMemo(() => {
    if (onceIdeal.length === 0) return 0;
    return Math.round((onceIdeal.reduce((s, p) => s + p.rating, 0) / onceIdeal.length) * 10) / 10;
  }, [onceIdeal]);

  const isLoadingPlayers =
    fixtureIds.length > 0 && playerQueries.some((q) => q.isLoading && !q.data);

  return {
    jornadas,
    selectedRound,
    setSelectedRound,
    activeJornada,
    onceIdeal,
    averageRating,
    isLoading: fixturesLoading || isLoadingPlayers,
  };
}
