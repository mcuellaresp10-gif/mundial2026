"use client";

import { useQuery, useQueries } from "@tanstack/react-query";
import { getPlayers, getPlayerProfile, getAllSquadsForTeams, getTeamSquadPlayers, getWorldCupTopScorers, getWorldCupAssistLeaders, getWorldCupPlayerStatsPool, getWorldCupGoalkeepersForTeams, getFixtureEvents, getFixtureLineups, getFixturePlayers } from "@/services/apiFootball";
import { DEFAULT_SEASON, CACHE_TTL_MS } from "@/lib/utils";
import type { Player, TopScorerEntry, TopGoalkeeperEntry, Fixture, Lineup } from "@/types";
import { parseRating } from "@/utils/formatters";
import { getStatBundle, getWorldCupTournamentStat } from "@/utils/playerStats";
import {
  aggregateScorersFromEvents,
  aggregateAssistsFromEvents,
  mapSquadPlayersToWorldCupScorers,
  mergeTopScorerLists,
  mergeTopAssistLists,
  scoringMetricsFromStat,
  passingMetricsFromStat,
  enrichScorerEntriesFromPlayers,
} from "@/utils/tournamentScorers";
import { translateTeamName } from "@/utils/teamNames";
import { useFixtures } from "./usePartidos";
import { useMemo } from "react";
import { dedupeFixturesByMatch, uniqueTeamIdsFromFixtures } from "@/utils/fixtureMerge";
import {
  isFixtureStarted,
  isFixtureFinished,
  getFixturesForScorerEvents,
  isFixtureLiveForScorerEvents,
  LIVE_REFRESH_MS,
} from "@/lib/liveRefresh";
import {
  aggregateCleanSheetsFromLineups,
  mapPlayersToTopGoalkeepers,
  mapSquadPlayersToGoalkeepers,
} from "@/utils/tournamentGoalkeepers";
import { getClientTournamentPhase } from "@/services/clientTournamentPhase";
import { isLiveSessionActive } from "@/services/liveSession";
import type { FixturePlayersTeam } from "@/types";
import {
  aggregateCandidatesFromFixturePlayerTeams,
  mergeWorldCupPoolIntoSquads,
} from "@/utils/onceIdealRatings";
import type { RatedPlayerCandidate } from "@/utils/calculations";

export function usePlayers(params: { team?: number; page?: number; search?: string }) {
  return useQuery({
    queryKey: ["players", params],
    queryFn: () => getPlayers({ ...params, season: DEFAULT_SEASON }),
    staleTime: 4 * 60 * 60 * 1000,
  });
}

export function usePlayer(id: number, nationalTeamId?: number) {
  const liveActive =
    getClientTournamentPhase() === "live" || isLiveSessionActive();

  return useQuery({
    queryKey: ["player", id, nationalTeamId, liveActive ? "live" : "pre"],
    queryFn: () => getPlayerProfile(id, nationalTeamId),
    enabled: id > 0,
    staleTime: liveActive ? LIVE_REFRESH_MS.topScorers : CACHE_TTL_MS,
    refetchInterval: liveActive ? LIVE_REFRESH_MS.topScorers : false,
  });
}

export function useTeamPlayers(teamId?: number) {
  return useQuery({
    queryKey: ["teamPlayers", teamId, "full"],
    queryFn: () => getTeamSquadPlayers(teamId!, { fullStats: true }),
    enabled: !!teamId,
    staleTime: 4 * 60 * 60 * 1000,
  });
}

export function useAllPlayers(
  teamIds: number[],
  fullStats = false,
  enabled = true,
  liveRefreshMs?: number
) {
  const teamKey = [...teamIds].sort((a, b) => a - b).join(",");
  return useQuery({
    queryKey: ["allPlayers", teamKey, fullStats ? "full" : "fast"],
    queryFn: () => getAllSquadsForTeams(teamIds, { fullStats }),
    enabled: enabled && teamIds.length > 0,
    staleTime: liveRefreshMs ?? 4 * 60 * 60 * 1000,
    refetchInterval: liveRefreshMs ?? false,
  });
}

type ScorerScope = "worldcup" | "national" | "club";

