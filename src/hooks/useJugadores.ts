"use client";

import { useQuery, useQueries } from "@tanstack/react-query";
import { getPlayers, getPlayerProfile, getAllSquadsForTeams, getTeamSquadPlayers, getWorldCupTopScorers, getFixtureEvents } from "@/services/apiFootball";
import { DEFAULT_SEASON } from "@/lib/utils";
import type { Player, TopScorerEntry } from "@/types";
import { parseRating } from "@/utils/formatters";
import { getStatBundle, statSummary } from "@/utils/playerStats";
import { aggregateScorersFromEvents, mapSquadPlayersToWorldCupScorers, mergeTopScorerLists } from "@/utils/tournamentScorers";
import { translateTeamName } from "@/utils/teamNames";
import { useFixtures } from "./usePartidos";
import { useMemo } from "react";
import { isFixtureLive, isFixtureStarted, LIVE_REFRESH_MS } from "@/lib/liveRefresh";
import { getClientTournamentPhase } from "@/services/clientTournamentPhase";

export function usePlayers(params: { team?: number; page?: number; search?: string }) {
  return useQuery({
    queryKey: ["players", params],
    queryFn: () => getPlayers({ ...params, season: DEFAULT_SEASON }),
    staleTime: 4 * 60 * 60 * 1000,
  });
}

export function usePlayer(id: number, nationalTeamId?: number) {
  return useQuery({
    queryKey: ["player", id, nationalTeamId],
    queryFn: () => getPlayerProfile(id, nationalTeamId),
    enabled: id > 0,
    staleTime: 4 * 60 * 60 * 1000,
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
      };
    })
    .filter(Boolean)
    .sort((a, b) => b!.goals - a!.goals) as TopScorerEntry[];
}

/** Goleadores del torneo — API oficial primero; eventos solo de partidos en vivo. */
export function useWorldCupTopScorers(limit = 10) {
  const { data: fixtures = [] } = useFixtures();
  const liveFixtureIds = useMemo(
    () =>
      fixtures
        .filter((f) => isFixtureLive(f.fixture.status.short))
        .map((f) => f.fixture.id),
    [fixtures]
  );

  const tournamentStarted =
    getClientTournamentPhase() === "live" ||
    fixtures.some((f) => isFixtureStarted(f.fixture.status.short));
  const hasLiveFixtures = liveFixtureIds.length > 0;

  const apiScorers = useQuery({
    queryKey: ["worldCupTopScorers", DEFAULT_SEASON],
    queryFn: () => getWorldCupTopScorers(),
    staleTime: LIVE_REFRESH_MS.topScorers,
    refetchInterval: tournamentStarted ? LIVE_REFRESH_MS.topScorers : false,
  });

  const eventQueries = useQueries({
    queries: liveFixtureIds.map((fixtureId) => ({
      queryKey: ["fixtureEvents", fixtureId],
      queryFn: () => getFixtureEvents(fixtureId),
      staleTime: LIVE_REFRESH_MS.topScorers,
      refetchInterval: hasLiveFixtures ? LIVE_REFRESH_MS.topScorers : false,
      enabled: hasLiveFixtures,
    })),
  });

  const eventsLoading = eventQueries.some((q) => q.isLoading);
  const scorersFromEvents = aggregateScorersFromEvents(
    eventQueries.map((q) => q.data ?? [])
  );

  const merged = mergeTopScorerLists(
    apiScorers.data ?? [],
    scorersFromEvents
  );

  return {
    scorers: merged.slice(0, limit),
    assists: extractTopAssistsFromScorers(merged),
    isLoading: apiScorers.isLoading || (hasLiveFixtures && eventsLoading && merged.length === 0),
  };
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
      };
    })
    .filter(Boolean)
    .sort((a, b) => b!.assists - a!.assists) as TopScorerEntry[];
}

/** Para Colombia Focus: mejor jugador en selección por rating */
export function getKeyPlayerByNationalRating(players: Player[]): Player | undefined {
  return [...players].sort(
    (a, b) => statSummary(getStatBundle(b).national).rating - statSummary(getStatBundle(a).national).rating
  )[0];
}
