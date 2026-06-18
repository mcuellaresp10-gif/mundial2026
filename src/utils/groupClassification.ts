import type { Fixture, StandingTeam, StandingsGroup } from "@/types";
import {
  COLOMBIA_MIN_CLASSIFICATION_PROB,
  GROUP_MATCHES_PER_TEAM,
  MAX_CLASSIFICATION_PROB,
  MIN_CLASSIFICATION_PROB,
} from "@/lib/utils";
import {
  getTeamPriorStrength,
  isColombiaTeam,
} from "@/data/teamStrengthPriors";
import { formatGroupFromRound } from "./formatters";

export interface TeamGroupState {
  teamId: number;
  teamName: string;
  points: number;
  goalsFor: number;
  goalsAgainst: number;
  priorStrength: number;
}

export interface MatchOutcomeProbs {
  homeWin: number;
  draw: number;
  awayWin: number;
}

export interface ClassificationSimResult {
  probability: number;
  probFirst: number;
  probSecond: number;
  probBestThird: number;
  probClassify: number;
  simulations: number;
  qualifiedCount: number;
  pendingMatchesPerTeam: number;
  method: "monte_carlo" | "mathematical" | "final_table";
}

export interface TeamOutcomeProbs {
  probFirst: number;
  probSecond: number;
  probBestThird: number;
  probClassify: number;
}

export interface TournamentGroupInput {
  groupStandings: StandingTeam[];
  groupFixturesForSim: Fixture[];
  groupLabel: string;
  isPreTournament: boolean;
}

export interface GroupContextResolved {
  groupStandings: StandingTeam[];
  groupFixturesForSim: Fixture[];
  pendingMatchesPerTeam: number;
  groupLabel: string;
  isPreTournament: boolean;
}

export type H2HMap = Map<string, Fixture[]>;

const DEFAULT_SIMULATIONS = 1000;
const DIRECT_QUALIFY_SPOTS = 2;
const BEST_THIRD_SPOTS = 8;
const BASE_DRAW = 0.12;
const HOME_ADVANTAGE = 1.5;
const H2H_WEIGHT_PRE_TOURNAMENT = 0.4;

export function pairKey(a: number, b: number): string {
  return a < b ? `${a}-${b}` : `${b}-${a}`;
}

export function extractGroupStandings(
  standings: StandingsGroup[],
  teamId: number
): StandingTeam[] | null {
  for (const sg of standings) {
    for (const group of sg.league.standings) {
      if (group.some((s) => s.team.id === teamId)) {
        return group;
      }
    }
  }
  return null;
}

/** Grupos A–L de la fase de grupos (excluye ranking de terceros, etc.). */
export function isWorldCupGroupLabel(group: string): boolean {
  return /^Group\s+[A-L]$/i.test(group.trim());
}

/** Un líder por cada grupo A–L (máx. 12). */
export function extractGroupStageLeaders(standings: StandingsGroup[]): StandingTeam[] {
  const leaders: StandingTeam[] = [];
  const seen = new Set<string>();

  for (const sg of standings) {
    for (const group of sg.league.standings) {
      const leader = group[0];
      if (!leader || !isWorldCupGroupLabel(leader.group)) continue;
      const key = leader.group.trim().toUpperCase();
      if (seen.has(key)) continue;
      seen.add(key);
      leaders.push(leader);
    }
  }

  return leaders.sort((a, b) => a.group.localeCompare(b.group, "es"));
}

export function getGroupTeamIds(group: StandingTeam[]): Set<number> {
  return new Set(group.map((s) => s.team.id));
}

export function isPreTournamentGroup(groupStandings: StandingTeam[]): boolean {
  return groupStandings.every((s) => s.all.played === 0);
}

export function normalizeGroupLabel(group: string): string {
  const match = group.match(/Group\s*([A-L])/i);
  if (match) return match[1].toUpperCase();
  const grMatch = group.match(/Grupo\s*([A-L])/i);
  if (grMatch) return grMatch[1].toUpperCase();
  return group.trim();
}

function isGroupStageFixture(f: Fixture): boolean {
  const round = f.league.round.toLowerCase();
  return round.includes("group") || round.includes("grupo");
}

