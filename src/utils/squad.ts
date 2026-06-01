import type { Player, SquadPlayer, Team, PlayerStatistics } from "@/types";
import type { PlayerStatBundle } from "@/types";
import { splitPlayerStatistics } from "@/utils/playerStats";

const POSITION_MAP: Record<string, string> = {
  Goalkeeper: "G",
  Defender: "D",
  Midfielder: "M",
  Attacker: "F",
  G: "G",
  D: "D",
  M: "M",
  F: "F",
};

export function positionToCode(position: string | null | undefined): string {
  if (!position) return "M";
  return POSITION_MAP[position] ?? position.charAt(0).toUpperCase();
}

function buildBasePlayerInfo(
  squadPlayer: SquadPlayer,
  team: Team,
  enriched?: Player | null
) {
  return {
    id: squadPlayer.id,
    name: enriched?.player.name ?? squadPlayer.name,
    firstname: enriched?.player.firstname ?? squadPlayer.name,
    lastname: enriched?.player.lastname ?? "",
    age: squadPlayer.age ?? enriched?.player.age ?? null,
    birth: enriched?.player.birth ?? { date: null, place: null, country: null },
    nationality: enriched?.player.nationality ?? team.country,
    height: enriched?.player.height ?? null,
    weight: enriched?.player.weight ?? null,
    injured: enriched?.player.injured ?? false,
    photo: squadPlayer.photo,
  };
}

function withSquadNumber(stat: PlayerStatistics | null, number: number | null, position: string): PlayerStatistics | null {
  if (!stat) return null;
  return {
    ...stat,
    games: { ...stat.games, number, position: positionToCode(position) },
  };
}

export function mapSquadPlayerToPlayer(
  squadPlayer: SquadPlayer,
  team: Team,
  enriched?: Player | null
): Player {
  const position = positionToCode(squadPlayer.position);
  const allStats = enriched?.statistics ?? [];

  const bundle: PlayerStatBundle = allStats.length
    ? splitPlayerStatistics(allStats, team)
    : { club: null, national: null, worldCup: null };

  const club = withSquadNumber(bundle.club, squadPlayer.number, squadPlayer.position);
  const national = withSquadNumber(bundle.national, squadPlayer.number, squadPlayer.position);
  const worldCup = withSquadNumber(bundle.worldCup, squadPlayer.number, squadPlayer.position);

  const primary = national ?? club ?? worldCup;

  return {
    player: buildBasePlayerInfo(squadPlayer, team, enriched),
    statistics: primary ? [primary] : [],
    statBundle: { club, national, worldCup },
    nationalTeam: team,
  };
}

export function enrichPlayerWithStatBundle(
  player: Player,
  nationalTeam: Team
): Player {
  const bundle = splitPlayerStatistics(player.statistics, nationalTeam);
  const primary = bundle.national ?? bundle.club ?? bundle.worldCup;
  return {
    ...player,
    statBundle: bundle,
    nationalTeam,
    statistics: primary ? [primary] : player.statistics,
  };
}

export function mergeSquadWithPlayerStats(
  squad: SquadPlayer[],
  team: Team,
  statsPlayers: Player[]
): Player[] {
  const statsById = new Map(statsPlayers.map((p) => [p.player.id, p]));
  return squad.map((sp) =>
    mapSquadPlayerToPlayer(sp, team, statsById.get(sp.id) ?? null)
  );
}

// Re-export for backwards compatibility
export { pickClubStat } from "@/utils/playerStats";