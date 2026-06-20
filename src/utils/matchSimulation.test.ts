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
import { getStrengthFromFifaRanking } from "@/data/fifaRankings";

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

  it("Portugal vs Uzbekistán favorece marcadores amplios del favorito", () => {
    const portugal = makeTeam(10, "Portugal");
    const uzbekistan = makeTeam(11, "Uzbekistan");
    const input = baseInput({
      teamAId: portugal.id,
      teamBId: uzbekistan.id,
      teamAName: portugal.name,
      teamBName: uzbekistan.name,
      standingA: undefined,
      standingB: undefined,
      isPreTournament: true,
      simulations: 12000,
    });

    const result = runScoreSimulation(input);
    const score11 = result.matrix[1]?.[1] ?? 0;
    const score20 = result.matrix[2]?.[0] ?? 0;

    assert.ok(result.outcomeProbs.winA > 0.78, `winA=${result.outcomeProbs.winA}`);
    assert.ok(result.outcomeProbs.draw < 0.1, `draw=${result.outcomeProbs.draw}`);
    assert.ok(result.expectedGoals.away < 0.75, `xG away=${result.expectedGoals.away}`);
    assert.ok(result.expectedGoals.home > 2, `xG home=${result.expectedGoals.home}`);
    assert.ok(
      [1, 2, 3].includes(result.mostLikely.home) && result.mostLikely.away <= 1,
      `mostLikely=${result.mostLikely.home}-${result.mostLikely.away}`
    );
    assert.ok(score20 > score11, `2-0=${score20} vs 1-1=${score11}`);
  });

  it("partido parejo tiene lambdas similares y empate moderado", () => {
    const colombia = makeTeam(20, "Colombia");
    const uruguay = makeTeam(21, "Uruguay");
    const input = baseInput({
      teamAId: colombia.id,
      teamBId: uruguay.id,
      teamAName: colombia.name,
      teamBName: uruguay.name,
      standingA: makeRow(colombia, 4, 4, 3),
      standingB: makeRow(uruguay, 4, 3, 3),
      isPreTournament: false,
    });
    const { home, away } = estimateLambdas(input);
    const result = runScoreSimulation(input);

    assert.ok(Math.abs(home - away) < 0.5);
    assert.ok(result.outcomeProbs.draw > 0.08 && result.outcomeProbs.draw < 0.28);
  });

  it("Colombia vs Portugal pre-torneo es equilibrado entre potencias", () => {
    const colombia = makeTeam(40, "Colombia");
    const portugal = makeTeam(41, "Portugal");
    const input = baseInput({
      teamAId: colombia.id,
      teamBId: portugal.id,
      teamAName: colombia.name,
      teamBName: portugal.name,
      standingA: undefined,
      standingB: undefined,
      isPreTournament: true,
      simulations: 8000,
    });
    const { home, away } = estimateLambdas(input);
    const result = runScoreSimulation(input);

    assert.ok(
      result.outcomeProbs.winA > 0.38 && result.outcomeProbs.winA < 0.48,
      `winA=${result.outcomeProbs.winA}`
    );
    assert.ok(
      result.outcomeProbs.winB > 0.38 && result.outcomeProbs.winB < 0.52,
      `winB=${result.outcomeProbs.winB}`
    );
    assert.ok(Math.abs(home - away) < 0.5, `λ diff=${Math.abs(home - away)}`);
    assert.ok(
      Math.abs(result.outcomeProbs.winA - result.target1X2.homeWin) < 0.05,
      `coherence winA=${result.outcomeProbs.winA} target=${result.target1X2.homeWin}`
    );
  });

  it("Colombia vs Portugal con forma no favorece extremo a Colombia", () => {
    const colombia = makeTeam(40, "Colombia");
    const portugal = makeTeam(41, "Portugal");
    const result = runScoreSimulation(
      baseInput({
        teamAId: colombia.id,
        teamBId: portugal.id,
        teamAName: colombia.name,
        teamBName: portugal.name,
        standingA: makeRow(colombia, 9, 8, 2),
        standingB: makeRow(portugal, 4, 4, 4),
        isPreTournament: false,
        simulations: 8000,
      })
    );

    assert.ok(result.outcomeProbs.winA < 0.58, `winA=${result.outcomeProbs.winA}`);
    assert.ok(
      Math.abs(result.outcomeProbs.winA - result.target1X2.homeWin) < 0.05,
      `coherence winA=${result.outcomeProbs.winA} target=${result.target1X2.homeWin}`
    );
  });

  it("simetría fixture: Brasil vs Japón no depende de localía nominal", () => {
    const brazil = makeTeam(30, "Brazil");
    const japan = makeTeam(31, "Japan");
    const asHome = runScoreSimulation(
      baseInput({
        teamAId: brazil.id,
        teamBId: japan.id,
        teamAName: brazil.name,
        teamBName: japan.name,
        isPreTournament: true,
        simulations: 8000,
      })
    );
    const asAway = runScoreSimulation(
      baseInput({
        teamAId: japan.id,
        teamBId: brazil.id,
        teamAName: japan.name,
        teamBName: brazil.name,
        isPreTournament: true,
        simulations: 8000,
      })
    );

    assert.ok(Math.abs(asHome.outcomeProbs.winA - asAway.outcomeProbs.winB) < 0.05);
    assert.ok(Math.abs(asHome.outcomeProbs.winB - asAway.outcomeProbs.winA) < 0.05);
  });
});
