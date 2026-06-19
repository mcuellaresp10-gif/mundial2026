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
import {
  hasAnyLiveFixture,
  isFixtureFinished,
  isFixtureLive,
  isWithinKickoffWindow,
  LIVE_REFRESH_MS,
  NORMAL_STALE_MS,
  shouldPollFixtures,
  getLiveRefreshInterval,
} from "@/lib/liveRefresh";
import type { PhaseFilter } from "@/types";
import { formatGroupFromRound } from "@/utils/formatters";
import { getClientTournamentPhase } from "@/services/clientTournamentPhase";
import { isLiveSessionActive } from "@/services/liveSession";
import { isWorldCupLive } from "@/services/tournamentPhase";
import { mergeFixtureLists } from "@/utils/fixtureMerge";
import type { Fixture } from "@/types";

const LIVE_FULL_LIST_REFRESH_MS = 60 * 1000;

function fixturesPollInterval(): number | false {
  if (isLiveSessionActive()) return getLiveRefreshInterval();
  return LIVE_REFRESH_MS.fixtures;
}

function shouldFastRefreshFixtures(
  fixtures: import("@/types").Fixture[] | undefined
): boolean {
  return (
    isLiveSessionActive() ||
    shouldPollFixtures(fixtures) ||
    getClientTournamentPhase() === "live"
  );
}

export function useTeams(season = DEFAULT_SEASON) {
  return useQuery({
    queryKey: ["teams", season],
    queryFn: () => getTeams(season),
    staleTime: NORMAL_STALE_MS,
  });
}

export function useFixtures(params?: {
  status?: string;
  team?: number;
  season?: number;
  id?: number;
}) {
  const qc = useQueryClient();
  const isSingle = params?.id != null;

  return useQuery({
    queryKey: ["fixtures", params],
    queryFn: async () => {
      const fresh = await getFixtures(params);
      if (isSingle) return fresh;
      const existing = qc.getQueryData<Fixture[]>(["fixtures", params]);
      return existing?.length ? mergeFixtureLists(existing, fresh) : fresh;
    },
    refetchOnMount:
      !isSingle &&
      (isLiveSessionActive() || getClientTournamentPhase() === "live")
        ? "always"
        : undefined,
    staleTime: (query) => {
      const fixtures = query.state.data;
      if (isSingle || shouldFastRefreshFixtures(fixtures)) {
        return isLiveSessionActive() ? getLiveRefreshInterval() : LIVE_REFRESH_MS.fixtures;
      }
      return NORMAL_STALE_MS;
    },
    refetchInterval: (query) => {
      const fixtures = query.state.data;
      if (isSingle) {
        if (shouldFastRefreshFixtures(fixtures)) {
          return fixturesPollInterval();
        }
        return false;
      }
      const isBaseList = !params?.team && !params?.status && params?.id == null;
      if (isLiveSessionActive() && isBaseList) {
        return LIVE_FULL_LIST_REFRESH_MS;
      }
      // useLiveScoreSync fusiona live=all en la lista; evita polling duplicado.
      if (isLiveSessionActive()) return false;
      if (shouldFastRefreshFixtures(fixtures)) {
        return fixturesPollInterval();
      }
      return false;
    },
    refetchOnWindowFocus: (query) => shouldFastRefreshFixtures(query.state.data),
  });
}

export function useFixture(fixtureId: number) {
  return useQuery({
    queryKey: ["fixtures", { id: fixtureId }],
    queryFn: () => getFixtures({ id: fixtureId }),
    enabled: fixtureId > 0,
    staleTime: isLiveSessionActive() ? getLiveRefreshInterval() : LIVE_REFRESH_MS.fixtures,
    refetchInterval: (query) => {
      const fixture = query.state.data?.[0];
      if (!fixture) return fixturesPollInterval() || LIVE_REFRESH_MS.fixtures;
      if (
        isFixtureLive(fixture.fixture.status.short) ||
        isWithinKickoffWindow(fixture.fixture.date, fixture.fixture.status.short) ||
        isLiveSessionActive() ||
        getClientTournamentPhase() === "live"
      ) {
        return isLiveSessionActive()
          ? LIVE_REFRESH_MS.fixtureDetail
          : LIVE_REFRESH_MS.fixtures;
      }
      return false;
    },
    select: (data) => data[0] ?? null,
  });
}