function pickStatForScope(player: Player, scope: ScorerScope) {
  const bundle = getStatBundle(player);
  if (scope === "worldcup") return bundle.worldCup;
  if (scope === "national") return bundle.national;
  return bundle.club;
}

export function extractTopScorers(
  players: Player[],
  scope: ScorerScope = "worldcup"
): TopScorerEntry[] {
  if (scope === "worldcup") {
    return mapSquadPlayersToWorldCupScorers(players);
  }
  return players
    .map((p) => {
      const stat = pickStatForScope(p, scope);
      if (!stat) return null;
      const goals = stat.goals.total ?? 0;
      if (goals === 0) return null;
      const team = p.nationalTeam ?? stat.team;
      return {
        playerId: p.player.id,
        name: p.player.name,
        photo: p.player.photo,
        team: translateTeamName(team.name),
        teamLogo: team.logo,
        goals,
        assists: stat.goals.assists ?? 0,
        matches: stat.games.appearences ?? 0,
        rating: parseRating(stat.games.rating),
        ...scoringMetricsFromStat(stat),
      };
    })
    .filter(Boolean)
    .sort((a, b) => b!.goals - a!.goals) as TopScorerEntry[];
}

function useWorldCupScorerFixtureEvents(fixtures: Fixture[]) {
  const dedupedFixtures = useMemo(() => dedupeFixturesByMatch(fixtures), [fixtures]);
  const scorerFixtureIds = useMemo(
    () => getFixturesForScorerEvents(dedupedFixtures),
    [dedupedFixtures]
  );
  const liveScorerFixtureIds = useMemo(
    () =>
      new Set(
        dedupedFixtures.filter(isFixtureLiveForScorerEvents).map((f) => f.fixture.id)
      ),
    [dedupedFixtures]
  );
  const hasLiveFixtures = liveScorerFixtureIds.size > 0;
  const tournamentStarted =
    getClientTournamentPhase() === "live" ||
    fixtures.some((f) => isFixtureStarted(f.fixture.status.short));

  const eventQueries = useQueries({
    queries: scorerFixtureIds.map((fixtureId) => ({
      queryKey: ["fixtureEvents", fixtureId],
      queryFn: () => getFixtureEvents(fixtureId),
      staleTime: liveScorerFixtureIds.has(fixtureId)
        ? LIVE_REFRESH_MS.fixtureDetail
        : CACHE_TTL_MS,
      refetchInterval: liveScorerFixtureIds.has(fixtureId) && hasLiveFixtures
        ? LIVE_REFRESH_MS.fixtureDetail
        : false,
      enabled: tournamentStarted && fixtureId > 0,
    })),
  });

  const eventsByFixture = useMemo(
    () => eventQueries.map((q) => q.data ?? []),
    [eventQueries]
  );

  const eventsLoading =
    tournamentStarted &&
    scorerFixtureIds.length > 0 &&
    eventQueries.some((q) => q.isLoading);

  const liveRefreshMs: number | false = hasLiveFixtures
    ? LIVE_REFRESH_MS.topScorersLive
    : tournamentStarted
      ? LIVE_REFRESH_MS.topScorers
      : false;

  return {
    eventsByFixture,
    eventsLoading,
    hasLiveFixtures,
    tournamentStarted,
    liveRefreshMs,
    scorerFixtureCount: scorerFixtureIds.length,
  };
}

/** Goleadores del torneo — API + eventos de todos los partidos con goles. */
export function useWorldCupTopScorers(limit = 10) {
  const { data: fixtures = [] } = useFixtures();
  const {
    eventsByFixture,
    eventsLoading,
    hasLiveFixtures,
    tournamentStarted,
    liveRefreshMs,
  } = useWorldCupScorerFixtureEvents(fixtures);

  const apiScorers = useQuery({
    queryKey: ["worldCupTopScorers", DEFAULT_SEASON],
    queryFn: () => getWorldCupTopScorers(),
    staleTime: hasLiveFixtures ? LIVE_REFRESH_MS.topScorersLive : LIVE_REFRESH_MS.topScorers,
    refetchInterval: liveRefreshMs,
    enabled: tournamentStarted || fixtures.length > 0,
  });

  const playerPool = useQuery({
    queryKey: ["worldCupPlayerStatsPool", DEFAULT_SEASON],
    queryFn: () => getWorldCupPlayerStatsPool(),
    staleTime: hasLiveFixtures ? LIVE_REFRESH_MS.topScorersLive : LIVE_REFRESH_MS.topScorers,
    refetchInterval: liveRefreshMs,
    enabled: tournamentStarted || fixtures.length > 0,
  });

  const scorersFromEvents = aggregateScorersFromEvents(eventsByFixture);
  const merged = enrichScorerEntriesFromPlayers(
    mergeTopScorerLists(apiScorers.data ?? [], scorersFromEvents),
    playerPool.data ?? []
  );

  return {
    scorers: merged.slice(0, limit),
    assists: extractTopAssistsFromScorers(merged),
    isLoading:
      apiScorers.isLoading ||
      (merged.length === 0 && eventsLoading && tournamentStarted),
    isLiveRefreshing: hasLiveFixtures || isLiveSessionActive(),
  };
}

