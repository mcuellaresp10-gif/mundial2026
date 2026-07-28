import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { construirAfectacion } from "@/data/carrera/afectaciones";

describe("construirAfectacion", () => {
  it("narra fallo de córners con reputación negativa", () => {
    const text = construirAfectacion(
      "Bromean con hacer un gol olímpico",
      "Probar tiros de esquina en el entrenamiento",
      { reputacion: -1, atributos: { tiro: 2 } }
    );
    assert.match(text, /esquina|córner|partido/i);
    assert.match(text, /-1 reputación|\+2 tiro/);
  });

  it("respeta consecuencia explícita", () => {
    const text = construirAfectacion(
      "X",
      "Y",
      { reputacion: 5 },
      "Quedaste como un crack ante la hinchada"
    );
    assert.match(text, /crack/);
    assert.match(text, /\+5 reputación/);
  });
});
