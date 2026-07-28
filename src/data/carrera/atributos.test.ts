import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  ATRIBUTOS_INICIALES,
  calcularMedia,
} from "@/data/carrera/atributos";

describe("calcularMedia", () => {
  it("devuelve overall ponderado por posición", () => {
    const media = calcularMedia(ATRIBUTOS_INICIALES.delantero, "delantero");
    assert.ok(media >= 40 && media <= 70);
    const alto = calcularMedia(
      { ...ATRIBUTOS_INICIALES.delantero, tiro: 90, ritmo: 85 },
      "delantero"
    );
    assert.ok(alto > media);
  });
});
