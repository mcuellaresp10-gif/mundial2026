import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { EVENTOS_CARRERA } from "./eventos";
import type { EfectosDecision } from "./types";

const RE_TRANSFER =
  /pr[eé]stamo|venderte|buscar destino|club menor|aceptar el ascenso|\bfichar\b|aceptar la oferta de|volver a colombia|club de origen/i;
const RE_SALIDA = /pedir la salida|pedir salida/i;
const RE_SELECCION = /selecci[oó]n|convocat/i;
const RE_LESION_FUERTE = /jugar lesionado|operarte/i;
const RE_ACELERAR = /acelerar (el )?retorno/i;

function hasCareerMove(ef: EfectosDecision): boolean {
  return Boolean(ef.transferencia || ef.buscarSalida);
}

function hasLesionConsequence(ef: EfectosDecision): boolean {
  if (ef.forzarLesion) return true;
  return (ef.riesgoLesion ?? 0) >= 0.2;
}

describe("coherencia de eventos de carrera", () => {
  it("opciones que prometen mudanza llevan transferencia o buscarSalida", () => {
    const mismatches: string[] = [];
    for (const ev of EVENTOS_CARRERA) {
      for (const op of ev.opciones) {
        if (RE_TRANSFER.test(op.texto) && !hasCareerMove(op.efectos)) {
          mismatches.push(`${ev.id} · «${op.texto}»`);
        }
        if (RE_SALIDA.test(op.texto) && !op.efectos.buscarSalida) {
          mismatches.push(`${ev.id} · salida sin flag · «${op.texto}»`);
        }
      }
    }
    assert.equal(
      mismatches.length,
      0,
      `Promesa de club sin efecto:\n${mismatches.slice(0, 20).join("\n")}`
    );
  });

  it("opciones de selección/convocatoria fuerzan convocatoria", () => {
    const mismatches: string[] = [];
    for (const ev of EVENTOS_CARRERA) {
      for (const op of ev.opciones) {
        if (RE_SELECCION.test(op.texto) && !op.efectos.convocatoria) {
          mismatches.push(`${ev.id} · «${op.texto}»`);
        }
      }
    }
    assert.equal(
      mismatches.length,
      0,
      `Selección sin convocatoria:\n${mismatches.slice(0, 20).join("\n")}`
    );
  });

  it("jugar lesionado / operarte / acelerar retorno tienen daño real", () => {
    const mismatches: string[] = [];
    for (const ev of EVENTOS_CARRERA) {
      for (const op of ev.opciones) {
        if (RE_LESION_FUERTE.test(op.texto) && !hasLesionConsequence(op.efectos)) {
          mismatches.push(`${ev.id} · «${op.texto}»`);
        }
        if (
          RE_ACELERAR.test(op.texto) &&
          !op.efectos.forzarLesion &&
          (op.efectos.riesgoLesion ?? 0) < 0.2
        ) {
          mismatches.push(`${ev.id} · acelerar suave · «${op.texto}»`);
        }
      }
    }
    assert.equal(
      mismatches.length,
      0,
      `Lesión prometida sin efecto:\n${mismatches.slice(0, 20).join("\n")}`
    );
  });

  it("el banco tiene mudanzas reales (no solo stats)", () => {
    const conTransfer = EVENTOS_CARRERA.filter((e) =>
      e.opciones.some((o) => o.efectos.transferencia)
    );
    assert.ok(
      conTransfer.length >= 20,
      `solo ${conTransfer.length} eventos con transferencia`
    );
  });
});