function filterByLetter(
  fixtures: Fixture[],
  groupTeamIds: Set<number>,
  groupLabel: string
): Fixture[] {
  const letter = normalizeGroupLabel(groupLabel);
  return fixtures.filter((f) => {
    if (f.fixture.status.short !== "NS") return false;
    if (!groupTeamIds.has(f.teams.home.id) || !groupTeamIds.has(f.teams.away.id)) {
      return false;
    }
    const round = f.league.round.toLowerCase();
    const formatted = formatGroupFromRound(f.league.round).toLowerCase();
    return (
      round.includes(`group ${letter.toLowerCase()}`) ||
      formatted.includes(letter.toLowerCase())
    );
  });
}

/** Todos los NS entre equipos del grupo (fallback sin depender del texto del round). */
export function filterPendingGroupFixturesFallback(
  fixtures: Fixture[],
  groupTeamIds: Set<number>
): Fixture[] {
  return fixtures.filter((f) => {
    if (f.fixture.status.short !== "NS") return false;
    if (!groupTeamIds.has(f.teams.home.id) || !groupTeamIds.has(f.teams.away.id)) {
      return false;
    }
    return isGroupStageFixture(f);
  });
}

export function filterPendingGroupFixtures(
  fixtures: Fixture[],
  groupTeamIds: Set<number>,
  groupLabel: string
): Fixture[] {
  const byLetter = filterByLetter(fixtures, groupTeamIds, groupLabel);
  if (byLetter.length >= 3) return dedupeFixtures(byLetter);

  const fallback = filterPendingGroupFixturesFallback(fixtures, groupTeamIds);
  if (fallback.length >= 3) return dedupeFixtures(fallback);

  return dedupeFixtures(
    fixtures.filter((f) => {
      if (f.fixture.status.short !== "NS") return false;
      return (
        groupTeamIds.has(f.teams.home.id) && groupTeamIds.has(f.teams.away.id)
      );
    })
  );
}

export function dedupeFixtures(fixtures: Fixture[]): Fixture[] {
  const byId = new Map<number, Fixture>();
  for (const f of fixtures) {
    byId.set(f.fixture.id, f);
  }
  return Array.from(byId.values());
}

export function countPendingMatchesForTeam(
  fixtures: Fixture[],
  teamId: number
): number {
  return fixtures.filter(
    (f) =>
      f.fixture.status.short === "NS" &&
      (f.teams.home.id === teamId || f.teams.away.id === teamId)
  ).length;
}

export function getUniqueGroupPairs(teamIds: number[]): [number, number][] {
  const pairs: [number, number][] = [];
  for (let i = 0; i < teamIds.length; i++) {
    for (let j = i + 1; j < teamIds.length; j++) {
      pairs.push([teamIds[i], teamIds[j]]);
    }
  }
  return pairs;
}

export function getAllTournamentGroupPairs(groups: TournamentGroupInput[]): [number, number][] {
  const pairs: [number, number][] = [];
  const seen = new Set<string>();
  for (const group of groups) {
    const teamIds = group.groupStandings.map((s) => s.team.id);
    for (const [a, b] of getUniqueGroupPairs(teamIds)) {
      const key = pairKey(a, b);
      if (seen.has(key)) continue;
      seen.add(key);
      pairs.push([a, b]);
    }
  }
  return pairs;
}

function standingToState(s: StandingTeam, isPreTournament: boolean): TeamGroupState {
  return {
    teamId: s.team.id,
    teamName: s.team.name,
    points: s.points,
    goalsFor: s.all.goals.for,
    goalsAgainst: s.all.goals.against,
    priorStrength: getTeamPriorStrength(
      s.team.name,
      s.points,
      s.all.played,
      s.all.goals.for,
      s.all.goals.against,
      isPreTournament
    ),
  };
}

function cloneStates(states: TeamGroupState[]): Map<number, TeamGroupState> {
  return new Map(states.map((s) => [s.teamId, { ...s }]));
}

function teamStrengthFromState(state: TeamGroupState): number {
  const gd = state.goalsFor - state.goalsAgainst;
  const form = state.points * 3 + gd + state.goalsFor * 0.15;
  return state.priorStrength + form;
}

