import type { FixtureEvent, Player, TopScorerEntry } from "@/types";
import { parseRating } from "@/utils/formatters";
import { getStatBundle } from "@/utils/playerStats";
import { translateTeamName } from "@/utils/teamNames";

export function mapPlayersToTopScorers(players: Player[]): TopScorerEntry[] {
  return players
    .map((p) => {
      const stat = p.statistics[0];
      if (!stat) return null;
      const goals = stat.goals.total ?? 0;
      if (goals <= 0) return null;
      return {
        playerId: p.player.id,
        name: p.player.name,
        photo: p.player.photo,
        team: translateTeamName(stat.team.name),
        teamLogo: stat.team.logo,
        goals,
        assists: stat.goals.assists ?? 0,
        matches: stat.games.appearences ?? 0,
        rating: parseRating(stat.games.rating),
      };
    })
    .filter(Boolean)
    .sort((a, b) => b!.goals - a!.goals) as TopScorerEntry[];
}

export function mapSquadPlayersToWorldCupScorers(players: Player[]): TopScorerEntry[] {
  return players
    .map((p) => {
      const stat = getStatBundle(p).worldCup;
      if (!stat) return null;
      const goals = stat.goals.total ?? 0;
      if (goals <= 0) return null;
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

const GOAL_EVENT_TYPES = new Set(["Goal"]);
const EXCLUDED_GOAL_DETAILS = new Set(["Missed Penalty"]);

export function aggregateScorersFromEvents(eventsByFixture: FixtureEvent[][]): TopScorerEntry[] {
  const byPlayer = new Map<number, TopScorerEntry>();

  for (const events of eventsByFixture) {
    for (const event of events) {
      if (!GOAL_EVENT_TYPES.has(event.type)) continue;
      if (EXCLUDED_GOAL_DETAILS.has(event.detail)) continue;

      const existing = byPlayer.get(event.player.id);
      if (existing) {
        existing.goals += 1;
        continue;
      }

      byPlayer.set(event.player.id, {
        playerId: event.player.id,
        name: event.player.name,
        photo: "",
        team: translateTeamName(event.team.name),
        teamLogo: event.team.logo,
        goals: 1,
        assists: 0,
        matches: 0,
        rating: 0,
      });
    }
  }

  return [...byPlayer.values()].sort((a, b) => b.goals - a.goals);
}

export function mergeTopScorerLists(...lists: TopScorerEntry[][]): TopScorerEntry[] {
  const byPlayer = new Map<number, TopScorerEntry>();

  for (const list of lists) {
    for (const entry of list) {
      const existing = byPlayer.get(entry.playerId);
      if (!existing || entry.goals > existing.goals) {
        byPlayer.set(entry.playerId, {
          ...entry,
          photo: entry.photo || existing?.photo || "",
        });
      } else if (!existing.photo && entry.photo) {
        existing.photo = entry.photo;
      }
    }
  }

  return [...byPlayer.values()].sort((a, b) => b.goals - a.goals);
}
