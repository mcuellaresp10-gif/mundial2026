import { describe, it } from "node:test";
import assert from "node:assert/strict";
import type { Fixture, Player, StandingTeam, Team } from "@/types";
import {
  deriveOutcomeProbsFromMatrix,
  estimateLambdas,
  poissonSample,
  runScoreSimulation,
  type MatchSimulationInput,
} from "@/utils/matchSimulation";

function makeTeam(id: number, name: string): Team {
  return {
    id,
    name,
    logo: `https://example.com/${id}.png`,
    code: "XX",
    country: name,
    founded: null,
    national: true,
  };
}

function makeRow(
  team: Team,
  points: number,
  gf: number,
  ga: number,
  played = 3
): StandingTeam {
  return {
    rank: 1,
    team,
    points,
    goalsDiff: gf - ga,
    group: "Group A",
    form: "WWW",
    status: "same",
    description: null,
    all: {
      played,
      win: Math.floor(points / 3),
      draw: points % 3,
      lose: Math.max(0, played - Math.ceil(points / 3)),
      goals: { for: gf, against: ga },
    },
    home: { played: 0, win: 0, draw: 0, lose: 0, goals: { for: 0, against: 0 } },
    away: { played: 0, win: 0, draw: 0, lose: 0, goals: { for: 0, against: 0 } },
    update: "",
  };
}

function makeH2HFixture(
  homeId: number,
  awayId: number,
  homeGoals: number,
  awayGoals: number
): Fixture {
  return {
    fixture: {
      id: Math.random(),
      referee: null,
      timezone: "UTC",
      date: "2025-01-01T00:00:00Z",
      timestamp: 0,
      periods: { first: 0, second: 90 },
      venue: { id: 1, name: "Stadium", city: "City" },
      status: { long: "Match Finished", short: "FT", elapsed: 90 },
    },
    league: {
      id: 1,
      name: "Friendlies",
      country: "World",
      logo: "",
      flag: null,
      season: 2025,
      round: "Regular",
    },
    teams: {
      home: { id: homeId, name: "Home", logo: "", winner: homeGoals > awayGoals },
      away: { id: awayId, name: "Away", logo: "", winner: awayGoals > homeGoals },
    },
    goals: { home: homeGoals, away: awayGoals },
    score: {
      halftime: { home: null, away: null },
      fulltime: { home: homeGoals, away: awayGoals },
      extratime: { home: null, away: null },
      penalty: { home: null, away: null },
    },
  };
}

function baseInput(overrides: Partial<MatchSimulationInput> = {}): MatchSimulationInput {
  const teamA = makeTeam(1, "Team A");
  const teamB = makeTeam(2, "Team B");
  return {
    teamAId: teamA.id,
    teamBId: teamB.id,
    teamAName: teamA.name,
    teamBName: teamB.name,
    standingA: makeRow(teamA, 6, 5, 2),
    standingB: makeRow(teamB, 3, 2, 4),
    h2h: [],
    playersA: [] as Player[],
    playersB: [] as Player[],
    avgGoalsPerMatch: 2.6,
    isPreTournament: false,
    simulations: 4000,
    ...overrides,
  };
}

describe("matchSimulation", () => {
  it("matrix probabilities sum to ~1", () => {
    const result = runScoreSimulation(baseInput());
    const sum = result.matrix.flat().reduce((acc, p) => acc + p, 0);
    assert.ok(sum >= 0.95 && sum <= 1.01, `sum=${sum}`);
  });

  it("stronger team gets higher expected goals and win probability", () => {
    const teamStrong = makeTeam(10, "Brazil");
    const teamWeak = makeTeam(11, "Minnow");
    const input = baseInput({
      teamAId: teamStrong.id,
      teamBId: teamWeak.id,
      teamAName: teamStrong.name,
      teamBName: teamWeak.name,
      standingA: makeRow(teamStrong, 9, 8, 1),
      standingB: makeRow(teamWeak, 0, 1, 7),
    });
    const result = runScoreSimulation(input);
    assert.ok(result.expectedGoals.home > result.expectedGoals.away);
    assert.ok(result.outcomeProbs.winA > result.outcomeProbs.winB);
  });

  it("symmetric teams produce similar lambdas", () => {
    const teamA = makeTeam(20, "Alpha");
    const teamB = makeTeam(21, "Beta");
    const input = baseInput({
      teamAId: teamA.id,
      teamBId: teamB.id,
      teamAName: teamA.name,
      teamBName: teamB.name,
      standingA: makeRow(teamA, 4, 3, 3),
      standingB: makeRow(teamB, 4, 3, 3),
    });
    const lambdas = estimateLambdas(input);
    assert.ok(Math.abs(lambdas.home - lambdas.away) < 0.35);
  });

  it("H2H dominance shifts win probability toward dominant team", () => {
    const teamA = makeTeam(30, "Colombia");
    const teamB = makeTeam(31, "Ecuador");
    const withoutH2H = runScoreSimulation(
      baseInput({
        teamAId: teamA.id,
        teamBId: teamB.id,
        teamAName: teamA.name,
        teamBName: teamB.name,
        standingA: makeRow(teamA, 4, 4, 3),
        standingB: makeRow(teamB, 4, 3, 3),
        h2h: [],
      })
    );
    const withH2H = runScoreSimulation(
      baseInput({
        teamAId: teamA.id,
        teamBId: teamB.id,
        teamAName: teamA.name,
        teamBName: teamB.name,
        standingA: makeRow(teamA, 4, 4, 3),
        standingB: makeRow(teamB, 4, 3, 3),
        h2h: [
          makeH2HFixture(teamA.id, teamB.id, 3, 0),
          makeH2HFixture(teamA.id, teamB.id, 2, 0),
          makeH2HFixture(teamB.id, teamA.id, 0, 2),
        ],
      })
    );
    assert.ok(withH2H.outcomeProbs.winA > withoutH2H.outcomeProbs.winA);
  });

  it("poissonSample mean approximates lambda", () => {
    const lambda = 1.8;
    const n = 12000;
    let sum = 0;
    for (let i = 0; i < n; i++) sum += poissonSample(lambda);
    const mean = sum / n;
    assert.ok(Math.abs(mean - lambda) < 0.08, `mean=${mean}`);
  });

  it("deriveOutcomeProbsFromMatrix aggregates win/draw/loss", () => {
    const matrix = [
      [0.2, 0.1],
      [0.15, 0.05],
    ];
    const probs = deriveOutcomeProbsFromMatrix(matrix);
    assert.equal(probs.winA, 0.15);
    assert.equal(probs.draw, 0.25);
    assert.equal(probs.winB, 0.1);
  });
});
