import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  aplicarCrecimientoPorRendimiento,
  calcularRendimiento,
  crearJugador,
  EDAD_INICIO,
  evaluarAscensoProfesional,
  evaluarConvocatoria,
  evaluarFinCarreraAnticipado,
  evaluarOfertaTransferencia,
  evaluarTrofeosYPremios,
  iniciarPrimeraTemporada,
  estadoInicial,
  cerrarTemporada,
  resolverDecisiones,
  resolverTransferenciaPorDestino,
  statsDesdeRendimiento,
  tramoDesdeEdad,
  RACHA_TRANSFERENCIA,
  UMBRAL_RENDIMIENTO_TRANSFERENCIA,
} from "./engine";
import { ATRIBUTOS_INICIALES } from "@/data/carrera/atributos";

function seededRng(start = 1): () => number {
  let seed = start;
  return () => {
    seed = (seed * 16807) % 2147483647;
    return (seed - 1) / 2147483646;
  };
}

describe("evaluarAscensoProfesional", () => {
  it("garantiza ascenso a los 19", () => {
    assert.equal(
      evaluarAscensoProfesional({
        yaProfesional: false,
        edad: 19,
        rendimiento: 0.4,
        reputacion: 0,
        rng: () => 0.99,
      }),
      true
    );
  });

  it("no garantiza a los 18 con campaña floja", () => {
    assert.equal(
      evaluarAscensoProfesional({
        yaProfesional: false,
        edad: 18,
        rendimiento: 0.4,
        reputacion: 0,
        rng: () => 0.99,
      }),
      false
    );
  });

  it("no vuelve a ascender si ya es profesional", () => {
    assert.equal(
      evaluarAscensoProfesional({
        yaProfesional: true,
        edad: 20,
        rendimiento: 0.9,
        reputacion: 50,
        rng: () => 0.01,
      }),
      false
    );
  });
});

describe("tramoDesdeEdad", () => {
  it("mapea tramos", () => {
    assert.equal(tramoDesdeEdad(15), "cantera");
    assert.equal(tramoDesdeEdad(22), "consolidacion");
    assert.equal(tramoDesdeEdad(28), "prime");
    assert.equal(tramoDesdeEdad(35), "veteran");
  });
});

describe("crearJugador", () => {
  it("arranca a los 15 en BetPlay con attrs de posición", () => {
    const j = crearJugador({
      apellido: "García",
      posicion: "delantero",
      piernaHabil: "derecha",
      nacionalidad: "Colombia",
      clubOrigenId: "millonarios",
    });
    assert.equal(j.edad, EDAD_INICIO);
    assert.equal(j.ligaActualId, "liga-betplay");
    assert.equal(j.atributos.tiro, ATRIBUTOS_INICIALES.delantero.tiro);
  });

  it("rechaza club no BetPlay", () => {
    assert.throws(() =>
      crearJugador({
        apellido: "X",
        posicion: "arquero",
        piernaHabil: "izquierda",
        nacionalidad: "Colombia",
        clubOrigenId: "real-madrid",
      })
    );
  });
});

describe("calcularRendimiento", () => {
  it("queda entre bandas razonables en cantera", () => {
    const rng = seededRng(9);
    const r = calcularRendimiento(ATRIBUTOS_INICIALES.mediocampista, "mediocampista", rng);
    assert.ok(r >= 0.18 && r <= 1.12, `r=${r}`);
    let sum = 0;
    const rng2 = seededRng(3);
    for (let i = 0; i < 20; i++) {
      sum += calcularRendimiento(ATRIBUTOS_INICIALES.delantero, "delantero", rng2);
    }
    const avg = sum / 20;
    assert.ok(avg >= 0.4 && avg <= 0.72, `avg=${avg}`);
  });
});

describe("evaluarOfertaTransferencia", () => {
  it("puede ofrecer fichaje doméstico en BetPlay con campaña fuerte", () => {
    const o = evaluarOfertaTransferencia(
      "liga-betplay",
      "millonarios",
      20,
      1,
      20,
      0.75,
      () => 0.01,
      true
    );
    assert.ok(o);
    assert.equal(o!.ligaId, "liga-betplay");
    assert.notEqual(o!.clubId, "millonarios");
  });

  it("ofrece intermedia desde BetPlay con racha", () => {
    const o = evaluarOfertaTransferencia(
      "liga-betplay",
      "millonarios",
      22,
      RACHA_TRANSFERENCIA,
      25,
      0.78,
      () => 0.01,
      true
    );
    assert.ok(o);
    assert.ok(o!.ligaId !== "liga-betplay");
  });

  it("ofrece Europa desde intermedia con racha", () => {
    const o = evaluarOfertaTransferencia(
      "liga-mx",
      "club-america",
      24,
      RACHA_TRANSFERENCIA,
      25,
      0.8,
      () => 0.01,
      true
    );
    assert.ok(o);
    assert.ok(["premier-league", "laliga"].includes(o!.ligaId));
  });
});