function buildOutcomeProbsFromStrength(
  homeId: number,
  awayId: number,
  states: TeamGroupState[]
): MatchOutcomeProbs {
  const home = states.find((s) => s.teamId === homeId);
  const away = states.find((s) => s.teamId === awayId);
  if (!home || !away) {
    return { homeWin: 0.33, draw: BASE_DRAW, awayWin: 0.55 };
  }

  const hStr = teamStrengthFromState(home) + HOME_ADVANTAGE;
  const aStr = teamStrengthFromState(away);
  const draw = BASE_DRAW;
  const remaining = 1 - draw;
  const total = hStr + aStr || 1;

  return {
    homeWin: remaining * (hStr / total),
    draw,
    awayWin: remaining * (aStr / total),
  };
}

function blendProbs(
  a: MatchOutcomeProbs,
  b: MatchOutcomeProbs,
  weightA: number
): MatchOutcomeProbs {
  const wB = 1 - weightA;
  let hw = a.homeWin * weightA + b.homeWin * wB;
  let d = a.draw * weightA + b.draw * wB;
  let aw = a.awayWin * weightA + b.awayWin * wB;
  const sum = hw + d + aw || 1;
  hw /= sum;
  d /= sum;
  aw /= sum;
  return { homeWin: hw, draw: d, awayWin: aw };
}

export function buildOutcomeProbsFromH2H(
  h2h: Fixture[],
  homeId: number,
  awayId: number,
  states: TeamGroupState[],
  isPreTournament: boolean
): MatchOutcomeProbs {
  const fromStrength = buildOutcomeProbsFromStrength(homeId, awayId, states);
  const finished = h2h.filter((f) => f.fixture.status.short === "FT");
  if (finished.length === 0) {
    return fromStrength;
  }

  let homeWins = 0;
  let draws = 0;
  let awayWins = 0;

  for (const f of finished) {
    const hg = f.goals.home ?? 0;
    const ag = f.goals.away ?? 0;
    const matchHomeId = f.teams.home.id;
    const matchAwayId = f.teams.away.id;

    if (
      ![matchHomeId, matchAwayId].includes(homeId) ||
      ![matchHomeId, matchAwayId].includes(awayId)
    ) {
      continue;
    }

    if (hg === ag) {
      draws++;
      continue;
    }

    const homeIdWon =
      (matchHomeId === homeId && hg > ag) || (matchAwayId === homeId && ag > hg);

    if (homeIdWon) homeWins++;
    else awayWins++;
  }

  const total = homeWins + draws + awayWins;
  if (total === 0) {
    return fromStrength;
  }

  let hw = homeWins / total;
  let d = Math.max(draws / total, BASE_DRAW);
  let aw = awayWins / total;
  const sum = hw + d + aw;
  hw /= sum;
  d /= sum;
  aw /= sum;

  const fromH2H = { homeWin: hw, draw: d, awayWin: aw };

  if (isPreTournament) {
    return blendProbs(fromH2H, fromStrength, H2H_WEIGHT_PRE_TOURNAMENT);
  }
  return blendProbs(fromH2H, fromStrength, 0.55);
}

function applyOutcome(
  states: Map<number, TeamGroupState>,
  homeId: number,
  awayId: number,
  outcome: "HW" | "D" | "AW"
): void {
  const home = states.get(homeId)!;
  const away = states.get(awayId)!;

  let hg: number;
  let ag: number;
  if (outcome === "HW") {
    hg = 1;
    ag = 0;
  } else if (outcome === "AW") {
    hg = 0;
    ag = 1;
  } else {
    hg = 1;
    ag = 1;
  }

  home.goalsFor += hg;
  home.goalsAgainst += ag;
  away.goalsFor += ag;
  away.goalsAgainst += hg;

  if (hg > ag) home.points += 3;
  else if (hg === ag) {
    home.points += 1;
    away.points += 1;
  } else away.points += 3;
}

export function sortGroupStates(states: TeamGroupState[]): TeamGroupState[] {
  return [...states].sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    const gdA = a.goalsFor - a.goalsAgainst;
    const gdB = b.goalsFor - b.goalsAgainst;
    if (gdB !== gdA) return gdB - gdA;
    return b.goalsFor - a.goalsFor;
  });
}

