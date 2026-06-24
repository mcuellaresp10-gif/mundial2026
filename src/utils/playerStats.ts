import type { PlayerStatistics, Team } from "@/types";
import { DEFAULT_SEASON, LEAGUE_ID, PLAYER_STAT_SEASON_LABEL, PLAYER_STAT_SEASONS } from "@/lib/utils";
import { parseRating } from "./formatters";

const WORLD_CUP_LEAGUE_ID = LEAGUE_ID;

/** Fila de estadísticas del Mundial (league=1 o nombre World Cup). */
export function isWorldCupStatRow(stat: PlayerStatistics, nationalTeamId?: number): boolean {
  const name = stat.league.name.toLowerCase();
  const isWcLeague =
    stat.league.id === WORLD_CUP_LEAGUE_ID ||
    name.includes("world cup") ||
    (stat.league.country === "World" && name.includes("cup"));
  if (!isWcLeague) return false;
  if (nationalTeamId != null && stat.team.id !== nationalTeamId) return false;
  return PLAYER_STAT_SEASONS.includes(stat.league.season as (typeof PLAYER_STAT_SEASONS)[number]);
}

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
  let shotsOn = 0;
  let passesTotal = 0;
  let passesKey = 0;
  let passAccWeighted = 0;
  let passAccWeight = 0;
  let duelsTotal = 0;
  let duelsWon = 0;
  let dribbleAttempts = 0;
  let dribbleSuccess = 0;
  let tacklesTotal = 0;
  let tacklesBlocks = 0;
  let tacklesInterceptions = 0;
  let foulsDrawn = 0;
  let foulsCommitted = 0;
  let conceded = 0;
  let saves = 0;

  for (const s of stats) {
    goals += s.goals.total ?? 0;
    assists += s.goals.assists ?? 0;
    appearences += s.games.appearences ?? 0;
    minutes += s.games.minutes ?? 0;
    yellow += s.cards.yellow ?? 0;
    red += s.cards.red ?? 0;
    shots += s.shots.total ?? 0;
    shotsOn += s.shots.on ?? 0;
    passesTotal += s.passes.total ?? 0;
    passesKey += s.passes.key ?? 0;
    duelsTotal += s.duels.total ?? 0;
    duelsWon += s.duels.won ?? 0;
    dribbleAttempts += s.dribbles.attempts ?? 0;
    dribbleSuccess += s.dribbles.success ?? 0;
    tacklesTotal += s.tackles.total ?? 0;
    tacklesBlocks += s.tackles.blocks ?? 0;
    tacklesInterceptions += s.tackles.interceptions ?? 0;
    foulsDrawn += s.fouls.drawn ?? 0;
    foulsCommitted += s.fouls.committed ?? 0;
    conceded += s.goals.conceded ?? 0;
    saves += s.goals.saves ?? 0;

    const acc = s.passes.accuracy;
    const w = s.games.appearences ?? 1;
    if (acc != null && acc > 0) {
      passAccWeighted += acc * w;
      passAccWeight += w;
    }

    const r = parseRating(s.games.rating);
    const ratingMinutes = s.games.minutes ?? 0;
    const weight = ratingMinutes > 0 ? ratingMinutes : w;
    if (r > 0 && weight > 0) {
      ratingWeighted += r * weight;
      ratingWeight += weight;
    }
  }

  const base = stats[0];
  const avgRating = ratingWeight > 0 ? ratingWeighted / ratingWeight : 0;
  const passAccuracy =
    passAccWeight > 0
      ? Math.round((passAccWeighted / passAccWeight) * 10) / 10
      : base.passes.accuracy;

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
    goals: { ...base.goals, total: goals, assists, conceded, saves },
    cards: { ...base.cards, yellow, red },
    shots: { ...base.shots, total: shots, on: shotsOn },
    passes: {
      ...base.passes,
      total: passesTotal,
      key: passesKey,
      accuracy: passAccuracy,
    },
    duels: { total: duelsTotal, won: duelsWon },
    dribbles: {
      ...base.dribbles,
      attempts: dribbleAttempts,
      success: dribbleSuccess,
    },
    tackles: {
      total: tacklesTotal,
      blocks: tacklesBlocks,
      interceptions: tacklesInterceptions,
    },
    fouls: { drawn: foulsDrawn, committed: foulsCommitted },
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
  const nationalRows = statistics.filter(
    (s) => s.team.id === nationalTeam.id && !isWorldCupStatRow(s, nationalTeam.id)
  );
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
  const wcRows = statistics.filter((s) => isWorldCupStatRow(s, nationalTeam.id));
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

/** Stats del Mundial 2026 si el jugador tiene minutos o partidos en el torneo. */
export function getWorldCupTournamentStat(player: {
  statBundle?: PlayerStatBundle;
  statistics: PlayerStatistics[];
}): PlayerStatistics | null {
  const wc = getStatBundle(player).worldCup;
  if (!wc) return null;

  const appearances = wc.games.appearences ?? 0;
  const minutes = wc.games.minutes ?? 0;
  if (appearances <= 0 && minutes <= 0) return null;

  return wc;
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
