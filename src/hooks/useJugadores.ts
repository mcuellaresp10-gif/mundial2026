"use client";

import { useQuery } from "@tanstack/react-query";
import { getPlayers, getPlayerProfile, getAllSquadsForTeams, getTeamSquadPlayers } from "@/services/apiFootball";
import { DEFAULT_SEASON } from "@/lib/utils";
import type { Player, TopScorerEntry } from "@/types";
import { parseRating } from "@/utils/formatters";
import { getStatBundle, statSummary } from "@/utils/playerStats";

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

export function useAllPlayers(teamIds: number[], fullStats = false) {
  return useQuery({
    queryKey: ["allPlayers", teamIds, fullStats ? "full" : "fast"],
    queryFn: () => getAllSquadsForTeams(teamIds, { fullStats }),
    enabled: teamIds.length > 0,
    staleTime: 4 * 60 * 60 * 1000,
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
        team: team.name,
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
        team: team.name,
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