export function getGroupRank(states: TeamGroupState[], teamId: number): number {
  const sorted = sortGroupStates(states);
  const idx = sorted.findIndex((s) => s.teamId === teamId);
  return idx >= 0 ? idx + 1 : 0;
}

export function pickBestThirdQualifiers(groupFinalStates: TeamGroupState[][]): Set<number> {
  const thirds: TeamGroupState[] = [];
  for (const states of groupFinalStates) {
    const sorted = sortGroupStates(states);
    if (sorted.length >= 3) {
      thirds.push(sorted[2]);
    }
  }
  const ranked = sortGroupStates(thirds);
  return new Set(ranked.slice(0, BEST_THIRD_SPOTS).map((s) => s.teamId));
}

function isQualified(states: TeamGroupState[], teamId: number): boolean {
  return getGroupRank(states, teamId) <= DIRECT_QUALIFY_SPOTS;
}

type OutcomeTriple = "HW" | "D" | "AW";
const OUTCOMES: OutcomeTriple[] = ["HW", "D", "AW"];

function simulateFixtures(
  baseStates: TeamGroupState[],
  pendingFixtures: Fixture[],
  outcomeProbs: Map<number, MatchOutcomeProbs>
): TeamGroupState[] {
  const states = cloneStates(baseStates);

  for (const f of pendingFixtures) {
    const probs = outcomeProbs.get(f.fixture.id);
    if (!probs) continue;
    const r = Math.random();
    let outcome: OutcomeTriple;
    if (r < probs.homeWin) outcome = "HW";
    else if (r < probs.homeWin + probs.draw) outcome = "D";
    else outcome = "AW";
    applyOutcome(states, f.teams.home.id, f.teams.away.id, outcome);
  }

  return Array.from(states.values());
}

function buildOutcomeProbsMap(
  pendingFixtures: Fixture[],
  baseStates: TeamGroupState[],
  h2hMap: H2HMap,
  isPreTournament: boolean
): Map<number, MatchOutcomeProbs> {
  const map = new Map<number, MatchOutcomeProbs>();
  for (const f of pendingFixtures) {
    const key = pairKey(f.teams.home.id, f.teams.away.id);
    const h2h = h2hMap.get(key) ?? [];
    map.set(
      f.fixture.id,
      buildOutcomeProbsFromH2H(
        h2h,
        f.teams.home.id,
        f.teams.away.id,
        baseStates,
        isPreTournament
      )
    );
  }
  return map;
}

function enumerateMathematicalStatus(
  teamId: number,
  baseStates: TeamGroupState[],
  pendingFixtures: Fixture[],
  isPreTournament: boolean
): "qualified" | "eliminated" | "undecided" {
  if (isPreTournament) {
    if (pendingFixtures.length === 0) return "undecided";
  } else if (pendingFixtures.length === 0) {
    return isQualified(baseStates, teamId) ? "qualified" : "eliminated";
  }

  let qualifiedCount = 0;
  let total = 0;
  const n = pendingFixtures.length;
  const maxCombos = Math.pow(3, n);

  if (maxCombos > 2187) return "undecided";

  for (let mask = 0; mask < maxCombos; mask++) {
    const states = cloneStates(baseStates);
    let combo = mask;
    for (const f of pendingFixtures) {
      const idx = combo % 3;
      combo = Math.floor(combo / 3);
      applyOutcome(states, f.teams.home.id, f.teams.away.id, OUTCOMES[idx]);
    }
    total++;
    if (isQualified(Array.from(states.values()), teamId)) qualifiedCount++;
  }

  if (qualifiedCount === total) return "qualified";
  if (qualifiedCount === 0 && !isPreTournament) return "eliminated";
  return "undecided";
}

function finalizeProbability(
  raw: number,
  teamName: string,
  isPreTournament: boolean
): number {
  let p = raw;
  if (isColombiaTeam(teamName) && isPreTournament) {
    p = Math.max(p, COLOMBIA_MIN_CLASSIFICATION_PROB);
  }
  return Math.round(
    Math.min(MAX_CLASSIFICATION_PROB, Math.max(MIN_CLASSIFICATION_PROB, p))
  );
}

