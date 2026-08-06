import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { findSimilarPlayers } from "@/utils/scoutingSimilarity";
import {
  filterProfilesByThresholds,
  rankProfilesByMetric,
  buildAnchoredScoutBrief,
} from "@/utils/scoutingInsights";
import type { ScoutingProfile } from "@/utils/worldCupScoutingMetrics";
import type { WorldCupPer90Metrics } from "@/utils/worldCupScoutingMetrics";

function emptyMetrics(partial: Partial<WorldCupPer90Metrics> = {}): WorldCupPer90Metrics {
  return {
    goals90: 0,
    assists90: 0,
    keyPasses90: 0,
    shots90: 0,
    shotsOn90: 0,
    dribblesSuccess90: 0,
    dribblesAttempts90: 0,
    dribbleSuccessRate: 0,
    shotOnTargetRate: 0,
    tackles90: 0,
    interceptions90: 0,
    blocks90: 0,
    duelsWon90: 0,
    duelWinRate: 0,
    foulsDrawn90: 0,
    foulsCommitted90: 0,
    passes90: 0,
    passAccuracy: 0,
    saves90: 0,
    conceded90: 0,
    savePercentage: 0,
    rating: 6.5,
    minutes: 900,
    appearances: 10,
    offensiveIndex: 5,
    finishingIndex: 5,
    defensiveIndex: 5,
    goalkeeperIndex: 5,
    ...partial,
  };
}

function profile(
  id: number,
  name: string,
  metrics: Partial<WorldCupPer90Metrics>,
  extras: Partial<ScoutingProfile> = {}
): ScoutingProfile {
  const m = emptyMetrics(metrics);
  return {
    playerId: id,
    name,
    photo: "",
    team: "Club",
    teamId: 1,
    teamLogo: "",
    position: "M",
    positionRaw: "Midfielder",
    minutes: m.minutes,
    rating: m.rating,
    goals: 0,
    assists: 0,
    metrics: m,
    percentiles: {
      keyPasses90: 80,
      tackles90: 40,
      dribblesSuccess90: 70,
    },
    radarValues: {},
    radarPeerAverage: {},
    ...extras,
  };
}

describe("scoutingSimilarity", () => {
  it("ordena jugadores cercanos por z-score del rol", () => {
    const target = profile(1, "Target", { keyPasses90: 2, tackles90: 3 });
    const pool = [
      target,
      profile(2, "Cercano", { keyPasses90: 2.1, tackles90: 2.9 }),
      profile(3, "Lejano", { keyPasses90: 0.2, tackles90: 0.1 }),
    ];
    const similar = findSimilarPlayers(target, pool, ["keyPasses90", "tackles90"], 5);
    assert.equal(similar[0]?.profile.playerId, 2);
    assert.ok(similar[0]!.score > similar[1]!.score);
  });
});

describe("scoutingInsights", () => {
  it("rankea por rating y métrica", () => {
    const list = [
      profile(1, "A", { keyPasses90: 1 }, { rating: 7.2 }),
      profile(2, "B", { keyPasses90: 3 }, { rating: 6.5 }),
    ];
    assert.equal(rankProfilesByMetric(list, "keyPasses90", 1)[0].playerId, 2);
    assert.equal(rankProfilesByMetric(list, "rating", 1)[0].playerId, 1);
  });

  it("filtra por umbrales", () => {
    const list = [
      profile(1, "A", {}, { minutes: 500, goals: 2, rating: 7 }),
      profile(2, "B", {}, { minutes: 100, goals: 0, rating: 6 }),
    ];
    const filtered = filterProfilesByThresholds(list, {
      minMinutes: 200,
      minGoals: 1,
      minRating: 6.5,
    });
    assert.equal(filtered.length, 1);
    assert.equal(filtered[0].playerId, 1);
  });

  it("brief anclado usa percentiles", () => {
    const brief = buildAnchoredScoutBrief(
      profile(1, "X", {}, { percentiles: { keyPasses90: 90, tackles90: 20 } })
    );
    assert.ok(brief.some((b) => b.includes("Fortalezas")));
    assert.ok(brief.some((b) => b.includes("API-Football")));
  });
});
