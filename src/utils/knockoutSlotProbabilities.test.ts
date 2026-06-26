import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  canShowSlotAsClinched,
  isSlotClinched,
  knockoutSlotKey,
} from "./knockoutSlotProbabilities";

describe("knockoutSlotProbabilities", () => {
  it("knockoutSlotKey formatea matchId y lado", () => {
    assert.equal(knockoutSlotKey(79, "home"), "79:home");
    assert.equal(knockoutSlotKey(80, "away"), "80:away");
  });

  it("isSlotClinched detecta candidato único con alta probabilidad", () => {
    assert.equal(
      isSlotClinched([{ teamId: 1, name: "Mexico", logo: "", probability: 100 }]),
      true
    );
    assert.equal(
      isSlotClinched([
        { teamId: 1, name: "Ecuador", logo: "", probability: 55 },
        { teamId: 2, name: "Scotland", logo: "", probability: 19 },
      ]),
      false
    );
  });

  it("canShowSlotAsClinched no confirma mejor tercero sin todos los grupos cerrados", () => {
    assert.equal(
      canShowSlotAsClinched(
        { type: "third", eligibleGroups: ["C", "E"], annexWinnerSlot: "1A" },
        {
          label: "3C",
          team: { teamId: 1, name: "Ecuador", logo: "" },
          provisional: true,
        },
        [{ teamId: 1, name: "Ecuador", logo: "", probability: 100 }],
        false
      ),
      false
    );
  });
});
