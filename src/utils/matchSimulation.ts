import type { Fixture, Player, StandingTeam } from "@/types";
import { getTeamPriorStrength } from "@/data/teamStrengthPriors";
import {
  buildOutcomeProbsFromH2H,
  type MatchOutcomeProbs,
  type TeamGroupState,
} from "@/utils/groupClassification";
import { getStatBundle } from "@/utils/playerStats";
import { parseRating } from "@/utils/formatters";

export interface MatchSimulationInput {
  teamAId: number;
  teamBId: number;
  teamAName: string;
  teamBName: string;
  standingA?: StandingTeam;
  standingB?: StandingTeam;
  h2h: Fixture[];
  playersA: Player[];
  playersB: Player[];
  avgGoalsPerMatch: number;
  isPreTournament: boolean;
  simulations?: number;
}

export interface ScoreProbabilityMatrix {
  matrix: number[][];
  maxHomeGoals: number;
  maxAwayGoals: number;
  mostLikely: { home: number; away: number; prob: number };
  outcomeProbs: { winA: number; draw: number; winB: number };
  expectedGoals: { home: number; away: number };
  lambdas: { home: number; away: number };
  simulations: number;
}

const DEFAULT_SIMULATIONS = 8000;
const MAX_INTERNAL_GOALS = 8;
const DEFAULT_DISPLAY_MAX = 5;
const DEFAULT_TOTAL_GOALS = 2.6;
const MIN_TOTAL_GOALS = 2.4;
const H2H_WEIGHT_PRE = 0.4;
const H2H_WEIGHT_TOURNAMENT = 0.55;

