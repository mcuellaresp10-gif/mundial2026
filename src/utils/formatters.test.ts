import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { olympicRank, olympicRankAscending, formatKnockoutMatchHeader } from "./formatters";
import { getKnockoutMatchCity, getKnockoutMatchMeta } from "@/data/worldCup2026KnockoutSchedule";

describe("olympicRank", () => {
  const table = [
    { goals: 3, assists: 1 },
    { goals: 3, assists: 0 },
    { goals: 3, assists: 2 },
    { goals: 2, assists: 4 },
    { goals: 1, assists: 0 },
  ];

  it("empata en #1 a quienes lideran con el mismo total", () => {
    assert.equal(olympicRank(table, 3, "goals"), 1);
    assert.equal(olympicRank(table, 2, "goals"), 4);
    assert.equal(olympicRank(table, 1, "goals"), 5);
  });

  it("aplica el mismo criterio por asistencias", () => {
    assert.equal(olympicRank(table, 4, "assists"), 1);
    assert.equal(olympicRank(table, 2, "assists"), 2);
    assert.equal(olympicRank(table, 1, "assists"), 3);
    assert.equal(olympicRank(table, 0, "assists"), 4);
  });

  it("rankea por menos goles encajados (olímpico ascendente)", () => {
    const keepers = [
      { goalsConceded: 1, concededPer90: 0.5 },
      { goalsConceded: 1, concededPer90: 0.5 },
      { goalsConceded: 1, concededPer90: 0.5 },
      { goalsConceded: 3, concededPer90: 1.5 },
    ];
    assert.equal(olympicRankAscending(keepers, 1, "goalsConceded"), 1);
    assert.equal(olympicRankAscending(keepers, 3, "goalsConceded"), 4);
  });
});

describe("knockout match header", () => {
  it("formatea fecha y ciudad junto al código", () => {
    const meta = getKnockoutMatchMeta(74);
    assert.equal(getKnockoutMatchCity(74), "Boston");
    assert.match(formatKnockoutMatchHeader(meta.date, meta.city), /29 jun · Boston/);
  });
});
