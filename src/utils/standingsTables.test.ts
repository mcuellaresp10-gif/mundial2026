import { describe, it } from "node:test";
import assert from "node:assert/strict";
import type { StandingTeam, StandingsGroup, Team } from "@/types";
import { dedupeStandingTable, iterateStandingsTables } from "@/utils/standingsTables";

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

function makeRow(rank: number, team: Team, group: string): StandingTeam {
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

function makeGroup(name: string, tables: StandingTeam[][]): StandingsGroup {
  return {
    league: {
      id: 1,
      name,
      country: "World",
      logo: "",
      flag: null,
      season: 2026,
      standings: tables,
    },
  };
}

describe("iterateStandingsTables", () => {
  it("incluye solo grupos A–L y excluye tablas Group Stage", () => {
    const groupA = makeRow(1, makeTeam(1, "A1"), "Group A");
    const groupStage = makeRow(1, makeTeam(99, "X"), "Group Stage - 1");

    const standings = [
      makeGroup("World Cup", [[groupA], [groupStage]]),
    ];

    const slices = iterateStandingsTables(standings);

    assert.equal(slices.length, 1);
    assert.equal(slices[0].letter, "A");
    assert.equal(slices[0].groupLabel, "Grupo A");
  });

  it("deduplica equipos repetidos en la misma tabla", () => {
    const t1 = makeTeam(10, "Belgium");
    const t2 = makeTeam(20, "Egypt");
    const table = [
      makeRow(1, t1, "Group G"),
      makeRow(2, t2, "Group G"),
      makeRow(3, t1, "Group G"),
      makeRow(4, t2, "Group G"),
    ];

    const deduped = dedupeStandingTable(table);
    assert.equal(deduped.length, 2);
    assert.deepEqual(
      deduped.map((r) => r.team.id),
      [10, 20]
    );
  });

  it("ignora tablas duplicadas del mismo grupo", () => {
    const row = makeRow(1, makeTeam(1, "A1"), "Group A");
    const standings = [
      makeGroup("World Cup", [[row], [makeRow(1, makeTeam(1, "A1"), "Group A")]]),
    ];
    assert.equal(iterateStandingsTables(standings).length, 1);
  });
});
