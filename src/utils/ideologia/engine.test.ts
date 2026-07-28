import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { ARQUETIPOS_DT } from "@/data/ideologia/arquetipos";
import { DILEMAS } from "@/data/ideologia/dilemas";
import {
  acumularRespuestas,
  calcularResultadoTest,
  distanciaEuclidiana,
  maxAbsPorEje,
  normalizarEjes,
  porcentajePoloDerecho,
} from "./engine";
import type { EleccionDilema } from "@/data/ideologia/types";

describe("ideologia dilemas bank", () => {
  it("tiene 20 dilemas con 2 opciones", () => {
    assert.equal(DILEMAS.length, 20);
    for (const d of DILEMAS) {
      assert.ok(d.opcionA.texto.length > 5);
      assert.ok(d.opcionB.texto.length > 5);
    }
  });

  it("cubre los 4 ejes en al menos 6 preguntas c/u", () => {
    const counts = {
      resultadismoIdealismo: 0,
      ordenLibertad: 0,
      posesionVerticalidad: 0,
      individualColectivo: 0,
    };
    for (const d of DILEMAS) {
      for (const key of Object.keys(counts) as (keyof typeof counts)[]) {
        if (
          (d.opcionA.efectos[key] ?? 0) !== 0 ||
          (d.opcionB.efectos[key] ?? 0) !== 0
        ) {
          counts[key] += 1;
        }
      }
    }
    for (const [k, n] of Object.entries(counts)) {
      assert.ok(n >= 6, `${k}=${n}`);
    }
  });
});

describe("porcentajePoloDerecho", () => {
  it("mapea +44 a ~72%", () => {
    assert.equal(porcentajePoloDerecho(44), 72);
  });
  it("mapea extremos", () => {
    assert.equal(porcentajePoloDerecho(-100), 0);
    assert.equal(porcentajePoloDerecho(100), 100);
    assert.equal(porcentajePoloDerecho(0), 50);
  });
});

describe("calcularResultadoTest", () => {
  it("elige un DT y normaliza ejes", () => {
    const elecciones: EleccionDilema[] = DILEMAS.map((_, i) =>
      i % 2 === 0 ? "A" : "B"
    );
    const r = calcularResultadoTest(elecciones);
    assert.ok(ARQUETIPOS_DT.some((a) => a.id === r.arquetipoGanador.id));
    assert.equal(r.porcentajesPorEje.length, 4);
    for (const v of Object.values(r.ejesUsuario)) {
      assert.ok(v >= -100 && v <= 100);
    }
  });

  it("idealismo extremo se acerca a un DT de ideario fuerte", () => {
    const elecciones: EleccionDilema[] = DILEMAS.map((d) => {
      const a = d.opcionA.efectos.resultadismoIdealismo ?? 0;
      const b = d.opcionB.efectos.resultadismoIdealismo ?? 0;
      return b >= a ? "B" : "A";
    });
    const r = calcularResultadoTest(elecciones);
    assert.ok(
      ["menotti", "bielsa", "guardiola", "maturana"].includes(
        r.arquetipoGanador.id
      ),
      r.arquetipoGanador.id
    );
  });

  it("distancia al ganador es la mínima del ranking", () => {
    const elecciones = DILEMAS.map(() => "A" as const);
    const r = calcularResultadoTest(elecciones);
    assert.equal(r.distanciaAlGanador, r.ranking[0].distancia);
    assert.ok(r.ranking[0].distancia <= r.ranking[1].distancia);
  });
});

describe("normalizarEjes", () => {
  it("respeta techos", () => {
    const techos = maxAbsPorEje();
    const crudo = acumularRespuestas(
      DILEMAS,
      DILEMAS.map(() => "A")
    );
    const n = normalizarEjes(crudo, techos);
    for (const v of Object.values(n)) {
      assert.ok(v >= -100 && v <= 100);
    }
  });
});

describe("distanciaEuclidiana", () => {
  it("cero entre iguales", () => {
    const v = { resultadismoIdealismo: 10, ordenLibertad: -5, posesionVerticalidad: 0, individualColectivo: 20 };
    assert.equal(distanciaEuclidiana(v, v), 0);
  });
});
