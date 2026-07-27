import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { Fixture, StandingTeam, Team } from "@/types";
import {
  applyMatchToStates,
  drawCuadrangularGroups,
  fixturesBetweenTeams,
  formatBetPlayPct,
  isMathematicallyEliminatedFromTopN,
  rankTeamStates,
  remainingMatchesByTeam,
  shrinkPairLambdas,
  simulateBetPlayPhaseProbabilities,
  simulateBetPlayPhaseProbabilitiesDetailed,
  strengthConfidenceWeight,
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

function seededRng(seedStart = 1): () => number {
  let seed = seedStart;
  return () => {
    seed = (seed * 16807) % 2147483647;
    return (seed - 1) / 2147483646;
  };
}

/** Round-robin pendiente entre N equipos (ida). */
function fullPendingRoundRobin(teamCount: number): Fixture[] {
  const fixtures: Fixture[] = [];
  let id = 1000;
  for (let i = 1; i <= teamCount; i++) {
    for (let j = i + 1; j <= teamCount; j++) {
      fixtures.push(
        pendingFixture(id++, i, j, `Team ${i}`, `Team ${j}`)
      );
    }
  }
  return fixtures;
}

function finishedFixture(
  id: number,
  homeId: number,
  awayId: number,
  homeName: string,
  awayName: string,
  hg: number,
  ag: number,
  round = "Apertura - 10"
): Fixture {
  const f = pendingFixture(id, homeId, awayId, homeName, awayName);
  f.fixture.status = { long: "Match Finished", short: "FT", elapsed: 90 };
  f.league.round = round;
  f.goals = { home: hg, away: ag };
  f.score.fulltime = { home: hg, away: ag };
  return f;
}

describe("fixturesBetweenTeams", () => {
  it("solo devuelve enfrentamientos FT entre el par", () => {
    const list = [
      finishedFixture(1, 1, 2, "A", "B", 2, 1),
      finishedFixture(2, 3, 1, "C", "A", 0, 0),
      pendingFixture(3, 1, 2, "A", "B"),
    ];
    const h2h = fixturesBetweenTeams(list, 1, 2);
    assert.equal(h2h.length, 1);
    assert.equal(h2h[0].fixture.id, 1);
  });
});

describe("rankTeamStates", () => {
  it("ordena por pts, luego DIF, luego GF", () => {
    const ranked = rankTeamStates([
      state(1, "A", 10, 5, 5),
      state(2, "B", 12, 8, 4),
      state(3, "C", 10, 7, 4),
      state(4, "D", 10, 7, 5),
    ]);
    assert.equal(ranked[0].teamId, 2);
    assert.equal(ranked[1].teamId, 3);
    assert.equal(ranked[2].teamId, 4);
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

describe("strengthConfidenceWeight / shrinkPairLambdas", () => {
  it("con 1 jornada w es bajo (~0.1)", () => {
    const w = strengthConfidenceWeight(1);
    assert.ok(w > 0.05 && w < 0.2, `w=${w}`);
  });

  it("shrink acerca λ a la media", () => {
    const map = new Map([
      ["1:2", { home: 2.5, away: 0.5 }],
      ["2:1", { home: 0.6, away: 2.2 }],
    ]);
    const shrunk = shrinkPairLambdas(map, 0.1);
    const a = shrunk.get("1:2")!;
    assert.ok(a.home < 2.5);
    assert.ok(a.away > 0.5);
  });
});

describe("isMathematicallyEliminatedFromTopN", () => {
  it("marca eliminado cuando 8 equipos ya tienen más puntos que su máximo", () => {
    const standings = Array.from({ length: 10 }, (_, i) =>
      standing(i + 1, `T${i + 1}`, i < 8 ? 30 : 0, 15, 20, 10, i + 1)
    );
    const remaining = new Map(standings.map((s) => [s.team.id, 0]));
    const elim = isMathematicallyEliminatedFromTopN(standings, remaining, 8);
    assert.equal(elim.get(9), true);
    assert.equal(elim.get(10), true);
    assert.equal(elim.get(1), false);
  });

  it("no elimina temprano si aún hay partidos", () => {
    const standings = Array.from({ length: 10 }, (_, i) =>
      standing(i + 1, `T${i + 1}`, i === 0 ? 3 : 0, 1, i === 0 ? 2 : 0, i === 0 ? 0 : 1, i + 1)
    );
    const remaining = new Map(standings.map((s) => [s.team.id, 18]));
    const elim = isMathematicallyEliminatedFromTopN(standings, remaining, 8);
    for (const s of standings) {
      assert.equal(elim.get(s.team.id), false);
    }
  });
});

describe("formatBetPlayPct", () => {
  it("muestra <0.1% temprano con valor 0", () => {
    assert.equal(formatBetPlayPct(0, { maxPlayed: 1 }), "<0.1%");
  });

  it("muestra 0.0% si eliminado", () => {
    assert.equal(
      formatBetPlayPct(0, { mathematicallyEliminated: true, maxPlayed: 1 }),
      "0.0%"
    );
  });

  it("formatea valores normales", () => {
    assert.equal(formatBetPlayPct(0.622), "62.2%");
  });
});

describe("simulateBetPlayPhaseProbabilities", () => {
  it("devuelve probs que suman ~8 clasificados y 1 campeón en promedio", () => {
    const standings: StandingTeam[] = Array.from({ length: 10 }, (_, i) =>
      standing(i + 1, `Team ${i + 1}`, 30 - i * 2, 10, 20 - i, 10 + i, i + 1)
    );

    const fixtures = [pendingFixture(100, 9, 10, "Team 9", "Team 10")];

    const rows = simulateBetPlayPhaseProbabilities({
      standings,
      fixtures,
      simulations: 80,
      rng: seededRng(1),
    });

    assert.equal(rows.length, 10);
    const sumQuad = rows.reduce((s, r) => s + r.probCuadrangulares, 0);
    const sumChamp = rows.reduce((s, r) => s + r.probChampion, 0);
    assert.ok(sumQuad > 7.5 && sumQuad < 8.5, `sumQuad=${sumQuad}`);
    assert.ok(sumChamp > 0.9 && sumChamp < 1.1, `sumChamp=${sumChamp}`);

    const first = rows.find((r) => r.teamId === 1)!;
    const last = rows.find((r) => r.teamId === 10)!;
    assert.ok(first.probChampion >= last.probChampion);
    assert.ok(first.probCuadrangulares >= 0.9);

    // Ordenados por cuadrangulares desc
    for (let i = 1; i < rows.length; i++) {
      assert.ok(
        rows[i - 1].probCuadrangulares >= rows[i].probCuadrangulares - 1e-9
      );
    }
  });

  it("temprano (1 jornada + muchos pendientes): nadie en 0% ni favorito al 100%", () => {
    const teamCount = 12;
    const standings: StandingTeam[] = Array.from({ length: teamCount }, (_, i) =>
      standing(
        i + 1,
        `Team ${i + 1}`,
        i === 0 ? 3 : 0,
        1,
        i === 0 ? 2 : 0,
        i === 0 ? 0 : 1,
        i + 1
      )
    );
    const fixtures = fullPendingRoundRobin(teamCount);

    const rows = simulateBetPlayPhaseProbabilities({
      standings,
      fixtures,
      simulations: 120,
      rng: seededRng(42),
    });

    assert.equal(rows.length, teamCount);
    for (const r of rows) {
      assert.equal(r.mathematicallyEliminated, false);
      assert.ok(
        r.probCuadrangulares > 0,
        `team ${r.teamId} quad=${r.probCuadrangulares}`
      );
      assert.ok(
        r.probCuadrangulares < 1,
        `team ${r.teamId} should not be 100% early`
      );
    }

    const top = rows[0];
    assert.ok(top.probCuadrangulares < 0.95, `top quad=${top.probCuadrangulares}`);
  });

  it("late season eliminado puede quedar en 0%", () => {
    // 8 equipos con 40 pts, 2 con 0 y sin partidos restantes
    const standings: StandingTeam[] = Array.from({ length: 10 }, (_, i) =>
      standing(
        i + 1,
        `Team ${i + 1}`,
        i < 8 ? 40 : 0,
        20,
        30,
        10,
        i + 1
      )
    );

    const rows = simulateBetPlayPhaseProbabilities({
      standings,
      fixtures: [],
      simulations: 40,
      rng: seededRng(7),
    });

    const last = rows.find((r) => r.teamId === 10)!;
    assert.equal(last.mathematicallyEliminated, true);
    assert.equal(last.probCuadrangulares, 0);
    assert.equal(formatBetPlayPct(0, { mathematicallyEliminated: true }), "0.0%");
  });

  it("historial no altera puntos del torneo (maxPlayed = tabla actual)", () => {
    const standings: StandingTeam[] = Array.from({ length: 10 }, (_, i) =>
      standing(
        i + 1,
        `Team ${i + 1}`,
        i === 0 ? 3 : 0,
        1,
        i === 0 ? 1 : 0,
        i === 0 ? 0 : 1,
        i + 1
      )
    );
    const tournament = [pendingFixture(100, 9, 10, "Team 9", "Team 10")];
    // Muchos FT de Apertura: no deben contar como jornadas del torneo actual.
    const history = [
      ...tournament,
      ...Array.from({ length: 20 }, (_, i) =>
        finishedFixture(
          200 + i,
          (i % 10) + 1,
          ((i + 1) % 10) + 1,
          `Team ${(i % 10) + 1}`,
          `Team ${((i + 1) % 10) + 1}`,
          1,
          0,
          "Apertura - 5"
        )
      ),
    ];

    const { meta } = simulateBetPlayPhaseProbabilitiesDetailed({
      standings,
      fixtures: tournament,
      historyFixtures: history,
      simulations: 20,
      rng: seededRng(3),
    });

    assert.equal(meta.maxPlayed, 1);
    assert.ok(meta.historyFixtureCount >= 20);
    assert.equal(meta.pendingCount, 1);
  });

  it("sin standings retorna vacío", () => {
    const rows: BetPlayPhaseProbs[] = simulateBetPlayPhaseProbabilities({
      standings: [],
      fixtures: [],
      simulations: 10,
    });
    assert.equal(rows.length, 0);
  });

  it("remainingMatchesByTeam cuenta pendientes", () => {
    const fixtures = [
      pendingFixture(1, 1, 2, "A", "B"),
      pendingFixture(2, 1, 3, "A", "C"),
    ];
    const rem = remainingMatchesByTeam(fixtures, [1, 2, 3]);
    assert.equal(rem.get(1), 2);
    assert.equal(rem.get(2), 1);
    assert.equal(rem.get(3), 1);
  });
});
