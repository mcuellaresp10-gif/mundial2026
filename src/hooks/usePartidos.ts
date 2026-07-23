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
import { DEFAULT_SEASON, WORLD_CUP_LEAGUE_ID } from "@/lib/utils";
import {
  hasAnyLiveFixture,
  isFixtureFinished,
  isFixtureLive,
  isWithinKickoffWindow,
  LIVE_REFRESH_MS,
  NORMAL_STALE_MS,
  shouldPollFixtures,
  getLivePollInterval,
} from "@/lib/liveRefresh";
import type { PhaseFilter } from "@/types";
import { formatRoundLabel } from "@/utils/formatters";
import { getClientTournamentPhase } from "@/services/clientTournamentPhase";
import { isLiveSessionActive } from "@/services/liveSession";
import { isWorldCupLive } from "@/services/tournamentPhase";
import { mergeFixtureLists } from "@/utils/fixtureMerge";
import type { Fixture } from "@/types";
import { useActiveLeague } from "@/hooks/useActiveLeague";
import { matchesLeaguePhase } from "@/data/americasLeagues";

function fixturesPollInterval(fixtures?: Fixture[]): number | false {
  const aggressive = shouldPollFixtures(fixtures);
  if (isLiveSessionActive()) return getLivePollInterval(aggressive);
  if (aggressive) return LIVE_REFRESH_MS.fixtures;
  return false;
}

function shouldFastRefreshFixtures(
  fixtures: import("@/types").Fixture[] | undefined
): boolean {
  return isLiveSessionActive() || shouldPollFixtures(fixtures);
}

export function useTeams(season?: number, leagueId?: number) {
  const active = useActiveLeague();
  const explicit = leagueId != null;
  const resolvedLeague = leagueId ?? active.leagueId;
  const resolvedSeason = season ?? active.season;
  const multiIds = explicit ? [resolvedLeague] : active.leagueIds;
  const multiSeasons = explicit
    ? [resolvedSeason]
    : active.leagues.map((l) => l.defaultSeason);

  return useQuery({
    queryKey: ["teams", multiIds.join(","), multiSeasons.join(",")],
    queryFn: async () => {
      if (multiIds.length <= 1) {
        return getTeams(multiSeasons[0] ?? resolvedSeason, multiIds[0] ?? resolvedLeague);
      }
      const batches = await Promise.all(
        multiIds.map((id, i) => getTeams(multiSeasons[i] ?? resolvedSeason, id))
      );
      const byId = new Map<number, (typeof batches)[0][number]>();
      for (const batch of batches) {
        for (const team of batch) byId.set(team.id, team);
      }
      return [...byId.values()];
    },
    staleTime: NORMAL_STALE_MS,
  });
}

/** Equipos del Mundial (archivo); no depende del selector Américas. */
export function useWorldCupTeams(season = DEFAULT_SEASON) {
  return useQuery({
    queryKey: ["teams", WORLD_CUP_LEAGUE_ID, season],
    queryFn: () => getTeams(season, WORLD_CUP_LEAGUE_ID),
    staleTime: NORMAL_STALE_MS,
  });
}

export function useFixtures(params?: {
  status?: string;
  team?: number;
  season?: number;
  league?: number;
  id?: number;
  /** Si false, no aplica filtro Apertura/Clausura del store. */
  applyPhaseFilter?: boolean;
}) {
  const qc = useQueryClient();
  const active = useActiveLeague();
  const isSingle = params?.id != null;
  const explicitLeague = params?.league != null;
  const leagueId = params?.league ?? (isSingle ? undefined : active.leagueId);
  const season = params?.season ?? active.season;
  const applyPhase = params?.applyPhaseFilter !== false && !isSingle;
  const multiLeagueIds =
    isSingle || explicitLeague ? (leagueId != null ? [leagueId] : []) : active.leagueIds;
  const multiSeasons =
    isSingle || explicitLeague
      ? [season]
      : active.leagues.map((l) => l.defaultSeason);

  const queryKey = [
    "fixtures",
    {
      ...params,
      league: multiLeagueIds.length > 1 ? multiLeagueIds.join(",") : leagueId,
      season: multiSeasons.length > 1 ? multiSeasons.join(",") : season,
      phase: applyPhase ? active.phase : "all",
    },
  ] as const;

  return useQuery({
    queryKey,
    queryFn: async () => {
      let fresh: Fixture[];
      if (multiLeagueIds.length > 1) {
        const batches = await Promise.all(
          multiLeagueIds.map((id, i) =>
            getFixtures({
              ...params,
              league: id,
              season: multiSeasons[i] ?? season,
            })
          )
        );
        fresh = batches.flat();
      } else {
        fresh = await getFixtures({
          ...params,
          league: leagueId,
          season,
        });
      }
      let list = fresh;
      if (applyPhase && !isSingle) {
        const leagueById = new Map(active.leagues.map((l) => [l.id, l]));
        list = fresh.filter((f) => {
          const meta = leagueById.get(f.league.id) ?? active.league;
          return matchesLeaguePhase(f.league.round, meta, active.phase);
        });
      }
      if (isSingle) return list;
      const existing = qc.getQueryData<Fixture[]>(queryKey);
      return existing?.length ? mergeFixtureLists(existing, list) : list;
    },
    refetchOnMount: !isSingle && isLiveSessionActive() ? "always" : undefined,
    staleTime: (query) => {
      const fixtures = query.state.data;
      if (isSingle || shouldFastRefreshFixtures(fixtures)) {
        const aggressive = shouldPollFixtures(fixtures);
        return isLiveSessionActive()
          ? getLivePollInterval(aggressive)
          : LIVE_REFRESH_MS.fixtures;
      }
      return NORMAL_STALE_MS;
    },
    refetchInterval: (query) => {
      const fixtures = query.state.data;
      if (isSingle) {
        if (shouldFastRefreshFixtures(fixtures)) {
          return fixturesPollInterval(fixtures);
        }
        return false;
      }
      const isBaseList = !params?.team && !params?.status && params?.id == null;
      if (isLiveSessionActive() && isBaseList) return false;
      if (isLiveSessionActive()) return false;
      if (shouldFastRefreshFixtures(fixtures)) {
        return fixturesPollInterval(fixtures);
      }
      return false;
    },
    refetchOnWindowFocus: (query) => shouldFastRefreshFixtures(query.state.data),
  });
}

