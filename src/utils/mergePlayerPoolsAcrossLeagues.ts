import type { Player, PlayerStatistics, Team } from "@/types";
import type { AmericasLeague } from "@/data/americasLeagues";
import { aggregateStatistics } from "@/utils/playerStats";
import { getLeagueSeasonStat } from "@/utils/playerStats";

export interface LeaguePoolSlice {
  league: AmericasLeague;
  players: Player[];
}

function teamFromStat(stat: PlayerStatistics): Team {
  return {
    id: stat.team.id,
    name: stat.team.name,
    logo: stat.team.logo,
    code: null,
    country: "",
    founded: null,
    national: false,
  };
}

/** Elige el club con más minutos entre las filas a agregar. */
function primaryTeamFromRows(rows: PlayerStatistics[]): Team {
  let best = rows[0];
  let bestMinutes = best.games.minutes ?? 0;
  for (const row of rows.slice(1)) {
    const minutes = row.games.minutes ?? 0;
    if (minutes > bestMinutes) {
      best = row;
      bestMinutes = minutes;
    }
  }
  return teamFromStat(best);
}

/**
 * Une pools de varias ligas: mismo jugador → una fila con stats sumadas
 * (minutos, goles, etc.) y rating ponderado por minutos.
 */
export function mergePlayerPoolsAcrossLeagues(
  slices: LeaguePoolSlice[]
): Player[] {
  if (slices.length === 0) return [];
  if (slices.length === 1) {
    const { league, players } = slices[0];
    return players.map((p) => {
      const row = getLeagueSeasonStat(p, league.id, league.defaultSeason);
      if (!row) return p;
      return {
        ...p,
        statistics: [row],
        nationalTeam: teamFromStat(row),
        statBundle: {
          club: row,
          national: null,
          worldCup: null,
        },
      };
    });
  }

  type Acc = {
    player: Player;
    rows: PlayerStatistics[];
  };
  const byId = new Map<number, Acc>();

  for (const { league, players } of slices) {
    for (const p of players) {
      const row = getLeagueSeasonStat(p, league.id, league.defaultSeason);
      if (!row) continue;
      if ((row.games.minutes ?? 0) < 1 && (row.games.appearences ?? 0) < 1) {
        continue;
      }
      const existing = byId.get(p.player.id);
      if (!existing) {
        byId.set(p.player.id, { player: p, rows: [row] });
      } else {
        existing.rows.push(row);
        if ((p.statistics?.length ?? 0) > (existing.player.statistics?.length ?? 0)) {
          existing.player = p;
        }
      }
    }
  }

  const label = slices.map((s) => s.league.shortName).join(" + ");
  const primaryLeague = slices[0].league;

  const merged: Player[] = [];
  for (const { player, rows } of byId.values()) {
    const team = primaryTeamFromRows(rows);
    const aggregated = aggregateStatistics(rows, team, label);
    if (!aggregated) continue;

    const normalized: PlayerStatistics = {
      ...aggregated,
      league: {
        ...aggregated.league,
        id: primaryLeague.id,
        name: label,
        season: primaryLeague.defaultSeason,
      },
      team,
    };

    merged.push({
      ...player,
      nationalTeam: team,
      statistics: [normalized],
      statBundle: {
        club: normalized,
        national: null,
        worldCup: null,
      },
    });
  }

  return merged;
}
