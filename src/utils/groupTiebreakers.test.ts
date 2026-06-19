import { describe, it } from "node:test";
import assert from "node:assert/strict";
import type { TeamGroupState } from "@/utils/groupClassification";
import {
  buildMiniGroupTable,
  compareTeamsByTiebreakers,
  rankGroupTeams,
  type GroupMatchResult,
} from "@/utils/groupTiebreakers";

function state(id: number, name: string, points: number, gf: number, ga: number): TeamGroupState {
  return {
    teamId: id,
    teamName: name,
    points,
    goalsFor: gf,
    goalsAgainst: ga,
    priorStrength: 0,
  };
}

function match(homeId: number, awayId: number, hg: number, ag: number): GroupMatchResult {
  return { homeId, awayId, homeGoals: hg, awayGoals: ag };
}

describe("groupTiebreakers", () => {
  it("H2H directo desempata antes que DG global", () => {
    const teams = [
      state(1, "A", 4, 5, 2),
      state(2, "B", 4, 3, 1),
    ];
    const matches = [match(1, 2, 2, 0)];
    const ranked = rankGroupTeams(teams, matches, new Map(), () => 0.5);
    assert.equal(ranked[0].teamId, 1);
    assert.equal(ranked[1].teamId, 2);
  });

  it("mini-liga de 3 equipos desempata por puntos mutuos", () => {
    const teams = [
      state(1, "A", 3, 2, 2),
      state(2, "B", 3, 2, 2),
      state(3, "C", 3, 2, 2),
    ];
    const matches = [
      match(1, 2, 1, 0),
      match(2, 3, 1, 0),
      match(3, 1, 2, 0),
    ];
    const ranked = rankGroupTeams(teams, matches, new Map(), () => 0.5);
    assert.equal(ranked[0].teamId, 3);
    assert.equal(ranked[1].teamId, 2);
    assert.equal(ranked[2].teamId, 1);
  });

  it("overall GD desempata si mini-liga empata", () => {
    const teams = [
      state(1, "A", 4, 6, 2),
      state(2, "B", 4, 4, 4),
    ];
    const matches = [match(1, 2, 1, 1)];
    const ranked = rankGroupTeams(teams, matches, new Map(), () => 0.5);
    assert.equal(ranked[0].teamId, 1);
  });

  it("fair play desempata con mismos puntos y DG/GF", () => {
    const teams = [
      state(1, "A", 4, 4, 4),
      state(2, "B", 4, 4, 4),
    ];
    const matches = [match(1, 2, 1, 1)];
    const fairPlay = new Map([
      [1, { yellow: 1, red: 0 }],
      [2, { yellow: 3, red: 1 }],
    ]);
    const ranked = rankGroupTeams(teams, matches, fairPlay, () => 0.5);
    assert.equal(ranked[0].teamId, 1);
  });

  it("sorteo reparte posiciones cuando todo es igual", () => {
    const teams = [state(1, "A", 3, 1, 1), state(2, "B", 3, 1, 1)];
    const matches = [match(1, 2, 1, 1)];
    let firstWins = 0;
    const runs = 500;
    for (let i = 0; i < runs; i++) {
      const ranked = rankGroupTeams(teams, matches, new Map(), Math.random);
      if (ranked[0].teamId === 1) firstWins++;
    }
    const ratio = firstWins / runs;
    assert.ok(ratio > 0.35 && ratio < 0.65, `ratio=${ratio}`);
  });

  it("buildMiniGroupTable calcula puntos mutuos", () => {
    const ids = new Set([1, 2]);
    const table = buildMiniGroupTable(ids, [match(1, 2, 2, 0)]);
    assert.equal(table.get(1)?.points, 3);
    assert.equal(table.get(2)?.points, 0);
  });

  it("compareTeamsByTiebreakers es determinista con rng fijo", () => {
    const a = state(1, "A", 3, 1, 1);
    const b = state(2, "B", 3, 1, 1);
    const tied = new Set([1, 2]);
    const cmp = compareTeamsByTiebreakers(a, b, tied, [match(1, 2, 1, 1)], new Map(), () => 0.1);
    assert.ok(cmp !== 0);
  });
});
