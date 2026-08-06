import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { Player, PlayerStatistics } from "@/types";
import {
  applyResolvedPositionsToPlayers,
  refineScoutingPosition,
  resolveScoutingPosition,
} from "@/utils/scoutingPosition";
import { positionToCode } from "@/utils/squad";

const team = {
  id: 1125,
  name: "Millonarios",
  code: "MIL",
  country: "Colombia",
  founded: null,
  national: false,
  logo: "m.png",
};

function leagueStat(
  position: string,
  minutes: number,
  overrides: Partial<{
    goals: number;
    shots: number;
    tackles: number;
    interceptions: number;
    keyPasses: number;
  }> = {}
): PlayerStatistics {
  return {
    games: {
      minutes,
      rating: "7.0",
      position,
      appearences: 10,
      lineups: 10,
      number: 23,
      captain: false,
    },
    team,
    league: {
      id: 239,
      name: "Primera A",
      country: "Colombia",
      logo: "",
      flag: null,
      season: 2026,
    },
    substitutes: { in: 0, out: 0, bench: 0 },
    shots: { total: overrides.shots ?? 0, on: 0 },
    goals: {
      total: overrides.goals ?? 0,
      conceded: 0,
      assists: 0,
      saves: 0,
    },
    passes: { total: 40, key: overrides.keyPasses ?? 0, accuracy: 80 },
    tackles: {
      total: overrides.tackles ?? 0,
      blocks: 0,
      interceptions: overrides.interceptions ?? 0,
    },
    duels: { total: 10, won: 5 },
    dribbles: { attempts: 2, success: 1, past: 0 },
    fouls: { drawn: 1, committed: 1 },
    cards: { yellow: 0, yellowred: 0, red: 0 },
    penalty: { won: 0, commited: 0, scored: 0, missed: 0, saved: 0 },
  };
}

function player(id: number, name: string, stat: PlayerStatistics): Player {
  return {
    player: {
      id,
      name,
      firstname: name,
      lastname: "",
      age: 30,
      birth: { date: "", place: "", country: "" },
      nationality: "Colombia",
      height: null,
      weight: null,
      injured: false,
      photo: "",
    },
    statistics: [stat],
  };
}

describe("positionToCode", () => {
  it("normaliza aliases y mayúsculas", () => {
    assert.equal(positionToCode("Attacker"), "F");
    assert.equal(positionToCode("forward"), "F");
    assert.equal(positionToCode("Centre Forward"), "F");
    assert.equal(positionToCode("midfielder"), "M");
    assert.equal(positionToCode("Wing-Back"), "D");
  });
});

describe("refineScoutingPosition", () => {
  it("reclasifica delantero etiquetado como Midfielder (perfil Castro)", () => {
    const row = leagueStat("Midfielder", 1414, {
      goals: 8,
      shots: 39,
      tackles: 6,
      interceptions: 4,
      keyPasses: 25,
    });
    assert.equal(refineScoutingPosition("M", row), "F");
  });

  it("no mueve a un volante ofensivo con tacles normales", () => {
    const row = leagueStat("Midfielder", 1494, {
      goals: 5,
      shots: 36,
      tackles: 20,
      interceptions: 8,
      keyPasses: 44,
    });
    assert.equal(refineScoutingPosition("M", row), "M");
  });

  it("no mueve a un volante defensivo (perfil Ureña) a defensa", () => {
    const row = leagueStat("Midfielder", 1611, {
      goals: 0,
      shots: 10,
      tackles: 25,
      interceptions: 19,
      keyPasses: 19,
    });
    assert.equal(refineScoutingPosition("M", row), "M");
  });

  it("no mueve defensas ni delanteros ya etiquetados", () => {
    const row = leagueStat("Defender", 1800, {
      goals: 0,
      shots: 9,
      tackles: 30,
      interceptions: 22,
    });
    assert.equal(refineScoutingPosition("D", row), "D");
    assert.equal(refineScoutingPosition("F", row), "F");
  });
});

describe("resolveScoutingPosition", () => {
  it("prioriza posición del plantel sobre season stats", () => {
    const p = player(
      538170,
      "J. Angulo",
      leagueStat("Midfielder", 363, { shots: 4, tackles: 12 })
    );
    const squad = new Map([[538170, "F"]]);
    assert.equal(
      resolveScoutingPosition(p, 239, 2026, { squadPositionByPlayerId: squad }),
      "F"
    );
  });

  it("corrige a L. Castro aunque plantel y season digan Midfielder", () => {
    const p = player(
      13525,
      "L. Castro",
      leagueStat("Midfielder", 1414, {
        goals: 8,
        shots: 39,
        tackles: 6,
        interceptions: 4,
      })
    );
    const squad = new Map([[13525, "M"]]);
    assert.equal(
      resolveScoutingPosition(p, 239, 2026, { squadPositionByPlayerId: squad }),
      "F"
    );
  });

  it("mantiene a R. Ureña como volante con plantel Midfielder", () => {
    const p = player(
      11805,
      "R. Ureña",
      leagueStat("Defender", 1611, {
        goals: 0,
        shots: 10,
        tackles: 25,
        interceptions: 19,
        keyPasses: 19,
      })
    );
    const squad = new Map([[11805, "M"]]);
    assert.equal(
      resolveScoutingPosition(p, 239, 2026, { squadPositionByPlayerId: squad }),
      "M"
    );
  });

  it("aplica posiciones resueltas sobre statistics.games.position", () => {
    const p = player(
      13525,
      "L. Castro",
      leagueStat("Midfielder", 1414, {
        goals: 8,
        shots: 39,
        tackles: 6,
        interceptions: 4,
      })
    );
    const [patched] = applyResolvedPositionsToPlayers([p], 239, 2026);
    assert.equal(patched.statistics[0].games.position, "Attacker");
  });
});
