import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { Fixture, StandingsGroup, StandingTeam, Team } from "@/types";
import {
  findTeamNextKnockoutMatch,
  getKnockoutWinnerFromFixture,
  resolveKnockoutBracket,
} from "@/utils/knockoutBracket";

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
  rank: number,
  team: Team,
  points: number,
  group: string,
  played = 3
): StandingTeam {
  return {
    rank,
    team,
    points,
    goalsDiff: points,
    group,
    form: "WWW",
    status: "same",
    description: null,
    all: {
      played,
      win: Math.floor(points / 3),
      draw: points % 3,
      lose: 0,
      goals: { for: points, against: 0 },
    },
    home: { played: 0, win: 0, draw: 0, lose: 0, goals: { for: 0, against: 0 } },
    away: { played: 0, win: 0, draw: 0, lose: 0, goals: { for: 0, against: 0 } },
    update: "",
  };
}

function makeGroup(letter: string, teams: StandingTeam[]): StandingsGroup {
  return {
    league: {
      id: 1,
      name: "World Cup",
      country: "World",
      logo: "",
      flag: "",
      season: 2026,
      standings: [teams.map((t) => ({ ...t, group: `Group ${letter}` }))],
    },
  };
}

function allGroupsStandings(): StandingsGroup[] {
  const standings: StandingsGroup[] = [];
  for (const letter of "ABCDEFGHIJKL") {
    const base = letter.charCodeAt(0) * 100;
    standings.push(
      makeGroup(letter, [
        makeRow(1, makeTeam(base + 1, `${letter} Winner`), 9, `Group ${letter}`),
        makeRow(2, makeTeam(base + 2, `${letter} Runner`), 6, `Group ${letter}`),
        makeRow(3, makeTeam(base + 3, `${letter} Third`), 3, `Group ${letter}`),
        makeRow(4, makeTeam(base + 4, `${letter} Fourth`), 0, `Group ${letter}`),
      ])
    );
  }
  return standings;
}

function makeFinishedKnockoutFixture(
  id: number,
  home: Team,
  away: Team,
  homeGoals: number,
  awayGoals: number,
  round = "Round of 32"
): Fixture {
  return {
    fixture: {
      id,
      referee: null,
      timezone: "UTC",
      date: "2026-07-01T16:00:00+00:00",
      timestamp: 0,
      periods: { first: 45, second: 90 },
      venue: { id: 1, name: "Stadium", city: "Atlanta" },
      status: { long: "Match Finished", short: "FT", elapsed: 90 },
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
      home: { id: home.id, name: home.name, logo: home.logo, winner: homeGoals > awayGoals },
      away: { id: away.id, name: away.name, logo: away.logo, winner: awayGoals > homeGoals },
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

describe("findTeamNextKnockoutMatch", () => {
  it("encuentra 16avos para campeón del grupo L sin fixture NS en API", () => {
    const colombia = makeTeam(1201, "Colombia");
    const standings = allGroupsStandings();
    const groupL = standings.find((g) =>
      g.league.standings[0].some((t) => t.group === "Group L")
    )!;
    groupL.league.standings[0] = groupL.league.standings[0].map((row) =>
      row.rank === 1 ? { ...row, team: colombia, points: 7 } : row
    );

    const bracket = resolveKnockoutBracket(standings);
    const next = findTeamNextKnockoutMatch(colombia.id, bracket);

    assert.ok(next);
    assert.equal(next!.matchId, 80);
    assert.equal(next!.round, "round_of_32");
    assert.equal(next!.isHome, true);
    assert.ok(next!.rivalName);
  });

  it("salta 16avos ganados y devuelve octavos (M92)", () => {
    const colombia = makeTeam(1201, "Colombia");
    const standings = allGroupsStandings();
    const groupL = standings.find((g) =>
      g.league.standings[0].some((t) => t.group === "Group L")
    )!;
    groupL.league.standings[0] = groupL.league.standings[0].map((row) =>
      row.rank === 1 ? { ...row, team: colombia, points: 7 } : row
    );

    const bracketBefore = resolveKnockoutBracket(standings);
    const m80Bracket = bracketBefore.roundOf32.find((m) => m.matchId === 80)!;
    assert.ok(m80Bracket.home.team?.teamId === colombia.id);
    assert.ok(m80Bracket.away.team);

    const m80 = makeFinishedKnockoutFixture(
      8001,
      colombia,
      makeTeam(m80Bracket.away.team!.teamId, m80Bracket.away.team!.name),
      2,
      0
    );

    const m79Bracket = bracketBefore.roundOf32.find((m) => m.matchId === 79)!;
    assert.ok(m79Bracket.home.team && m79Bracket.away.team);
    const m79 = makeFinishedKnockoutFixture(
      7901,
      makeTeam(m79Bracket.home.team!.teamId, m79Bracket.home.team!.name),
      makeTeam(m79Bracket.away.team!.teamId, m79Bracket.away.team!.name),
      1,
      0
    );

    const bracket = resolveKnockoutBracket(standings, { fixtures: [m80, m79] });
    const next = findTeamNextKnockoutMatch(colombia.id, bracket);

    assert.ok(next);
    assert.equal(next!.matchId, 92);
    assert.equal(next!.round, "round_of_16");
    assert.ok(getKnockoutWinnerFromFixture(m80)?.teamId === colombia.id);
  });
});
