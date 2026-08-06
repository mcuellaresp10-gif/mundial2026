import type { Player, PlayerStatistics } from "@/types";
import type { ScoutingPosition } from "@/config/positionMetricProfiles";
import { getLeagueSeasonStat, getWorldCupTournamentStat } from "@/utils/playerStats";
import { DEFAULT_SEASON, LEAGUE_ID } from "@/lib/utils";
import { isScoutingPositionCode, positionToCode } from "@/utils/squad";

const REFINE_MIN_MINUTES = 180;

const CODE_TO_API_POSITION: Record<ScoutingPosition, string> = {
  G: "Goalkeeper",
  D: "Defender",
  M: "Midfielder",
  F: "Attacker",
};

function per90(total: number | null | undefined, minutes: number): number {
  return (90 * (total ?? 0)) / minutes;
}

function asScoutingPosition(code: string): ScoutingPosition {
  return isScoutingPositionCode(code) ? code : "M";
}

/**
 * Solo corrige el error más claro de API-Football: delanteros etiquetados como
 * Midfielder (p. ej. L. Castro). No mueve M→D: un volante defensivo (CDM) tiene
 * el mismo perfil defensivo que un central y se clasificaría mal (R. Ureña).
 */
export function refineScoutingPosition(
  code: ScoutingPosition,
  row: PlayerStatistics
): ScoutingPosition {
  if (code !== "M") return code;

  const minutes = row.games.minutes ?? 0;
  if (minutes < REFINE_MIN_MINUTES) return code;

  const shots90 = per90(row.shots.total, minutes);
  const tackles90 = per90(row.tackles.total, minutes);
  const goals90 = per90(row.goals.total, minutes);

  // Delantero listado como volante: remata y define, casi no taclea.
  if (shots90 >= 2.0 && tackles90 <= 0.65 && goals90 >= 0.25) {
    return "F";
  }

  return "M";
}

export interface ScoutingPositionOptions {
  /** Posición del plantel (players/squads). */
  squadPositionByPlayerId?: ReadonlyMap<number, string>;
}

/**
 * Posición de scouting:
 * 1) plantel si existe
 * 2) stats de temporada
 * 3) solo refinamiento M→F (delanteros mal etiquetados)
 */
export function resolveScoutingPosition(
  player: Player,
  leagueId: number = LEAGUE_ID,
  season: number = DEFAULT_SEASON,
  options?: ScoutingPositionOptions
): ScoutingPosition {
  const stat =
    getLeagueSeasonStat(player, leagueId, season) ??
    getWorldCupTournamentStat(player);

  const squadRaw = options?.squadPositionByPlayerId?.get(player.player.id);
  const seasonRaw =
    stat?.games.position ?? player.statistics[0]?.games.position ?? null;

  // Preferir plantel: season stats (y parches previos) pueden estar mal.
  const preferredRaw = squadRaw || seasonRaw || "M";
  const base = asScoutingPosition(positionToCode(preferredRaw));

  if (!stat) return base;
  return refineScoutingPosition(base, stat);
}

function patchStatPosition(
  stat: PlayerStatistics,
  positionLabel: string
): PlayerStatistics {
  if (stat.games.position === positionLabel) return stat;
  return {
    ...stat,
    games: { ...stat.games, position: positionLabel },
  };
}

/**
 * Reescribe `games.position` de cada jugador con la posición resuelta
 * (plantel + refinamiento), para que scouting / once ideal / tablas usen la misma.
 */
export function applyResolvedPositionsToPlayers(
  players: Player[],
  leagueId: number,
  season: number,
  squadPositionByPlayerId?: ReadonlyMap<number, string>
): Player[] {
  const opts: ScoutingPositionOptions | undefined = squadPositionByPlayerId
    ? { squadPositionByPlayerId }
    : undefined;

  return players.map((player) => {
    const resolved = resolveScoutingPosition(player, leagueId, season, opts);
    const label = CODE_TO_API_POSITION[resolved];

    const statistics = player.statistics.map((stat) => {
      if (stat.league.id !== leagueId) return stat;
      if (stat.league.season != null && stat.league.season !== season) return stat;
      return patchStatPosition(stat, label);
    });

    const bundle = player.statBundle;
    const nextBundle = bundle
      ? {
          club: bundle.club ? patchStatPosition(bundle.club, label) : bundle.club,
          national: bundle.national
            ? patchStatPosition(bundle.national, label)
            : bundle.national,
          worldCup: bundle.worldCup
            ? patchStatPosition(bundle.worldCup, label)
            : bundle.worldCup,
        }
      : undefined;

    return {
      ...player,
      statistics,
      ...(nextBundle ? { statBundle: nextBundle } : {}),
    };
  });
}
