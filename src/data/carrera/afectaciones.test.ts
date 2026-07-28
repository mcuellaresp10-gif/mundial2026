import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { construirAfectacion } from "@/data/carrera/afectaciones";

describe("construirAfectacion", () => {
  it("devuelve chips de impacto", () => {
    const text = construirAfectacion(
      "Bromean con hacer un gol olímpico",
      "Probar tiros de esquina en el entrenamiento",
      { reputacion: -1, atributos: { tiro: 2 } }
    );
    assert.match(text, /-1 reputación/);
    assert.match(text, /\+2 tiro/);
    assert.match(text, /·/);
  });

  it("respeta consecuencia explícita corta + chips", () => {
    const text = construirAfectacion(
      "X",
      "Y",
      { reputacion: 5 },
      "Quedaste como un crack ante la hinchada"
    );
    assert.match(text, /crack/);
    assert.match(text, /\+5 reputación/);
  });

  it("chips de consecuencias de carrera", () => {
    const text = construirAfectacion("X", "Y", {
      transferencia: "ascenso",
      convocatoria: "mayor",
      forzarLesion: "leve",
      buscarSalida: true,
    });
    assert.match(text, /cambio de club/);
    assert.match(text, /busca salida/);
    assert.match(text, /convocado mayor/);
    assert.match(text, /lesión/);
  });
});