function clampOutcomePct(raw: number): number {
  return Math.round(Math.min(100, Math.max(0, raw)));
}

function buildVirtualGroupFixtures(
  groupStandings: StandingTeam[],
  groupLabel: string
): Fixture[] {
  let virtualId = -1;
  return getUniqueGroupPairs(groupStandings.map((s) => s.team.id)).map(
    ([homeId, awayId]) => {
      const home = groupStandings.find((s) => s.team.id === homeId)!;
      const away = groupStandings.find((s) => s.team.id === awayId)!;
      virtualId -= 1;
      return {
        fixture: {
          id: virtualId,
          referee: null,
          timezone: "UTC",
          date: "",
          timestamp: 0,
          periods: { first: null, second: null },
          venue: { id: 0, name: "", city: "" },
          status: { long: "Not Started", short: "NS", elapsed: null },
        },
        league: {
          id: 1,
          name: "World Cup",
          country: "World",
          logo: "",
          flag: null,
          season: 2026,
          round: groupLabel,
        },
        teams: {
          home: { id: home.team.id, name: home.team.name, logo: "", winner: null },
          away: { id: away.team.id, name: away.team.name, logo: "", winner: null },
        },
        goals: { home: null, away: null },
        score: {
          halftime: { home: null, away: null },
          fulltime: { home: null, away: null },
          extratime: { home: null, away: null },
          penalty: { home: null, away: null },
        },
      } satisfies Fixture;
    }
  );
}

function getFixturesForSimulation(group: TournamentGroupInput): Fixture[] {
  if (group.groupFixturesForSim.length > 0) return group.groupFixturesForSim;
  if (group.isPreTournament) {
    return buildVirtualGroupFixtures(group.groupStandings, group.groupLabel);
  }
  return [];
}

function buildTeamNameMap(groups: TournamentGroupInput[]): Map<number, string> {
  const map = new Map<number, string>();
  for (const group of groups) {
    for (const s of group.groupStandings) {
      map.set(s.team.id, s.team.name);
    }
  }
  return map;
}

function initOutcomeCounts(teamIds: number[]) {
  const first = new Map<number, number>();
  const second = new Map<number, number>();
  const bestThird = new Map<number, number>();
  for (const id of teamIds) {
    first.set(id, 0);
    second.set(id, 0);
    bestThird.set(id, 0);
  }
  return { first, second, bestThird };
}

function countsToOutcomes(
  teamId: number,
  teamName: string,
  counts: ReturnType<typeof initOutcomeCounts>,
  runs: number,
  isPreTournament: boolean
): TeamOutcomeProbs {
  if (runs <= 0) {
    return { probFirst: 0, probSecond: 0, probBestThird: 0, probClassify: 0 };
  }
  const probFirst = clampOutcomePct(((counts.first.get(teamId) ?? 0) / runs) * 100);
  const probSecond = clampOutcomePct(((counts.second.get(teamId) ?? 0) / runs) * 100);
  const probBestThird = clampOutcomePct(
    ((counts.bestThird.get(teamId) ?? 0) / runs) * 100
  );
  const probClassify = finalizeProbability(
    probFirst + probSecond + probBestThird,
    teamName,
    isPreTournament
  );
  return { probFirst, probSecond, probBestThird, probClassify };
}

function outcomesToSimResult(
  outcomes: TeamOutcomeProbs,
  options: {
    simulations: number;
    qualifiedCount: number;
    pendingMatchesPerTeam: number;
    method: ClassificationSimResult["method"];
  }
): ClassificationSimResult {
  return {
    probability: outcomes.probClassify,
    probFirst: outcomes.probFirst,
    probSecond: outcomes.probSecond,
    probBestThird: outcomes.probBestThird,
    probClassify: outcomes.probClassify,
    simulations: options.simulations,
    qualifiedCount: options.qualifiedCount,
    pendingMatchesPerTeam: options.pendingMatchesPerTeam,
    method: options.method,
  };
}

