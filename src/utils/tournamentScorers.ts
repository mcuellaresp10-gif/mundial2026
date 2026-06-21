import type { FixtureEvent, Player, PlayerStatistics, TopScorerEntry } from "@/types";
import { parseRating } from "@/utils/formatters";
import { getStatBundle } from "@/utils/playerStats";
import { translateTeamName } from "@/utils/teamNames";

export function scoringMetricsFromStat(
  stat: Pick<PlayerStatistics, "games" | "goals" | "shots">
): Pick<
  TopScorerEntry,
  "minutes" | "goalsPer90" | "minsPerGoal" | "totalShots" | "goalConversion" | "shotAccuracy"
> {
  const goals = stat.goals.total ?? 0;
  const minutes = stat.games.minutes ?? 0;
  const totalShots = stat.shots.total ?? 0;
  const shotsOn = stat.shots.on ?? 0;

  return {
    minutes: minutes > 0 ? minutes : null,
    goalsPer90: minutes > 0 ? Math.round((goals / minutes) * 90 * 100) / 100 : null,
    minsPerGoal: goals > 0 && minutes > 0 ? Math.round(minutes / goals) : null,
    totalShots: totalShots > 0 ? totalShots : null,
    goalConversion:
      totalShots > 0 ? Math.round((goals / totalShots) * 100) : null,
    shotAccuracy:
      totalShots > 0 ? Math.round((shotsOn / totalShots) * 100) : null,
  };
}

export function passingMetricsFromStat(
  stat: Pick<PlayerStatistics, "games" | "passes">
): Pick<
  TopScorerEntry,
  | "minutes"
  | "chancesCreated"
  | "chancesPer90"
  | "totalPasses"
  | "passesComplete"
  | "passesIncomplete"
  | "passAccuracy"
> {
  const minutes = stat.games.minutes ?? 0;
  const totalPasses = stat.passes.total ?? 0;
  const keyPasses = stat.passes.key ?? 0;
  const accuracyPct = stat.passes.accuracy;

  let passesComplete: number | null = null;
  let passesIncomplete: number | null = null;
  if (totalPasses > 0 && accuracyPct != null) {
    passesComplete = Math.round(totalPasses * (accuracyPct / 100));
    passesIncomplete = totalPasses - passesComplete;
  }

  return {
    minutes: minutes > 0 ? minutes : null,
    chancesCreated: keyPasses > 0 ? keyPasses : null,
    chancesPer90:
      minutes > 0 && keyPasses > 0
        ? Math.round((keyPasses / minutes) * 90 * 100) / 100
        : null,
    totalPasses: totalPasses > 0 ? totalPasses : null,
    passesComplete,
    passesIncomplete,
    passAccuracy: accuracyPct != null ? Math.round(accuracyPct) : null,
  };
}

function playerStatExtras(stat: PlayerStatistics) {
  return {
    ...scoringMetricsFromStat(stat),
    ...passingMetricsFromStat(stat),
  };
}

function baseScorerFromStat(
  p: Player,
  stat: PlayerStatistics,
  teamOverride?: { name: string; logo: string }
): TopScorerEntry | null {
  const goals = stat.goals.total ?? 0;
  if (goals <= 0) return null;
  const team = teamOverride ?? stat.team;
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
    ...playerStatExtras(stat),
  };
}

function baseAssistFromStat(
  p: Player,
  stat: PlayerStatistics,
  teamOverride?: { name: string; logo: string }
): TopScorerEntry | null {
  const assists = stat.goals.assists ?? 0;
  if (assists <= 0) return null;
  const team = teamOverride ?? stat.team;
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
    ...playerStatExtras(stat),
  };
}

export function mapPlayersToTopAssists(players: Player[]): TopScorerEntry[] {
  return players
    .map((p) => {
      const stat = p.statistics[0];
      if (!stat) return null;
      return baseAssistFromStat(p, stat);
    })
    .filter(Boolean)
    .sort((a, b) => {
      if (b!.assists !== a!.assists) return b!.assists - a!.assists;
      return (b!.chancesCreated ?? 0) - (a!.chancesCreated ?? 0);
    }) as TopScorerEntry[];
}

