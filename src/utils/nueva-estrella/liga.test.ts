import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  crearTemporadaLiga,
  generarFixtureSoloIda,
  ordenarTabla,
  resolverJornada,
  semanasPorLiga,
} from "./liga";

describe("liga nueva-estrella", () => {
  it("fixture solo ida: N-1 jornadas y cada par una vez", () => {
    const ids = ["a", "b", "c", "d"];
    const fixture = generarFixtureSoloIda(ids);
    assert.equal(fixture.length, 3);
    const pairs = new Set<string>();
    for (const j of fixture) {
      assert.equal(j.length, 2);
      for (const p of j) {
        const key = [p.localId, p.visitanteId].sort().join("-");
        assert.equal(pairs.has(key), false);
        pairs.add(key);
      }
    }
    assert.equal(pairs.size, 6);
  });

  it("BetPlay tiene semanas = clubes - 1", () => {
    assert.equal(semanasPorLiga("liga-betplay"), 17);
  });

  it("resolver jornada actualiza tabla y pts", () => {
    let t = crearTemporadaLiga("liga-betplay", 1);
    const jornada = 1;
    t = resolverJornada(t, jornada, null, () => 0.5);
    assert.ok(t.resultados.length > 0);
    assert.equal(t.jornadaActual, 2);
    const sumaPj = t.tabla.reduce((s, f) => s + f.pj, 0);
    assert.equal(sumaPj, t.clubIds.length); // cada club jugó 1
    const ordered = ordenarTabla(t.tabla);
    assert.ok(ordered[0]!.pts >= ordered[ordered.length - 1]!.pts);
  });

  it("override del jugador fija el marcador", () => {
    let t = crearTemporadaLiga("liga-betplay", 1);
    const clubId = t.clubIds[0]!;
    const partido = t.fixture[0]!.find(
      (p) => p.localId === clubId || p.visitanteId === clubId
    )!;
    t = resolverJornada(
      t,
      1,
      { clubId, golesFavor: 3, golesContra: 1 },
      () => 0.1
    );
    const res = t.resultados.find(
      (r) =>
        r.jornada === 1 &&
        (r.localId === clubId || r.visitanteId === clubId)
    )!;
    if (partido.localId === clubId) {
      assert.equal(res.golesLocal, 3);
      assert.equal(res.golesVisitante, 1);
    } else {
      assert.equal(res.golesLocal, 1);
      assert.equal(res.golesVisitante, 3);
    }
  });
});
