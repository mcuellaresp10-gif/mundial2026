import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  getEditionSummary,
  searchHistory,
  WORLD_CUP_EDITIONS,
  WORLD_CUP_RECORDS,
  getTeamWorldCupHistory,
  formatTeamWorldCupHistory,
  formatChronologicalTimeline,
  formatWorldCup2026FramingBlock,
} from "@/data/worldCupHistory";

describe("worldCupHistory", () => {
  it("incluye ediciones clave desde 1930", () => {
    assert.ok(WORLD_CUP_EDITIONS[1930]);
    assert.ok(WORLD_CUP_EDITIONS[1986]);
    assert.ok(WORLD_CUP_EDITIONS[2022]);
  });

  it("getEditionSummary devuelve campeón correcto", () => {
    const e = getEditionSummary(2022);
    assert.equal(e?.champion, "Argentina");
    assert.equal(e?.runnerUp, "Francia");
  });

  it("searchHistory encuentra por año", () => {
    const hits = searchHistory("Mundial 2014");
    assert.equal(hits.length, 1);
    assert.equal(hits[0].year, 2014);
  });

  it("searchHistory encuentra por país campeón", () => {
    const hits = searchHistory("Brasil");
    assert.ok(hits.length >= 3);
    assert.ok(hits.some((h) => h.champion === "Brasil"));
  });

  it("expone récords históricos", () => {
    assert.equal(WORLD_CUP_RECORDS.allTimeTopScorer.name, "Miroslav Klose");
    assert.ok(WORLD_CUP_RECORDS.mostTitles[0].titles >= 4);
  });

  it("resume palmarés por selección", () => {
    const br = getTeamWorldCupHistory("brasil");
    assert.ok(br);
    assert.ok(br!.titles.length >= 5);
    const block = formatTeamWorldCupHistory("brasil");
    assert.match(block!, /Campeonatos \(5\)/);
  });

  it("expone cronología y framing 2026 para el agente", () => {
    const timeline = formatChronologicalTimeline();
    assert.match(timeline, /1930/);
    assert.match(timeline, /2022/);
    assert.match(formatWorldCup2026FramingBlock(), /48 selecciones/);
  });
});