export function useNextFixture() {
  return useQuery({
    queryKey: ["nextFixture"],
    queryFn: getNextFixture,
    staleTime: LIVE_REFRESH_MS.nextFixture,
    refetchInterval: (query) => {
      const fixture = query.state.data;
      if (fixture && isFixtureLive(fixture.fixture.status.short)) {
        return LIVE_REFRESH_MS.nextFixture;
      }
      if (
        fixture &&
        (isWithinKickoffWindow(fixture.fixture.date, fixture.fixture.status.short) ||
          isFixtureFinished(fixture.fixture.status.short))
      ) {
        return LIVE_REFRESH_MS.nextFixture;
      }
      if (getClientTournamentPhase() === "live") {
        return LIVE_REFRESH_MS.nextFixture;
      }
      return false;
    },
  });
}

export function useStandings(season = DEFAULT_SEASON) {
  return useQuery({
    queryKey: ["standings", season],
    queryFn: () => getStandings(season),
    staleTime: LIVE_REFRESH_MS.standingsLive,
    refetchOnWindowFocus: () =>
      isLiveSessionActive() || getClientTournamentPhase() === "live",
    refetchInterval: (query) => {
      const standings = query.state.data ?? [];
      if (isLiveSessionActive()) return LIVE_REFRESH_MS.standingsLive;
      if (isWorldCupLive(standings)) return LIVE_REFRESH_MS.standings;
      if (getClientTournamentPhase() === "live") return LIVE_REFRESH_MS.standingsLive;
      return false;
    },
  });
}

export function useFixtureDetail(fixtureId: number, isLive = false) {
  const live = isLive || isLiveSessionActive();
  const detailInterval = live ? LIVE_REFRESH_MS.fixtureDetail : false;
  const detailStale = live ? LIVE_REFRESH_MS.fixtureDetail : NORMAL_STALE_MS;

  const events = useQuery({
    queryKey: ["fixtureEvents", fixtureId],
    queryFn: () => getFixtureEvents(fixtureId),
    enabled: fixtureId > 0,
    staleTime: detailStale,
    refetchInterval: detailInterval,
  });
  const stats = useQuery({
    queryKey: ["fixtureStats", fixtureId],
    queryFn: () => getFixtureStatistics(fixtureId),
    enabled: fixtureId > 0,
    staleTime: detailStale,
    refetchInterval: detailInterval,
  });
  const lineups = useQuery({
    queryKey: ["fixtureLineups", fixtureId],
    queryFn: () => getFixtureLineups(fixtureId),
    enabled: fixtureId > 0,
    staleTime: live ? LIVE_REFRESH_MS.standings : NORMAL_STALE_MS,
    refetchInterval: live ? LIVE_REFRESH_MS.standings : false,
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

/** Refresco ligero durante partidos — solo tabla y próximo partido. */
export function useRefreshStandingsAndNext() {
  const qc = useQueryClient();
  return () => {
    qc.invalidateQueries({ queryKey: ["standings"] });
    qc.invalidateQueries({ queryKey: ["nextFixture"] });
  };
}

export function useAutoRefresh(enabled: boolean, intervalMs = LIVE_REFRESH_MS.fixtures) {
  const refresh = useRefreshAll();
  if (typeof window !== "undefined" && enabled) {
    const interval = setInterval(refresh, intervalMs);
    return () => clearInterval(interval);
  }
  return undefined;
}

export { hasAnyLiveFixture, isFixtureLive, LIVE_REFRESH_MS } from "@/lib/liveRefresh";
