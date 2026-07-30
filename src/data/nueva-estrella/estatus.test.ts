import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  aplicarDeltaEstatus,
  deltaEstatusPorPartido,
  estatusDesdePuntos,
  labelEstatusClub,
} from "@/data/nueva-estrella/estatus";

describe("estatus club", () => {
  it("mapea umbrales a roles", () => {
    assert.equal(estatusDesdePuntos(0), "reserva");
    assert.equal(estatusDesdePuntos(25), "titular");
    assert.equal(estatusDesdePuntos(45), "figura");
    assert.equal(estatusDesdePuntos(65), "capitan");
    assert.equal(estatusDesdePuntos(90), "idolo");
    assert.equal(labelEstatusClub(90), "Ídolo");
  });

  it("buenas notas suben y malas bajan", () => {
    assert.ok(deltaEstatusPorPartido(9, 1, 0) > 0);
    assert.ok(deltaEstatusPorPartido(3, 0, 0) < 0);
    assert.equal(aplicarDeltaEstatus(95, 10), 100);
    assert.equal(aplicarDeltaEstatus(5, -10), 0);
  });
});