describe("evaluarConvocatoria", () => {
  it("sub20 con buen rendimiento joven", () => {
    const r = evaluarConvocatoria(18, 0.7, 10, null);
    assert.equal(r.nivel, "sub20");
    assert.ok(r.narrativa);
  });
});

describe("evaluarFinCarreraAnticipado", () => {
  it("mala racha sostenida", () => {
    const m = evaluarFinCarreraAnticipado({
      reputacion: -70,
      moral: -70,
      rachaBaja: 2,
      riesgoFinCarrera: 0,
      rng: () => 0.99,
    });
    assert.equal(m, "mala_racha");
  });

  it("lesión con riesgoFinCarrera", () => {
    const m = evaluarFinCarreraAnticipado({
      reputacion: 0,
      moral: 0,
      rachaBaja: 0,
      riesgoFinCarrera: 0.9,
      rng: () => 0.1,
    });
    assert.equal(m, "lesion_grave");
  });
});

describe("statsDesdeRendimiento", () => {
  it("produce stats de temporada", () => {
    const s = statsDesdeRendimiento(0.7, "delantero", 22, () => 0.05);
    assert.ok(s.partidos > 0);
    assert.ok(s.goles >= 0);
  });
});

describe("evaluarTrofeosYPremios", () => {
  it("puede dar Libertadores/Sudamericana en Colombia con gran campaña", () => {
    const r = evaluarTrofeosYPremios({
      rendimiento: 0.9,
      posicion: "delantero",
      edad: 24,
      ligaId: "liga-betplay",
      nivelLiga: "colombia_primera",
      esProfesional: true,
      reputacion: 45,
      goles: 22,
      asistencias: 8,
      rng: () => 0.01,
    });
    assert.ok(
      r.titulos.some(
        (t) =>
          t.includes("Libertadores") ||
          t.includes("Sudamericana") ||
          t.includes("liga") ||
          t.includes("Copa")
      )
    );
  });

  it("puede dar Champions/Europa League en Europa con gran campaña", () => {
    const r = evaluarTrofeosYPremios({
      rendimiento: 0.92,
      posicion: "extremo",
      edad: 25,
      ligaId: "premier-league",
      nivelLiga: "grande_europa",
      esProfesional: true,
      reputacion: 50,
      goles: 18,
      asistencias: 10,
      rng: () => 0.01,
    });
    assert.ok(
      r.titulos.some(
        (t) =>
          t.includes("Champions") ||
          t.includes("Europa League") ||
          t.includes("Conference") ||
          t.includes("liga") ||
          t.includes("Copa")
      )
    );
  });

  it("puede otorgar premios individuales solo con campaña elite", () => {
    const r = evaluarTrofeosYPremios({
      rendimiento: 0.95,
      posicion: "delantero",
      edad: 21,
      ligaId: "liga-betplay",
      nivelLiga: "colombia_primera",
      esProfesional: true,
      reputacion: 55,
      goles: 28,
      asistencias: 10,
      rng: () => 0.01,
    });
    assert.ok(r.premios.length >= 1 || r.titulos.length >= 1);
  });
});

describe("resolverTransferenciaPorDestino", () => {
  it("vuelve al club de origen", () => {
    const j = crearJugador({
      apellido: "Test",
      posicion: "delantero",
      piernaHabil: "derecha",
      nacionalidad: "Colombia",
      clubOrigenId: "millonarios",
    });
    // Simula estar en Europa
    const enEuropa = {
      ...j,
      clubActualId: "manchester-city",
      ligaActualId: "premier-league",
      esProfesional: true,
    };
    const o = resolverTransferenciaPorDestino(enEuropa, "club_origen", () => 0.1);
    assert.ok(o);
    assert.equal(o!.clubId, "millonarios");
    assert.equal(o!.ligaId, "liga-betplay");
  });

  it("asciende de BetPlay a intermedia", () => {
    const j = crearJugador({
      apellido: "Test",
      posicion: "extremo",
      piernaHabil: "izquierda",
      nacionalidad: "Colombia",
      clubOrigenId: "junior",
    });
    const o = resolverTransferenciaPorDestino(
      { ...j, esProfesional: true },
      "ascenso",
      () => 0.2
    );
    assert.ok(o);
    assert.notEqual(o!.ligaId, "liga-betplay");
  });
});

