import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { getStrengthFromFifaRanking } from "@/data/fifaRankings";
import {
  buildOutcomeProbsFromH2H,
  estimateMatchLambdas,
  type TeamGroupState,
} from "@/utils/matchOutcomeEngine";
import { estimateLambdas } from "@/utils/matchSimulation";

function state(id: number, name: string, prior: number): TeamGroupState {
  return {
    teamId: id,
    teamName: name,
    points: 0,
    goalsFor: 0,
    goalsAgainst: 0,
    priorStrength: prior,
  };
}

describe("matchOutcomeEngine unificación", () => {
  it("grupos y simulador comparten λ para Colombia vs Portugal", () => {
    const col = getStrengthFromFifaRanking("Colombia");
    const por = getStrengthFromFifaRanking("Portugal");
    const colState = state(1, "Colombia", col);
    const porState = state(2, "Portugal", por);

    const fromEngine = estimateMatchLambdas({
      homeState: colState,
      awayState: porState,
      h2h: [],
      isPreTournament: true,
    });

    const fromSim = estimateLambdas({
      teamAId: 1,
      teamBId: 2,
      teamAName: "Colombia",
      teamBName: "Portugal",
      h2h: [],
      playersA: [],
      playersB: [],
      avgGoalsPerMatch: 2.6,
      isPreTournament: true,
    });

    assert.ok(Math.abs(fromEngine.home - fromSim.home) < 0.01);
    assert.ok(Math.abs(fromEngine.away - fromSim.away) < 0.01);
    assert.ok(Math.abs(fromEngine.target1X2.homeWin - fromSim.target1X2.homeWin) < 0.001);
  });

  it("buildOutcomeProbsFromH2H sigue disponible para Monte Carlo", () => {
    const por = state(1, "Portugal", getStrengthFromFifaRanking("Portugal"));
    const uzb = state(2, "Uzbekistan", getStrengthFromFifaRanking("Uzbekistan"));
    const probs = buildOutcomeProbsFromH2H([], 1, 2, [por, uzb], true);
    assert.ok(probs.homeWin > 0.78);
  });
});
