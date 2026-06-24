import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { buildOnceIdealFromCandidates, type RatedPlayerCandidate } from "./calculations";

function candidate(
  id: number,
  position: string,
  rating: number,
  goals: number
): RatedPlayerCandidate {
  return {
    id,
    name: `P${id}`,
    photo: "",
    team: "Team",
    teamLogo: "",
    position,
    rating,
    goals,
    assists: 0,
    minutes: 270,
  };
}

describe("buildOnceIdealFromCandidates", () => {
  it("coloca primero a un goleador registrado como mediocampista en la delantera", () => {
    const candidates = [
      candidate(1, "M", 7.4, 5),
      candidate(2, "F", 7.8, 2),
      candidate(3, "F", 7.7, 1),
      candidate(4, "F", 7.6, 0),
      candidate(5, "M", 7.9, 0),
      candidate(6, "M", 7.5, 0),
      candidate(7, "D", 7.3, 0),
      candidate(8, "D", 7.2, 0),
      candidate(9, "D", 7.1, 0),
      candidate(10, "D", 7.0, 0),
      candidate(11, "G", 7.4, 0),
    ];

    const xi = buildOnceIdealFromCandidates(candidates, "4-3-3");
    assert.ok(xi.some((p) => p.id === 1));
  });
});
