import type { Fixture, Lineup, Player, PlayerStatistics, TopGoalkeeperEntry } from "@/types";
import { parseRating } from "@/utils/formatters";
import { getStatBundle } from "@/utils/playerStats";
import { positionToCode } from "@/utils/squad";
import { translateTeamName } from "@/utils/teamNames";
import { isFixtureFinished } from "@/lib/liveRefresh";
import { pickImageSrc } from "@/utils/imageSrc";

export function isGoalkeeperStat(stat: Pick<PlayerStatistics, "games">): boolean {
  return positionToCode(stat.games.position) === "G";
}

export function goalkeeperMetricsFromStat(
  stat: PlayerStatistics
): Pick<
  TopGoalkeeperEntry,
  | "minutes"
  | "goalsConceded"
  | "concededPer90"
  | "saves"
  | "savePercentage"
> {
  const minutes = stat.games.minutes ?? 0;
  const goalsConceded = stat.goals.conceded ?? 0;
  const saves = stat.goals.saves ?? 0;
  const shotsFaced = saves + goalsConceded;

  return {
    minutes,
    goalsConceded,
    concededPer90:
      minutes > 0 ? Math.round((goalsConceded / minutes) * 90 * 100) / 100 : null,
    saves,
    savePercentage:
      shotsFaced > 0 ? Math.round((saves / shotsFaced) * 100) : null,
  };
}

function baseGoalkeeperFromStat(
  p: Player,
  stat: PlayerStatistics,
  teamOverride?: { name: string; logo: string },
  cleanSheets = 0
): TopGoalkeeperEntry | null {
  if (!isGoalkeeperStat(stat)) return null;
  const minutes = stat.games.minutes ?? 0;
  if (minutes < 1) return null;

  const team = teamOverride ?? stat.team;
  const appearances = stat.games.appearences ?? 0;
  return {
    playerId: p.player.id,
    name: p.player.name,
    photo: pickImageSrc(p.player.photo, team.logo) ?? "",
    team: translateTeamName(team.name),
    teamLogo: team.logo,
    matches: appearances,
    rating: parseRating(stat.games.rating),
    cleanSheets,
    ...goalkeeperMetricsFromStat(stat),
  };
}

export function mapPlayersToTopGoalkeepers(
  players: Player[],
  cleanSheetsByPlayer: Map<number, number> = new Map()
): TopGoalkeeperEntry[] {
  return players
    .map((p) => {
      const stat = p.statistics[0];
      if (!stat) return null;
      return baseGoalkeeperFromStat(
        p,
        stat,
        undefined,
        cleanSheetsByPlayer.get(p.player.id) ?? 0
      );
    })
    .filter(Boolean)
    .sort((a, b) => {
      if (a!.goalsConceded !== b!.goalsConceded) {
        return a!.goalsConceded - b!.goalsConceded;
      }
      const saveA = a!.savePercentage ?? 0;
      const saveB = b!.savePercentage ?? 0;
      if (saveB !== saveA) return saveB - saveA;
      return b!.cleanSheets - a!.cleanSheets;
    }) as TopGoalkeeperEntry[];
}

export function mapSquadPlayersToGoalkeepers(
  players: Player[],
  scope: "worldcup" | "national" | "club"
): TopGoalkeeperEntry[] {
  return players
    .map((p) => {
      const bundle = getStatBundle(p);
      const stat =
        scope === "worldcup"
          ? bundle.worldCup
          : scope === "national"
            ? bundle.national
            : bundle.club;
      if (!stat) return null;
      const team = p.nationalTeam ?? stat.team;
      return baseGoalkeeperFromStat(p, stat, team);
    })
    .filter(Boolean)
    .sort((a, b) => a!.goalsConceded - b!.goalsConceded) as TopGoalkeeperEntry[];
}

/** Portería en cero por titular (pos G) en partidos FT. */
export function aggregateCleanSheetsFromLineups(
  entries: { fixture: Fixture; lineups: Lineup[] }[]
): Map<number, number> {
  const byPlayer = new Map<number, number>();

  for (const { fixture, lineups } of entries) {
    if (!isFixtureFinished(fixture.fixture.status.short)) continue;

    for (const lineup of lineups) {
      const isHome = lineup.team.id === fixture.teams.home.id;
      const conceded = isHome
        ? (fixture.goals.away ?? 0)
        : (fixture.goals.home ?? 0);
      if (conceded > 0) continue;

      const starter = lineup.startXI.find((row) => row.player.pos === "G");
      if (!starter) continue;

      const id = starter.player.id;
      byPlayer.set(id, (byPlayer.get(id) ?? 0) + 1);
    }
  }

  return byPlayer;
}