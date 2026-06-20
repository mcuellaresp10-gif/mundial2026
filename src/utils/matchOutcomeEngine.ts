import type { Fixture, Player, StandingTeam } from "@/types";
import { getFifaStrengthGap, getTeamPriorStrength } from "@/data/teamStrengthPriors";
import { getHostNationStrengthBonus } from "@/data/worldCupHosts";
import { getStatBundle } from "@/utils/playerStats";
import { parseRating } from "@/utils/formatters";
import {
  calibrateLambdasTo1X2,
  expectedGoalsFromStrength,
  outcomeProbsFromStrength,
  poissonOutcomeProbs,
  type MatchOutcomeProbs,
} from "@/utils/matchStrengthModel";

export type { MatchOutcomeProbs };

export interface TeamGroupState {
  teamId: number;
  teamName: string;
  points: number;
  goalsFor: number;
  goalsAgainst: number;
  priorStrength: number;
}

export interface MatchLambdas {
  home: number;
  away: number;
  target1X2: MatchOutcomeProbs;
}

export interface MatchLambdaEstimateInput {
  homeState: TeamGroupState;
  awayState: TeamGroupState;
  h2h?: Fixture[];
  isPreTournament: boolean;
  baseTotalGoals?: number;
  playersHome?: Player[];
  playersAway?: Player[];
  standingHome?: StandingTeam;
  standingAway?: StandingTeam;
}

export const DEFAULT_TOTAL_GOALS = 2.6;
export const MIN_TOTAL_GOALS = 2.4;
export const H2H_WEIGHT_PRE = 0.4;
export const H2H_WEIGHT_TOURNAMENT = 0.55;
export const H2H_WEIGHT_PRE_TOURNAMENT = 0.4;
export const STRENGTH_WEIGHT_WITH_H2H = 0.5;
export const BASE_DRAW = 0.12;
export const MAX_SIM_GOALS = 8;
const SQUAD_MOD_TOURNAMENT_BLEND = 0.5;

export function standingToTeamGroupState(
  s: StandingTeam,
  isPreTournament: boolean
): TeamGroupState {
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

export function teamStrengthFromState(state: TeamGroupState): number {
  return state.priorStrength;
}

function blendSquadMod(raw: number, isPreTournament: boolean): number {
  if (isPreTournament) return raw;
  return raw * SQUAD_MOD_TOURNAMENT_BLEND + 1 * (1 - SQUAD_MOD_TOURNAMENT_BLEND);
}

function computeSquadAttackMod(players: Player[], isPreTournament: boolean): number {
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
  const raw = Math.max(0.75, Math.min(1.35, avg / 7));
  return blendSquadMod(raw, isPreTournament);
}

function computeSquadDefenseMod(
  players: Player[],
  standing: StandingTeam | undefined,
  isPreTournament: boolean
): number {
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

  return blendSquadMod(mod, isPreTournament);
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

function buildOutcomeProbsFromStrength(
  homeId: number,
  awayId: number,
  states: TeamGroupState[]
): MatchOutcomeProbs {
  const home = states.find((s) => s.teamId === homeId);
  const away = states.find((s) => s.teamId === awayId);
  if (!home || !away) {
    const half = (1 - BASE_DRAW) / 2;
    return { homeWin: half, draw: BASE_DRAW, awayWin: half };
  }

  const hStr =
    teamStrengthFromState(home) + getHostNationStrengthBonus(home.teamName);
  const aStr =
    teamStrengthFromState(away) + getHostNationStrengthBonus(away.teamName);

  return outcomeProbsFromStrength(hStr, aStr);
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
  return blendProbs(fromH2H, fromStrength, 1 - STRENGTH_WEIGHT_WITH_H2H);
}

export function avgGoalsFromFixtures(fixtures: Fixture[]): number {
  const finished = fixtures.filter((f) => f.fixture.status.short === "FT");
  if (finished.length === 0) return DEFAULT_TOTAL_GOALS;

  let totalGoals = 0;
  for (const f of finished) {
    totalGoals += (f.goals.home ?? 0) + (f.goals.away ?? 0);
  }
  return totalGoals / finished.length;
}

/** λ calibrados + 1X2 objetivo — fuente única para simulador y Monte Carlo de grupos. */
export function estimateMatchLambdas(input: MatchLambdaEstimateInput): MatchLambdas {
  const {
    homeState,
    awayState,
    h2h = [],
    isPreTournament,
    baseTotalGoals,
    playersHome = [],
    playersAway = [],
    standingHome,
    standingAway,
  } = input;

  const baseTotal = Math.max(
    baseTotalGoals && baseTotalGoals > 0 ? baseTotalGoals : DEFAULT_TOTAL_GOALS,
    MIN_TOTAL_GOALS
  );

  const strengthA = Math.max(0.1, teamStrengthFromState(homeState));
  const strengthB = Math.max(0.1, teamStrengthFromState(awayState));
  const fifaGap = getFifaStrengthGap(homeState.teamName, awayState.teamName);

  const attackModA = computeSquadAttackMod(playersHome, isPreTournament);
  const attackModB = computeSquadAttackMod(playersAway, isPreTournament);
  const defenseModA = computeSquadDefenseMod(playersHome, standingHome, isPreTournament);
  const defenseModB = computeSquadDefenseMod(playersAway, standingAway, isPreTournament);

  let { home: lambdaA, away: lambdaB } = expectedGoalsFromStrength({
    strengthA,
    strengthB,
    baseTotal,
    attackModA,
    attackModB,
    defenseModA,
    defenseModB,
    fifaGap,
  });

  const strengthGap = strengthA - strengthB;
  const h2hRates = computeH2HGoalRates(h2h, homeState.teamId, awayState.teamId);
  if (h2hRates) {
    const w =
      Math.abs(fifaGap) > 22
        ? 0.15
        : isPreTournament
          ? H2H_WEIGHT_PRE
          : H2H_WEIGHT_TOURNAMENT;
    lambdaA = lambdaA * (1 - w) + h2hRates.rateA * w;
    lambdaB = lambdaB * (1 - w) + h2hRates.rateB * w;
  }

  const target1X2 = buildOutcomeProbsFromH2H(
    h2h,
    homeState.teamId,
    awayState.teamId,
    [homeState, awayState],
    isPreTournament
  );

  const calibrated = calibrateLambdasTo1X2(
    lambdaA,
    lambdaB,
    target1X2,
    strengthGap,
    fifaGap
  );

  return { ...calibrated, target1X2 };
}

export function resolveOutcomeProbsFromLambdas(
  home: number,
  away: number,
  target1X2: MatchOutcomeProbs
): MatchOutcomeProbs {
  const poissonOutcomes = poissonOutcomeProbs(home, away);
  const winDrift =
    Math.abs(poissonOutcomes.homeWin - target1X2.homeWin) > 0.05 ||
    Math.abs(poissonOutcomes.awayWin - target1X2.awayWin) > 0.05;

  if (winDrift) {
    return { ...target1X2 };
  }

  return {
    homeWin: poissonOutcomes.homeWin,
    draw: poissonOutcomes.draw,
    awayWin: poissonOutcomes.awayWin,
  };
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

export function sampleScoreFromLambdas(
  homeLambda: number,
  awayLambda: number,
  rng: () => number = Math.random,
  maxGoals = MAX_SIM_GOALS
): { homeGoals: number; awayGoals: number } {
  return {
    homeGoals: Math.min(poissonSample(homeLambda, rng), maxGoals),
    awayGoals: Math.min(poissonSample(awayLambda, rng), maxGoals),
  };
}
