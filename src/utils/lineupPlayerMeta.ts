import type { Player } from "@/types";
import { getStatBundle, pickClubStat } from "@/utils/playerStats";
import { translateTeamName } from "@/utils/teamNames";

export interface LineupPlayerMeta {
  clubName: string | null;
  age: number | null;
}

export function buildLineupPlayerMetaMap(
  squadPlayers: Player[] | undefined,
  nationalTeamId: number
): Map<number, LineupPlayerMeta> {
  const map = new Map<number, LineupPlayerMeta>();
  if (!squadPlayers?.length) return map;

  for (const p of squadPlayers) {
    const bundle = getStatBundle(p);
    const club =
      bundle.club?.team.name ??
      pickClubStat(p.statistics, nationalTeamId)?.team.name ??
      null;
    map.set(p.player.id, {
      clubName: club ? translateTeamName(club) : null,
      age: p.player.age ?? null,
    });
  }

  return map;
}

export function getLineupPlayerMeta(
  map: Map<number, LineupPlayerMeta>,
  playerId: number
): LineupPlayerMeta {
  return map.get(playerId) ?? { clubName: null, age: null };
}

function shortName(fullName: string): string {
  const parts = fullName.trim().split(/\s+/);
  if (parts.length <= 1) return fullName;
  return parts[parts.length - 1];
}

export { shortName as lineupShortName };
