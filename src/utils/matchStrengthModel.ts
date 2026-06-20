export interface MatchOutcomeProbs {
  homeWin: number;
  draw: number;
  awayWin: number;
}

export const BASE_DRAW_MAX = 0.12;
export const BASE_DRAW_MIN = 0.03;
/** Escala logística sobre diferencia de fuerza (0–100). Menor = favorito más dominante. */
export const ELO_STRENGTH_SCALE = 38;
export const DRAW_DECAY_K = 22;
const GAP_COMPRESS_THRESHOLD = 15;
const GAP_COMPRESS_RATE = 22;
const LAMBDA_FLOOR_MISMATCH = 0.05;
const LAMBDA_FLOOR_DEFAULT = 0.08;

export function winProbFromStrength(strengthA: number, strengthB: number): number {
  const diff = strengthB - strengthA;
  return 1 / (1 + Math.pow(10, diff / ELO_STRENGTH_SCALE));
}

export function drawProbFromStrengthGap(gap: number): number {
  const draw = BASE_DRAW_MAX * Math.exp(-Math.abs(gap) / DRAW_DECAY_K);
  return Math.max(BASE_DRAW_MIN, Math.min(BASE_DRAW_MAX, draw));
}

export function outcomeProbsFromStrength(
  strengthA: number,
  strengthB: number
): MatchOutcomeProbs {
  const draw = drawProbFromStrengthGap(strengthA - strengthB);
  const remaining = 1 - draw;
  const shareA = winProbFromStrength(strengthA, strengthB);
  const shareB = 1 - shareA;

  return {
    homeWin: remaining * shareA,
    draw,
    awayWin: remaining * shareB,
  };
}

export interface ExpectedGoalsInput {
  strengthA: number;
  strengthB: number;
  baseTotal: number;
  attackModA?: number;
  attackModB?: number;
  defenseModA?: number;
  defenseModB?: number;
  /** Gap FIFA puro para compresión de λ del débil (evita inflar favoritos por forma). */
  fifaGap?: number;
}

export function expectedGoalsFromStrength(input: ExpectedGoalsInput): {
  home: number;
  away: number;
} {
  const {
    strengthA,
    strengthB,
    baseTotal,
    attackModA = 1,
    attackModB = 1,
    defenseModA = 1,
    defenseModB = 1,
    fifaGap,
  } = input;

  const shareA = winProbFromStrength(strengthA, strengthB);
  const gap = strengthA - strengthB;
  const compressGap = fifaGap ?? gap;

  let lambdaA = baseTotal * (0.35 + 0.65 * shareA) * attackModA * (1 / defenseModB);
  let lambdaB = baseTotal * (0.35 + 0.65 * (1 - shareA)) * attackModB * (1 / defenseModA);

  if (compressGap > GAP_COMPRESS_THRESHOLD) {
    lambdaB *= Math.exp(-(compressGap - GAP_COMPRESS_THRESHOLD) / GAP_COMPRESS_RATE);
    lambdaA *= 1 + Math.min(0.22, (compressGap - GAP_COMPRESS_THRESHOLD) / 90);
  } else if (compressGap < -GAP_COMPRESS_THRESHOLD) {
    lambdaA *= Math.exp(-(-compressGap - GAP_COMPRESS_THRESHOLD) / GAP_COMPRESS_RATE);
    lambdaB *= 1 + Math.min(0.22, (-compressGap - GAP_COMPRESS_THRESHOLD) / 90);
  }

  if (Math.abs(compressGap) > 25) {
    const weak = compressGap > 0 ? "away" : "home";
    if (weak === "away") lambdaB = Math.min(lambdaB, 0.35);
    else lambdaA = Math.min(lambdaA, 0.35);
  }

  const floor =
    Math.abs(compressGap) > 20 ? LAMBDA_FLOOR_MISMATCH : LAMBDA_FLOOR_DEFAULT;

  return {
    home: Math.max(floor, lambdaA),
    away: Math.max(floor, lambdaB),
  };
}

function poissonPMF(k: number, lambda: number): number {
  if (lambda <= 0) return k === 0 ? 1 : 0;
  let logP = -lambda + k * Math.log(lambda);
  for (let i = 2; i <= k; i++) logP -= Math.log(i);
  return Math.exp(logP);
}

