import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { Fixture, Team } from "@/types";
import {
  buildPointsEvolution,
  buildStandingsAtMatchday,
  listBetPlayMatchdayCuts,
  parseBetPlayMatchday,
  pendingFixturesAfterMatchday,
  type BetPlayTeamMeta,
} from "./betPlayEvolution";

function team(id: number, name: string): Team {
  return {
    id,
    name,
    code: null,
    country: "Colombia",
    founded: null,
    national: false,
    logo: `/logo-${id}.png`,
  };
}

function fixture(
  id: number,
  homeId: number,
  awayId: number,
  round: string,
  status: "FT" | "NS",
  hg: number | null = null,
  ag: number | null = null
): Fixture {
  return {
    fixture: {
      id,
      referee: null,
      timezone: "UTC",
      date: "2026-01-01T00:00:00+00:00",
      timestamp: 0,
      periods: { first: null, second: null },
      venue: { id: null, name: null, city: null },
      status: {
        long: status === "FT" ? "Match Finished" : "Not Started",
        short: status,
        elapsed: status === "FT" ? 90 : null,
      },
    },
    league: {
      id: 239,
      name: "Primera A",
      country: "Colombia",
      logo: "",
      flag: null,
      season: 2026,
      round,
    },
    teams: {
      home: { ...team(homeId, `T${homeId}`), winner: null },
      away: { ...team(awayId, `T${awayId}`), winner: null },
    },
    goals: { home: hg, away: ag },
    score: {
      halftime: { home: null, away: null },
      fulltime: { home: hg, away: ag },
      extratime: { home: null, away: null },
      penalty: { home: null, away: null },
    },
  };
}

const TEAMS: BetPlayTeamMeta[] = [
  { teamId: 1, teamName: "A", teamLogo: "/a.png" },
  { teamId: 2, teamName: "B", teamLogo: "/b.png" },
  { teamId: 3, teamName: "C", teamLogo: "/c.png" },
];

describe("parseBetPlayMatchday", () => {
  it("lee Apertura/Clausura - N", () => {
    assert.equal(parseBetPlayMatchday("Apertura - 5"), 5);
    assert.equal(parseBetPlayMatchday("Clausura - 12"), 12);
    assert.equal(parseBetPlayMatchday("Finalización - 3"), 3);
  });

  it("ignora eliminatorias", () => {
    assert.equal(parseBetPlayMatchday("Apertura - Final"), null);
    assert.equal(parseBetPlayMatchday("Quarter-finals"), null);
  });
});

describe("listBetPlayMatchdayCuts", () => {
  it("ordena jornadas y marca complete", () => {
    const list = [
      fixture(1, 1, 2, "Clausura - 2", "FT", 1, 0),
      fixture(2, 2, 3, "Clausura - 1", "FT", 0, 0),
      fixture(3, 1, 3, "Clausura - 2", "NS"),
    ];
    const cuts = listBetPlayMatchdayCuts(list);
    assert.equal(cuts.length, 2);
    assert.equal(cuts[0]!.matchday, 1);
    assert.equal(cuts[0]!.complete, true);
    assert.equal(cuts[1]!.matchday, 2);
    assert.equal(cuts[1]!.complete, false);
  });
});

describe("buildPointsEvolution", () => {
  it("acumula puntos jornada a jornada", () => {
    const list = [
      fixture(1, 1, 2, "Clausura - 1", "FT", 2, 1), // A wins
      fixture(2, 2, 3, "Clausura - 1", "FT", 1, 1), // draw
      fixture(3, 1, 3, "Clausura - 2", "FT", 0, 1), // C wins
    ];
    const series = buildPointsEvolution(list, TEAMS);
    assert.equal(series.length, 2);
    assert.equal(series[0]!.pointsByTeamId[1], 3);
    assert.equal(series[0]!.pointsByTeamId[2], 1);
    assert.equal(series[0]!.pointsByTeamId[3], 1);
    assert.equal(series[1]!.pointsByTeamId[1], 3);
    assert.equal(series[1]!.pointsByTeamId[3], 4);
  });
});

describe("buildStandingsAtMatchday", () => {
  it("reconstruye PJ y pts al corte", () => {
    const list = [
      fixture(1, 1, 2, "Clausura - 1", "FT", 1, 0),
      fixture(2, 3, 1, "Clausura - 2", "FT", 0, 2),
      fixture(3, 2, 3, "Clausura - 3", "NS"),
    ];
    const at1 = buildStandingsAtMatchday(list, TEAMS, 1);
    const a = at1.find((s) => s.team.id === 1)!;
    assert.equal(a.points, 3);
    assert.equal(a.all.played, 1);

    const at2 = buildStandingsAtMatchday(list, TEAMS, 2);
    const a2 = at2.find((s) => s.team.id === 1)!;
    assert.equal(a2.points, 6);
    assert.equal(a2.all.played, 2);
    assert.equal(at2[0]!.team.id, 1);
  });
});

describe("pendingFixturesAfterMatchday", () => {
  it("deja pendientes jornadas futuras y FT incompletos", () => {
    const list = [
      fixture(1, 1, 2, "Clausura - 1", "FT", 1, 0),
      fixture(2, 2, 3, "Clausura - 2", "NS"),
      fixture(3, 1, 3, "Clausura - 3", "NS"),
    ];
    const pending = pendingFixturesAfterMatchday(list, 1);
    assert.equal(pending.length, 2);
    assert.ok(pending.every((f) => f.fixture.status.short === "NS"));
  });
});