function buildTeamGroupState(s: StandingTeam, isPreTournament: boolean): TeamGroupState {
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

function teamStrengthFromState(state: TeamGroupState): number {
  const gd = state.goalsFor - state.goalsAgainst;
  const form = state.points * 3 + gd + state.goalsFor * 0.15;
  return state.priorStrength + form;
}

function poissonPMF(k: number, lambda: number): number {
  if (lambda <= 0) return k === 0 ? 1 : 0;
  let logP = -lambda + k * Math.log(lambda);
  for (let i = 2; i <= k; i++) logP -= Math.log(i);
  return Math.exp(logP);
}

export function poissonSample(lambda: number, rng: () => number = Math.random): number {
  if (lambda <= 0) return 0;
  const limit = Math.exp(-lambda);
  let k = 0;
  let p = 1;
  do {
    k++;
    p *= rng();
  } while (p > limit);
  return k - 1;
}

function computeSquadAttackMod(players: Player[]): number {
  if (players.length === 0) return 1;

  const scores = [...players]
    .map((p) => {
      const bundle = getStatBundle(p);
      const wc = bundle.worldCup;
      const nat = bundle.national;
      let rating = 6.5;
      let goalsPer90 = 0;

      if (wc && (wc.games.appearences ?? 0) > 0) {
        rating = parseRating(wc.games.rating) || rating;
        const minutes = Math.max(wc.games.minutes ?? 0, 90);
        goalsPer90 = ((wc.goals.total ?? 0) / minutes) * 90;
      } else if (nat && (nat.games.appearences ?? 0) > 0) {
        rating = parseRating(nat.games.rating) || rating;
        const minutes = Math.max(nat.games.minutes ?? 0, 90);
        goalsPer90 = ((nat.goals.total ?? 0) / minutes) * 90;
      }

      return rating * 0.65 + goalsPer90 * 4;
    })
    .sort((a, b) => b - a)
    .slice(0, 11);

  const avg = scores.reduce((sum, v) => sum + v, 0) / scores.length;
  return Math.max(0.75, Math.min(1.35, avg / 7));
}

function computeSquadDefenseMod(players: Player[], standing?: StandingTeam): number {
  let mod = 1;

  if (standing && standing.all.played > 0) {
    const gaPerGame = standing.all.goals.against / standing.all.played;
    mod *= Math.max(0.82, Math.min(1.18, gaPerGame / 1.1));
  }

  const defensive = players.filter((p) => {
    const pos =
      getStatBundle(p).worldCup?.games.position ??
      getStatBundle(p).national?.games.position ??
      "";
    return pos === "G" || pos === "D";
  });

  if (defensive.length > 0) {
    const avgRating =
      defensive.reduce((sum, p) => {
        const bundle = getStatBundle(p);
        const rating =
          parseRating(bundle.worldCup?.games.rating) ||
          parseRating(bundle.national?.games.rating) ||
          6.5;
        return sum + rating;
      }, 0) / defensive.length;
    mod *= Math.max(0.85, Math.min(1.15, 7 / avgRating));
  }

  return mod;
}

function computeH2HGoalRates(
  h2h: Fixture[],
  teamAId: number,
  teamBId: number
): { rateA: number; rateB: number } | null {
  const finished = h2h.filter((f) => f.fixture.status.short === "FT");
  if (finished.length === 0) return null;

  let goalsA = 0;
  let goalsB = 0;
  let count = 0;

  for (const f of finished) {
    const hg = f.goals.home ?? 0;
    const ag = f.goals.away ?? 0;
    const matchHomeId = f.teams.home.id;
    const matchAwayId = f.teams.away.id;

    if (
      ![matchHomeId, matchAwayId].includes(teamAId) ||
      ![matchHomeId, matchAwayId].includes(teamBId)
    ) {
      continue;
    }

    if (matchHomeId === teamAId) {
      goalsA += hg;
      goalsB += ag;
    } else {
      goalsA += ag;
      goalsB += hg;
    }
    count++;
  }

  if (count === 0) return null;
  return { rateA: goalsA / count, rateB: goalsB / count };
}

function poissonOutcomeProbs(
  lambdaA: number,
  lambdaB: number,
  maxGoals = 10
): MatchOutcomeProbs {
  let homeWin = 0;
  let draw = 0;
  let awayWin = 0;

  for (let i = 0; i <= maxGoals; i++) {
    const pi = poissonPMF(i, lambdaA);
    for (let j = 0; j <= maxGoals; j++) {
      const p = pi * poissonPMF(j, lambdaB);
      if (i > j) homeWin += p;
      else if (i === j) draw += p;
      else awayWin += p;
    }
  }

  const sum = homeWin + draw + awayWin || 1;
  return { homeWin: homeWin / sum, draw: draw / sum, awayWin: awayWin / sum };
}

function calibrateLambdasTo1X2(
  lambdaA: number,
  lambdaB: number,
  target: MatchOutcomeProbs
): { home: number; away: number } {
  let lo = 0.4;
  let hi = 2.5;

  for (let iter = 0; iter < 40; iter++) {
    const mid = (lo + hi) / 2;
    const probs = poissonOutcomeProbs(lambdaA * mid, lambdaB / mid);
    const err = probs.homeWin - target.homeWin;
    if (Math.abs(err) < 0.005) break;
    if (err < 0) lo = mid;
    else hi = mid;
  }

  const factor = (lo + hi) / 2;
  return {
    home: Math.max(0.15, lambdaA * factor),
    away: Math.max(0.15, lambdaB / factor),
  };
}

export function deriveOutcomeProbsFromMatrix(matrix: number[][]): {
  winA: number;
  draw: number;
  winB: number;
} {
  let winA = 0;
  let draw = 0;
  let winB = 0;

  for (let i = 0; i < matrix.length; i++) {
    for (let j = 0; j < (matrix[i]?.length ?? 0); j++) {
      const p = matrix[i][j] ?? 0;
      if (i > j) winA += p;
      else if (i === j) draw += p;
      else winB += p;
    }
  }

  return { winA, draw, winB };
}

function computeDisplayBounds(fullMatrix: number[][], defaultMax = DEFAULT_DISPLAY_MAX): {
  maxHome: number;
  maxAway: number;
} {
  const entries: { i: number; j: number; p: number }[] = [];
  for (let i = 0; i < fullMatrix.length; i++) {
    for (let j = 0; j < (fullMatrix[i]?.length ?? 0); j++) {
      entries.push({ i, j, p: fullMatrix[i][j] ?? 0 });
    }
  }
  entries.sort((a, b) => b.p - a.p);

  let covered = 0;
  let maxHome = 0;
  let maxAway = 0;
  for (const entry of entries) {
    covered += entry.p;
    maxHome = Math.max(maxHome, entry.i);
    maxAway = Math.max(maxAway, entry.j);
    if (covered >= 0.99) break;
  }

  return {
    maxHome: Math.max(defaultMax, maxHome),
    maxAway: Math.max(defaultMax, maxAway),
  };
}

function sliceMatrix(
  fullMatrix: number[][],
  maxHome: number,
  maxAway: number
): number[][] {
  const rows: number[][] = [];
  for (let i = 0; i <= maxHome; i++) {
    const row: number[] = [];
    for (let j = 0; j <= maxAway; j++) {
      row.push(fullMatrix[i]?.[j] ?? 0);
    }
    rows.push(row);
  }
  return rows;
}

function findMostLikely(matrix: number[][]): { home: number; away: number; prob: number } {
  let best = { home: 0, away: 0, prob: 0 };
  for (let i = 0; i < matrix.length; i++) {
    for (let j = 0; j < (matrix[i]?.length ?? 0); j++) {
      const p = matrix[i][j] ?? 0;
      if (p > best.prob) best = { home: i, away: j, prob: p };
    }
  }
  return best;
}

export function estimateLambdas(input: MatchSimulationInput): { home: number; away: number } {
  const {
    teamAId,
    teamBId,
    standingA,
    standingB,
    h2h,
    playersA,
    playersB,
    avgGoalsPerMatch,
    isPreTournament,
  } = input;

  const baseTotal = Math.max(
    avgGoalsPerMatch > 0 ? avgGoalsPerMatch : DEFAULT_TOTAL_GOALS,
    MIN_TOTAL_GOALS
  );

  const stateA = standingA
    ? buildTeamGroupState(standingA, isPreTournament)
    : {
        teamId: teamAId,
        teamName: input.teamAName,
        points: 0,
        goalsFor: 0,
        goalsAgainst: 0,
        priorStrength: getTeamPriorStrength(input.teamAName, 0, 0, 0, 0, isPreTournament),
      };
  const stateB = standingB
    ? buildTeamGroupState(standingB, isPreTournament)
    : {
        teamId: teamBId,
        teamName: input.teamBName,
        points: 0,
        goalsFor: 0,
        goalsAgainst: 0,
        priorStrength: getTeamPriorStrength(input.teamBName, 0, 0, 0, 0, isPreTournament),
      };

  const strengthA = Math.max(0.1, teamStrengthFromState(stateA));
  const strengthB = Math.max(0.1, teamStrengthFromState(stateB));
  const ratio = strengthA / (strengthA + strengthB);

  const attackModA = computeSquadAttackMod(playersA);
  const attackModB = computeSquadAttackMod(playersB);
  const defenseModA = computeSquadDefenseMod(playersA, standingA);
  const defenseModB = computeSquadDefenseMod(playersB, standingB);

  let lambdaA = baseTotal * ratio * attackModA * (1 / defenseModB);
  let lambdaB = baseTotal * (1 - ratio) * attackModB * (1 / defenseModA);

  const h2hRates = computeH2HGoalRates(h2h, teamAId, teamBId);
  if (h2hRates) {
    const w = isPreTournament ? H2H_WEIGHT_PRE : H2H_WEIGHT_TOURNAMENT;
    lambdaA = lambdaA * (1 - w) + h2hRates.rateA * w;
    lambdaB = lambdaB * (1 - w) + h2hRates.rateB * w;
  }

  const states = [stateA, stateB];
  const target1X2 = buildOutcomeProbsFromH2H(h2h, teamAId, teamBId, states, isPreTournament);
  return calibrateLambdasTo1X2(lambdaA, lambdaB, target1X2);
}

export function runScoreSimulation(input: MatchSimulationInput): ScoreProbabilityMatrix {
  const simulations = input.simulations ?? DEFAULT_SIMULATIONS;
  const lambdas = estimateLambdas(input);

  const counts: number[][] = Array.from({ length: MAX_INTERNAL_GOALS + 1 }, () =>
    Array(MAX_INTERNAL_GOALS + 1).fill(0)
  );

  for (let s = 0; s < simulations; s++) {
    const homeGoals = Math.min(poissonSample(lambdas.home), MAX_INTERNAL_GOALS);
    const awayGoals = Math.min(poissonSample(lambdas.away), MAX_INTERNAL_GOALS);
    counts[homeGoals][awayGoals]++;
  }

  const fullMatrix = counts.map((row) => row.map((c) => c / simulations));
  const { maxHome, maxAway } = computeDisplayBounds(fullMatrix);
  const matrix = sliceMatrix(fullMatrix, maxHome, maxAway);
  const mostLikely = findMostLikely(fullMatrix);
  const outcomeProbs = deriveOutcomeProbsFromMatrix(fullMatrix);

  return {
    matrix,
    maxHomeGoals: maxHome,
    maxAwayGoals: maxAway,
    mostLikely,
    outcomeProbs,
    expectedGoals: { home: lambdas.home, away: lambdas.away },
    lambdas,
    simulations,
  };
}