export function poissonOutcomeProbs(
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

function calibrationError(
  probs: MatchOutcomeProbs,
  target: MatchOutcomeProbs,
  isMismatch: boolean,
  lambdaA?: number,
  lambdaB?: number
): number {
  if (isMismatch) {
    const drawTarget = Math.min(target.draw, 0.08);
    const drawExcess = Math.max(0, probs.draw - 0.095);
    return (
      Math.abs(probs.homeWin - target.homeWin) * 5 +
      Math.abs(probs.draw - drawTarget) * 2.5 +
      drawExcess * 15 +
      Math.abs(probs.awayWin - target.awayWin) * 0.5
    );
  }

  const la = lambdaA ?? 0;
  const lb = lambdaB ?? 0;
  const totalPenalty = Math.max(0, la + lb - 3.2) * 4;
  const highLambdaPenalty =
    Math.max(0, la - 2.4) * 3 + Math.max(0, lb - 2.4) * 3;

  return (
    Math.abs(probs.homeWin - target.homeWin) * 5 +
    Math.abs(probs.draw - target.draw) * 1.5 +
    Math.abs(probs.awayWin - target.awayWin) * 5 +
    totalPenalty +
    highLambdaPenalty
  );
}

function capBalancedLambdas(
  lambdaA: number,
  lambdaB: number,
  isMismatch: boolean
): { home: number; away: number } {
  if (isMismatch) {
    return { home: lambdaA, away: lambdaB };
  }

  let la = Math.min(lambdaA, 2.4);
  let lb = Math.min(lambdaB, 2.4);
  const maxTotal = 3.2;
  const sum = la + lb;
  if (sum > maxTotal) {
    la = (la / sum) * maxTotal;
    lb = (lb / sum) * maxTotal;
  }

  return { home: la, away: lb };
}

/** Calibra λ para acercar P(victoria A) y P(empate) al objetivo 1X2. */
export function calibrateLambdasTo1X2(
  lambdaA: number,
  lambdaB: number,
  target: MatchOutcomeProbs,
  strengthGap?: number,
  fifaGap?: number
): { home: number; away: number } {
  const absFifaGap = Math.abs(fifaGap ?? strengthGap ?? 0);
  const isMismatch = absFifaGap > 18;

  const initial = poissonOutcomeProbs(lambdaA, lambdaB);
  const initialErr = calibrationError(initial, target, isMismatch, lambdaA, lambdaB);

  if (initialErr < 0.04 && !isMismatch) {
    const capped = capBalancedLambdas(lambdaA, lambdaB, isMismatch);
    return {
      home: Math.max(LAMBDA_FLOOR_DEFAULT, capped.home),
      away: Math.max(LAMBDA_FLOOR_DEFAULT, capped.away),
    };
  }

  let bestLa = lambdaA;
  let bestLb = lambdaB;
  let bestErr = initialErr;

  const laMin = isMismatch
    ? Math.max(1.6, lambdaA * 0.85)
    : Math.max(0.35, lambdaA * 0.45);
  const laMax = isMismatch ? lambdaA * 1.35 : Math.min(2.4, lambdaA * 1.8);
  const lbMin = isMismatch ? LAMBDA_FLOOR_MISMATCH : Math.max(0.12, lambdaB * 0.35);
  const lbMax = isMismatch
    ? Math.min(0.42, Math.max(lbMin + 0.05, lambdaB * 1.05))
    : Math.min(2.4, lambdaB * 1.8);

  const laStep = 0.05;
  const lbStep = isMismatch ? 0.03 : 0.04;

  for (let la = laMin; la <= laMax; la += laStep) {
    for (let lb = lbMin; lb <= lbMax; lb += lbStep) {
      const probs = poissonOutcomeProbs(la, lb);
      const err = calibrationError(probs, target, isMismatch, la, lb);
      if (err < bestErr) {
        bestErr = err;
        bestLa = la;
        bestLb = lb;
      }
    }
  }

  const floor =
    absFifaGap > 20 ? LAMBDA_FLOOR_MISMATCH : LAMBDA_FLOOR_DEFAULT;

  const capped = capBalancedLambdas(
    Math.max(floor, bestLa),
    Math.max(floor, bestLb),
    isMismatch
  );

  return {
    home: Math.max(floor, capped.home),
    away: Math.max(floor, capped.away),
  };
}

/** Ajuste Dixon-Coles: reduce masa en marcadores bajos correlacionados. */
export function applyDixonColesAdjustment(
  matrix: number[][],
  lambdaA: number,
  lambdaB: number,
  strengthGap: number,
  fifaGap?: number
): number[][] {
  const absGap = Math.abs(fifaGap ?? strengthGap);
  if (absGap > 18) return matrix;

  const rho = absGap < 8 ? -0.08 : -0.04 * (1 - absGap / 18);
  const tau = (i: number, j: number): number => {
    if (i === 0 && j === 0) return 1 - lambdaA * lambdaB * rho;
    if (i === 0 && j === 1) return 1 + lambdaA * rho;
    if (i === 1 && j === 0) return 1 + lambdaB * rho;
    if (i === 1 && j === 1) return 1 - rho;
    return 1;
  };

  const adjusted = matrix.map((row, i) =>
    row.map((p, j) => Math.max(0, p * tau(i, j)))
  );

  const sum = adjusted.flat().reduce((acc, p) => acc + p, 0) || 1;
  return adjusted.map((row) => row.map((p) => p / sum));
}
