"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getFixtures,
  getNextFixture,
  getStandings,
  getTeams,
  getFixtureEvents,
  getFixtureStatistics,
  getFixtureLineups,
  getH2H,
} from "@/services/apiFootball";
import { DEFAULT_SEASON } from "@/lib/utils";
import type { PhaseFilter } from "@/types";
import { formatGroupFromRound } from "@/utils/formatters";

export function useTeams(season = DEFAULT_SEASON) {
  return useQuery({ queryKey: ["teams", season], queryFn: () => getTeams(season), staleTime: 4 * 60 * 60 * 1000 });
}

export function useFixtures(params?: { status?: string; team?: number; season?: number }) {
  return useQuery({
    queryKey: ["fixtures", params],
    queryFn: () => getFixtures(params),
    staleTime: 4 * 60 * 60 * 1000,
  });
}

export function useNextFixture() {
  return useQuery({
    queryKey: ["nextFixture"],
    queryFn: getNextFixture,
    staleTime: 30 * 60 * 1000,
  });
}

export function useStandings(season = DEFAULT_SEASON) {
  return useQuery({
    queryKey: ["standings", season],
    queryFn: () => getStandings(season),
    staleTime: 4 * 60 * 60 * 1000,
  });
}

export function useFixtureDetail(fixtureId: number) {
  const events = useQuery({
    queryKey: ["fixtureEvents", fixtureId],
    queryFn: () => getFixtureEvents(fixtureId),
    enabled: fixtureId > 0,
  });
  const stats = useQuery({
    queryKey: ["fixtureStats", fixtureId],
    queryFn: () => getFixtureStatistics(fixtureId),
    enabled: fixtureId > 0,
  });
  const lineups = useQuery({
    queryKey: ["fixtureLineups", fixtureId],
    queryFn: () => getFixtureLineups(fixtureId),
    enabled: fixtureId > 0,
  });
  return { events, stats, lineups };
}

export function useH2H(teamA?: number, teamB?: number) {
  return useQuery({
    queryKey: ["h2h", teamA, teamB],
    queryFn: () => getH2H(teamA!, teamB!),
    enabled: !!teamA && !!teamB,
    staleTime: 4 * 60 * 60 * 1000,
  });
}

export function filterFixturesByPhase(
  fixtures: import("@/types").Fixture[],
  phase: PhaseFilter
) {
  if (phase === "Todos") return fixtures;
  return fixtures.filter((f) => {
    const group = formatGroupFromRound(f.league.round);
    return group === phase || f.league.round.includes(phase.replace("Grupo ", "Group "));
  });
}

export function useRefreshAll() {
  const qc = useQueryClient();
  return () => {
    qc.invalidateQueries();
  };
}

export function useAutoRefresh(enabled: boolean) {
  const refresh = useRefreshAll();
  if (typeof window !== "undefined" && enabled) {
    const interval = setInterval(refresh, 30 * 60 * 1000);
    return () => clearInterval(interval);
  }
  return undefined;
}
