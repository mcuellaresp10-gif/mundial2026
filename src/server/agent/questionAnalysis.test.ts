import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { analyzeAgentQuestion } from "@/server/agent/questionAnalysis";

describe("analyzeAgentQuestion", () => {
  it("detecta preguntas históricas por año", () => {
    const h = analyzeAgentQuestion("¿Qué pasó en el Mundial de 1986?");
    assert.equal(h.wantsHistory, true);
    assert.equal(h.historyYear, 1986);
  });

  it("detecta probabilidades y equipo", () => {
    const h = analyzeAgentQuestion("¿Cuál es la probabilidad de que Colombia clasifique?");
    assert.equal(h.wantsProbabilities, true);
    assert.equal(h.wantsTeamStats, true);
    assert.ok(h.teamKey?.includes("colombia"));
  });

  it("detecta mejores terceros", () => {
    const h = analyzeAgentQuestion("¿Cuáles son los mejores terceros?");
    assert.equal(h.wantsBestThirds, true);
  });

  it("detecta récords históricos", () => {
    const h = analyzeAgentQuestion("¿Quién es el máximo goleador histórico en Mundiales?");
    assert.equal(h.wantsRecords, true);
    assert.equal(h.wantsHistory, true);
  });

  it("detecta alineaciones", () => {
    const h = analyzeAgentQuestion("¿Cuál es la alineación de Colombia?");
    assert.equal(h.wantsLineups, true);
    assert.ok(h.teamKey?.includes("colombia"));
  });
});
