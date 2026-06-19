import type { Fixture, StandingTeam, StandingsGroup, Team } from "@/types";
import {
  isFixtureFinished,
  isFixtureLive,
  isPlausibleLiveFixture,
} from "@/lib/liveRefresh";
import { isWorldCupGroupLabel, normalizeGroupLabel, dedupeFixtures } from "@/utils/groupClassification";
import { iterateStandingsTables } from "@/utils/standingsTables";

export interface LiveStandingsProjection {
  standings: StandingsGroup[];
  liveGroupLetters: Set<string>;
  isProjected: boolean;
}

interface TeamAccum {
  team: Team;
  group: string;
  played: number;
  win: number;
  draw: number;
  lose: number;
  goalsFor: number;
  goalsAgainst: number;
  points: number;
}

function isGroupStageFixture(f: Fixture): boolean {
  const round = f.league.round.toLowerCase();
  return round.includes("group") || round.includes("grupo");
}

function fixtureBelongsToGroup(f: Fixture, teamIds: Set<number>): boolean {
  if (!teamIds.has(f.teams.home.id) || !teamIds.has(f.teams.away.id)) return false;
  return isGroupStageFixture(f);
}

function isCountableGroupFixture(f: Fixture): boolean {
  const status = f.fixture.status.short;
  if (isFixtureFinished(status)) return true;
  if (isFixtureLive(status) || isPlausibleLiveFixture(f)) return true;
  return false;
}

function initTeamAccum(row: StandingTeam): TeamAccum {
  return {
    team: row.team,
    group: row.group,
    played: 0,
    win: 0,
    draw: 0,
    lose: 0,
    goalsFor: 0,
    goalsAgainst: 0,
    points: 0,
  };
}

function applyMatchResult(accum: Map<number, TeamAccum>, f: Fixture): void {
  const home = accum.get(f.teams.home.id);
  const away = accum.get(f.teams.away.id);
  if (!home || !away) return;

  const hg = f.goals.home ?? 0;
  const ag = f.goals.away ?? 0;

  home.played += 1;
  away.played += 1;
  home.goalsFor += hg;
  home.goalsAgainst += ag;
  away.goalsFor += ag;
  away.goalsAgainst += hg;

  if (hg > ag) {
    home.win += 1;
    away.lose += 1;
    home.points += 3;
  } else if (hg < ag) {
    away.win += 1;
    home.lose += 1;
    away.points += 3;
  } else {
    home.draw += 1;
    away.draw += 1;
    home.points += 1;
    away.points += 1;
  }
}

function sortTeamAccums(rows: TeamAccum[]): TeamAccum[] {
  return [...rows].sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    const gdA = a.goalsFor - a.goalsAgainst;
    const gdB = b.goalsFor - b.goalsAgainst;
    if (gdB !== gdA) return gdB - gdA;
    return b.goalsFor - a.goalsFor;
  });
}

function toStandingTeam(row: TeamAccum, rank: number, template: StandingTeam): StandingTeam {
  const goalsDiff = row.goalsFor - row.goalsAgainst;
  return {
    ...template,
    rank,
    team: row.team,
    points: row.points,
    goalsDiff,
    group: row.group,
    all: {
      played: row.played,
      win: row.win,
      draw: row.draw,
      lose: row.lose,
      goals: { for: row.goalsFor, against: row.goalsAgainst },
    },
  };
}

function rebuildGroupTable(
  table: StandingTeam[],
  letter: string,
  fixtures: Fixture[]
): { table: StandingTeam[]; hasLive: boolean } {
  const teamIds = new Set(table.map((r) => r.team.id));
  const accum = new Map<number, TeamAccum>();
  for (const row of table) {
    accum.set(row.team.id, initTeamAccum(row));
  }

  let hasLive = false;
  const groupFixtures = dedupeFixtures(
    fixtures.filter((f) => fixtureBelongsToGroup(f, teamIds) && isCountableGroupFixture(f))
  );

  for (const f of groupFixtures) {
    if (isFixtureLive(f.fixture.status.short) || isPlausibleLiveFixture(f)) {
      hasLive = true;
    }
    applyMatchResult(accum, f);
  }

  if (groupFixtures.length === 0) {
    return { table, hasLive: false };
  }

  const templateById = new Map(table.map((r) => [r.team.id, r]));
  const sorted = sortTeamAccums([...accum.values()]).map((row, index) =>
    toStandingTeam(row, index + 1, templateById.get(row.team.id)!)
  );

  const officialPlayed = table.reduce((sum, row) => sum + row.all.played, 0);
  const projectedPlayed = sorted.reduce((sum, row) => sum + row.all.played, 0);
  if (projectedPlayed < officialPlayed) {
    return { table, hasLive };
  }

  return { table: sorted, hasLive };
}

/** Recalcula tablas de grupos con partidos FT + en vivo. */
export function projectLiveGroupStandings(
  standings: StandingsGroup[],
  fixtures: Fixture[]
): LiveStandingsProjection {
  if (standings.length === 0) {
    return { standings, liveGroupLetters: new Set(), isProjected: false };
  }

  const liveGroupLetters = new Set<string>();
  let isProjected = false;

  const nextGroups: StandingsGroup[] = standings.map((sg) => ({
    ...sg,
    league: {
      ...sg.league,
      standings: sg.league.standings.map((table) => {
        if (!table.length || !isWorldCupGroupLabel(table[0].group)) {
          return table;
        }

        const letter =
          normalizeGroupLabel(table[0].group) ||
          table[0].group.match(/Group\s+([A-L])/i)?.[1]?.toUpperCase() ||
          "";

        if (!letter) return table;

        const { table: projected, hasLive } = rebuildGroupTable(table, letter, fixtures);
        if (projected !== table) isProjected = true;
        if (hasLive) liveGroupLetters.add(letter);
        if (projected.some((r, i) => r.points !== table[i]?.points || r.rank !== table[i]?.rank)) {
          isProjected = true;
        }

        return projected;
      }),
    },
  }));

  return {
    standings: nextGroups,
    liveGroupLetters,
    isProjected: isProjected || liveGroupLetters.size > 0,
  };
}

/** Firma de marcadores en vivo + FT de fase de grupos (para refrescos). */
export function groupStageScoresSignature(fixtures: Fixture[]): string {
  return fixtures
    .filter((f) => isGroupStageFixture(f) && isCountableGroupFixture(f))
    .map(
      (f) =>
        `${f.fixture.id}:${f.goals.home ?? "-"}-${f.goals.away ?? "-"}:${f.fixture.status.short}`
    )
    .sort((a, b) => a.localeCompare(b))
    .join("|");
}

export function getLiveGroupStageFixtures(fixtures: Fixture[]): Fixture[] {
  return fixtures.filter(
    (f) => isGroupStageFixture(f) && (isFixtureLive(f.fixture.status.short) || isPlausibleLiveFixture(f))
  );
}

/** Grupos con proyección activa (para tests / UI). */
export function listProjectedGroupLetters(standings: StandingsGroup[]): string[] {
  return iterateStandingsTables(standings)
    .map((s) => s.letter)
    .filter(Boolean) as string[];
}
