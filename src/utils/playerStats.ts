import type { PlayerStatistics, Team } from "@/types";
import { PLAYER_STAT_SEASON_LABEL } from "@/lib/utils";
import { parseRating } from "./formatters";
const WORLD_CUP_LEAGUE_ID = 1;

/** Agrega varias filas de stats (ej. amistosos + eliminatorias con la selección). */
export function aggregateStatistics(
  stats: PlayerStatistics[],
  contextTeam: Team,
  leagueLabel: string
): PlayerStatistics | null {
  if (stats.length === 0) return null;
  if (stats.length === 1) return stats[0];

  let goals = 0;
  let assists = 0;
  let appearences = 0;
  let minutes = 0;
  let ratingWeighted = 0;
  let ratingWeight = 0;
  let yellow = 0;
  let red = 0;
  let shots = 0;

  for (const s of stats) {
    goals += s.goals.total ?? 0;
    assists += s.goals.assists ?? 0;
    appearences += s.games.appearences ?? 0;
    minutes += s.games.minutes ?? 0;
    yellow += s.cards.yellow ?? 0;
    red += s.cards.red ?? 0;
    shots += s.shots.total ?? 0;
    const r = parseRating(s.games.rating);
    const w = s.games.appearences ?? 1;
    if (r > 0) {
      ratingWeighted += r * w;
      ratingWeight += w;
    }
  }

  const base = stats[0];
  const avgRating = ratingWeight > 0 ? ratingWeighted / ratingWeight : 0;

  return {
    ...base,
    team: contextTeam,
    league: {
      ...base.league,
      name: leagueLabel,
      season: base.league.season,
    },
    games: {
      ...base.games,
      appearences: appearences,
      minutes,
      rating: avgRating > 0 ? avgRating.toFixed(2) : null,
    },
    goals: { ...base.goals, total: goals, assists },
    cards: { ...base.cards, yellow, red },
    shots: { ...base.shots, total: shots },
  };
}

export function pickClubStat(
  statistics: PlayerStatistics[],
  nationalTeamId: number
): PlayerStatistics | null {
  const clubStats =
    nationalTeamId > 0
      ? statistics.filter((s) => s.team.id !== nationalTeamId)
      : statistics.filter(
          (s) =>
            s.league.country !== "World" &&
            s.league.id !== WORLD_CUP_LEAGUE_ID &&
            !s.league.name.toLowerCase().includes("friend")
        );
  if (clubStats.length === 0) return null;

  const byClub = new Map<number, PlayerStatistics[]>();
  for (const s of clubStats) {
    const rows = byClub.get(s.team.id) ?? [];
    rows.push(s);
    byClub.set(s.team.id, rows);
  }

  let bestClubId = 0;
  let bestMinutes = 0;
  for (const [clubId, rows] of byClub) {
    const totalMin = rows.reduce((sum, r) => sum + (r.games.minutes ?? 0), 0);
    if (totalMin > bestMinutes) {
      bestMinutes = totalMin;
      bestClubId = clubId;
    }
  }

  const primaryClubRows = byClub.get(bestClubId) ?? [];
  if (primaryClubRows.length === 0) return null;

  const contextTeam = primaryClubRows[0].team;
  return aggregateStatistics(
    primaryClubRows,
    contextTeam,
    `${contextTeam.name} (todas competiciones) · Temporada ${PLAYER_STAT_SEASON_LABEL}`
  );
}

export function pickNationalStats(
  statistics: PlayerStatistics[],
  nationalTeam: Team
): PlayerStatistics | null {
  const nationalRows = statistics.filter((s) => s.team.id === nationalTeam.id);
  return aggregateStatistics(
    nationalRows,
    nationalTeam,
    `Selección (todas competiciones) · Temporada ${PLAYER_STAT_SEASON_LABEL}`
  );
}

export function pickWorldCupStat(
  statistics: PlayerStatistics[],
  nationalTeam: Team
): PlayerStatistics | null {
  const wcRows = statistics.filter(
    (s) =>
      s.league.id === WORLD_CUP_LEAGUE_ID &&
      s.league.season === 2026 &&
      s.team.id === nationalTeam.id
  );
  return aggregateStatistics(wcRows, nationalTeam, "Mundial 2026");
}

export interface PlayerStatBundle {
  club: PlayerStatistics | null;
  national: PlayerStatistics | null;
  worldCup: PlayerStatistics | null;
}

export function splitPlayerStatistics(
  statistics: PlayerStatistics[],
  nationalTeam: Team
): PlayerStatBundle {
  return {
    club: pickClubStat(statistics, nationalTeam.id),
    national: pickNationalStats(statistics, nationalTeam),
    worldCup: pickWorldCupStat(statistics, nationalTeam),
  };
}

export function getStatBundle(player: {
  statBundle?: PlayerStatBundle;
  statistics: PlayerStatistics[];
}): PlayerStatBundle {
  if (player.statBundle) return player.statBundle;
  const s = player.statistics[0];
  return {
    club: s ?? null,
    national: null,
    worldCup: null,
  };
}

export function statSummary(stat: PlayerStatistics | null | undefined) {
  if (!stat) {
    return {
      goals: 0,
      assists: 0,
      matches: 0,
      minutes: 0,
      rating: 0,
      teamName: "N/D",
      teamLogo: "",
      leagueName: "",
    };
  }
  return {
    goals: stat.goals.total ?? 0,
    assists: stat.goals.assists ?? 0,
    matches: stat.games.appearences ?? 0,
    minutes: stat.games.minutes ?? 0,
    rating: parseRating(stat.games.rating),
    teamName: stat.team.name,
    teamLogo: stat.team.logo,
    leagueName: stat.league.name,
  };
}