describe("resolverDecisiones con transferencia", () => {
  it("cambia de club al elegir volver a Colombia", () => {
    const j = crearJugador({
      apellido: "Vet",
      posicion: "mediocampista",
      piernaHabil: "derecha",
      nacionalidad: "Colombia",
      clubOrigenId: "santa-fe",
    });
    const jugador = {
      ...j,
      edad: 35,
      esProfesional: true,
      clubActualId: "real-madrid",
      ligaActualId: "laliga",
    };
    const evento = {
      id: "vet-regreso-colombia",
      tramoCarrera: "veteran" as const,
      categoria: "colombia_especifico" as const,
      texto: "Suena un regreso",
      opciones: [
        {
          texto: "Volver al club de origen",
          efectos: { transferencia: "club_origen" as const, moral: 5 },
        },
      ],
    };
    const r = resolverDecisiones(
      jugador,
      [{ eventoId: evento.id, opcionIndex: 0 }],
      [evento],
      () => 0.5
    );
    assert.equal(r.jugador.clubActualId, "santa-fe");
    assert.equal(r.jugador.ligaActualId, "liga-betplay");
    assert.ok(r.transferenciaPorDecision);
    assert.ok(r.notas.some((n) => n.includes("fichás")));
  });
});

describe("aplicarCrecimientoPorRendimiento", () => {
  it("sube attrs con buen rendimiento y baja con malo", () => {
    const base = { ...ATRIBUTOS_INICIALES.delantero };
    const up = aplicarCrecimientoPorRendimiento(base, 0.9, false);
    const down = aplicarCrecimientoPorRendimiento(base, 0.25, false);
    assert.ok(up.ritmo! > base.ritmo);
    assert.ok(down.ritmo! < base.ritmo);
    assert.ok(up.tiro! > base.tiro);
    assert.ok(down.fisico! < base.fisico);
  });
});

describe("cerrarTemporada", () => {
  it("resuelve decisiones y produce resultado", () => {
    const j = crearJugador({
      apellido: "Test",
      posicion: "extremo",
      piernaHabil: "izquierda",
      nacionalidad: "Colombia",
      clubOrigenId: "junior",
    });
    let estado = iniciarPrimeraTemporada(estadoInicial(j), seededRng(5));
    assert.ok(estado.eventosPendientes.length >= 1);

    const decisiones = estado.eventosPendientes.map((e) => ({
      eventoId: e.id,
      opcionIndex: 0,
    }));
    estado = cerrarTemporada(
      { ...estado, decisionesTemporada: decisiones },
      seededRng(5)
    );

    assert.equal(estado.historialTemporadas.length, 1);
    assert.ok(estado.historialTemporadas[0].rendimientoPromedio > 0);
    assert.ok(estado.historialTemporadas[0].resumenAnio.length > 20);
    assert.ok(estado.historialTemporadas[0].eventosResolvidos.length >= 1);
    assert.ok(estado.historialTemporadas[0].eventosResolvidos[0].decision);
    assert.ok(estado.historialTemporadas[0].eventosResolvidos[0].afectacion.length > 10);
    assert.ok(estado.historialTemporadas[0].atributos);
    assert.equal(typeof estado.historialTemporadas[0].deltasAtributos, "object");
    assert.equal(typeof estado.historialTemporadas[0].reputacion, "number");
    assert.equal(typeof estado.historialTemporadas[0].moral, "number");
    assert.equal(typeof estado.historialTemporadas[0].deltaReputacion, "number");
    assert.equal(typeof estado.historialTemporadas[0].deltaMoral, "number");
    assert.equal(typeof estado.historialTemporadas[0].debutProfesional, "boolean");
    assert.equal(estado.jugador.esProfesional, false); // arranca a los 15 en cantera
    assert.ok(
      estado.fase === "temporada_resultado" || estado.fase === "retiro"
    );
    assert.ok(
      estado.historialTemporadas[0].rendimientoPromedio <= 1.2
    );
    void UMBRAL_RENDIMIENTO_TRANSFERENCIA;
  });
});