export function useWorldCupFixtures(params?: {
  status?: string;
  team?: number;
  season?: number;
  id?: number;
}) {
  return useFixtures({
    ...params,
    league: WORLD_CUP_LEAGUE_ID,
    season: params?.season ?? DEFAULT_SEASON,
    applyPhaseFilter: false,
  });
}

export function useFixture(fixtureId: number) {
  return useQuery({
    queryKey: ["fixtures", { id: fixtureId }],
    queryFn: () => getFixtures({ id: fixtureId }),
    enabled: fixtureId > 0,
    staleTime: (query) => {
      const fixture = query.state.data?.[0];
      const aggressive =
        !!fixture &&
        (isFixtureLive(fixture.fixture.status.short) ||
          isWithinKickoffWindow(fixture.fixture.date, fixture.fixture.status.short));
      return isLiveSessionActive()
        ? getLivePollInterval(aggressive)
        : LIVE_REFRESH_MS.fixtures;
    },
    refetchInterval: (query) => {
      const fixture = query.state.data?.[0];
      if (!fixture) return fixturesPollInterval() || LIVE_REFRESH_MS.fixtures;
      if (
        isFixtureLive(fixture.fixture.status.short) ||
        isWithinKickoffWindow(fixture.fixture.date, fixture.fixture.status.short) ||
        isLiveSessionActive()
      ) {
        const aggressive =
          isFixtureLive(fixture.fixture.status.short) ||
          isWithinKickoffWindow(fixture.fixture.date, fixture.fixture.status.short);
        return isLiveSessionActive()
          ? getLivePollInterval(aggressive)
          : LIVE_REFRESH_MS.fixtures;
      }
      return false;
    },
    select: (data) => data[0] ?? null,
  });
}

export function useNextFixture() {
  const { leagueId, season } = useActiveLeague();
  return useQuery({
    queryKey: ["nextFixture", leagueId, season],
    queryFn: () => getNextFixture(leagueId, season),
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
      return false;
    },
  });
}

export function useStandings(season?: number, leagueId?: number) {
  const active = useActiveLeague();
  const explicit = leagueId != null;
  const resolvedSeason = season ?? active.season;
  const resolvedLeague = leagueId ?? active.leagueId;
  const multiIds = explicit ? [resolvedLeague] : active.leagueIds;
  const multiSeasons = explicit
    ? [resolvedSeason]
    : active.leagues.map((l) => l.defaultSeason);

  return useQuery({
    queryKey: [
      "standings",
      multiIds.join(","),
      multiSeasons.join(","),
      active.phase,
    ],
    queryFn: async () => {
      if (multiIds.length <= 1) {
        return getStandings(
          multiSeasons[0] ?? resolvedSeason,
          multiIds[0] ?? resolvedLeague
        );
      }
      const batches = await Promise.all(
        multiIds.map((id, i) =>
          getStandings(multiSeasons[i] ?? resolvedSeason, id)
        )
      );
      return batches.flat();
    },
    staleTime: LIVE_REFRESH_MS.standingsLive,
    refetchOnMount: (query) => (query.state.data?.length ?? 0) === 0,
    refetchOnWindowFocus: () =>
      isLiveSessionActive() || getClientTournamentPhase() === "live",
    refetchInterval: (query) => {
      const standings = query.state.data ?? [];
      if (isLiveSessionActive()) return LIVE_REFRESH_MS.standingsLive;
      if (
        multiIds.includes(WORLD_CUP_LEAGUE_ID) &&
        isWorldCupLive(standings)
      ) {
        return LIVE_REFRESH_MS.standings;
      }
      return false;
    },
  });
}

export function useWorldCupStandings(season = DEFAULT_SEASON) {
  return useStandings(season, WORLD_CUP_LEAGUE_ID);
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
    const label = formatRoundLabel(f.league.round);
    if (phase.startsWith("Grupo ")) {
      return label === phase || f.league.round.includes(`Group ${phase.replace("Grupo ", "")}`);
    }
    const phaseLabels: Partial<Record<PhaseFilter, string>> = {
      "16avos": "16avos de final",
      Octavos: "Octavos de final",
      Cuartos: "Cuartos de final",
      Semis: "Semifinal",
      Final: "Final",
    };
    return label === phaseLabels[phase];
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
