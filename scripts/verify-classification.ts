/**
 * Verificación local pre-Mundial: Colombia ≥55%, débiles ≥5%, breakdown coherente.
 */
import {
  getUniqueGroupPairs,
  pairKey,
  simulateClassificationProbability,
  simulateTournamentOutcomeProbabilities,
  type H2HMap,
  type TournamentGroupInput,
} from "../src/utils/groupClassification";
import type { Fixture, StandingTeam } from "../src/types";
import { MAX_CLASSIFICATION_PROB, MIN_CLASSIFICATION_PROB } from "../src/lib/utils";

function mockStanding(
  id: number,
  name: string,
  rank: number,
  group = "Group K"
): StandingTeam {
  return {
    rank,
    team: {
      id,
      name,
      code: null,
      country: name,
      founded: null,
      national: true,
      logo: "",
    },
    points: 0,
    goalsDiff: 0,
    group,
    form: null,
    status: null,
    description: null,
    all: {
      played: 0,
      win: 0,
      draw: 0,
      lose: 0,
      goals: { for: 0, against: 0 },
    },
    home: {
      played: 0,
      win: 0,
      draw: 0,
      lose: 0,
      goals: { for: 0, against: 0 },
    },
    away: {
      played: 0,
      win: 0,
      draw: 0,
      lose: 0,
      goals: { for: 0, against: 0 },
    },
    update: "",
  };
}

function mockFixture(
  id: number,
  homeId: number,
  homeName: string,
  awayId: number,
  awayName: string,
  round = "Group Stage - K"
): Fixture {
  return {
    fixture: {
      id,
      referee: null,
      timezone: "UTC",
      date: "2026-06-15T18:00:00+00:00",
      timestamp: 0,
      periods: { first: null, second: null },
      venue: { id: 1, name: "Stadium", city: "City" },
      status: { long: "Not Started", short: "NS", elapsed: null },
    },
    league: {
      id: 1,
      name: "World Cup",
      country: "World",
      logo: "",
      flag: null,
      season: 2026,
      round,
    },
    teams: {
      home: { id: homeId, name: homeName, logo: "", winner: null },
      away: { id: awayId, name: awayName, logo: "", winner: null },
    },
    goals: { home: null, away: null },
    score: {
      halftime: { home: null, away: null },
      fulltime: { home: null, away: null },
      extratime: { home: null, away: null },
      penalty: { home: null, away: null },
    },
  };
}

const colombiaId = 1001;
const franceId = 1002;
const jordanId = 1003;
const capeVerdeId = 1004;

const group: StandingTeam[] = [
  mockStanding(franceId, "France", 1),
  mockStanding(colombiaId, "Colombia", 2),
  mockStanding(jordanId, "Jordan", 3),
  mockStanding(capeVerdeId, "Cape Verde", 4),
];

const fixtures: Fixture[] = [
  mockFixture(1, franceId, "France", colombiaId, "Colombia"),
  mockFixture(2, jordanId, "Jordan", capeVerdeId, "Cape Verde"),
  mockFixture(3, franceId, "France", jordanId, "Jordan"),
  mockFixture(4, colombiaId, "Colombia", capeVerdeId, "Cape Verde"),
  mockFixture(5, franceId, "France", capeVerdeId, "Cape Verde"),
  mockFixture(6, colombiaId, "Colombia", jordanId, "Jordan"),
];

const h2hMap: H2HMap = new Map();
for (const [a, b] of getUniqueGroupPairs([colombiaId, franceId, jordanId, capeVerdeId])) {
  h2hMap.set(pairKey(a, b), []);
}

const tournamentGroup: TournamentGroupInput = {
  groupStandings: group,
  groupFixturesForSim: fixtures,
  groupLabel: "Group K",
  isPreTournament: true,
};

const tournamentMap = simulateTournamentOutcomeProbabilities(
  [tournamentGroup],
  h2hMap,
  2000
);

const cases = [
  { id: colombiaId, name: "Colombia", min: 55 },
  { id: jordanId, name: "Jordan", min: MIN_CLASSIFICATION_PROB },
  { id: capeVerdeId, name: "Cape Verde", min: MIN_CLASSIFICATION_PROB },
];

let ok = true;
for (const c of cases) {
  const outcomes = tournamentMap.get(c.id);
  const r = simulateClassificationProbability(
    c.id,
    group,
    fixtures,
    h2hMap,
    { isPreTournament: true, pendingMatchesPerTeam: 3, teamName: c.name },
    2000,
    [tournamentGroup]
  );
  const p = outcomes?.probClassify ?? r?.probability ?? -1;
  const sum =
    (outcomes?.probFirst ?? 0) +
    (outcomes?.probSecond ?? 0) +
    (outcomes?.probBestThird ?? 0);
  const sumOk = Math.abs(sum - p) <= 8;
  const pass =
    p >= c.min &&
    p <= MAX_CLASSIFICATION_PROB &&
    sumOk &&
    (outcomes?.probFirst ?? 0) >= 0 &&
    (outcomes?.probSecond ?? 0) >= 0 &&
    (outcomes?.probBestThird ?? 0) >= 0;
  console.log(
    `${pass ? "OK" : "FAIL"} ${c.name}: clasificar=${p}% (1º=${outcomes?.probFirst}% 2º=${outcomes?.probSecond}% 3º*=${outcomes?.probBestThird}%, sum=${sum}%)`
  );
  if (!pass) ok = false;
}

process.exit(ok ? 0 : 1);