export function mapPlayersToTopScorers(players: Player[]): TopScorerEntry[] {
  return players
    .map((p) => {
      const stat = p.statistics[0];
      if (!stat) return null;
      return baseScorerFromStat(p, stat);
    })
    .filter(Boolean)
    .sort((a, b) => b!.goals - a!.goals) as TopScorerEntry[];
}

export function mapSquadPlayersToWorldCupScorers(players: Player[]): TopScorerEntry[] {
  return players
    .map((p) => {
      const stat = getStatBundle(p).worldCup;
      if (!stat) return null;
      const team = p.nationalTeam ?? stat.team;
      return baseScorerFromStat(p, stat, team);
    })
    .filter(Boolean)
    .sort((a, b) => b!.goals - a!.goals) as TopScorerEntry[];
}

export function mapSquadPlayersToWorldCupAssists(players: Player[]): TopScorerEntry[] {
  return players
    .map((p) => {
      const stat = getStatBundle(p).worldCup;
      if (!stat) return null;
      const team = p.nationalTeam ?? stat.team;
      return baseAssistFromStat(p, stat, team);
    })
    .filter(Boolean)
    .sort((a, b) => b!.assists - a!.assists) as TopScorerEntry[];
}

const GOAL_EVENT_TYPES = new Set(["Goal"]);
const EXCLUDED_GOAL_DETAILS = new Set(["Missed Penalty"]);

function isScorerGoalEvent(event: FixtureEvent): boolean {
  if (!GOAL_EVENT_TYPES.has(event.type)) return false;
  if (EXCLUDED_GOAL_DETAILS.has(event.detail)) return false;
  if (/Own Goal/i.test(event.detail)) return false;
  return true;
}

function goalEventKey(event: FixtureEvent): string {
  return `${event.player.id}:${event.time.elapsed}:${event.time.extra ?? 0}:${event.detail}:${event.team.id}`;
}

function dedupeGoalEvents(events: FixtureEvent[]): FixtureEvent[] {
  const seen = new Set<string>();
  const out: FixtureEvent[] = [];
  for (const event of events) {
    if (!isScorerGoalEvent(event)) continue;
    const key = goalEventKey(event);
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(event);
  }
  return out;
}

/** Entrada de goleador desde stats API (incluye jugadores con 0 goles). */
export function scorerEntryFromStat(
  p: Player,
  stat: PlayerStatistics,
  teamOverride?: { name: string; logo: string }
): TopScorerEntry {
  const team = teamOverride ?? stat.team;
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
    ...playerStatExtras(stat),
  };
}

export function enrichScorerEntriesFromPlayers(
  entries: TopScorerEntry[],
  players: Player[]
): TopScorerEntry[] {
  if (players.length === 0) return entries;

  const byId = new Map<number, Player>();
  for (const p of players) byId.set(p.player.id, p);

  return entries.map((entry) => {
    const p = byId.get(entry.playerId);
    const stat = p?.statistics[0];
    if (!p || !stat) return entry;

    const fromApi = scorerEntryFromStat(p, stat, p.nationalTeam ?? stat.team);
    return {
      ...fromApi,
      goals: Math.max(entry.goals, fromApi.goals),
      assists: Math.max(entry.assists, fromApi.assists),
      photo: fromApi.photo || entry.photo,
      name: fromApi.name || entry.name,
      team: fromApi.team || entry.team,
      teamLogo: fromApi.teamLogo || entry.teamLogo,
    };
  });
}