/** Asistidores del torneo — API con paginación + eventos de todos los partidos con goles. */
export function useWorldCupTopAssists(limit = 50) {
  const { data: fixtures = [] } = useFixtures();
  const {
    eventsByFixture,
    hasLiveFixtures,
    tournamentStarted,
    liveRefreshMs,
  } = useWorldCupScorerFixtureEvents(fixtures);

  const apiAssists = useQuery({
    queryKey: ["worldCupTopAssists", DEFAULT_SEASON],
    queryFn: () => getWorldCupAssistLeaders(),
    staleTime: hasLiveFixtures ? LIVE_REFRESH_MS.topScorersLive : LIVE_REFRESH_MS.topScorers,
    refetchInterval: liveRefreshMs,
    enabled: tournamentStarted || fixtures.length > 0,
  });

  const playerPool = useQuery({
    queryKey: ["worldCupPlayerStatsPool", DEFAULT_SEASON],
    queryFn: () => getWorldCupPlayerStatsPool(),
    staleTime: hasLiveFixtures ? LIVE_REFRESH_MS.topScorersLive : LIVE_REFRESH_MS.topScorers,
    refetchInterval: liveRefreshMs,
    enabled: tournamentStarted || fixtures.length > 0,
  });

  const assistsFromEvents = aggregateAssistsFromEvents(eventsByFixture);
  const merged = enrichScorerEntriesFromPlayers(
    mergeTopAssistLists(apiAssists.data ?? [], assistsFromEvents),
    playerPool.data ?? []
  );

  return {
    assists: merged.slice(0, limit),
    isLoading: apiAssists.isLoading,
    isLiveRefreshing: hasLiveFixtures || isLiveSessionActive(),
  };
}

function finishedWorldCupFixtureIds(fixtures: Fixture[]): number[] {
  return dedupeFixturesByMatch(fixtures)
    .filter((f) => isFixtureFinished(f.fixture.status.short))
    .map((f) => f.fixture.id);
}

/** Porteros del torneo — stats por selección + vallas invictas desde alineaciones. */
export function useWorldCupTopGoalkeepers(limit?: number) {
  const { data: fixtures = [] } = useFixtures();
  const {
    hasLiveFixtures,
    tournamentStarted,
    liveRefreshMs,
  } = useWorldCupScorerFixtureEvents(fixtures);

  const teamIds = useMemo(
    () => uniqueTeamIdsFromFixtures(fixtures, true),
    [fixtures]
  );

  const finishedIds = useMemo(() => finishedWorldCupFixtureIds(fixtures), [fixtures]);
  const fixtureById = useMemo(() => {
    const map = new Map<number, Fixture>();
    for (const f of dedupeFixturesByMatch(fixtures)) {
      map.set(f.fixture.id, f);
    }
    return map;
  }, [fixtures]);

  const goalkeeperPool = useQuery({
    queryKey: ["worldCupGoalkeeperPool", DEFAULT_SEASON, teamIds.join(",")],
    queryFn: () => getWorldCupGoalkeepersForTeams(teamIds),
    staleTime: hasLiveFixtures ? LIVE_REFRESH_MS.topScorersLive : LIVE_REFRESH_MS.topScorers,
    refetchInterval: liveRefreshMs,
    enabled: teamIds.length > 0 && (tournamentStarted || fixtures.length > 0),
  });

  const lineupQueries = useQueries({
    queries: finishedIds.map((fixtureId) => ({
      queryKey: ["fixtureLineups", fixtureId],
      queryFn: () => getFixtureLineups(fixtureId),
      staleTime: CACHE_TTL_MS,
      enabled: (tournamentStarted || fixtures.length > 0) && fixtureId > 0,
    })),
  });

  const cleanSheetsMap = useMemo(() => {
    const entries = finishedIds
      .map((id, index) => {
        const fixture = fixtureById.get(id);
        if (!fixture) return null;
        return {
          fixture,
          lineups: lineupQueries[index]?.data ?? [],
        };
      })
      .filter(Boolean) as { fixture: Fixture; lineups: Lineup[] }[];
    return aggregateCleanSheetsFromLineups(entries);
  }, [finishedIds, fixtureById, lineupQueries]);

  const goalkeepers = useMemo(() => {
    const list = mapPlayersToTopGoalkeepers(goalkeeperPool.data ?? [], cleanSheetsMap);
    return limit != null ? list.slice(0, limit) : list;
  }, [goalkeeperPool.data, cleanSheetsMap, limit]);

  return {
    goalkeepers,
    isLoading: goalkeeperPool.isLoading,
    isLiveRefreshing: hasLiveFixtures || isLiveSessionActive(),
  };
}

