import type { Fixture } from "@/types";
import {
  isFixtureFinished,
  isFixtureLive,
  isPlausibleLiveFixture,
} from "@/lib/liveRefresh";
import type { TeamGroupState } from "@/utils/groupClassification";
import { fairPlayPoints, type FairPlayRecord } from "@/utils/fairPlay";

export interface GroupMatchResult {
  homeId: number;
  awayId: number;
  homeGoals: number;
  awayGoals: number;
}

export interface MiniGroupStats {
  points: number;
  goalsFor: number;
  goalsAgainst: number;
}

function isGroupStageFixture(f: Fixture): boolean {
  const round = f.league.round.toLowerCase();
  return round.includes("group") || round.includes("grupo");
}

function isCountableFixture(f: Fixture): boolean {
  const status = f.fixture.status.short;
  if (isFixtureFinished(status)) return true;
  if (isFixtureLive(status) || isPlausibleLiveFixture(f)) return true;
  return false;
}

export function collectGroupMatchResults(
  fixtures: Fixture[],
  teamIds: Set<number>
): GroupMatchResult[] {
  return filterGroupStageCountableFixtures(fixtures, teamIds).map((f) => ({
    homeId: f.teams.home.id,
    awayId: f.teams.away.id,
    homeGoals: f.goals.home ?? 0,
    awayGoals: f.goals.away ?? 0,
  }));
}

export function filterGroupStageCountableFixtures(
  fixtures: Fixture[],
  teamIds: Set<number>
): Fixture[] {
  return fixtures.filter((f) => {
    if (!isGroupStageFixture(f)) return false;
    if (!isCountableFixture(f)) return false;
    return teamIds.has(f.teams.home.id) && teamIds.has(f.teams.away.id);
  });
}

export function buildMiniGroupTable(
  teamIds: Set<number>,
  matches: GroupMatchResult[]
): Map<number, MiniGroupStats> {
  const stats = new Map<number, MiniGroupStats>();
  for (const id of teamIds) {
    stats.set(id, { points: 0, goalsFor: 0, goalsAgainst: 0 });
  }

  for (const m of matches) {
    if (!teamIds.has(m.homeId) || !teamIds.has(m.awayId)) continue;

    const home = stats.get(m.homeId)!;
    const away = stats.get(m.awayId)!;

    home.goalsFor += m.homeGoals;
    home.goalsAgainst += m.awayGoals;
    away.goalsFor += m.awayGoals;
    away.goalsAgainst += m.homeGoals;

    if (m.homeGoals > m.awayGoals) {
      home.points += 3;
    } else if (m.homeGoals < m.awayGoals) {
      away.points += 3;
    } else {
      home.points += 1;
      away.points += 1;
    }
  }

  return stats;
}

function miniStatsForTeam(
  teamId: number,
  tiedIds: Set<number>,
  matches: GroupMatchResult[]
): MiniGroupStats {
  const table = buildMiniGroupTable(tiedIds, matches);
  return table.get(teamId) ?? { points: 0, goalsFor: 0, goalsAgainst: 0 };
}

function compareMiniGroup(
  aId: number,
  bId: number,
  tiedIds: Set<number>,
  matches: GroupMatchResult[]
): number {
  const a = miniStatsForTeam(aId, tiedIds, matches);
  const b = miniStatsForTeam(bId, tiedIds, matches);
  if (b.points !== a.points) return b.points - a.points;
  const gdA = a.goalsFor - a.goalsAgainst;
  const gdB = b.goalsFor - b.goalsAgainst;
  if (gdB !== gdA) return gdB - gdA;
  return b.goalsFor - a.goalsFor;
}

function compareOverall(a: TeamGroupState, b: TeamGroupState): number {
  const gdA = a.goalsFor - a.goalsAgainst;
  const gdB = b.goalsFor - b.goalsAgainst;
  if (gdB !== gdA) return gdB - gdA;
  return b.goalsFor - a.goalsFor;
}

function compareFairPlay(
  aId: number,
  bId: number,
  fairPlay: Map<number, FairPlayRecord>
): number {
  const aPts = fairPlayPoints(fairPlay.get(aId));
  const bPts = fairPlayPoints(fairPlay.get(bId));
  return aPts - bPts;
}

export function compareTeamsByTiebreakers(
  a: TeamGroupState,
  b: TeamGroupState,
  tiedIds: Set<number>,
  matches: GroupMatchResult[],
  fairPlay: Map<number, FairPlayRecord>,
  rng: () => number = Math.random
): number {
  const mini = compareMiniGroup(a.teamId, b.teamId, tiedIds, matches);
  if (mini !== 0) return mini;

  const overall = compareOverall(a, b);
  if (overall !== 0) return overall;

  const fp = compareFairPlay(a.teamId, b.teamId, fairPlay);
  if (fp !== 0) return fp;

  return rng() < 0.5 ? -1 : 1;
}

function resolveTiedBlock(
  block: TeamGroupState[],
  matches: GroupMatchResult[],
  fairPlay: Map<number, FairPlayRecord>,
  rng: () => number
): TeamGroupState[] {
  if (block.length <= 1) return block;

  const tiedIds = new Set(block.map((s) => s.teamId));
  return [...block].sort((a, b) =>
    compareTeamsByTiebreakers(a, b, tiedIds, matches, fairPlay, rng)
  );
}

export function rankGroupTeams(
  states: TeamGroupState[],
  matches: GroupMatchResult[],
  fairPlay: Map<number, FairPlayRecord> = new Map(),
  rng: () => number = Math.random
): TeamGroupState[] {
  if (states.length === 0) return [];

  const byPoints = new Map<number, TeamGroupState[]>();
  for (const state of states) {
    const bucket = byPoints.get(state.points) ?? [];
    bucket.push(state);
    byPoints.set(state.points, bucket);
  }

  const pointLevels = [...byPoints.keys()].sort((a, b) => b - a);
  const ranked: TeamGroupState[] = [];

  for (const pts of pointLevels) {
    const block = byPoints.get(pts)!;
    ranked.push(...resolveTiedBlock(block, matches, fairPlay, rng));
  }

  return ranked;
}

export function getGroupRankFromMatches(
  states: TeamGroupState[],
  teamId: number,
  matches: GroupMatchResult[],
  fairPlay: Map<number, FairPlayRecord> = new Map(),
  rng: () => number = Math.random
): number {
  const ranked = rankGroupTeams(states, matches, fairPlay, rng);
  const idx = ranked.findIndex((s) => s.teamId === teamId);
  return idx >= 0 ? idx + 1 : 0;
}

/** Compat: ranking simple sin partidos (solo PTS/DG/GF global). */
export function sortGroupStatesSimple(states: TeamGroupState[]): TeamGroupState[] {
  return rankGroupTeams(states, [], new Map(), () => 0.5);
}
