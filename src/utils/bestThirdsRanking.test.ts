import { describe, it } from "node:test";
import assert from "node:assert/strict";
import type { StandingTeam, StandingsGroup, Team } from "@/types";
import {
  BEST_THIRD_QUALIFIERS,
  rankThirdPlaceTeamsFromStandings,
} from "@/utils/bestThirdsRanking";

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
  group: string,
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
    group,
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

function makeStandingsGroup(letter: string, table: StandingTeam[]): StandingsGroup {
  return {
    league: {
      id: 1,
      name: `Group ${letter}`,
      country: "World",
      logo: "",
      flag: null,
      season: 2026,
      standings: [table],
    },
  };
}

describe("rankThirdPlaceTeamsFromStandings", () => {
  it("ordena terceros por puntos y marca los 8 mejores", () => {
    const groupA = makeStandingsGroup("A", [
      makeRow(1, makeTeam(1, "A1"), "Group A", 9, 5, 1, 3),
      makeRow(2, makeTeam(2, "A2"), "Group A", 6, 4, 3, 3),
      makeRow(3, makeTeam(3, "A3"), "Group A", 3, 2, 4, 3),
      makeRow(4, makeTeam(4, "A4"), "Group A", 0, 1, 4, 3),
    ]);
    const groupB = makeStandingsGroup("B", [
      makeRow(1, makeTeam(5, "B1"), "Group B", 9, 6, 2, 3),
      makeRow(2, makeTeam(6, "B2"), "Group B", 6, 5, 4, 3),
      makeRow(3, makeTeam(7, "B3"), "Group B", 4, 3, 3, 3),
      makeRow(4, makeTeam(8, "B4"), "Group B", 1, 2, 6, 3),
    ]);

    const ranked = rankThirdPlaceTeamsFromStandings([groupA, groupB], []);

    assert.equal(ranked.length, 2);
    assert.equal(ranked[0].row.team.id, 7);
    assert.equal(ranked[0].groupLetter, "B");
    assert.equal(ranked[1].row.team.id, 3);
    assert.equal(ranked[0].qualifies, true);
    assert.equal(ranked[1].qualifies, true);
    assert.equal(ranked[0].rankAmongThirds, 1);
  });

  it("expone la constante de plazas para mejores terceros", () => {
    assert.equal(BEST_THIRD_QUALIFIERS, 8);
  });
});
