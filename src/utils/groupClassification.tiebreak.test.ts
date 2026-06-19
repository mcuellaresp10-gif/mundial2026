import { describe, it } from "node:test";
import assert from "node:assert/strict";
import type { Fixture, StandingTeam, Team } from "@/types";
import {
  simulateTournamentOutcomeProbabilities,
  type TournamentGroupInput,
} from "@/utils/groupClassification";

function makeTeam(id: number, name: string): Team {
  return {
    id,
    name,
    logo: "",
    code: "XX",
    country: name,
    founded: null,
    national: true,
  };
}

function makeRow(
  rank: number,
  team: Team,
  points: number,
  gf: number,
  ga: number,
  played: number
): StandingTeam {
  return {
    rank,
    team,
    points,
    goalsDiff: gf - ga,
    group: "Group B",
    form: null,
    status: null,
    description: null,
    all: {
      played,
      win: 0,
      draw: 0,
      lose: 0,
      goals: { for: gf, against: ga },
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

function makeFixture(
  id: number,
  home: Team,
  away: Team,
  homeGoals: number | null,
  awayGoals: number | null,
  status: string,
  round = "Group Stage - 2"
): Fixture {
  return {
    fixture: {
      id,
      referee: null,
      timezone: "UTC",
      date: "2026-06-15T00:00:00+00:00",
      timestamp: 0,
      periods: { first: null, second: null },
      venue: { id: null, name: null, city: null },
      status: { long: status, short: status, elapsed: null, extra: null },
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
      home: { id: home.id, name: home.name, logo: "", winner: null },
      away: { id: away.id, name: away.name, logo: "", winner: null },
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

describe("groupClassification tiebreak integration", () => {
  it("Monte Carlo favorece H2H cuando dos equipos empatan en puntos (Canadá Grupo B)", () => {
    const canada = makeTeam(1, "Canada");
    const rival = makeTeam(2, "Qatar");
    const third = makeTeam(3, "Team C");
    const fourth = makeTeam(4, "Team D");

    const standings = [
      makeRow(2, canada, 4, 3, 2, 2),
      makeRow(1, rival, 4, 5, 1, 2),
      makeRow(3, third, 3, 2, 3, 2),
      makeRow(4, fourth, 1, 1, 5, 2),
    ];

    const completed = [
      makeFixture(101, canada, rival, 2, 0, "FT"),
      makeFixture(102, third, fourth, 1, 0, "FT"),
      makeFixture(103, canada, third, 1, 2, "FT"),
      makeFixture(104, rival, fourth, 3, 0, "FT"),
    ];

    const pending = [makeFixture(105, third, fourth, null, null, "NS", "Group Stage - 3")];

    const group: TournamentGroupInput = {
      groupStandings: standings,
      groupFixturesForSim: pending,
      completedGroupFixtures: completed,
      groupLabel: "Group B",
      isPreTournament: false,
    };

    const probs = simulateTournamentOutcomeProbabilities([group], new Map(), new Map(), 800);
    const canadaProbs = probs.get(canada.id);
    const rivalProbs = probs.get(rival.id);

    assert.ok(canadaProbs);
    assert.ok(rivalProbs);
    assert.ok(
      canadaProbs!.probFirst + canadaProbs!.probSecond >
        rivalProbs!.probFirst + rivalProbs!.probSecond,
      `Canada ${canadaProbs!.probFirst + canadaProbs!.probSecond}% vs rival ${rivalProbs!.probFirst + rivalProbs!.probSecond}%`
    );
  });
});