export function simulateTournamentOutcomeProbabilities(
  groups: TournamentGroupInput[],
  h2hMap: H2HMap,
  simulations = DEFAULT_SIMULATIONS
): Map<number, TeamOutcomeProbs> {
  const result = new Map<number, TeamOutcomeProbs>();
  if (groups.length === 0) return result;

  const teamNameMap = buildTeamNameMap(groups);
  const allTeamIds = [...teamNameMap.keys()];
  const counts = initOutcomeCounts(allTeamIds);
  const isPreTournament = groups.every((g) => g.isPreTournament);

  const groupPrepared = groups.map((group) => {
    const baseStates = group.groupStandings.map((s) =>
      standingToState(s, group.isPreTournament)
    );
    const pending = getFixturesForSimulation(group);
    const outcomeProbs = buildOutcomeProbsMap(
      pending,
      baseStates,
      h2hMap,
      group.isPreTournament
    );
    return { group, baseStates, pending, outcomeProbs };
  });

  const hasSimWork = groupPrepared.some((g) => g.pending.length > 0);
  const runs = hasSimWork ? simulations : 0;

  for (let i = 0; i < runs; i++) {
    const groupFinalStates: TeamGroupState[][] = [];

    for (const prepared of groupPrepared) {
      const finalStates =
        prepared.pending.length > 0
          ? simulateFixtures(
              prepared.baseStates,
              prepared.pending,
              prepared.outcomeProbs
            )
          : prepared.baseStates;
      groupFinalStates.push(finalStates);

      for (const state of finalStates) {
        const rank = getGroupRank(finalStates, state.teamId);
        if (rank === 1) {
          counts.first.set(state.teamId, (counts.first.get(state.teamId) ?? 0) + 1);
        } else if (rank === 2) {
          counts.second.set(state.teamId, (counts.second.get(state.teamId) ?? 0) + 1);
        }
      }
    }

    const bestThirds = pickBestThirdQualifiers(groupFinalStates);
    for (const teamId of bestThirds) {
      counts.bestThird.set(teamId, (counts.bestThird.get(teamId) ?? 0) + 1);
    }
  }

  if (runs === 0) {
    for (const teamId of allTeamIds) {
      const teamName = teamNameMap.get(teamId) ?? "";
      const prior = getTeamPriorStrength(teamName, 0, 0, 0, 0, true);
      const rawClassify = Math.min(
        85,
        Math.max(MIN_CLASSIFICATION_PROB, Math.round(prior * 0.85))
      );
      const probClassify = finalizeProbability(rawClassify, teamName, isPreTournament);
      result.set(teamId, {
        probFirst: clampOutcomePct(Math.round(probClassify * 0.35)),
        probSecond: clampOutcomePct(Math.round(probClassify * 0.35)),
        probBestThird: clampOutcomePct(Math.round(probClassify * 0.3)),
        probClassify,
      });
    }
    return result;
  }

  for (const teamId of allTeamIds) {
    const teamName = teamNameMap.get(teamId) ?? "";
    result.set(
      teamId,
      countsToOutcomes(teamId, teamName, counts, runs, isPreTournament)
    );
  }

  return result;
}

