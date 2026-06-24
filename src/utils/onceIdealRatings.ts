import type { Player, FixturePlayersTeam } from "@/types";
import type { RatedPlayerCandidate } from "@/utils/calculations";
import { parseRating } from "@/utils/formatters";
import { positionToCode } from "@/utils/squad";
import { translateTeamName } from "@/utils/teamNames";
import { getStatBundle, getWorldCupTournamentStat } from "@/utils/playerStats";

/** Mínimo de minutos en el torneo para entrar al once ideal acumulado. */
export const ONCE_IDEAL_MIN_MINUTES_TOURNAMENT = 45;

interface PlayerRatingAccumulator {
  id: number;
  name: string;
  photo: string;
  team: string;
  teamLogo: string;
  ratingWeighted: number;
  minutes: number;
  goals: number;
  assists: number;
  positionMinutes: Map<string, number>;
}

function pickPrimaryPosition(positionMinutes: Map<string, number>): string {
  let best = "M";
  let bestMin = -1;
  for (const [pos, mins] of positionMinutes) {
    if (mins > bestMin) {
      bestMin = mins;
      best = pos;
    }
  }
  return best;
}

function roundRating(value: number): number {
  return Math.round(value * 100) / 100;
}

/**
 * Agrega ratings por partido ponderados por minutos jugados.
 * Si un jugador disputó varios partidos en la jornada/torneo, el rating es
 * sum(rating × minutos) / sum(minutos), no el mejor partido ni la media simple.
 */
export function aggregateCandidatesFromFixturePlayerTeams(
  teamsGroups: FixturePlayersTeam[][],
  minMinutes = 1
): RatedPlayerCandidate[] {
  const acc = new Map<number, PlayerRatingAccumulator>();

  for (const teams of teamsGroups) {
    for (const { team, players } of teams) {
      for (const entry of players) {
        const stat = entry.statistics[0];
        if (!stat) continue;

        const mins = stat.games.minutes ?? 0;
        if (mins <= 0) continue;

        const rating = parseRating(stat.games.rating);
        if (rating <= 0) continue;

        const pos = positionToCode(stat.games.position);
        let row = acc.get(entry.player.id);
        if (!row) {
          row = {
            id: entry.player.id,
            name: entry.player.name,
            photo: entry.player.photo,
            team: translateTeamName(team.name),
            teamLogo: team.logo,
            ratingWeighted: 0,
            minutes: 0,
            goals: 0,
            assists: 0,
            positionMinutes: new Map(),
          };
          acc.set(entry.player.id, row);
        }

        row.ratingWeighted += rating * mins;
        row.minutes += mins;
        row.goals += stat.goals.total ?? 0;
        row.assists += stat.goals.assists ?? 0;
        row.positionMinutes.set(pos, (row.positionMinutes.get(pos) ?? 0) + mins);
      }
    }
  }

  return [...acc.values()]
    .filter((p) => p.minutes >= minMinutes)
    .map((p) => ({
      id: p.id,
      name: p.name,
      photo: p.photo,
      team: p.team,
      teamLogo: p.teamLogo,
      position: pickPrimaryPosition(p.positionMinutes),
      rating: roundRating(p.ratingWeighted / p.minutes),
      goals: p.goals,
      assists: p.assists,
      minutes: p.minutes,
    }));
}

/** Prioriza stats del Mundial (league=1) del pool sobre el fetch rápido por plantel. */
export function mergeWorldCupPoolIntoSquads(squads: Player[], pool: Player[]): Player[] {
  const poolById = new Map(pool.map((p) => [p.player.id, p]));

  const merged = squads.map((squad) => {
    const poolPlayer = poolById.get(squad.player.id);
    if (!poolPlayer) return squad;

    const poolWc = getWorldCupTournamentStat({
      ...poolPlayer,
      nationalTeam: squad.nationalTeam ?? poolPlayer.nationalTeam,
    });
    if (!poolWc) return squad;

    const squadBundle = getStatBundle(squad);
    return {
      ...squad,
      statBundle: {
        club: squadBundle.club ?? getStatBundle(poolPlayer).club,
        national: squadBundle.national ?? getStatBundle(poolPlayer).national,
        worldCup: poolWc,
      },
    };
  });

  const squadIds = new Set(squads.map((p) => p.player.id));
  for (const p of pool) {
    if (squadIds.has(p.player.id)) continue;
    if (getWorldCupTournamentStat(p)) merged.push(p);
  }

  return merged;
}

export function playerToOnceIdealCandidate(
  player: Player,
  minMinutes = ONCE_IDEAL_MIN_MINUTES_TOURNAMENT
): RatedPlayerCandidate | null {
  const wc = getWorldCupTournamentStat(player);
  if (!wc) return null;

  const minutes = wc.games.minutes ?? 0;
  if (minutes < minMinutes) return null;

  const rating = parseRating(wc.games.rating);
  if (rating <= 0) return null;

  return {
    id: player.player.id,
    name: player.player.name,
    photo: player.player.photo,
    team: translateTeamName(wc.team.name),
    teamLogo: wc.team.logo,
    position: positionToCode(wc.games.position),
    rating: roundRating(rating),
    goals: wc.goals.total ?? 0,
    assists: wc.goals.assists ?? 0,
    minutes,
  };
}

export function buildCandidatesFromPlayers(
  players: Player[],
  minMinutes = ONCE_IDEAL_MIN_MINUTES_TOURNAMENT
): RatedPlayerCandidate[] {
  return players
    .map((p) => playerToOnceIdealCandidate(p, minMinutes))
    .filter((c): c is RatedPlayerCandidate => c != null);
}
