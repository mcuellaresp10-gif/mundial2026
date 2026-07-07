import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  getNextMatchProbShortLabel,
  isKnockoutFixtureRound,
  knockoutAdvanceProbability,
} from "./matchPhase";

describe("matchPhase", () => {
  it("detecta octavos como eliminatoria", () => {
    assert.equal(isKnockoutFixtureRound("Round of 16"), true);
    assert.equal(isKnockoutFixtureRound("Group Stage - 3"), false);
  });

  it("etiqueta corta para octavos", () => {
    assert.equal(getNextMatchProbShortLabel("Round of 16"), "Prob. octavos");
    assert.equal(getNextMatchProbShortLabel("Group Stage - 2"), "Prob. victoria");
  });

  it("avance en KO suma victoria y empate", () => {
    assert.equal(knockoutAdvanceProbability(0.45, 0.25), 0.7);
  });
});
