import { describe, it } from "node:test";
import assert from "node:assert/strict";
import type { Fixture, StandingTeam, StandingsGroup, Team } from "@/types";
import { projectLiveGroupStandings, rerankGroupTableWithTiebreakers } from "@/utils/liveStandings";

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

  it("includes Group Stage - 2 fixtures without letter in round", () => {
    const canada = makeTeam(40, "Canada");
    const qatar = makeTeam(41, "Qatar");
    const switzerland = makeTeam(42, "Switzerland");
    const bosnia = makeTeam(43, "Bosnia");
    const standings = makeStandings([
      makeRow(1, switzerland, "Group B"),
      makeRow(2, canada, "Group B"),
      makeRow(3, qatar, "Group B"),
      makeRow(4, bosnia, "Group B"),
    ]);

    const j1 = makeFixture(1, canada, qatar, 1, 1, "FT");
    j1.league.round = "Group Stage - 1";
    const j2 = makeFixture(2, canada, qatar, 6, 0, "FT");
    j2.league.round = "Group Stage - 2";

    const result = projectLiveGroupStandings(standings, [j1, j2]);
    const canadaRow = result.standings[0].league.standings[0].find((r) => r.team.id === 40)!;

    assert.equal(canadaRow.all.played, 2);
    assert.equal(canadaRow.points, 4);
    assert.equal(canadaRow.all.goals.for, 7);
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
    ft.league.round = "Group Stage - 1";
    const live = makeFixture(2, t1, t2, 0, 0, "1H");
    live.league.round = "Group Stage - 2";
    const result = projectLiveGroupStandings(standings, [ft, live]);

    const third = result.standings[0].league.standings[0].find((r) => r.team.id === 12)!;
    assert.equal(third.points, 3);
    assert.equal(third.all.played, 1);
  });

  it("reordena tabla oficial con H2H aunque la API ponga mejor DG arriba", () => {
    const canada = makeTeam(40, "Canada");
    const rival = makeTeam(41, "Qatar");
    const third = makeTeam(42, "Switzerland");
    const fourth = makeTeam(43, "Bosnia");

    const makePlayedRow = (
      rank: number,
      team: Team,
      points: number,
      gf: number,
      ga: number
    ): StandingTeam => ({
      ...makeRow(rank, team, "Group B"),
      points,
      goalsDiff: gf - ga,
      all: {
        played: 2,
        win: 0,
        draw: 0,
        lose: 0,
        goals: { for: gf, against: ga },
      },
    });

    const table = [
      makePlayedRow(1, rival, 4, 5, 1),
      makePlayedRow(2, canada, 4, 3, 2),
      makePlayedRow(3, third, 3, 2, 3),
      makePlayedRow(4, fourth, 1, 1, 5),
    ];
    const standings = makeStandings(table);

    const h2h = makeFixture(200, canada, rival, 2, 0, "FT");
    h2h.league.round = "Group Stage - 2";

    const reranked = rerankGroupTableWithTiebreakers(table, [h2h]);
    assert.equal(reranked[0].team.id, canada.id);
    assert.equal(reranked[1].team.id, rival.id);

    const projected = projectLiveGroupStandings(standings, [h2h]);
    const canadaRow = projected.standings[0].league.standings[0].find((r) => r.team.id === 40)!;
    const rivalRow = projected.standings[0].league.standings[0].find((r) => r.team.id === 41)!;
    assert.equal(canadaRow.rank, 1);
    assert.equal(rivalRow.rank, 2);
  });
});
