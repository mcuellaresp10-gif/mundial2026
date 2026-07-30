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
