import type { Fixture, FixturePlayersTeam } from "@/types";
import { isFixtureFinished, isFixtureStarted } from "@/lib/liveRefresh";
import { formatRoundLabel } from "@/utils/formatters";
import { aggregateCandidatesFromFixturePlayerTeams } from "@/utils/onceIdealRatings";

export interface JornadaGroup {
  round: string;
  label: string;
  sortKey: number;
  fixtures: Fixture[];
  finishedFixtureIds: number[];
  /** Partidos ya iniciados (en vivo o finalizados) con stats por jugador. */
  playedFixtureIds: number[];
}

function roundSortKey(round: string): number {
  const groupStage = round.match(/Group Stage\s*-\s*(\d+)/i);
  if (groupStage) return parseInt(groupStage[1], 10);

  if (/Round of 32|Round of thirty-two/i.test(round)) return 100;
  if (/Round of 16|8th Finals|Round of sixteen/i.test(round)) return 110;
  if (/Quarter[- ]finals?/i.test(round)) return 120;
  if (/Semi[- ]finals?/i.test(round)) return 130;
  if (/3rd Place|Third Place/i.test(round)) return 140;
  if (/Final/i.test(round) && !/Semi|Quarter|Round|3rd|Third/i.test(round)) return 150;

  return 50;
}

/** Agrupa partidos por ronda/jornada del torneo. */
export function listJornadasFromFixtures(fixtures: Fixture[]): JornadaGroup[] {
  const byRound = new Map<string, Fixture[]>();

  for (const fixture of fixtures) {
    const round = fixture.league.round?.trim();
    if (!round) continue;
    const list = byRound.get(round) ?? [];
    list.push(fixture);
    byRound.set(round, list);
  }

  return [...byRound.entries()]
    .map(([round, roundFixtures]) => ({
      round,
      label: formatRoundLabel(round),
      sortKey: roundSortKey(round),
      fixtures: roundFixtures,
      finishedFixtureIds: roundFixtures
        .filter((f) => isFixtureFinished(f.fixture.status.short))
        .map((f) => f.fixture.id),
      playedFixtureIds: roundFixtures
        .filter((f) => isFixtureStarted(f.fixture.status.short))
        .map((f) => f.fixture.id),
    }))
    .sort((a, b) => a.sortKey - b.sortKey);
}

/** Última jornada con al menos un partido jugado. */
export function pickLatestPlayedJornada(jornadas: JornadaGroup[]): JornadaGroup | null {
  for (let i = jornadas.length - 1; i >= 0; i -= 1) {
    if (jornadas[i].playedFixtureIds.length > 0) return jornadas[i];
  }
  return null;
}

/** @deprecated Usar pickLatestPlayedJornada */
export function pickLatestFinishedJornada(jornadas: JornadaGroup[]): JornadaGroup | null {
  return pickLatestPlayedJornada(jornadas);
}

/** Convierte stats por partido en candidatos para el once ideal de jornada. */
export function flattenFixturePlayersTeams(teamsGroups: FixturePlayersTeam[][]) {
  return aggregateCandidatesFromFixturePlayerTeams(teamsGroups, 1);
}
