import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  buildPhaseProbsThread,
  formatPhaseProbsListTweet,
} from "./formatPhaseProbsTweets.ts";

describe("formatPhaseProbsTweets", () => {
  const rows = [
    { teamName: "America de Cali", probCuadrangulares: 1 },
    { teamName: "Atletico Nacional", probCuadrangulares: 0.995 },
    { teamName: "Millonarios", probCuadrangulares: 0.738 },
    { teamName: "Independiente Medellin", probCuadrangulares: 0.7 },
    { teamName: "Aguilas Doradas", probCuadrangulares: 0.6 },
    { teamName: "Llaneros", probCuadrangulares: 0.55 },
    { teamName: "Deportes Tolima", probCuadrangulares: 0.5 },
    { teamName: "Bucaramanga", probCuadrangulares: 0.45 },
    { teamName: "Junior", probCuadrangulares: 0.1 },
  ];

  it("lista top 8 con jornada en un tuit ≤280", () => {
    const text = formatPhaseProbsListTweet(rows, 10);
    assert.ok(text.includes("Jornada 10"));
    assert.ok(text.includes("1. América de Cali") || text.includes("1. America de Cali"));
    assert.ok(text.includes("2. Nacional"));
    assert.ok(text.includes("8. Bucaramanga"));
    assert.ok(!text.includes("Junior"));
    assert.ok(text.length <= 280);
  });

  it("hilo = lista + porcentajes", () => {
    const thread = buildPhaseProbsThread(rows, 10);
    assert.equal(thread.length, 2);
    assert.ok(thread[1].includes("%"));
  });
});
