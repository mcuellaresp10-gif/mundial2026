import type { Fixture, Player, StandingTeam } from "@/types";
import { getFifaStrengthGap, getTeamPriorStrength } from "@/data/teamStrengthPriors";
import {
  estimateMatchLambdas,
  poissonSample as enginePoissonSample,
  resolveOutcomeProbsFromLambdas,
  standingToTeamGroupState,
  teamStrengthFromState,
  type MatchLambdas,
  type MatchOutcomeProbs,
  type TeamGroupState,
  DEFAULT_TOTAL_GOALS,
  MIN_TOTAL_GOALS,
} from "@/utils/matchOutcomeEngine";
import {
  applyDixonColesAdjustment,
  outcomeProbsFromStrength,
} from "@/utils/matchStrengthModel";

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
  /** Calibración club (local A / visitante B). */
  clubCalibration?: boolean;
  leagueFixtures?: Fixture[];
}

export interface ScoreProbabilityMatrix {
  matrix: number[][];
  maxHomeGoals: number;
  maxAwayGoals: number;
  mostLikely: { home: number; away: number; prob: number };
  outcomeProbs: { winA: number; draw: number; winB: number };
  expectedGoals: { home: number; away: number };
  lambdas: { home: number; away: number };
  target1X2: MatchOutcomeProbs;
  simulations: number;
  calibration?: MatchLambdas["calibration"];
}

const DEFAULT_SIMULATIONS = 8000;
const MAX_INTERNAL_GOALS = 8;
const DEFAULT_DISPLAY_MAX = 5;

export { enginePoissonSample as poissonSample };

function buildTeamGroupState(s: StandingTeam, isPreTournament: boolean): TeamGroupState {
  return standingToTeamGroupState(s, isPreTournament);
}

function poissonPMF(k: number, lambda: number): number {
  if (lambda <= 0) return k === 0 ? 1 : 0;
  let logP = -lambda + k * Math.log(lambda);
  for (let i = 2; i <= k; i++) logP -= Math.log(i);
  return Math.exp(logP);
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

function blendMatrices(a: number[][], b: number[][], weightB: number): number[][] {
  const rows = Math.max(a.length, b.length);
  const cols = Math.max(a[0]?.length ?? 0, b[0]?.length ?? 0);
  const weightA = 1 - weightB;
  const blended: number[][] = [];

  for (let i = 0; i < rows; i++) {
    const row: number[] = [];
    for (let j = 0; j < cols; j++) {
      row.push((a[i]?.[j] ?? 0) * weightA + (b[i]?.[j] ?? 0) * weightB);
    }
    blended.push(row);
  }

  const sum = blended.flat().reduce((acc, p) => acc + p, 0) || 1;
  return blended.map((row) => row.map((p) => p / sum));
}

function buildAnalyticPoissonMatrix(
  lambdaA: number,
  lambdaB: number,
  maxGoals: number
): number[][] {
  const matrix: number[][] = [];
  for (let i = 0; i <= maxGoals; i++) {
    const row: number[] = [];
    const pi = poissonPMF(i, lambdaA);
    for (let j = 0; j <= maxGoals; j++) {
      row.push(pi * poissonPMF(j, lambdaB));
    }
    matrix.push(row);
  }
  const sum = matrix.flat().reduce((acc, p) => acc + p, 0) || 1;
  return matrix.map((row) => row.map((p) => p / sum));
}

export function estimateLambdas(input: MatchSimulationInput): {
  home: number;
  away: number;
  target1X2: MatchOutcomeProbs;
  calibration?: MatchLambdas["calibration"];
} {
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
    teamAName,
    teamBName,
    clubCalibration = false,
    leagueFixtures = [],
  } = input;

  const baseTotal = Math.max(
    avgGoalsPerMatch > 0 ? avgGoalsPerMatch : DEFAULT_TOTAL_GOALS,
    MIN_TOTAL_GOALS
  );

  const homeState = standingA
    ? buildTeamGroupState(standingA, isPreTournament)
    : {
        teamId: teamAId,
        teamName: teamAName,
        points: 0,
        goalsFor: 0,
        goalsAgainst: 0,
        priorStrength: getTeamPriorStrength(teamAName, 0, 0, 0, 0, isPreTournament),
      };
  const awayState = standingB
    ? buildTeamGroupState(standingB, isPreTournament)
    : {
        teamId: teamBId,
        teamName: teamBName,
        points: 0,
        goalsFor: 0,
        goalsAgainst: 0,
        priorStrength: getTeamPriorStrength(teamBName, 0, 0, 0, 0, isPreTournament),
      };

  return estimateMatchLambdas({
    homeState,
    awayState,
    h2h,
    isPreTournament,
    baseTotalGoals: baseTotal,
    playersHome: playersA,
    playersAway: playersB,
    standingHome: standingA,
    standingAway: standingB,
    clubCalibration: clubCalibration
      ? { enabled: true, leagueFixtures }
      : undefined,
  });
}

