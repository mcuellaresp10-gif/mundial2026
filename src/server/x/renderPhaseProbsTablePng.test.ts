import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  buildPhaseProbsTableSvg,
  renderPhaseProbsTablePng,
} from "./renderPhaseProbsTablePng.ts";

describe("renderPhaseProbsTablePng", () => {
  const rows = [
    {
      teamName: "America de Cali",
      probCuadrangulares: 0.998,
      probFinal: 0.4,
      probChampion: 0.25,
    },
    {
      teamName: "Atletico Nacional",
      probCuadrangulares: 0.997,
      probFinal: 0.35,
      probChampion: 0.2,
    },
    {
      teamName: "Junior",
      probCuadrangulares: 0.1,
      probFinal: 0.02,
      probChampion: 0.01,
    },
  ];

  it("SVG incluye título y equipos", () => {
    const svg = buildPhaseProbsTableSvg(rows, {
      jornada: 11,
      phase: "clausura",
    });
    assert.ok(svg.includes("Liga BetPlay"));
    assert.ok(svg.includes("Clausura"));
    assert.ok(svg.includes("Jornada 11"));
    assert.ok(svg.includes("América de Cali") || svg.includes("America de Cali"));
    assert.ok(svg.includes("Nacional"));
  });

  it("renderiza PNG con sharp", async () => {
    const png = await renderPhaseProbsTablePng(rows, {
      jornada: 11,
      phase: "clausura",
      simulations: 1000,
    });
    assert.ok(png.length > 1000);
    // PNG signature
    assert.equal(png[0], 0x89);
    assert.equal(png[1], 0x50);
  });
});
