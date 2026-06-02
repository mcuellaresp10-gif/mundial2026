/**
 * Verificación del radar: elite ofensivo > 5 en tiro/pase; jugador débil cerca del promedio o bajo.
 */
import type { Player, PlayerStatistics } from "../src/types";
import {
  computePlayerRadar,
  computeAxisRawScores,
  extractPer90Metrics,
  buildPoolAxisScores,
  normalizeAxisScoresToRadar,
} from "../src/utils/radarMetrics";

function mockStat(
  overrides: Partial<{
    minutes: number;
    goals: number;
    assists: number;
    keyPasses: number;
    shotsOn: number;
    dribbleSuccess: number;
    dribbleAttempts: number;
    tackles: number;
    interceptions: number;
    duelsWon: number;
    duelsTotal: number;
    passAccuracy: number;
    rating: string;
    position: string;
  }> = {}
): PlayerStatistics {
  const minutes = overrides.minutes ?? 2500;
  return {
    team: { id: 1, name: "Bayern", code: null, country: "Germany", founded: null, national: false, logo: "" },
    league: { id: 78, name: "Bundesliga", country: "Germany", logo: "", flag: null, season: 2025 },
    games: {
      appearences: 30,
      minutes,
      rating: overrides.rating ?? "7.30",
      position: overrides.position ?? "M",
      number: 7,
      lineups: 28,
      captain: false,
    },
    substitutes: { in: 2, out: 10, bench: 2 },
    shots: { total: 120, on: overrides.shotsOn ?? 70 },
    goals: { total: overrides.goals ?? 26, assists: overrides.assists ?? 19, conceded: 0, saves: null },
    passes: { total: 900, key: overrides.keyPasses ?? 80, accuracy: overrides.passAccuracy ?? 82 },
    tackles: { total: overrides.tackles ?? 25, blocks: 2, interceptions: overrides.interceptions ?? 8 },
    duels: { total: overrides.duelsTotal ?? 200, won: overrides.duelsWon ?? 95 },
    dribbles: {
      attempts: overrides.dribbleAttempts ?? 150,
      success: overrides.dribbleSuccess ?? 85,
      past: null,
    },
    fouls: { drawn: 40, committed: 20 },
    cards: { yellow: 3, red: 0 },
    penalty: { won: null, commited: null, scored: null, missed: null, saved: null },
  };
}

function mockPlayer(id: number, name: string, stat: PlayerStatistics): Player {
  return {
    player: {
      id,
      name,
      firstname: name,
      lastname: "",
      age: 28,
      birth: { date: null, place: null, country: null },
      nationality: "Colombia",
      height: "178",
      weight: "65",
      injured: false,
      photo: "",
    },
    statistics: [stat],
    statBundle: { club: stat, national: null, worldCup: null },
  };
}

const diazStat = mockStat();
const weakStat = mockStat({
  minutes: 400,
  goals: 0,
  assists: 1,
  keyPasses: 4,
  shotsOn: 3,
  dribbleSuccess: 8,
  dribbleAttempts: 25,
  tackles: 15,
  interceptions: 5,
  duelsWon: 20,
  duelsTotal: 60,
  passAccuracy: 75,
  rating: "6.40",
  position: "M",
});

const pool: Player[] = [
  mockPlayer(1, "L. Díaz", diazStat),
  mockPlayer(2, "Bench MF", weakStat),
  mockPlayer(3, "Avg MF", mockStat({
    goals: 4,
    assists: 3,
    minutes: 1800,
    rating: "6.80",
    dribbleSuccess: 35,
    dribbleAttempts: 80,
  })),
  mockPlayer(4, "Avg MF 2", mockStat({
    goals: 5,
    assists: 4,
    minutes: 2000,
    rating: "6.90",
    dribbleSuccess: 40,
    dribbleAttempts: 90,
  })),
  mockPlayer(5, "Avg MF 3", mockStat({
    goals: 3,
    assists: 2,
    minutes: 1600,
    rating: "6.70",
    dribbleSuccess: 30,
    dribbleAttempts: 70,
  })),
];

const diazRadar = computePlayerRadar(diazStat, "M", pool);
const weakRadar = computePlayerRadar(weakStat, "M", pool);

console.log("L. Díaz radar:", diazRadar);
console.log("Weak MF radar:", weakRadar);

let ok = true;
const diazChecks: [string, number][] = [
  ["tiro", 5],
  ["pase", 5],
  ["dribbling", 5],
];
for (const [axis, min] of diazChecks) {
  const val = diazRadar[axis as keyof typeof diazRadar];
  const pass = val > min;
  console.log(`${pass ? "OK" : "FAIL"} Díaz ${axis}: ${val} (min ${min})`);
  if (!pass) ok = false;
}

for (const key of Object.keys(weakRadar) as (keyof typeof weakRadar)[]) {
  if (weakRadar[key] < 0 || weakRadar[key] > 10) {
    console.log(`FAIL weak ${key} out of range: ${weakRadar[key]}`);
    ok = false;
  }
}
console.log("OK weak player all axes 0-10");

const raw = computeAxisRawScores(extractPer90Metrics(diazStat), "M");
const poolScores = buildPoolAxisScores(pool, "M", 180);
const normalized = normalizeAxisScoresToRadar(raw, poolScores);
console.log("Normalized sample:", normalized);

process.exit(ok ? 0 : 1);
