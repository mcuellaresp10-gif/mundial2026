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
  simulations: number;
  qualifiedCount: number;
  pendingMatchesPerTeam: number;
  method: "monte_carlo" | "mathematical" | "final_table";
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
const QUALIFY_SPOTS = 2;
const BASE_DRAW = 0.12;
const HOME_ADVANTAGE = 1.5;
const H2H_WEIGHT_PRE_TOURNAMENT = 0.4;
const PRIOR_WEIGHT_PRE_TOURNAMENT = 0.6;

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
  const match = group.match(/Group\s*([A-H])/i);
  if (match) return match[1].toUpperCase();
  const grMatch = group.match(/Grupo\s*([A-H])/i);
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

function isQualified(states: TeamGroupState[], teamId: number): boolean {
  const sorted = [...states].sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    const gdA = a.goalsFor - a.goalsAgainst;
    const gdB = b.goalsFor - b.goalsAgainst;
    if (gdB !== gdA) return gdB - gdA;
    return b.goalsFor - a.goalsFor;
  });
  const rank = sorted.findIndex((s) => s.teamId === teamId) + 1;
  return rank <= QUALIFY_SPOTS;
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
  simulations = DEFAULT_SIMULATIONS
): ClassificationSimResult | null {
  const teamInGroup = groupStandings.some((s) => s.team.id === teamId);
  if (!teamInGroup) return null;

  const teamStanding = groupStandings.find((s) => s.team.id === teamId)!;
  const { isPreTournament, pendingMatchesPerTeam, teamName } = options;
  const baseStates = groupStandings.map((s) =>
    standingToState(s, isPreTournament)
  );
  const pending = groupFixturesForSim;
  const hasGroupFixtures = pending.length > 0;

  if (!hasGroupFixtures && isPreTournament) {
    const priorOnly = teamStanding
      ? getTeamPriorStrength(
          teamStanding.team.name,
          0,
          0,
          0,
          0,
          true
        )
      : DEFAULT_PRIOR_FALLBACK;
    const rawFromPrior = Math.min(
      85,
      Math.max(MIN_CLASSIFICATION_PROB, Math.round(priorOnly * 0.85))
    );
    return {
      probability: finalizeProbability(rawFromPrior, teamName, isPreTournament),
      simulations: 0,
      qualifiedCount: 0,
      pendingMatchesPerTeam,
      method: "monte_carlo",
    };
  }

  const mathStatus = enumerateMathematicalStatus(
    teamId,
    baseStates,
    pending,
    isPreTournament
  );

  if (mathStatus === "qualified" && !isPreTournament) {
    return {
      probability: finalizeProbability(100, teamName, isPreTournament),
      simulations: 0,
      qualifiedCount: 0,
      pendingMatchesPerTeam,
      method: pending.length === 0 ? "final_table" : "mathematical",
    };
  }

  if (mathStatus === "eliminated" && !isPreTournament) {
    return {
      probability: finalizeProbability(0, teamName, isPreTournament),
      simulations: 0,
      qualifiedCount: 0,
      pendingMatchesPerTeam,
      method: pending.length === 0 ? "final_table" : "mathematical",
    };
  }

  const outcomeProbs = buildOutcomeProbsMap(
    pending,
    baseStates,
    h2hMap,
    isPreTournament
  );
  let qualifiedCount = 0;
  const runs = pending.length > 0 ? simulations : 0;

  for (let i = 0; i < runs; i++) {
    const finalStates = simulateFixtures(baseStates, pending, outcomeProbs);
    if (isQualified(finalStates, teamId)) qualifiedCount++;
  }

  const rawProb =
    runs > 0
      ? Math.round((qualifiedCount / runs) * 100)
      : isPreTournament
        ? Math.round(
            (getTeamPriorStrength(teamName, 0, 0, 0, 0, true) / 100) * 50
          )
        : 50;

  return {
    probability: finalizeProbability(rawProb, teamName, isPreTournament),
    simulations: runs,
    qualifiedCount,
    pendingMatchesPerTeam,
    method: "monte_carlo",
  };
}

const DEFAULT_PRIOR_FALLBACK = 62;

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