export function aggregateScorersFromEvents(eventsByFixture: FixtureEvent[][]): TopScorerEntry[] {
  const byPlayer = new Map<number, TopScorerEntry>();

  for (const events of eventsByFixture) {
    for (const event of dedupeGoalEvents(events)) {
      if (!event.player.id) continue;

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

export function aggregateAssistsFromEvents(eventsByFixture: FixtureEvent[][]): TopScorerEntry[] {
  const byPlayer = new Map<number, TopScorerEntry>();

  for (const events of eventsByFixture) {
    for (const event of dedupeGoalEvents(events)) {
      const assistId = event.assist?.id;
      if (!assistId) continue;

      const existing = byPlayer.get(assistId);
      if (existing) {
        existing.assists += 1;
        continue;
      }

      byPlayer.set(assistId, {
        playerId: assistId,
        name: event.assist.name ?? "—",
        photo: "",
        team: translateTeamName(event.team.name),
        teamLogo: event.team.logo,
        goals: 0,
        assists: 1,
        matches: 0,
        rating: 0,
      });
    }
  }

  return [...byPlayer.values()].sort((a, b) => b.assists - a.assists);
}

export function mergeTopScorerLists(...lists: TopScorerEntry[][]): TopScorerEntry[] {
  const [apiList = [], ...overlays] = lists;
  const byPlayer = new Map<number, TopScorerEntry>();

  for (const entry of apiList) {
    byPlayer.set(entry.playerId, { ...entry });
  }

  for (const list of overlays) {
    for (const entry of list) {
      const existing = byPlayer.get(entry.playerId);
      if (!existing) {
        byPlayer.set(entry.playerId, { ...entry });
        continue;
      }

      byPlayer.set(entry.playerId, {
        ...existing,
        goals: Math.max(existing.goals, entry.goals),
        assists: Math.max(existing.assists, entry.assists),
        photo: existing.photo || entry.photo,
        name: existing.name || entry.name,
        team: existing.team || entry.team,
        teamLogo: existing.teamLogo || entry.teamLogo,
        matches: Math.max(existing.matches, entry.matches),
        rating: Math.max(existing.rating, entry.rating),
        minutes: existing.minutes ?? entry.minutes ?? null,
        goalsPer90: existing.goalsPer90 ?? entry.goalsPer90 ?? null,
        minsPerGoal: existing.minsPerGoal ?? entry.minsPerGoal ?? null,
        totalShots: existing.totalShots ?? entry.totalShots ?? null,
        goalConversion: existing.goalConversion ?? entry.goalConversion ?? null,
        shotAccuracy: existing.shotAccuracy ?? entry.shotAccuracy ?? null,
        chancesCreated: existing.chancesCreated ?? entry.chancesCreated ?? null,
        chancesPer90: existing.chancesPer90 ?? entry.chancesPer90 ?? null,
        totalPasses: existing.totalPasses ?? entry.totalPasses ?? null,
        passesComplete: existing.passesComplete ?? entry.passesComplete ?? null,
        passesIncomplete: existing.passesIncomplete ?? entry.passesIncomplete ?? null,
        passAccuracy: existing.passAccuracy ?? entry.passAccuracy ?? null,
      });
    }
  }

  return [...byPlayer.values()].sort((a, b) => b.goals - a.goals);
}

export function mergeTopAssistLists(...lists: TopScorerEntry[][]): TopScorerEntry[] {
  const [apiList = [], ...overlays] = lists;
  const byPlayer = new Map<number, TopScorerEntry>();

  for (const entry of apiList) {
    if (entry.assists > 0) byPlayer.set(entry.playerId, { ...entry });
  }

  for (const list of overlays) {
    for (const entry of list) {
      if (entry.assists <= 0) continue;
      const existing = byPlayer.get(entry.playerId);
      if (!existing) {
        byPlayer.set(entry.playerId, { ...entry });
        continue;
      }

      byPlayer.set(entry.playerId, {
        ...existing,
        assists: Math.max(existing.assists, entry.assists),
        goals: Math.max(existing.goals, entry.goals),
        photo: existing.photo || entry.photo,
        name: existing.name || entry.name,
        team: existing.team || entry.team,
        teamLogo: existing.teamLogo || entry.teamLogo,
        matches: Math.max(existing.matches, entry.matches),
        rating: Math.max(existing.rating, entry.rating),
        minutes: existing.minutes ?? entry.minutes ?? null,
        chancesCreated: existing.chancesCreated ?? entry.chancesCreated ?? null,
        chancesPer90: existing.chancesPer90 ?? entry.chancesPer90 ?? null,
        totalPasses: existing.totalPasses ?? entry.totalPasses ?? null,
        passesComplete: existing.passesComplete ?? entry.passesComplete ?? null,
        passesIncomplete: existing.passesIncomplete ?? entry.passesIncomplete ?? null,
        passAccuracy: existing.passAccuracy ?? entry.passAccuracy ?? null,
      });
    }
  }

  return [...byPlayer.values()].sort((a, b) => {
    if (b.assists !== a.assists) return b.assists - a.assists;
    return (b.chancesCreated ?? 0) - (a.chancesCreated ?? 0);
  });
}