export function extractTopGoalkeepers(
  players: Player[],
  scope: ScorerScope = "worldcup"
): TopGoalkeeperEntry[] {
  return mapSquadPlayersToGoalkeepers(players, scope);
}

export function extractTopAssistsFromScorers(scorers: TopScorerEntry[]): TopScorerEntry[] {
  return [...scorers]
    .filter((s) => s.assists > 0)
    .sort((a, b) => b.assists - a.assists);
}

export function extractTopAssists(
  players: Player[],
  scope: ScorerScope = "worldcup"
): TopScorerEntry[] {
  return players
    .map((p) => {
      const stat = pickStatForScope(p, scope);
      if (!stat) return null;
      const assists = stat.goals.assists ?? 0;
      if (assists === 0) return null;
      const team = p.nationalTeam ?? stat.team;
      return {
        playerId: p.player.id,
        name: p.player.name,
        photo: p.player.photo,
        team: translateTeamName(team.name),
        teamLogo: team.logo,
        goals: stat.goals.total ?? 0,
        assists,
        matches: stat.games.appearences ?? 0,
        rating: parseRating(stat.games.rating),
        ...scoringMetricsFromStat(stat),
        ...passingMetricsFromStat(stat),
      };
    })
    .filter(Boolean)
    .sort((a, b) => b!.assists - a!.assists) as TopScorerEntry[];
}

/** Top jugadores del mundial por rating (desempate: goles, asistencias, partidos). */
export function getTopWorldCupPlayers(players: Player[], limit = 5): TopScorerEntry[] {
  return players
    .map((p) => {
      const stat = getWorldCupTournamentStat(p);
      if (!stat) return null;
      const team = p.nationalTeam ?? stat.team;
      return {
        playerId: p.player.id,
        name: p.player.name,
        photo: p.player.photo,
        team: translateTeamName(team.name),
        teamLogo: team.logo,
        goals: stat.goals.total ?? 0,
        assists: stat.goals.assists ?? 0,
        matches: stat.games.appearences ?? 0,
        rating: parseRating(stat.games.rating),
      };
    })
    .filter(Boolean)
    .sort((a, b) => {
      if (b!.rating !== a!.rating) return b!.rating - a!.rating;
      if (b!.goals !== a!.goals) return b!.goals - a!.goals;
      if (b!.assists !== a!.assists) return b!.assists - a!.assists;
      return b!.matches - a!.matches;
    })
    .slice(0, limit) as TopScorerEntry[];
}

function ratedCandidatesToTopScorers(
  candidates: RatedPlayerCandidate[],
  limit: number
): TopScorerEntry[] {
  return [...candidates]
    .sort((a, b) => {
      if (b.rating !== a.rating) return b.rating - a.rating;
      if (b.goals !== a.goals) return b.goals - a.goals;
      return b.assists - a.assists;
    })
    .slice(0, limit)
    .map((c) => ({
      playerId: c.id,
      name: c.name,
      photo: c.photo,
      team: c.team,
      teamLogo: c.teamLogo,
      goals: c.goals,
      assists: c.assists,
      matches: c.minutes > 0 ? Math.max(1, Math.round(c.minutes / 90)) : 0,
      rating: c.rating,
    }));
}

