import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  isSlotClinched,
  knockoutSlotKey,
  type KnockoutSlotCandidate,
} from "./knockoutSlotProbabilities";

describe("knockoutSlotProbabilities", () => {
  it("knockoutSlotKey formatea matchId y lado", () => {
    assert.equal(knockoutSlotKey(79, "home"), "79:home");
    assert.equal(knockoutSlotKey(80, "away"), "80:away");
  });

  it("isSlotClinched detecta candidato único con alta probabilidad", () => {
    const clinched: KnockoutSlotCandidate[] = [
      { teamId: 1, name: "Mexico", logo: "", probability: 100 },
    ];
    assert.equal(isSlotClinched(clinched), true);

    const open: KnockoutSlotCandidate[] = [
      { teamId: 1, name: "Ecuador", logo: "", probability: 55 },
      { teamId: 2, name: "Scotland", logo: "", probability: 19 },
    ];
    assert.equal(isSlotClinched(open), false);
  });
});
