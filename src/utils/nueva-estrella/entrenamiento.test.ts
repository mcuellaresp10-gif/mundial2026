import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { gananciaEntrenamiento } from "./entrenamiento";

describe("gananciaEntrenamiento soft-cap", () => {
  it("bajo 70 da ganancia plena", () => {
    assert.equal(gananciaEntrenamiento(50, "perfecto"), 3);
    assert.equal(gananciaEntrenamiento(50, "bien"), 2);
    assert.equal(gananciaEntrenamiento(50, "fallo"), 0);
  });

  it("cerca de 99 reduce y topea en el techo", () => {
    assert.equal(gananciaEntrenamiento(75, "perfecto"), 2);
    assert.equal(gananciaEntrenamiento(90, "bien"), 1);
    assert.equal(gananciaEntrenamiento(95, "bien"), 0);
    assert.equal(gananciaEntrenamiento(95, "perfecto"), 1);
    assert.equal(gananciaEntrenamiento(98, "perfecto"), 1);
    assert.equal(gananciaEntrenamiento(99, "perfecto"), 0);
  });
});
