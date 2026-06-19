import { describe, it } from "node:test";
import assert from "node:assert/strict";
import type { Fixture, StandingTeam, StandingsGroup, Team } from "@/types";
import { projectLiveGroupStandings } from "@/utils/liveStandings";

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

function makeRow(rank: number, team: Team, group = "Group A"): StandingTeam {
  return {
    rank,
    team,
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

function makeStandings(table: StandingTeam[]): StandingsGroup[] {
  return [
    {
      league: {
        id: 1,
        name: "World Cup",
        country: "World",
        logo: "",
        flag: null,
        season: 2026,
        standings: [table],
      },
    },
  ];
}

function makeFixture(
  id: number,
  home: Team,
  away: Team,
  homeGoals: number,
  awayGoals: number,
  status: string
): Fixture {
  return {
    fixture: {
      id,
      referee: null,
      timezone: "UTC",
      date: "2026-06-15T18:00:00Z",
      timestamp: 0,
      periods: { first: 45, second: 90 },
      venue: { id: 1, name: "Stadium", city: "City" },
      status: { long: status, short: status, elapsed: status === "2H" ? 70 : 90 },
    },
    league: {
      id: 1,
      name: "World Cup",
      country: "World",
      logo: "",
      flag: null,
      season: 2026,
      round: "Group A - 2",
    },
    teams: {
      home: { id: home.id, name: home.name, logo: "", winner: homeGoals > awayGoals },
      away: { id: away.id, name: away.name, logo: "", winner: awayGoals > homeGoals },
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

describe("liveStandings", () => {
  it("projects live score into group table", () => {
    const t1 = makeTeam(1, "Colombia");
    const t2 = makeTeam(2, "Brazil");
    const t3 = makeTeam(3, "Ecuador");
    const t4 = makeTeam(4, "Peru");
    const standings = makeStandings([
      makeRow(1, t1),
      makeRow(2, t2),
      makeRow(3, t3),
      makeRow(4, t4),
    ]);

    const live = makeFixture(100, t1, t2, 2, 1, "2H");
    const result = projectLiveGroupStandings(standings, [live]);

    const table = result.standings[0].league.standings[0];
    const col = table.find((r) => r.team.id === 1)!;
    const bra = table.find((r) => r.team.id === 2)!;

    assert.equal(col.points, 3);
    assert.equal(col.all.goals.for, 2);
    assert.equal(bra.points, 0);
    assert.equal(col.rank, 1);
    assert.ok(result.liveGroupLetters.has("A"));
    assert.equal(result.isProjected, true);
  });

  it("combines FT and live fixtures", () => {
    const t1 = makeTeam(10, "A1");
    const t2 = makeTeam(11, "A2");
    const t3 = makeTeam(12, "A3");
    const t4 = makeTeam(13, "A4");
    const standings = makeStandings([
      makeRow(1, t1),
      makeRow(2, t2),
      makeRow(3, t3),
      makeRow(4, t4),
    ]);

    const ft = makeFixture(1, t3, t4, 1, 0, "FT");
    const live = makeFixture(2, t1, t2, 0, 0, "1H");
    const result = projectLiveGroupStandings(standings, [ft, live]);

    const third = result.standings[0].league.standings[0].find((r) => r.team.id === 12)!;
    assert.equal(third.points, 3);
    assert.equal(third.all.played, 1);
  });
});
