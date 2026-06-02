import type { Player, PlayerStatistics, RadarStats } from "@/types";
import { parseRating } from "./formatters";
import { getStatBundle } from "./playerStats";

export const RADAR_POOL_MIN_MINUTES = 180;
export const RADAR_REFERENCE_SCORE = 5;

export interface Per90Metrics {
  goals90: number;
  assists90: number;
  keyPasses90: number;
  shotsOn90: number;
  dribblesSuccess90: number;
  dribbleSuccessRate: number;
  tackles90: number;
  interceptions90: number;
  duelsWon90: number;
  duelWinRate: number;
  foulsDrawn90: number;
  passAccuracy: number;
  rating: number;
  minutes: number;
}

export interface AxisRawScores {
  tiro: number;
  pase: number;
  dribbling: number;
  velocidad: number;
  defensa: number;
  fisico: number;
}

const RADAR_KEYS: (keyof RadarStats)[] = [
  "velocidad",
  "defensa",
  "pase",
  "dribbling",
  "tiro",
  "fisico",
];

function per90(value: number, minutes: number): number {
  if (minutes <= 0) return 0;
  return (value / minutes) * 90;
}

function rate(numerator: number, denominator: number, fallback = 0.5): number {
  if (denominator <= 0) return fallback;
  return numerator / denominator;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function round1(value: number): number {
  return Math.round(value * 10) / 10;
}

export function extractPer90Metrics(stat: PlayerStatistics): Per90Metrics {
  const minutes = stat.games.minutes ?? 0;
  const dribbleAttempts = stat.dribbles.attempts ?? 0;
  const dribbleSuccess = stat.dribbles.success ?? 0;
  const duelsTotal = stat.duels.total ?? 0;
  const duelsWon = stat.duels.won ?? 0;

  return {
    goals90: per90(stat.goals.total ?? 0, minutes),
    assists90: per90(stat.goals.assists ?? 0, minutes),
    keyPasses90: per90(stat.passes.key ?? 0, minutes),
    shotsOn90: per90(stat.shots.on ?? 0, minutes),
    dribblesSuccess90: per90(dribbleSuccess, minutes),
    dribbleSuccessRate: rate(dribbleSuccess, dribbleAttempts),
    tackles90: per90(stat.tackles.total ?? 0, minutes),
    interceptions90: per90(stat.tackles.interceptions ?? 0, minutes),
    duelsWon90: per90(duelsWon, minutes),
    duelWinRate: rate(duelsWon, duelsTotal),
    foulsDrawn90: per90(stat.fouls.drawn ?? 0, minutes),
    passAccuracy: (stat.passes.accuracy ?? 70) / 100,
    rating: parseRating(stat.games.rating) || 6,
    minutes,
  };
}

function weightedSum(weights: Record<string, number>, values: Record<string, number>): number {
  let sum = 0;
  let totalWeight = 0;
  for (const [key, weight] of Object.entries(weights)) {
    sum += (values[key] ?? 0) * weight;
    totalWeight += weight;
  }
  return totalWeight > 0 ? sum / totalWeight : 0;
}

export function computeAxisRawScores(
  metrics: Per90Metrics,
  position: string
): AxisRawScores {
  const pos = position || "M";
  const ratingNorm = metrics.rating / 10;

  if (pos === "G") {
    return {
      tiro: weightedSum({ rating: 0.6, saves: 0.4 }, { rating: ratingNorm, saves: 0.5 }),
      pase: weightedSum(
        { acc: 0.7, key: 0.3 },
        { acc: metrics.passAccuracy, key: metrics.keyPasses90 / 2 }
      ),
      dribbling: 0.3,
      velocidad: 0.4,
      defensa: weightedSum({ rating: 0.8, duels: 0.2 }, { rating: ratingNorm, duels: metrics.duelWinRate }),
      fisico: weightedSum({ duels: 0.6, drawn: 0.4 }, { duels: metrics.duelWinRate, drawn: metrics.foulsDrawn90 / 2 }),
    };
  }

  if (pos === "D") {
    return {
      tiro: weightedSum({ shots: 0.4, goals: 0.3, rating: 0.3 }, {
        shots: metrics.shotsOn90 / 1.5,
        goals: metrics.goals90 / 0.3,
        rating: ratingNorm,
      }),
      pase: weightedSum({ acc: 0.4, key: 0.35, assists: 0.25 }, {
        acc: metrics.passAccuracy,
        key: metrics.keyPasses90 / 2,
        assists: metrics.assists90 / 0.3,
      }),
      dribbling: weightedSum({ success90: 0.6, rate: 0.4 }, {
        success90: metrics.dribblesSuccess90 / 2,
        rate: metrics.dribbleSuccessRate,
      }),
      velocidad: weightedSum({ dribbles: 0.5, duels: 0.5 }, {
        dribbles: metrics.dribblesSuccess90 / 2,
        duels: metrics.duelsWon90 / 4,
      }),
      defensa: weightedSum({ tackles: 0.45, interceptions: 0.35, rating: 0.2 }, {
        tackles: metrics.tackles90 / 3,
        interceptions: metrics.interceptions90 / 2,
        rating: ratingNorm,
      }),
      fisico: weightedSum({ duels: 0.55, rate: 0.25, drawn: 0.2 }, {
        duels: metrics.duelsWon90 / 4,
        rate: metrics.duelWinRate,
        drawn: metrics.foulsDrawn90 / 2,
      }),
    };
  }

  if (pos === "F") {
    return {
      tiro: weightedSum({ goals: 0.5, shots: 0.3, rating: 0.2 }, {
        goals: metrics.goals90 / 0.6,
        shots: metrics.shotsOn90 / 2.5,
        rating: ratingNorm,
      }),
      pase: weightedSum({ assists: 0.45, key: 0.35, acc: 0.2 }, {
        assists: metrics.assists90 / 0.35,
        key: metrics.keyPasses90 / 2,
        acc: metrics.passAccuracy,
      }),
      dribbling: weightedSum({ success90: 0.65, rate: 0.35 }, {
        success90: metrics.dribblesSuccess90 / 3,
        rate: metrics.dribbleSuccessRate,
      }),
      velocidad: weightedSum({ dribbles: 0.55, goals: 0.45 }, {
        dribbles: metrics.dribblesSuccess90 / 3,
        goals: metrics.goals90 / 0.5,
      }),
      defensa: weightedSum({ tackles: 0.6, interceptions: 0.4 }, {
        tackles: metrics.tackles90 / 2,
        interceptions: metrics.interceptions90 / 1.5,
      }),
      fisico: weightedSum({ duels: 0.5, rate: 0.3, drawn: 0.2 }, {
        duels: metrics.duelsWon90 / 5,
        rate: metrics.duelWinRate,
        drawn: metrics.foulsDrawn90 / 2.5,
      }),
    };
  }

  // M — mediocampistas / extremos
  return {
    tiro: weightedSum({ goals: 0.45, shots: 0.35, rating: 0.2 }, {
      goals: metrics.goals90 / 0.45,
      shots: metrics.shotsOn90 / 2,
      rating: ratingNorm,
    }),
    pase: weightedSum({ assists: 0.4, key: 0.35, acc: 0.25 }, {
      assists: metrics.assists90 / 0.3,
      key: metrics.keyPasses90 / 2,
      acc: metrics.passAccuracy,
    }),
    dribbling: weightedSum({ success90: 0.7, rate: 0.3 }, {
      success90: metrics.dribblesSuccess90 / 2,
      rate: metrics.dribbleSuccessRate,
    }),
    velocidad: weightedSum({ dribbles: 0.5, goals: 0.5 }, {
      dribbles: metrics.dribblesSuccess90 / 2.5,
      goals: metrics.goals90 / 0.4,
    }),
    defensa: weightedSum({ tackles: 0.55, interceptions: 0.45 }, {
      tackles: metrics.tackles90 / 2.5,
      interceptions: metrics.interceptions90 / 1.5,
    }),
    fisico: weightedSum({ duels: 0.5, rate: 0.3, drawn: 0.2 }, {
      duels: metrics.duelsWon90 / 5,
      rate: metrics.duelWinRate,
      drawn: metrics.foulsDrawn90 / 2,
    }),
  };
}

function poolMeanStd(values: number[]): { mean: number; std: number } {
  if (values.length === 0) return { mean: 0, std: 1 };
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  if (values.length === 1) return { mean, std: 1 };
  const variance =
    values.reduce((sum, v) => sum + (v - mean) ** 2, 0) / values.length;
  return { mean, std: Math.max(Math.sqrt(variance), 0.05) };
}

function zScoreToRadar(value: number, mean: number, std: number): number {
  return round1(clamp(RADAR_REFERENCE_SCORE + ((value - mean) / std) * 2, 0, 10));
}

export function mundialAverageRadar(): RadarStats {
  return {
    velocidad: RADAR_REFERENCE_SCORE,
    defensa: RADAR_REFERENCE_SCORE,
    pase: RADAR_REFERENCE_SCORE,
    dribbling: RADAR_REFERENCE_SCORE,
    tiro: RADAR_REFERENCE_SCORE,
    fisico: RADAR_REFERENCE_SCORE,
  };
}

/** Jugadores del pool con minutos de club suficientes para el radar. */
export function eligibleRadarPoolPlayers(
  pool: Player[],
  minMinutes = RADAR_POOL_MIN_MINUTES
): Player[] {
  return pool
    .map(playerForClubRadar)
    .filter((p): p is Player => p != null)
    .filter((p) => (p.statistics[0]?.games.minutes ?? 0) >= minMinutes);
}

/**
 * Promedio real del radar entre todos los convocados al Mundial.
 * Promedia las métricas crudas (cada jugador con su posición) y normaliza
 * contra el pool de la posición comparada para que la escala coincida con el jugador.
 */
export function computeMundialAverageRadar(
  pool: Player[],
  comparePosition: string
): RadarStats {
  const eligible = eligibleRadarPoolPlayers(pool);
  if (eligible.length === 0) return mundialAverageRadar();

  const allRaw = eligible.map((p) => {
    const stat = p.statistics[0];
    const pos = stat.games.position ?? "M";
    return computeAxisRawScores(extractPer90Metrics(stat), pos);
  });

  const avgRaw = {} as AxisRawScores;
  for (const key of RADAR_KEYS) {
    avgRaw[key] = allRaw.reduce((sum, r) => sum + r[key], 0) / allRaw.length;
  }

  const poolScores = buildPoolAxisScores(pool, comparePosition);
  return normalizeAxisScoresToRadar(avgRaw, poolScores);
}

export function playerForClubRadar(player: Player): Player | null {
  const club = getStatBundle(player).club;
  if (!club || (club.games.minutes ?? 0) < 1) return null;
  return { ...player, statistics: [club] };
}

export function buildPoolAxisScores(
  pool: Player[],
  position: string,
  minMinutes = RADAR_POOL_MIN_MINUTES
): AxisRawScores[] {
  return pool
    .map(playerForClubRadar)
    .filter((p): p is Player => p != null)
    .filter((p) => (p.statistics[0]?.games.minutes ?? 0) >= minMinutes)
    .filter((p) => (p.statistics[0]?.games.position ?? "M") === position)
    .map((p) =>
      computeAxisRawScores(
        extractPer90Metrics(p.statistics[0]),
        p.statistics[0].games.position ?? position
      )
    );
}

export function normalizeAxisScoresToRadar(
  raw: AxisRawScores,
  poolScores: AxisRawScores[]
): RadarStats {
  if (poolScores.length === 0) {
    return {
      velocidad: round1(clamp(raw.velocidad * 5 + 2.5, 0, 10)),
      defensa: round1(clamp(raw.defensa * 5 + 2.5, 0, 10)),
      pase: round1(clamp(raw.pase * 5 + 2.5, 0, 10)),
      dribbling: round1(clamp(raw.dribbling * 5 + 2.5, 0, 10)),
      tiro: round1(clamp(raw.tiro * 5 + 2.5, 0, 10)),
      fisico: round1(clamp(raw.fisico * 5 + 2.5, 0, 10)),
    };
  }

  const result = {} as RadarStats;
  for (const key of RADAR_KEYS) {
    const poolValues = poolScores.map((s) => s[key]);
    const { mean, std } = poolMeanStd(poolValues);
    result[key] = zScoreToRadar(raw[key], mean, std);
  }
  return result;
}

export function computePlayerRadar(
  stat: PlayerStatistics,
  position: string,
  pool: Player[] = []
): RadarStats {
  const raw = computeAxisRawScores(extractPer90Metrics(stat), position);
  const poolScores = buildPoolAxisScores(pool, position);
  return normalizeAxisScoresToRadar(raw, poolScores);
}

export function computePlayerRadarFromPlayer(
  player: Player,
  pool: Player[] = []
): RadarStats | null {
  const clubPlayer = playerForClubRadar(player);
  if (!clubPlayer) return null;
  const stat = clubPlayer.statistics[0];
  const position = stat.games.position ?? "M";
  return computePlayerRadar(stat, position, pool);
}