function filterPlayersForNationalTeam(players: Player[], teamId: number): Player[] {
  return players.filter((p) => {
    if (p.nationalTeam?.id === teamId) return true;
    const wc = getWorldCupTournamentStat(p);
    return wc?.team.id === teamId;
  });
}

function keyPlayersFromFixturePlayerTeams(
  teamsGroups: FixturePlayersTeam[][],
  teamId: number,
  limit: number
): TopScorerEntry[] {
  const filteredGroups = teamsGroups
    .map((teams) => teams.filter((t) => t.team.id === teamId))
    .filter((group) => group.length > 0);
  if (filteredGroups.length === 0) return [];
  return ratedCandidatesToTopScorers(
    aggregateCandidatesFromFixturePlayerTeams(filteredGroups, 1),
    limit
  );
}

/** Jugadores clave del Mundial para una selección (pool API + fallback por ratings de partido). */
export function useTeamWorldCupKeyPlayers(teamId?: number, limit = 5) {
  const { data: fixtures = [] } = useFixtures({ team: teamId });
  const { data: squad = [], isLoading: squadLoading } = useTeamPlayers(teamId);

  const tournamentStarted =
    getClientTournamentPhase() === "live" ||
    fixtures.some((f) => isFixtureStarted(f.fixture.status.short));

  const liveRefreshMs = tournamentStarted ? LIVE_REFRESH_MS.topScorers : undefined;
  const staleTime = liveRefreshMs ?? CACHE_TTL_MS;

  const { data: wcPool = [], isLoading: poolLoading } = useQuery({
    queryKey: ["worldCupPlayerStatsPool", "teamKey", teamId, tournamentStarted ? "live" : "pre"],
    queryFn: () => getWorldCupPlayerStatsPool(),
    enabled: !!teamId,
    staleTime,
    refetchInterval: liveRefreshMs ?? false,
  });

  const mergedPlayers = useMemo(() => {
    if (!teamId) return [];
    const merged = !squad.length
      ? wcPool
      : mergeWorldCupPoolIntoSquads(squad, wcPool);
    return filterPlayersForNationalTeam(merged, teamId);
  }, [squad, wcPool, teamId]);

  const fromSeasonStats = useMemo(
    () => getTopWorldCupPlayers(mergedPlayers, limit),
    [mergedPlayers, limit]
  );

  const finishedFixtureIds = useMemo(() => {
    if (!teamId) return [];
    return dedupeFixturesByMatch(fixtures)
      .filter((f) => isFixtureFinished(f.fixture.status.short))
      .filter((f) => f.teams.home.id === teamId || f.teams.away.id === teamId)
      .map((f) => f.fixture.id);
  }, [fixtures, teamId]);

  const useFixtureFallback = fromSeasonStats.length === 0 && finishedFixtureIds.length > 0;

  const fixturePlayerQueries = useQueries({
    queries: finishedFixtureIds.map((fixtureId) => ({
      queryKey: ["fixturePlayers", "teamKey", teamId, fixtureId],
      queryFn: () => getFixturePlayers(fixtureId),
      enabled: useFixtureFallback && fixtureId > 0,
      staleTime: CACHE_TTL_MS,
    })),
  });

  const fromFixtures = useMemo(() => {
    if (!useFixtureFallback || !teamId) return [];
    const groups = fixturePlayerQueries
      .map((q) => q.data ?? [])
      .filter((group) => group.length > 0);
    return keyPlayersFromFixturePlayerTeams(groups, teamId, limit);
  }, [useFixtureFallback, teamId, fixturePlayerQueries, limit]);

  const keyPlayers = fromSeasonStats.length > 0 ? fromSeasonStats : fromFixtures;

  const fixturesLoading =
    useFixtureFallback && fixturePlayerQueries.some((q) => q.isLoading && !q.data);

  return {
    keyPlayers,
    isLoading: squadLoading || poolLoading || fixturesLoading,
  };
}
