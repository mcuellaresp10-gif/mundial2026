import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  detectArgentinaZone,
  simulateArgentinaPhaseProbabilitiesDetailed,
} from "./argentinaSeasonSimulation.ts";
import type { Fixture, StandingTeam } from "../types/index.ts";

function standing(
  id: number,
  name: string,
  points: number,
  played: number,
  group: string
): StandingTeam {
  return {
    rank: 1,
    team: { id, name, logo: "" },
    points,
    goalsDiff: points,
    group,
    form: null,
    status: null,
    description: null,
    all: {
      played,
      win: Math.floor(points / 3),
      draw: points % 3,
      lose: 0,
      goals: { for: played + 5, against: 5 },
    },
    home: {
      played: Math.ceil(played / 2),
      win: 0,
      draw: 0,
      lose: 0,
      goals: { for: 0, against: 0 },
    },
    away: {
      played: Math.floor(played / 2),
      win: 0,
      draw: 0,
      lose: 0,
      goals: { for: 0, against: 0 },
    },
    update: "",
  };
}

describe("argentinaSeasonSimulation", () => {
  it("detecta zona desde labels API", () => {
    assert.equal(detectArgentinaZone("Clausura - Group A"), "A");
    assert.equal(detectArgentinaZone("Apertura - Group B"), "B");
    assert.equal(detectArgentinaZone("Zona A"), "A");
    assert.equal(detectArgentinaZone("random"), null);
  });

  it("simula playoffs con 2 zonas de 15 (pocas sims)", () => {
    const zoneA = Array.from({ length: 15 }, (_, i) =>
      standing(100 + i, `A${i + 1}`, 40 - i, 10, "Clausura - Group A")
    );
    const zoneB = Array.from({ length: 15 }, (_, i) =>
      standing(200 + i, `B${i + 1}`, 40 - i, 10, "Clausura - Group B")
    );

    // Un pendiente interzonal
    const fixtures: Fixture[] = [
      {
        fixture: {
          id: 1,
          referee: null,
          timezone: "UTC",
          date: "2026-10-01T00:00:00+00:00",
          timestamp: 0,
          periods: { first: null, second: null },
          venue: { id: null, name: null, city: null },
          status: { long: "Not Started", short: "NS", elapsed: null },
        },
        league: {
          id: 128,
          name: "Liga Profesional",
          country: "Argentina",
          logo: "",
          flag: "",
          season: 2026,
          round: "Clausura - 11",
        },
        teams: {
          home: { id: 100, name: "A1", logo: "", winner: null },
          away: { id: 200, name: "B1", logo: "", winner: null },
        },
        goals: { home: null, away: null },
        score: {
          halftime: { home: null, away: null },
          fulltime: { home: null, away: null },
          extratime: { home: null, away: null },
          penalty: { home: null, away: null },
        },
      },
    ];

    let seed = 1;
    const rng = () => {
      seed = (seed * 16807) % 2147483647;
      return (seed - 1) / 2147483646;
    };

    const { rows, meta } = simulateArgentinaPhaseProbabilitiesDetailed({
      zoneA,
      zoneB,
      fixtures,
      simulations: 50,
      rng,
    });

    assert.equal(meta.zoneASize, 15);
    assert.equal(meta.zoneBSize, 15);
    assert.equal(rows.length, 30);
    const top = rows.filter((r) => r.probPlayoffs > 0.5);
    assert.ok(top.length >= 8);
    const champs = rows.reduce((s, r) => s + r.probChampion, 0);
    assert.ok(champs > 0.9 && champs < 1.1);
  });
});
