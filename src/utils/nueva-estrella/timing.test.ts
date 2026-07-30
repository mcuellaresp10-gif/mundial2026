import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  configTimingDesdeAtributo,
  evaluarToque,
  posicionIndicador,
} from "./timing";

describe("timing nueva-estrella", () => {
  it("ping-pong oscila entre 0 y 1", () => {
    const v = 1;
    assert.equal(posicionIndicador(0, v), 0);
    assert.ok(posicionIndicador(250, v) > 0.2);
    assert.ok(Math.abs(posicionIndicador(1000, v) - 1) < 0.01);
    assert.ok(posicionIndicador(1500, v) < 0.6);
  });

  it("evalúa zonas verde / amarilla / fallo", () => {
    const cfg = {
      velocidad: 1,
      zonaCentro: 0.5,
      zonaVerdeAncho: 0.1,
      zonaAmarillaAncho: 0.3,
    };
    assert.equal(evaluarToque(0.5, cfg, 10).tipo, "perfecto");
    assert.equal(evaluarToque(0.62, cfg, 10).tipo, "bien");
    assert.equal(evaluarToque(0.9, cfg, 10).tipo, "fallo");
  });

  it("mejor atributo → zona más ancha o más lento", () => {
    const bajo = configTimingDesdeAtributo(30, 0.5);
    const alto = configTimingDesdeAtributo(90, 0.5);
    assert.ok(alto.zonaVerdeAncho >= bajo.zonaVerdeAncho);
    assert.ok(alto.velocidad <= bajo.velocidad);
  });

  it("más dificultad → zona verde más chica", () => {
    const facil = configTimingDesdeAtributo(70, 0.1);
    const dificil = configTimingDesdeAtributo(70, 0.9);
    assert.ok(dificil.zonaVerdeAncho < facil.zonaVerdeAncho);
  });
});
