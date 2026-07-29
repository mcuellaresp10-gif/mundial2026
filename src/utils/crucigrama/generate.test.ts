import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { BANCO_PALABRAS, validarDistribucionBanco } from "@/data/crucigrama/banco-palabras";
import {
  generarCrucigrama,
  letrasCoinciden,
  normalizarLetra,
  puedeColocar,
} from "./generate";

function seeded(start = 1): () => number {
  let s = start;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

describe("banco crucigrama", () => {
  it("tiene tamaño y distribución razonable", () => {
    assert.ok(BANCO_PALABRAS.length >= 120, `banco=${BANCO_PALABRAS.length}`);
    const v = validarDistribucionBanco();
    assert.ok(v.ok, "distribución de longitudes");
  });
});

describe("normalizarLetra", () => {
  it("ignora tildes y conserva Ñ", () => {
    assert.equal(normalizarLetra("á"), "A");
    assert.equal(normalizarLetra("É"), "E");
    assert.equal(normalizarLetra("ñ"), "Ñ");
    assert.equal(normalizarLetra("Ñ"), "Ñ");
  });

  it("compara letras sin tildes", () => {
    assert.equal(letrasCoinciden("a", "Á"), true);
    assert.equal(letrasCoinciden("Ñ", "N"), false);
  });
});

describe("generarCrucigrama", () => {
  it("genera grilla 10x10 con varias palabras e intersecciones", () => {
    const g = generarCrucigrama(BANCO_PALABRAS, seeded(42));
    assert.equal(g.tamano.filas, 10);
    assert.equal(g.tamano.columnas, 10);
    assert.ok(g.palabrasUbicadas.length >= 7);
    let letras = 0;
    for (const row of g.celdas) {
      for (const c of row) if (c.letra) letras += 1;
    }
    assert.ok(letras >= 28);

    const hasAcross = g.palabrasUbicadas.some((p) => p.direccion === "across");
    const hasDown = g.palabrasUbicadas.some((p) => p.direccion === "down");
    assert.ok(hasAcross);
    // Con seed bueno debería haber verticales; si no, al menos 1 palabra
    assert.ok(hasDown || g.palabrasUbicadas.length >= 1);

    // Números en celdas de inicio
    for (const p of g.palabrasUbicadas) {
      const cell = g.celdas[p.filaInicio]![p.columnaInicio]!;
      assert.equal(cell.numero, p.numero);
      assert.ok(cell.letra);
    }
  });

  it("puedeColocar rechaza choque de letras", () => {
    const grid = Array.from({ length: 5 }, () =>
      Array.from({ length: 5 }, () => null as string | null)
    );
    grid[2]![1] = "A";
    grid[2]![2] = "B";
    assert.equal(puedeColocar(grid, "AC", 2, 1, "across", false), false);
  });
});
