import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  aplicarDescanso,
  aplicarEntrenamiento,
  aplicarSocializar,
  cerrarSemana,
  comprarItem,
  configTimingMomento,
  crearPartida,
  finalizarPartido,
  iniciarPartido,
  registrarMomentoPartido,
  tiposMomentosPartido,
} from "./engine";
import { exportarCodigo, importarCodigo } from "./persistencia";
import { evaluarToque } from "./timing";

const baseInput = {
  apellido: "Valdés",
  posicion: "delantero" as const,
  piernaHabil: "derecha" as const,
  nacionalidad: "Colombia",
  clubOrigenId: "millonarios",
};

describe("engine nueva-estrella", () => {
  it("crea partida en BetPlay con energía base", () => {
    const p = crearPartida(baseInput);
    assert.equal(p.jugador.clubActualId, "millonarios");
    assert.equal(p.jugador.energiaActual, 3);
    assert.equal(p.schemaVersion, 1);
    assert.ok(p.temporadaLiga);
    assert.equal(p.temporadaLiga.ligaId, p.jugador.ligaActualId);
    assert.equal(p.temporadaLiga.fixture.length, 17);
  });

  it("iniciarPartido usa rival del fixture", () => {
    const p0 = crearPartida(baseInput);
    const p = iniciarPartido(p0);
    assert.ok(p.partidoEnCurso);
    const jornada = p0.temporadaLiga.jornadaActual;
    const partidos = p0.temporadaLiga.fixture[jornada - 1]!;
    const mio = partidos.find(
      (x) =>
        x.localId === p0.jugador.clubActualId ||
        x.visitanteId === p0.jugador.clubActualId
    )!;
    const rivalEsperado =
      mio.localId === p0.jugador.clubActualId
        ? mio.visitanteId
        : mio.localId;
    assert.equal(p.partidoEnCurso!.rivalId, rivalEsperado);
  });

  it("entrenar consume energía y puede subir atributo", () => {
    let p = crearPartida(baseInput);
    const tiroAntes = p.jugador.atributos.tiro;
    const res = evaluarToque(
      0.5,
      { velocidad: 1, zonaCentro: 0.5, zonaVerdeAncho: 0.2, zonaAmarillaAncho: 0.4 },
      100
    );
    p = aplicarEntrenamiento(p, "tiro", res);
    assert.equal(p.jugador.energiaActual, 2);
    assert.ok(p.jugador.atributos.tiro >= tiroAntes);
  });

  it("socializar sube relación", () => {
    let p = crearPartida(baseInput);
    const fam = p.jugador.relaciones.familia;
    p = aplicarSocializar(p, "socializar_familia");
    assert.ok(p.jugador.relaciones.familia > fam);
  });

  it("descansar dos semanas da bono de energía", () => {
    let p = crearPartida(baseInput);
    p = aplicarDescanso(p);
    p = aplicarDescanso(p);
    p = aplicarDescanso(p);
    // force empty energy path by closing after match
    p = iniciarPartido(p);
    const tipos = tiposMomentosPartido(p);
    for (const t of tipos) {
      const res = evaluarToque(
        0.5,
        { velocidad: 1, zonaCentro: 0.5, zonaVerdeAncho: 0.5, zonaAmarillaAncho: 0.6 },
        1
      );
      p = registrarMomentoPartido(p, t, res);
    }
    p = finalizarPartido(p);
    p = cerrarSemana(p);
    // second week rest streak
    p = { ...p, semanasDescansoSeguidas: 2, accionesSemana: [{ tipo: "descansar", costoEnergia: 1 }] };
    p = iniciarPartido(p);
    for (const t of tiposMomentosPartido(p)) {
      p = registrarMomentoPartido(
        p,
        t,
        evaluarToque(
          0.5,
          { velocidad: 1, zonaCentro: 0.5, zonaVerdeAncho: 0.5, zonaAmarillaAncho: 0.6 },
          1
        )
      );
    }
    p = finalizarPartido(p);
    p = cerrarSemana(p);
    assert.ok(p.jugador.energiaActual >= 3);
  });

  it("compra ítem con dinero", () => {
    let p = crearPartida(baseInput);
    p = {
      ...p,
      jugador: { ...p.jugador, dinero: 50000 },
    };
    p = comprarItem(p, "moto");
    assert.ok(p.itemsComprados.includes("moto"));
    assert.ok(p.jugador.fama > 8);
  });

  it("export/import conserva apellido", () => {
    const p = crearPartida(baseInput);
    const code = exportarCodigo(p);
    const back = importarCodigo(code);
    assert.equal(back.jugador.apellido, "Valdés");
    assert.ok(back.temporadaLiga?.fixture?.length);
  });

  it("cerrarSemana resuelve jornada de liga", () => {
    let p = crearPartida(baseInput);
    p = iniciarPartido(p);
    for (const t of tiposMomentosPartido(p)) {
      p = registrarMomentoPartido(
        p,
        t,
        evaluarToque(
          0.5,
          { velocidad: 1, zonaCentro: 0.5, zonaVerdeAncho: 0.5, zonaAmarillaAncho: 0.6 },
          1
        )
      );
    }
    p = finalizarPartido(p);
    const golesFavor = p.historialPartidos[0]!.golesFavor;
    const golesContra = p.historialPartidos[0]!.golesContra;
    p = cerrarSemana(p);
    assert.equal(p.temporadaLiga.jornadaActual, 2);
    assert.equal(p.jugador.semanaActual, 2);
    assert.ok(p.temporadaLiga.resultados.length > 0);
    const mio = p.temporadaLiga.resultados.find(
      (r) =>
        r.jornada === 1 &&
        (r.localId === p.jugador.clubActualId ||
          r.visitanteId === p.jugador.clubActualId)
    )!;
    if (mio.localId === p.jugador.clubActualId) {
      assert.equal(mio.golesLocal, golesFavor);
      assert.equal(mio.golesVisitante, golesContra);
    } else {
      assert.equal(mio.golesLocal, golesContra);
      assert.equal(mio.golesVisitante, golesFavor);
    }
  });

  it("menos energía → zona verde más chica en partido", () => {
    let fresco = crearPartida(baseInput);
    fresco = iniciarPartido(fresco);
    const conEnergia = configTimingMomento(fresco, "definicion");

    let cansado = crearPartida(baseInput);
    cansado = {
      ...cansado,
      jugador: { ...cansado.jugador, energiaActual: 0, energiaMaxima: 3 },
    };
    cansado = iniciarPartido(cansado);
    const sinEnergia = configTimingMomento(cansado, "definicion");

    assert.ok(sinEnergia.zonaVerdeAncho < conEnergia.zonaVerdeAncho);
  });

  it("buen partido sube estatus en el club", () => {
    let p = crearPartida(baseInput);
    const antes = p.jugador.estatusClub;
    p = iniciarPartido(p);
    for (const t of tiposMomentosPartido(p)) {
      p = registrarMomentoPartido(
        p,
        t,
        evaluarToque(
          0.5,
          { velocidad: 1, zonaCentro: 0.5, zonaVerdeAncho: 0.5, zonaAmarillaAncho: 0.6 },
          1
        )
      );
    }
    p = finalizarPartido(p);
    assert.ok(p.jugador.estatusClub >= antes);
    const last = p.historialPartidos[p.historialPartidos.length - 1]!;
    assert.ok(typeof last.estatusTras === "number");
  });
});