export function simulateClassificationProbability(
  teamId: number,
  groupStandings: StandingTeam[],
  groupFixturesForSim: Fixture[],
  h2hMap: H2HMap,
  options: {
    isPreTournament: boolean;
    pendingMatchesPerTeam: number;
    teamName: string;
  },
  simulations = DEFAULT_SIMULATIONS,
  allGroups?: TournamentGroupInput[]
): ClassificationSimResult | null {
  const teamInGroup = groupStandings.some((s) => s.team.id === teamId);
  if (!teamInGroup) return null;

  const { isPreTournament, pendingMatchesPerTeam } = options;

  const baseStates = groupStandings.map((s) =>
    standingToState(s, isPreTournament)
  );
  const pending = groupFixturesForSim;

  const mathStatus = enumerateMathematicalStatus(
    teamId,
    baseStates,
    pending,
    isPreTournament
  );

  if (mathStatus === "qualified" && !isPreTournament) {
    const rank = getGroupRank(baseStates, teamId);
    const fixed: TeamOutcomeProbs = {
      probFirst: rank === 1 ? 100 : 0,
      probSecond: rank === 2 ? 100 : 0,
      probBestThird: 0,
      probClassify: rank <= DIRECT_QUALIFY_SPOTS ? 100 : 0,
    };
    return outcomesToSimResult(fixed, {
      simulations: 0,
      qualifiedCount: 0,
      pendingMatchesPerTeam,
      method: pending.length === 0 ? "final_table" : "mathematical",
    });
  }

  if (mathStatus === "eliminated" && !isPreTournament) {
    const rank = getGroupRank(baseStates, teamId);
    const fixed: TeamOutcomeProbs = {
      probFirst: 0,
      probSecond: 0,
      probBestThird: rank === 3 ? 0 : 0,
      probClassify: 0,
    };
    return outcomesToSimResult(fixed, {
      simulations: 0,
      qualifiedCount: 0,
      pendingMatchesPerTeam,
      method: pending.length === 0 ? "final_table" : "mathematical",
    });
  }

  const groups =
    allGroups ??
    ([
      {
        groupStandings,
        groupFixturesForSim,
        groupLabel: groupStandings[0]?.group ?? "Group",
        isPreTournament,
      },
    ] satisfies TournamentGroupInput[]);

  const tournamentMap = simulateTournamentOutcomeProbabilities(
    groups,
    h2hMap,
    simulations
  );
  const outcomes = tournamentMap.get(teamId);
  if (!outcomes) return null;

  const method: ClassificationSimResult["method"] = "monte_carlo";
  const runs = groups.some((g) => getFixturesForSimulation(g).length > 0)
    ? simulations
    : 0;

  return outcomesToSimResult(outcomes, {
    simulations: runs,
    qualifiedCount: Math.round((outcomes.probClassify / 100) * (runs || 1)),
    pendingMatchesPerTeam,
    method,
  });
}


export function resolveAllGroupContexts(
  standings: StandingsGroup[],
  fixtures: Fixture[]
): TournamentGroupInput[] {
  const results: TournamentGroupInput[] = [];
  const seen = new Set<string>();

  for (const sg of standings) {
    for (const groupStandings of sg.league.standings) {
      if (!groupStandings.length) continue;
      const groupLabel = groupStandings[0].group;
      if (!isWorldCupGroupLabel(groupLabel)) continue;
      const key = groupLabel.trim().toUpperCase();
      if (seen.has(key)) continue;
      seen.add(key);

      const teamIds = getGroupTeamIds(groupStandings);
      const isPreTournament = isPreTournamentGroup(groupStandings);
      const groupFixturesForSim = filterPendingGroupFixtures(
        fixtures,
        teamIds,
        groupLabel
      );

      results.push({
        groupStandings,
        groupFixturesForSim,
        groupLabel,
        isPreTournament,
      });
    }
  }

  return results.sort((a, b) =>
    normalizeGroupLabel(a.groupLabel).localeCompare(
      normalizeGroupLabel(b.groupLabel),
      "es"
    )
  );
}

export function resolveGroupContext(
  standings: StandingsGroup[],
  fixtures: Fixture[],
  teamId: number
): GroupContextResolved | null {
  const groupStandings = extractGroupStandings(standings, teamId);
  if (!groupStandings?.length) return null;

  const groupLabel = groupStandings[0].group;
  const teamIds = getGroupTeamIds(groupStandings);
  const isPreTournament = isPreTournamentGroup(groupStandings);

  let groupFixturesForSim = filterPendingGroupFixtures(
    fixtures,
    teamIds,
    groupLabel
  );

  let pendingMatchesPerTeam = countPendingMatchesForTeam(
    groupFixturesForSim,
    teamId
  );

  if (pendingMatchesPerTeam === 0) {
    const teamOnly = fixtures.filter(
      (f) =>
        f.fixture.status.short === "NS" &&
        (f.teams.home.id === teamId || f.teams.away.id === teamId)
    );
    pendingMatchesPerTeam = teamOnly.length;
    groupFixturesForSim = dedupeFixtures([
      ...groupFixturesForSim,
      ...teamOnly,
    ]);
  }

  if (isPreTournament && pendingMatchesPerTeam === 0) {
    pendingMatchesPerTeam = GROUP_MATCHES_PER_TEAM;
  }

  return {
    groupStandings,
    groupFixturesForSim,
    pendingMatchesPerTeam,
    groupLabel,
    isPreTournament,
  };
}