export function runScoreSimulation(input: MatchSimulationInput): ScoreProbabilityMatrix {
  const simulations = input.simulations ?? DEFAULT_SIMULATIONS;
  const { home, away, target1X2, calibration } = estimateLambdas(input);
  const useClub = input.clubCalibration === true;
  const fifaGap = useClub
    ? (calibration?.strengthHome ?? 50) - (calibration?.strengthAway ?? 50)
    : getFifaStrengthGap(input.teamAName, input.teamBName);
  const strengthA = useClub
    ? calibration?.strengthHome ?? 50
    : input.standingA
      ? teamStrengthFromState(buildTeamGroupState(input.standingA, input.isPreTournament))
      : getTeamPriorStrength(input.teamAName, 0, 0, 0, 0, input.isPreTournament);
  const strengthB = useClub
    ? calibration?.strengthAway ?? 50
    : input.standingB
      ? teamStrengthFromState(buildTeamGroupState(input.standingB, input.isPreTournament))
      : getTeamPriorStrength(input.teamBName, 0, 0, 0, 0, input.isPreTournament);
  const strengthGap = strengthA - strengthB;

  const counts: number[][] = Array.from({ length: MAX_INTERNAL_GOALS + 1 }, () =>
    Array(MAX_INTERNAL_GOALS + 1).fill(0)
  );

  for (let s = 0; s < simulations; s++) {
    const homeGoals = Math.min(enginePoissonSample(home), MAX_INTERNAL_GOALS);
    const awayGoals = Math.min(enginePoissonSample(away), MAX_INTERNAL_GOALS);
    counts[homeGoals][awayGoals]++;
  }

  const mcMatrix = counts.map((row) => row.map((c) => c / simulations));
  const analyticMatrix = getAnalyticScoreMatrix(home, away, strengthGap, fifaGap);
  const blendWeight = Math.abs(fifaGap) > 18 ? 0.55 : 0.35;
  const fullMatrix = blendMatrices(mcMatrix, analyticMatrix, blendWeight);

  const { maxHome, maxAway } = computeDisplayBounds(fullMatrix);
  const matrix = sliceMatrix(fullMatrix, maxHome, maxAway);
  const mostLikely = findMostLikely(fullMatrix);
  const resolved = resolveOutcomeProbsFromLambdas(home, away, target1X2);
  const outcomeProbs = {
    winA: resolved.homeWin,
    draw: resolved.draw,
    winB: resolved.awayWin,
  };

  return {
    matrix,
    maxHomeGoals: maxHome,
    maxAwayGoals: maxAway,
    mostLikely,
    outcomeProbs,
    expectedGoals: { home, away },
    lambdas: { home, away },
    target1X2,
    simulations,
    calibration,
  };
}

export function getTarget1X2ForTeams(
  strengthA: number,
  strengthB: number
): MatchOutcomeProbs {
  return outcomeProbsFromStrength(strengthA, strengthB);
}

export function getAnalyticScoreMatrix(
  lambdaA: number,
  lambdaB: number,
  strengthGap: number,
  fifaGap?: number,
  maxGoals = MAX_INTERNAL_GOALS
): number[][] {
  const base = buildAnalyticPoissonMatrix(lambdaA, lambdaB, maxGoals);
  return applyDixonColesAdjustment(base, lambdaA, lambdaB, strengthGap, fifaGap);
}
