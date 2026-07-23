"use client";

import { useEffect, useMemo, useState } from "react";
import { useQueries } from "@tanstack/react-query";
import { getFixturePlayers } from "@/services/apiFootball";
import { useFixtures } from "./usePartidos";
import { buildOnceIdealFromCandidates } from "@/utils/calculations";
import {
  flattenFixturePlayersTeams,
  listJornadasFromFixtures,
  pickLatestPlayedJornada,
} from "@/utils/onceIdealMatchday";
import {
  filterCandidatesByLeague,
  type LeagueFilter,
} from "@/utils/onceIdealLeague";
import {
  filterCandidatesByConfederation,
  type ConfederationFilter,
} from "@/utils/onceIdealConfederation";
import { useActiveLeague } from "./useActiveLeague";
import { WORLD_CUP_LEAGUE_ID } from "@/lib/utils";
import type { FormationType, OnceIdealPlayer } from "@/types";
import { CACHE_TTL_MS } from "@/lib/utils";
import { isFixtureStarted, LIVE_REFRESH_MS } from "@/lib/liveRefresh";
import { getClientTournamentPhase } from "@/services/clientTournamentPhase";

export function useOnceIdealJornada(
  formation: FormationType = "4-3-3",
  leagueFilter: LeagueFilter = "all",
  confederation: ConfederationFilter = "all"
) {
  const { leagueId, isScoped } = useActiveLeague();
  const isWorldCup = isScoped || leagueId === WORLD_CUP_LEAGUE_ID;
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
    return activeJornada.fixtures.some((f) =>
      isFixtureStarted(f.fixture.status.short)
    );
  }, [activeJornada]);

  const staleTime =
    tournamentStarted && hasLiveInJornada ? LIVE_REFRESH_MS.fixtureDetail : CACHE_TTL_MS;

  const scopedFixtures = useMemo(() => {
    if (!activeJornada) return [];
    if (isWorldCup || leagueFilter === "all") return activeJornada.fixtures;
    return activeJornada.fixtures.filter((f) => f.league.id === leagueFilter);
  }, [activeJornada, isWorldCup, leagueFilter]);

  const fixtureIds = useMemo(
    () =>
      scopedFixtures
        .filter((f) => isFixtureStarted(f.fixture.status.short))
        .map((f) => f.fixture.id),
    [scopedFixtures]
  );

  const fixtureLeagueById = useMemo(() => {
    const map = new Map<number, number>();
    for (const f of scopedFixtures) map.set(f.fixture.id, f.league.id);
    return map;
  }, [scopedFixtures]);

  const playerQueries = useQueries({
    queries: fixtureIds.map((fixtureId) => ({
      queryKey: ["fixturePlayers", fixtureId],
      queryFn: () => getFixturePlayers(fixtureId),
      enabled: fixtureIds.length > 0,
      staleTime,
      refetchInterval: tournamentStarted && hasLiveInJornada ? staleTime : false,
    })),
  });

  const playersDataKey = playerQueries.map((q) => q.dataUpdatedAt).join("|");

  const onceIdeal: OnceIdealPlayer[] = useMemo(() => {
    const groups = playerQueries
      .map((q, i) => ({
        data: q.data ?? [],
        leagueId: fixtureLeagueById.get(fixtureIds[i]),
      }))
      .filter((g) => g.data.length > 0);

    if (groups.length === 0) return [];

    // Agrupar por liga para etiquetar candidatos
    const byLeague = new Map<number | "unknown", (typeof groups)[0]["data"][]>();
    for (const g of groups) {
      const key = g.leagueId ?? "unknown";
      const list = byLeague.get(key) ?? [];
      list.push(g.data);
      byLeague.set(key, list);
    }

    let candidates = [...byLeague.entries()].flatMap(([key, teamsGroups]) =>
      flattenFixturePlayersTeams(
        teamsGroups,
        key === "unknown" ? undefined : key
      )
    );

    if (isWorldCup) {
      candidates = filterCandidatesByConfederation(candidates, confederation);
    } else {
      candidates = filterCandidatesByLeague(candidates, leagueFilter);
    }

    return buildOnceIdealFromCandidates(candidates, formation);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    playersDataKey,
    formation,
    confederation,
    leagueFilter,
    isWorldCup,
    fixtureIds.join(","),
  ]);

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
    playedCount: fixtureIds.length,
    totalCount: scopedFixtures.length,
    isWorldCup,
  };
}
