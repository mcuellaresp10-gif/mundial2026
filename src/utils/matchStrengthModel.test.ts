import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { getStrengthFromFifaRanking } from "@/data/fifaRankings";
import {
  calibrateLambdasTo1X2,
  drawProbFromStrengthGap,
  expectedGoalsFromStrength,
  outcomeProbsFromStrength,
  poissonOutcomeProbs,
  winProbFromStrength,
} from "@/utils/matchStrengthModel";

describe("matchStrengthModel", () => {
  it("winProbFromStrength favorece claramente al equipo superior", () => {
    const por = getStrengthFromFifaRanking("Portugal");
    const uzb = getStrengthFromFifaRanking("Uzbekistan");
    const p = winProbFromStrength(por, uzb);
    assert.ok(p > 0.82, `p=${p}`);
    assert.ok(p < 0.95);
  });

  it("empate baja con gap grande", () => {
    assert.ok(drawProbFromStrengthGap(30) < drawProbFromStrengthGap(2));
    assert.ok(drawProbFromStrengthGap(30) <= 0.08);
  });

  it("Portugal vs Uzbekistán 1X2 calibrado", () => {
    const por = getStrengthFromFifaRanking("Portugal");
    const uzb = getStrengthFromFifaRanking("Uzbekistan");
    const probs = outcomeProbsFromStrength(por, uzb);
    assert.ok(probs.homeWin > 0.78);
    assert.ok(probs.draw < 0.1);
    assert.ok(probs.awayWin < 0.15);
  });

  it("expectedGoals comprime goles del débil en mismatch", () => {
    const por = getStrengthFromFifaRanking("Portugal");
    const uzb = getStrengthFromFifaRanking("Uzbekistan");
    const { home, away } = expectedGoalsFromStrength({
      strengthA: por,
      strengthB: uzb,
      baseTotal: 2.6,
    });
    assert.ok(home > 2);
    assert.ok(away < 0.75, `away=${away}`);
  });

  it("calibrateLambdasTo1X2 acerca victoria y empate en partido parejo", () => {
    const col = getStrengthFromFifaRanking("Colombia");
    const uru = getStrengthFromFifaRanking("Uruguay");
    const target = outcomeProbsFromStrength(col, uru);
    const base = expectedGoalsFromStrength({
      strengthA: col,
      strengthB: uru,
      baseTotal: 2.6,
    });
    const calibrated = calibrateLambdasTo1X2(
      base.home,
      base.away,
      target,
      col - uru,
      col - uru
    );
    const probs = poissonOutcomeProbs(calibrated.home, calibrated.away);
    assert.ok(Math.abs(probs.homeWin - target.homeWin) < 0.05);
    assert.ok(
      Math.abs(probs.homeWin - target.homeWin) +
        Math.abs(probs.awayWin - target.awayWin) <
        0.15
    );
  });
});
