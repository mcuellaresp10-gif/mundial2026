import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  getEffectiveTeamStrength,
  getFifaStrengthGap,
  scaleFormStrength,
} from "@/data/teamStrengthPriors";
import { getStrengthFromFifaRanking } from "@/data/fifaRankings";

describe("teamStrengthPriors", () => {
  it("pre-torneo usa solo FIFA sin duplicar forma", () => {
    const fifa = getStrengthFromFifaRanking("Colombia");
    const effective = getEffectiveTeamStrength("Colombia", 9, 3, 8, 2, true);
    assert.equal(effective, fifa);
  });

  it("durante torneo mezcla 75% FIFA + 25% forma sin sumar forma dos veces", () => {
    const fifa = getStrengthFromFifaRanking("Colombia");
    const form = scaleFormStrength(9, 8, 2);
    const expected = fifa * 0.75 + form * 0.25;
    const effective = getEffectiveTeamStrength("Colombia", 9, 3, 8, 2, false);
    assert.ok(Math.abs(effective - expected) < 0.01);
    assert.ok(effective < fifa + 15, `effective=${effective} no debe explotar`);
  });

  it("Colombia vs Portugal gap FIFA es pequeño", () => {
    const gap = getFifaStrengthGap("Colombia", "Portugal");
    assert.ok(Math.abs(gap) < 8, `gap=${gap}`);
  });
});
