import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  lineupGridToPitch,
  shouldFlipLineupLabel,
  toSafeLineupPitchCoord,
} from "./lineupGrid";
import type { LineupPlayer } from "@/types";

function xi(grids: string[]): LineupPlayer[] {
  return grids.map((grid, i) => ({
    player: {
      id: i + 1,
      name: `Player ${i + 1}`,
      number: i + 1,
      pos: "M",
      grid,
    },
  }));
}

describe("lineupGrid", () => {
  it("aplica márgenes internos a las coordenadas", () => {
    const top = toSafeLineupPitchCoord(50, 0);
    const bottom = toSafeLineupPitchCoord(50, 100);
    assert.ok(top.y >= 14);
    assert.ok(bottom.y <= 86);
    assert.ok(top.x >= 10);
    assert.ok(top.x <= 90);
  });

  it("coloca portero abajo y delantero arriba con grid API", () => {
    const startXI = xi(["1:1", "2:2", "3:2", "4:2", "5:1"]);
    const gk = lineupGridToPitch("1:1", startXI);
    const st = lineupGridToPitch("5:1", startXI);
    assert.ok(gk.y > st.y);
    assert.ok(gk.y >= 68);
    assert.ok(st.y <= 32);
  });

  it("marca etiqueta invertida en zona baja del campo", () => {
    assert.equal(shouldFlipLineupLabel(70), true);
    assert.equal(shouldFlipLineupLabel(40), false);
  });
});
