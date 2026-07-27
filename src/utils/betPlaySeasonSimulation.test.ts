import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { Fixture, StandingTeam, Team } from "@/types";
import {
  applyMatchToStates,
  drawCuadrangularGroups,
  rankTeamStates,
  simulateBetPlayPhaseProbabilities,
  type BetPlayPhaseProbs,
} from "./betPlaySeasonSimulation";
import type { TeamGroupState } from "./matchOutcomeEngine";

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

function standing(
  id: number,
  name: string,
  points: number,
  played: number,
  gf: number,
  ga: number,
  rank: number
): StandingTeam {
  const win = Math.floor(points / 3);
  const draw = points % 3;
  const lose = Math.max(0, played - win - draw);
  return {
    rank,
    team: team(id, name),
    points,
    goalsDiff: gf - ga,
    group: "Clausura",
    form: null,
    status: null,
    description: null,
    all: {
      played,
      win,
      draw,
      lose,
      goals: { for: gf, against: ga },
    },
    home: {
      played: Math.floor(played / 2),
      win: 0,
      draw: 0,
      lose: 0,
      goals: { for: 0, against: 0 },
    },
    away: {
      played: Math.ceil(played / 2),
      win: 0,
      draw: 0,
      lose: 0,
      goals: { for: 0, against: 0 },
    },
    update: "",
  };
}

function state(
  id: number,
  name: string,
  points: number,
  gf: number,
  ga: number,
  prior = 50
): TeamGroupState {
  return {
    teamId: id,
    teamName: name,
    points,
    goalsFor: gf,
    goalsAgainst: ga,
    priorStrength: prior,
  };
}

function pendingFixture(
  id: number,
  homeId: number,
  awayId: number,
  homeName: string,
  awayName: string
): Fixture {
  return {
    fixture: {
      id,
      referee: null,
      timezone: "UTC",
      date: "2026-11-01T20:00:00Z",
      timestamp: 1793556000,
      periods: { first: null, second: null },
      venue: { id: 1, name: "Estadio", city: "Bogotá" },
      status: { long: "Not Started", short: "NS", elapsed: null },
    },
    league: {
      id: 239,
      name: "Primera A",
      country: "Colombia",
      logo: "",
      flag: null,
      season: 2026,
      round: "Clausura - 19",
    },
    teams: {
      home: { id: homeId, name: homeName, logo: "", winner: null },
      away: { id: awayId, name: awayName, logo: "", winner: null },
    },
    goals: { home: null, away: null },
    score: {
      halftime: { home: null, away: null },
      fulltime: { home: null, away: null },
      extratime: { home: null, away: null },
      penalty: { home: null, away: null },
    },
  };
}

describe("rankTeamStates", () => {
  it("ordena por pts, luego DIF, luego GF", () => {
    const ranked = rankTeamStates([
      state(1, "A", 10, 5, 5),
      state(2, "B", 12, 8, 4),
      state(3, "C", 10, 7, 4),
      state(4, "D", 10, 7, 5),
    ]);
    assert.equal(ranked[0].teamId, 2);
    assert.equal(ranked[1].teamId, 3); // same pts, better GD (3 vs 0)
    assert.equal(ranked[2].teamId, 4); // same pts/GD as? wait D is 7-5=2, C is 7-4=3
    assert.equal(ranked[3].teamId, 1);
  });
});

describe("applyMatchToStates", () => {
  it("suma puntos y goles", () => {
    const states = new Map([
      [1, state(1, "Home", 0, 0, 0)],
      [2, state(2, "Away", 0, 0, 0)],
    ]);
    applyMatchToStates(states, 1, 2, 2, 1);
    assert.equal(states.get(1)!.points, 3);
    assert.equal(states.get(1)!.goalsFor, 2);
    assert.equal(states.get(2)!.points, 0);
    assert.equal(states.get(2)!.goalsAgainst, 2);
  });
});

describe("drawCuadrangularGroups", () => {
  it("pone 1º en A y 2º en B; 4 por grupo", () => {
    const top8 = [
      state(1, "1st", 40, 30, 10, 80),
      state(2, "2nd", 38, 28, 12, 75),
      state(3, "3rd", 35, 25, 15, 70),
      state(4, "4th", 33, 22, 16, 65),
      state(5, "5th", 30, 20, 18, 60),
      state(6, "6th", 28, 18, 20, 55),
      state(7, "7th", 25, 16, 22, 50),
      state(8, "8th", 22, 14, 24, 45),
    ];
    let i = 0;
    const rng = () => {
      const seq = [0.1, 0.9, 0.2, 0.8, 0.3, 0.7];
      return seq[i++ % seq.length];
    };
    const { groupA, groupB } = drawCuadrangularGroups(top8, rng);
    assert.equal(groupA.length, 4);
    assert.equal(groupB.length, 4);
    assert.equal(groupA[0].teamId, 1);
    assert.equal(groupB[0].teamId, 2);
    const ids = [...groupA, ...groupB].map((t) => t.teamId).sort((a, b) => a - b);
    assert.deepEqual(ids, [1, 2, 3, 4, 5, 6, 7, 8]);
  });
});

describe("simulateBetPlayPhaseProbabilities", () => {
  it("devuelve probs que suman ~8 clasificados y 1 campeón en promedio", () => {
    const standings: StandingTeam[] = Array.from({ length: 10 }, (_, i) =>
      standing(
        i + 1,
        `Team ${i + 1}`,
        30 - i * 2,
        10,
        20 - i,
        10 + i,
        i + 1
      )
    );

    // Un solo pendiente: no cambia mucho la tabla.
    const fixtures = [
      pendingFixture(100, 9, 10, "Team 9", "Team 10"),
    ];

    let seed = 1;
    const rng = () => {
      seed = (seed * 16807) % 2147483647;
      return (seed - 1) / 2147483646;
    };

    const rows = simulateBetPlayPhaseProbabilities({
      standings,
      fixtures,
      simulations: 80,
      rng,
    });

    assert.equal(rows.length, 10);
    const sumQuad = rows.reduce((s, r) => s + r.probCuadrangulares, 0);
    const sumChamp = rows.reduce((s, r) => s + r.probChampion, 0);
    // 8 clasifican → suma de probs ≈ 8
    assert.ok(sumQuad > 7.5 && sumQuad < 8.5, `sumQuad=${sumQuad}`);
    assert.ok(sumChamp > 0.9 && sumChamp < 1.1, `sumChamp=${sumChamp}`);

    // Favorito (1º) debe tener mayor chance de título que el último
    const first = rows.find((r) => r.teamId === 1)!;
    const last = rows.find((r) => r.teamId === 10)!;
    assert.ok(first.probChampion >= last.probChampion);
    assert.ok(first.probCuadrangulares >= 0.9);

    // Ordenados por campeón desc
    for (let i = 1; i < rows.length; i++) {
      assert.ok(rows[i - 1].probChampion >= rows[i].probChampion - 1e-9);
    }
  });

  it("sin standings retorna vacío", () => {
    const rows: BetPlayPhaseProbs[] = simulateBetPlayPhaseProbabilities({
      standings: [],
      fixtures: [],
      simulations: 10,
    });
    assert.equal(rows.length, 0);
  });
});
