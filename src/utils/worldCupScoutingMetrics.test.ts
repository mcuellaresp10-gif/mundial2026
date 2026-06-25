import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { Player } from "@/types";
import {
  POSITION_METRIC_PROFILES,
  scoutingPositionOptions,
} from "@/config/positionMetricProfiles";
import {
  getMetricViewsForPosition,
  resolveScatterConfig,
} from "@/config/scoutingMetricViews";
import {
  SCOUTING_MIN_WC_MINUTES,
  buildScoutingProfiles,
  extractWorldCupPer90,
  playerHasScoutingEligibleWc,
} from "@/utils/worldCupScoutingMetrics";
import { getWorldCupTournamentStat } from "@/utils/playerStats";

const team = {
  id: 10,
  name: "Argentina",
  code: "ARG",
  country: "Argentina",
  founded: null,
  national: true,
  logo: "a.png",
};

function wcStat(
  minutes: number,
  position: string,
  overrides: Partial<{
    goals: number;
    assists: number;
    keyPasses: number;
    shots: number;
    shotsOn: number;
    dribbles: number;
    duelsWon: number;
    duelsTotal: number;
    tackles: number;
    interceptions: number;
    rating: string;
  }> = {}
) {
  return {
    games: {
      minutes,
      rating: overrides.rating ?? "7.0",
      position,
      appearences: 1,
      lineups: 1,
      number: 10,
      captain: false,
    },
    team,
    league: { id: 1, name: "World Cup", country: "World", logo: "", flag: null, season: 2026 },
    substitutes: { in: 0, out: 0, bench: 0 },
    shots: { total: overrides.shots ?? 3, on: overrides.shotsOn ?? 1 },
    goals: { total: overrides.goals ?? 0, conceded: 0, assists: overrides.assists ?? 0, saves: 0 },
    passes: { total: 40, key: overrides.keyPasses ?? 2, accuracy: 85 },
    tackles: {
      total: overrides.tackles ?? 2,
      blocks: 0,
      interceptions: overrides.interceptions ?? 1,
    },
    duels: { total: overrides.duelsTotal ?? 10, won: overrides.duelsWon ?? 5 },
    dribbles: { attempts: 4, success: overrides.dribbles ?? 2, past: 0 },
    fouls: { drawn: 1, committed: 1 },
    cards: { yellow: 0, yellowred: 0, red: 0 },
    penalty: { won: 0, commited: 0, scored: 0, missed: 0, saved: 0 },
  };
}

function player(id: number, name: string, stat: ReturnType<typeof wcStat>): Player {
  return {
    player: { id, name, firstname: name, lastname: "", age: 25, birth: { date: "", place: "", country: "" }, nationality: "ARG", height: null, weight: null, injured: false, photo: "" },
    statistics: [stat],
  };
}

describe("worldCupScoutingMetrics", () => {
  it("extractWorldCupPer90 calcula métricas por 90 min", () => {
    const stat = wcStat(180, "M", { goals: 2, assists: 1, keyPasses: 4 });
    const m = extractWorldCupPer90(stat);
    assert.equal(m.goals90, 1);
    assert.equal(m.assists90, 0.5);
    assert.equal(m.keyPasses90, 2);
    assert.equal(m.minutes, 180);
    assert.equal(m.shotOnTargetRate, 33.3);
  });

  it("playerHasScoutingEligibleWc exige mínimo de minutos", () => {
    const low = player(1, "A", wcStat(45, "M"));
    const ok = player(2, "B", wcStat(90, "M"));
    assert.equal(playerHasScoutingEligibleWc(low), false);
    assert.equal(playerHasScoutingEligibleWc(ok), true);
    assert.equal(SCOUTING_MIN_WC_MINUTES, 90);
  });

  it("buildScoutingProfiles agrupa por posición y asigna percentiles", () => {
    const players = [
      player(1, "Star", wcStat(180, "M", { keyPasses: 6, rating: "8.5" })),
      player(2, "Mid", wcStat(180, "M", { keyPasses: 2, rating: "6.5" })),
      player(3, "Bench", wcStat(60, "M")),
    ];
    const profiles = buildScoutingProfiles(players);
    assert.equal(profiles.length, 2);
    const star = profiles.find((p) => p.playerId === 1)!;
    const mid = profiles.find((p) => p.playerId === 2)!;
    assert.ok(star.percentiles.keyPasses90! >= mid.percentiles.keyPasses90!);
    assert.ok(star.radarValues.keyPasses90 >= mid.radarValues.keyPasses90);
    assert.equal(star.position, "M");
  });

  it("calcula índice ofensivo para volantes", () => {
    const players = [
      player(1, "A", wcStat(180, "M", { keyPasses: 8, shotsOn: 4, dribbles: 4 })),
      player(2, "B", wcStat(180, "M", { keyPasses: 1, shotsOn: 0, dribbles: 0 })),
    ];
    const profiles = buildScoutingProfiles(players);
    const a = profiles.find((p) => p.playerId === 1)!;
    assert.ok(a.metrics.offensiveIndex > 0);
    assert.ok(a.metrics.offensiveIndex > profiles.find((p) => p.playerId === 2)!.metrics.offensiveIndex);
  });

  it("getWorldCupTournamentStat resuelve stat del torneo", () => {
    const p = player(1, "X", wcStat(120, "F", { goals: 1 }));
    const wc = getWorldCupTournamentStat(p);
    assert.ok(wc);
    assert.equal(wc!.games.minutes, 120);
  });
});

describe("positionMetricProfiles", () => {
  it("cada posición tiene 8 ejes radar y scatter válido", () => {
    for (const pos of ["G", "D", "M", "F"] as const) {
      const profile = POSITION_METRIC_PROFILES[pos];
      assert.equal(profile.radarAxes.length, 8);
      assert.ok(profile.scatter.x.key);
      assert.ok(profile.scatter.y.key);
      assert.ok(profile.scatter.color.key);
      assert.ok(profile.scatter.colorLabel.length > 0);
    }
  });

  it("scoutingPositionOptions incluye las 4 posiciones", () => {
    assert.equal(scoutingPositionOptions().length, 4);
  });
});

describe("scoutingMetricViews", () => {
  it("expone vistas de métricas por posición con scatter válido", () => {
    for (const pos of ["G", "D", "M", "F"] as const) {
      const views = getMetricViewsForPosition(pos);
      assert.ok(views.length >= 3);
      assert.ok(views.some((v) => v.id === "default"));
      for (const view of views) {
        const scatter = resolveScatterConfig(pos, view.id);
        assert.ok(scatter.x.key);
        assert.ok(scatter.y.key);
        assert.ok(scatter.colorLabel.length > 0);
      }
    }
  });

  it("oculta regates y disparos para porteros", () => {
    const gkViews = getMetricViewsForPosition("G").map((v) => v.id);
    assert.ok(!gkViews.includes("dribbles"));
    assert.ok(!gkViews.includes("shooting"));
    assert.ok(gkViews.includes("defense"));
  });
});

describe("scoutingStarLabels", () => {
  it("resuelve etiquetas por nombre e ID", async () => {
    const { resolveStarLabel, isStarLabelPlayer } = await import("@/config/scoutingStarLabels");
    assert.equal(resolveStarLabel(154, "L. Messi"), "Messi");
    assert.equal(resolveStarLabel(999, "K. Mbappé"), "Mbappé");
    assert.equal(resolveStarLabel(999, "E. Haaland"), "Haaland");
    assert.equal(resolveStarLabel(999, "Random Player"), null);
    assert.equal(isStarLabelPlayer(154, "L. Messi"), true);
  });
});
