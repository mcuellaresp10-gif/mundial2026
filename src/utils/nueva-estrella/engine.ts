import { ATRIBUTOS_INICIALES, clipAtributo } from "@/data/carrera/atributos";
import { getClubById, getClubesByLiga, getClubesByNivel } from "@/data/carrera/clubes";
import type { Atributos, NivelLiga } from "@/data/carrera/types";
import {
  ATRIBUTOS_ENTRENABLES,
  COSTO_DESCANSAR,
  COSTO_ENTRENAR,
  COSTO_MEDIOS,
  COSTO_SOCIALIZAR,
  DECAY_ATRIBUTO,
  DECAY_RELACION,
  EDAD_INICIO,
  EDAD_RETIRO,
  ENERGIA_BASE,
  ENERGIA_BONO_DESCANSO,
  FAMA_OFERTA_EUROPA,
  FAMA_OFERTA_INTERMEDIA,
  RELACION_MAX,
  RELACION_MIN,
  SALARIO_BASE_POR_NIVEL,
  SCHEMA_VERSION,
  SEMANAS_SIN_ENTRENAR_PARA_DECAY,
  SOCIAL_DELTA,
  TEMPORADAS_MAX,
  VENTANA_TRANSFERENCIA_SEMANAS,
} from "@/data/nueva-estrella/constantes";
import {
  aplicarDeltaEstatus,
  deltaEstatusPorPartido,
  ESTATUS_INICIAL,
  ESTATUS_TRAS_TRANSFERENCIA,
} from "@/data/nueva-estrella/estatus";
import { pickEntrevista } from "@/data/nueva-estrella/entrevistas";
import { getItemById } from "@/data/nueva-estrella/tienda";
import type {
  AccionSemanal,
  AtributoEntrenable,
  CrearJugadorNEInput,
  MomentoPartido,
  OfertaTransferencia,
  PartidaNuevaEstrella,
  PartidoSemana,
  ResultadoJugada,
  ResultadoMinijuego,
  TipoMomentoPartido,
} from "@/data/nueva-estrella/types";
import { gananciaEntrenamiento } from "./entrenamiento";
import { configTimingDesdeAtributo } from "./timing";
import {
  crearTemporadaLiga,
  partidoJugadorEnJornada,
  resolverJornada,
  semanasPorLiga,
  temporadaLigaTerminada,
} from "./liga";

function semanasSinEntrenarInicial(): Record<AtributoEntrenable, number> {
  return {
    ritmo: 0,
    tiro: 0,
    pase: 0,
    regate: 0,
    defensa: 0,
    fisico: 0,
  };
}
function clampRel(n: number): number {
  return Math.max(RELACION_MIN, Math.min(RELACION_MAX, Math.round(n)));
}

function clampFama(n: number): number {
  return Math.max(0, Math.min(100, Math.round(n)));
}

function clampMoral(n: number): number {
  return Math.max(0, Math.min(100, Math.round(n)));
}

function clipAttrs(a: Atributos): Atributos {
  return {
    ritmo: clipAtributo(a.ritmo),
    tiro: clipAtributo(a.tiro),
    pase: clipAtributo(a.pase),
    regate: clipAtributo(a.regate),
    defensa: clipAtributo(a.defensa),
    fisico: clipAtributo(a.fisico),
    ...(a.atajadas != null ? { atajadas: clipAtributo(a.atajadas) } : {}),
    ...(a.reflejos != null ? { reflejos: clipAtributo(a.reflejos) } : {}),
  };
}

function salarioDesdeClub(clubId: string, fama: number): number {
  const club = getClubById(clubId);
  const nivel = club?.nivel ?? "colombia_primera";
  const base = SALARIO_BASE_POR_NIVEL[nivel];
  return Math.round(base * (1 + fama / 100));
}

function moralDesdeRelaciones(
  familia: number,
  pareja: number,
  resultadosRecientes: number[]
): number {
  const rel = (familia + pareja) / 2;
  const form =
    resultadosRecientes.length === 0
      ? 50
      : (resultadosRecientes.reduce((s, n) => s + n, 0) /
          resultadosRecientes.length) *
        10;
  return clampMoral(rel * 0.55 + form * 0.45);
}

export function crearPartida(input: CrearJugadorNEInput): PartidaNuevaEstrella {
  const apellido = input.apellido.trim();
  if (apellido.length < 2) throw new Error("El apellido debe tener al menos 2 letras");
  const club = getClubById(input.clubOrigenId);
  if (!club) throw new Error("Club de origen inválido");

  const attrs = { ...ATRIBUTOS_INICIALES[input.posicion] };
  const relaciones = { familia: 70, pareja: 40, agente: 55 };
  const fama = 8;

  return {
    schemaVersion: SCHEMA_VERSION,
    jugador: {
      apellido,
      edad: EDAD_INICIO,
      posicion: input.posicion,
      piernaHabil: input.piernaHabil,
      nacionalidad: input.nacionalidad,
      atributos: attrs,
      energiaActual: ENERGIA_BASE,
      energiaMaxima: ENERGIA_BASE,
      dinero: 2500,
      fama,
      moral: moralDesdeRelaciones(relaciones.familia, relaciones.pareja, []),
      estatusClub: ESTATUS_INICIAL,
      relaciones,
      clubActualId: club.id,
      ligaActualId: club.ligaId,
      salarioSemanal: salarioDesdeClub(club.id, fama),
      semanaActual: 1,
      temporadaActual: 1,
      semanasSinEntrenar: semanasSinEntrenarInicial(),
    },
    historialPartidos: [],
    accionesSemana: [],
    semanasDescansoSeguidas: 0,
    itemsComprados: [],
    ofertaPendiente: null,
    momentoPartidoIndex: 0,
    partidoEnCurso: null,
    temporadaLiga: crearTemporadaLiga(club.ligaId, 1),
    stats: { goles: 0, asistencias: 0, partidos: 0, famaMax: fama, dineroMax: 2500 },
    retirado: false,
    motivoRetiro: null,
  };
}

function costoAccion(tipo: AccionSemanal["tipo"]): number {
  switch (tipo) {
    case "entrenar":
      return COSTO_ENTRENAR;
    case "medios":
      return COSTO_MEDIOS;
    case "descansar":
      return COSTO_DESCANSAR;
    default:
      return COSTO_SOCIALIZAR;
  }
}

export function puedeEjecutarAccion(
  partida: PartidaNuevaEstrella,
  tipo: AccionSemanal["tipo"]
): boolean {
  if (partida.retirado) return false;
  return partida.jugador.energiaActual >= costoAccion(tipo);
}

export function aplicarEntrenamiento(
  partida: PartidaNuevaEstrella,
  atributo: AtributoEntrenable,
  resultado: ResultadoMinijuego
): PartidaNuevaEstrella {
  if (!puedeEjecutarAccion(partida, "entrenar")) {
    throw new Error("Sin energía para entrenar");
  }
  const valorAntes = partida.jugador.atributos[atributo] ?? 1;
  const delta = gananciaEntrenamiento(valorAntes, resultado.tipo);
  const attrs = { ...partida.jugador.atributos };
  attrs[atributo] = clipAtributo(valorAntes + delta);

  const semanasSinEntrenar = {
    ...(partida.jugador.semanasSinEntrenar ?? semanasSinEntrenarInicial()),
    [atributo]: 0,
  };

  return {
    ...partida,
    jugador: {
      ...partida.jugador,
      atributos: clipAttrs(attrs),
      energiaActual: partida.jugador.energiaActual - COSTO_ENTRENAR,
      semanasSinEntrenar,
    },
    accionesSemana: [
      ...partida.accionesSemana,
      {
        tipo: "entrenar",
        costoEnergia: COSTO_ENTRENAR,
        atributoEntrenado: atributo,
        resultadoMinijuego: resultado,
      },
    ],
    semanasDescansoSeguidas: 0,
  };
}

export function aplicarSocializar(
  partida: PartidaNuevaEstrella,
  tipo: "socializar_familia" | "socializar_pareja" | "socializar_agente"
): PartidaNuevaEstrella {
  if (!puedeEjecutarAccion(partida, tipo)) {
    throw new Error("Sin energía para socializar");
  }
  const rel = { ...partida.jugador.relaciones };
  if (tipo === "socializar_familia") rel.familia = clampRel(rel.familia + SOCIAL_DELTA);
  if (tipo === "socializar_pareja") rel.pareja = clampRel(rel.pareja + SOCIAL_DELTA);
  if (tipo === "socializar_agente") rel.agente = clampRel(rel.agente + SOCIAL_DELTA);

  const energiaExtra = tipo === "socializar_familia" ? 0 : tipo === "socializar_pareja" ? -0 : 0;
  // Pareja puede costar un poco de moral-energy narrative: slight energy drain already via cost.
  void energiaExtra;

  const moral = moralDesdeRelaciones(
    rel.familia,
    rel.pareja,
    partida.historialPartidos.slice(-3).map((p) => p.calificacion)
  );

  return {
    ...partida,
    jugador: {
      ...partida.jugador,
      relaciones: rel,
      moral,
      energiaActual: partida.jugador.energiaActual - COSTO_SOCIALIZAR,
    },
    accionesSemana: [
      ...partida.accionesSemana,
      { tipo, costoEnergia: COSTO_SOCIALIZAR },
    ],
    semanasDescansoSeguidas: 0,
  };
}

export function aplicarMedios(
  partida: PartidaNuevaEstrella,
  preguntaId: string,
  opcionId: string
): PartidaNuevaEstrella {
  if (!puedeEjecutarAccion(partida, "medios")) {
    throw new Error("Sin energía para medios");
  }
  const pregunta = pickEntrevista(
    partida.jugador.semanaActual + partida.jugador.temporadaActual * 100
  );
  const opcion =
    pregunta.id === preguntaId
      ? pregunta.opciones.find((o) => o.id === opcionId)
      : pregunta.opciones.find((o) => o.id === opcionId) ??
        pregunta.opciones[0];

  const chosen = opcion ?? pregunta.opciones[0]!;
  const fama = clampFama(partida.jugador.fama + chosen.deltaFama);
  const moral = clampMoral(partida.jugador.moral + chosen.deltaMoral);

  return {
    ...partida,
    jugador: {
      ...partida.jugador,
      fama,
      moral,
      energiaActual: partida.jugador.energiaActual - COSTO_MEDIOS,
      salarioSemanal: salarioDesdeClub(partida.jugador.clubActualId, fama),
    },
    accionesSemana: [
      ...partida.accionesSemana,
      {
        tipo: "medios",
        costoEnergia: COSTO_MEDIOS,
        respuestaMediosId: chosen.id,
      },
    ],
    stats: {
      ...partida.stats,
      famaMax: Math.max(partida.stats.famaMax, fama),
    },
    semanasDescansoSeguidas: 0,
  };
}

export function aplicarDescanso(partida: PartidaNuevaEstrella): PartidaNuevaEstrella {
  if (!puedeEjecutarAccion(partida, "descansar")) {
    throw new Error("Sin energía para descansar");
  }
  return {
    ...partida,
    jugador: {
      ...partida.jugador,
      energiaActual: partida.jugador.energiaActual - COSTO_DESCANSAR,
      moral: clampMoral(partida.jugador.moral + 2),
    },
    accionesSemana: [
      ...partida.accionesSemana,
      { tipo: "descansar", costoEnergia: COSTO_DESCANSAR },
    ],
    semanasDescansoSeguidas: partida.semanasDescansoSeguidas + 1,
  };
}

export function comprarItem(
  partida: PartidaNuevaEstrella,
  itemId: string
): PartidaNuevaEstrella {
  const item = getItemById(itemId);
  if (!item) throw new Error("Ítem no encontrado");
  if (item.unico && partida.itemsComprados.includes(itemId)) {
    throw new Error("Ya tenés este ítem");
  }
  if (partida.jugador.dinero < item.precio) {
    throw new Error("Dinero insuficiente");
  }

  const fama = clampFama(partida.jugador.fama + item.deltaFama);
  const moral = clampMoral(partida.jugador.moral + item.deltaMoral);
  const energiaMaxima =
    partida.jugador.energiaMaxima + (item.deltaEnergiaMax ?? 0);
  const dinero = partida.jugador.dinero - item.precio;

  return {
    ...partida,
    itemsComprados: item.unico
      ? [...partida.itemsComprados, itemId]
      : partida.itemsComprados,
    jugador: {
      ...partida.jugador,
      dinero,
      fama,
      moral,
      energiaMaxima,
      salarioSemanal: salarioDesdeClub(partida.jugador.clubActualId, fama),
    },
    stats: {
      ...partida.stats,
      famaMax: Math.max(partida.stats.famaMax, fama),
      dineroMax: Math.max(partida.stats.dineroMax, dinero),
    },
  };
}

function momentosParaPosicion(
  posicion: PartidaNuevaEstrella["jugador"]["posicion"]
): TipoMomentoPartido[] {
  switch (posicion) {
    case "arquero":
      return ["atajada", "atajada", "pase_clave"];
    case "defensa_central":
      return ["cabezazo", "atajada", "pase_clave"];
    case "lateral":
      return ["gambeta", "pase_clave", "definicion"];
    case "mediocampista":
      return ["pase_clave", "gambeta", "definicion"];
    case "extremo":
      return ["gambeta", "definicion", "pase_clave"];
    case "delantero":
      return ["definicion", "cabezazo", "gambeta"];
  }
}

function atributoParaMomento(
  attrs: Atributos,
  tipo: TipoMomentoPartido
): number {
  switch (tipo) {
    case "definicion":
      return attrs.tiro;
    case "cabezazo":
      return (attrs.tiro + attrs.fisico) / 2;
    case "gambeta":
      return (attrs.regate + attrs.ritmo) / 2;
    case "atajada":
      return attrs.reflejos ?? attrs.defensa;
    case "pase_clave":
      return attrs.pase;
  }
}

function resolverJugada(
  tipo: TipoMomentoPartido,
  timing: ResultadoMinijuego["tipo"]
): ResultadoJugada {
  if (timing === "fallo") {
    return tipo === "atajada" ? "fallo" : "fallo";
  }
  if (tipo === "atajada") return "parada";
  if (tipo === "pase_clave") return "asistencia";
  if (timing === "perfecto") return "gol";
  return "atajado";
}

export function iniciarPartido(partida: PartidaNuevaEstrella): PartidaNuevaEstrella {
  const tl =
    partida.temporadaLiga ??
    crearTemporadaLiga(partida.jugador.ligaActualId, partida.jugador.temporadaActual);
  const jornada = Math.min(tl.jornadaActual, tl.fixture.length || 1);
  const fixturePartido = partidoJugadorEnJornada(
    tl,
    jornada,
    partida.jugador.clubActualId
  );

  let rivalId: string;
  let rivalNombre: string;
  let local: boolean;

  if (fixturePartido) {
    local = fixturePartido.localId === partida.jugador.clubActualId;
    rivalId = local ? fixturePartido.visitanteId : fixturePartido.localId;
    rivalNombre = getClubById(rivalId)?.nombre ?? rivalId;
  } else {
    const rivales = getClubesByLiga(partida.jugador.ligaActualId).filter(
      (c) => c.id !== partida.jugador.clubActualId
    );
    const seed =
      partida.jugador.semanaActual +
      partida.jugador.temporadaActual * 40 +
      partida.historialPartidos.length;
    const rival = rivales[seed % Math.max(1, rivales.length)] ?? rivales[0];
    rivalNombre = rival?.nombre ?? "Rival FC";
    rivalId = rival?.id ?? "rival";
    local = seed % 2 === 0;
  }

  const partido: PartidoSemana = {
    semana: partida.jugador.semanaActual,
    temporada: partida.jugador.temporadaActual,
    rivalId,
    rivalNombre,
    local,
    golesFavor: 0,
    golesContra: 0,
    momentos: [],
    calificacion: 5,
    bonoDinero: 0,
  };

  return {
    ...partida,
    temporadaLiga: tl,
    partidoEnCurso: partido,
    momentoPartidoIndex: 0,
  };
}

export function tiposMomentosPartido(
  partida: PartidaNuevaEstrella
): TipoMomentoPartido[] {
  if (!partida.partidoEnCurso) return [];
  const seed =
    partida.partidoEnCurso.semana + partida.partidoEnCurso.temporada * 40;
  return momentosParaPosicion(partida.jugador.posicion).slice(0, 1 + (seed % 3));
}

export function configTimingMomento(
  partida: PartidaNuevaEstrella,
  tipo: TipoMomentoPartido
) {
  const attr = atributoParaMomento(partida.jugador.atributos, tipo);
  const moralFactor = (100 - partida.jugador.moral) / 200;
  const maxE = Math.max(1, partida.jugador.energiaMaxima);
  const energiaRatio = Math.max(
    0,
    Math.min(1, partida.jugador.energiaActual / maxE)
  );
  /** Sin energía → partido más duro (zona verde más chica). */
  const energiaFactor = (1 - energiaRatio) * 0.5;
  return configTimingDesdeAtributo(attr, 0.25 + moralFactor + energiaFactor);
}

export function registrarMomentoPartido(
  partida: PartidaNuevaEstrella,
  tipo: TipoMomentoPartido,
  resultado: ResultadoMinijuego
): PartidaNuevaEstrella {
  if (!partida.partidoEnCurso) throw new Error("No hay partido en curso");
  const jugada = resolverJugada(tipo, resultado.tipo);
  // Use deterministic "bien" goal chance based on seed instead of Math.random for tests
  const jugadaFinal =
    resultado.tipo === "bien" &&
    (tipo === "definicion" || tipo === "cabezazo" || tipo === "gambeta")
      ? (partida.momentoPartidoIndex + resultado.timestampToqueMs) % 2 === 0
        ? "gol"
        : "atajado"
      : jugada;

  const momento: MomentoPartido = {
    tipo,
    resultadoMinijuego: resultado,
    resultadoJugada: jugadaFinal as ResultadoJugada,
  };

  const momentos = [...partida.partidoEnCurso.momentos, momento];
  let golesFavor = partida.partidoEnCurso.golesFavor;
  let golesContra = partida.partidoEnCurso.golesContra;
  if (jugadaFinal === "gol") golesFavor += 1;
  if (jugadaFinal === "fallo" && tipo === "atajada") golesContra += 1;
  if (jugadaFinal === "parada") {
    /* ok */
  } else if (resultado.tipo === "fallo" && tipo !== "atajada") {
    // opponent chance
    if ((partida.momentoPartidoIndex + 1) % 3 === 0) golesContra += 1;
  }

  return {
    ...partida,
    partidoEnCurso: {
      ...partida.partidoEnCurso,
      momentos,
      golesFavor,
      golesContra,
    },
    momentoPartidoIndex: partida.momentoPartidoIndex + 1,
  };
}

function calificarPartido(p: PartidoSemana, moral: number): number {
  let score = 5;
  for (const m of p.momentos) {
    if (m.resultadoMinijuego.tipo === "perfecto") score += 1.2;
    else if (m.resultadoMinijuego.tipo === "bien") score += 0.6;
    else score -= 0.8;
    if (m.resultadoJugada === "gol" || m.resultadoJugada === "asistencia") score += 0.5;
    if (m.resultadoJugada === "parada") score += 0.4;
  }
  score += (moral - 50) / 50;
  if (p.golesFavor > p.golesContra) score += 0.5;
  if (p.golesFavor < p.golesContra) score -= 0.4;
  return Math.max(1, Math.min(10, Math.round(score * 10) / 10));
}

export function finalizarPartido(partida: PartidaNuevaEstrella): PartidaNuevaEstrella {
  if (!partida.partidoEnCurso) throw new Error("No hay partido en curso");
  const calificacion = calificarPartido(
    partida.partidoEnCurso,
    partida.jugador.moral
  );
  const goles = partida.partidoEnCurso.momentos.filter(
    (m) => m.resultadoJugada === "gol"
  ).length;
  const asistencias = partida.partidoEnCurso.momentos.filter(
    (m) => m.resultadoJugada === "asistencia"
  ).length;
  const bono = Math.round(
    goles * 400 + asistencias * 250 + (calificacion >= 7 ? 300 : 0)
  );
  const famaGain = Math.round(
    goles * 2 +
      asistencias +
      (calificacion >= 8 ? 3 : calificacion >= 6 ? 1 : -1)
  );
  const fama = clampFama(partida.jugador.fama + famaGain);
  const estatusAntes = partida.jugador.estatusClub ?? ESTATUS_INICIAL;
  const deltaEstatus = deltaEstatusPorPartido(calificacion, goles, asistencias);
  const estatusClub = aplicarDeltaEstatus(estatusAntes, deltaEstatus);
  const partido: PartidoSemana = {
    ...partida.partidoEnCurso,
    calificacion,
    bonoDinero: bono,
    estatusDelta: estatusClub - estatusAntes,
    estatusTras: estatusClub,
  };
  const dinero = partida.jugador.dinero + bono;
  const moral = moralDesdeRelaciones(
    partida.jugador.relaciones.familia,
    partida.jugador.relaciones.pareja,
    [...partida.historialPartidos.slice(-2).map((p) => p.calificacion), calificacion]
  );

  return {
    ...partida,
    partidoEnCurso: null,
    momentoPartidoIndex: 0,
    historialPartidos: [...partida.historialPartidos, partido],
    jugador: {
      ...partida.jugador,
      dinero,
      fama,
      moral,
      estatusClub,
      salarioSemanal: salarioDesdeClub(partida.jugador.clubActualId, fama),
    },
    stats: {
      goles: partida.stats.goles + goles,
      asistencias: partida.stats.asistencias + asistencias,
      partidos: partida.stats.partidos + 1,
      famaMax: Math.max(partida.stats.famaMax, fama),
      dineroMax: Math.max(partida.stats.dineroMax, dinero),
    },
  };
}

function generarOferta(partida: PartidaNuevaEstrella): OfertaTransferencia | null {
  const clubActual = getClubById(partida.jugador.clubActualId);
  if (!clubActual) return null;
  const agenteFactor = partida.jugador.relaciones.agente / 100;
  const fama = partida.jugador.fama;

  let targetNivel: NivelLiga | null = null;
  if (fama >= FAMA_OFERTA_EUROPA && clubActual.nivel !== "grande_europa") {
    targetNivel = "grande_europa";
  } else if (
    fama >= FAMA_OFERTA_INTERMEDIA &&
    clubActual.nivel === "colombia_primera"
  ) {
    targetNivel = "intermedia";
  } else if (
    fama >= 25 &&
    clubActual.nivel === "colombia_primera" &&
    agenteFactor > 0.4
  ) {
    targetNivel = "colombia_primera";
  }

  if (!targetNivel) return null;

  const pool = getClubesByNivel(targetNivel).filter(
    (c) => c.id !== partida.jugador.clubActualId
  );
  if (pool.length === 0) return null;
  const idx =
    (partida.jugador.semanaActual +
      partida.jugador.temporadaActual * 17 +
      Math.round(fama)) %
    pool.length;
  const club = pool[idx]!;
  const salario = Math.round(
    SALARIO_BASE_POR_NIVEL[targetNivel] *
      (1 + fama / 80) *
      (0.85 + agenteFactor * 0.35)
  );

  return {
    clubId: club.id,
    clubNombre: club.nombre,
    ligaId: club.ligaId,
    salarioSemanal: salario,
    nivel: targetNivel,
  };
}

export function aceptarTransferencia(partida: PartidaNuevaEstrella): PartidaNuevaEstrella {
  if (!partida.ofertaPendiente) throw new Error("No hay oferta");
  const o = partida.ofertaPendiente;
  return {
    ...partida,
    ofertaPendiente: null,
    temporadaLiga: crearTemporadaLiga(o.ligaId, partida.jugador.temporadaActual),
    jugador: {
      ...partida.jugador,
      clubActualId: o.clubId,
      ligaActualId: o.ligaId,
      salarioSemanal: o.salarioSemanal,
      estatusClub: ESTATUS_TRAS_TRANSFERENCIA,
      semanaActual: 1,
      moral: clampMoral(partida.jugador.moral + 8),
      fama: clampFama(partida.jugador.fama + 5),
      relaciones: {
        ...partida.jugador.relaciones,
        agente: clampRel(partida.jugador.relaciones.agente + 8),
      },
    },
  };
}

export function rechazarTransferencia(partida: PartidaNuevaEstrella): PartidaNuevaEstrella {
  return {
    ...partida,
    ofertaPendiente: null,
    jugador: {
      ...partida.jugador,
      relaciones: {
        ...partida.jugador.relaciones,
        agente: clampRel(partida.jugador.relaciones.agente - 5),
      },
    },
  };
}

/**
 * Cierra la semana: partido ya debe estar finalizado.
 * Simula el resto de la jornada de liga, paga salario, decay relaciones, avanza calendario.
 */
export function cerrarSemana(partida: PartidaNuevaEstrella): PartidaNuevaEstrella {
  if (partida.partidoEnCurso) {
    throw new Error("Finalizá el partido antes de cerrar la semana");
  }

  const descansoEstaSemana = partida.accionesSemana.some(
    (a) => a.tipo === "descansar"
  );
  const semanasDescanso = descansoEstaSemana
    ? partida.semanasDescansoSeguidas
    : 0;

  const socializoFamilia = partida.accionesSemana.some(
    (a) => a.tipo === "socializar_familia"
  );
  const socializoPareja = partida.accionesSemana.some(
    (a) => a.tipo === "socializar_pareja"
  );
  const socializoAgente = partida.accionesSemana.some(
    (a) => a.tipo === "socializar_agente"
  );

  const rel = {
    familia: clampRel(
      partida.jugador.relaciones.familia - (socializoFamilia ? 0 : DECAY_RELACION)
    ),
    pareja: clampRel(
      partida.jugador.relaciones.pareja - (socializoPareja ? 0 : DECAY_RELACION)
    ),
    agente: clampRel(
      partida.jugador.relaciones.agente - (socializoAgente ? 0 : DECAY_RELACION)
    ),
  };

  let temporadaLiga =
    partida.temporadaLiga ??
    crearTemporadaLiga(
      partida.jugador.ligaActualId,
      partida.jugador.temporadaActual
    );

  const ultimo = partida.historialPartidos[partida.historialPartidos.length - 1];
  const override =
    ultimo &&
    ultimo.semana === partida.jugador.semanaActual &&
    ultimo.temporada === partida.jugador.temporadaActual
      ? {
          clubId: partida.jugador.clubActualId,
          golesFavor: ultimo.golesFavor,
          golesContra: ultimo.golesContra,
        }
      : null;

  const jornadaAResolver = temporadaLiga.jornadaActual;
  temporadaLiga = resolverJornada(temporadaLiga, jornadaAResolver, override);

  let semana: number;
  let temporada = partida.jugador.temporadaActual;
  let edad = partida.jugador.edad;

  if (temporadaLigaTerminada(temporadaLiga)) {
    temporada += 1;
    edad += 1;
    temporadaLiga = crearTemporadaLiga(partida.jugador.ligaActualId, temporada);
    semana = 1;
  } else {
    semana = temporadaLiga.jornadaActual;
  }

  const bonoEnergia =
    semanasDescanso >= 2 ? ENERGIA_BONO_DESCANSO : 0;
  const energiaMaxima = Math.max(
    ENERGIA_BASE,
    partida.jugador.energiaMaxima
  );
  const energiaActual = energiaMaxima + bonoEnergia;

  const dinero = partida.jugador.dinero + partida.jugador.salarioSemanal;
  const moral = moralDesdeRelaciones(
    rel.familia,
    rel.pareja,
    partida.historialPartidos.slice(-3).map((p) => p.calificacion)
  );

  const entrenadosEstaSemana = new Set(
    partida.accionesSemana
      .filter((a) => a.tipo === "entrenar" && a.atributoEntrenado)
      .map((a) => a.atributoEntrenado!)
  );
  const semanasSinEntrenar = {
    ...(partida.jugador.semanasSinEntrenar ?? semanasSinEntrenarInicial()),
  };
  const attrs = { ...partida.jugador.atributos };
  for (const attr of ATRIBUTOS_ENTRENABLES) {
    if (entrenadosEstaSemana.has(attr)) {
      semanasSinEntrenar[attr] = 0;
    } else {
      semanasSinEntrenar[attr] = (semanasSinEntrenar[attr] ?? 0) + 1;
      if (semanasSinEntrenar[attr]! >= SEMANAS_SIN_ENTRENAR_PARA_DECAY) {
        attrs[attr] = clipAtributo((attrs[attr] ?? 1) - DECAY_ATRIBUTO);
      }
    }
  }

  let next: PartidaNuevaEstrella = {
    ...partida,
    accionesSemana: [],
    semanasDescansoSeguidas: descansoEstaSemana ? semanasDescanso : 0,
    temporadaLiga,
    jugador: {
      ...partida.jugador,
      semanaActual: semana,
      temporadaActual: temporada,
      edad,
      relaciones: rel,
      moral,
      dinero,
      energiaActual,
      energiaMaxima,
      atributos: clipAttrs(attrs),
      semanasSinEntrenar,
    },
    stats: {
      ...partida.stats,
      dineroMax: Math.max(partida.stats.dineroMax, dinero),
    },
  };

  const semanasLiga = semanasPorLiga(partida.jugador.ligaActualId);
  const totalSemanas =
    (temporada - 1) * semanasLiga + semana;
  if (
    totalSemanas % VENTANA_TRANSFERENCIA_SEMANAS === 0 &&
    !next.ofertaPendiente
  ) {
    next = { ...next, ofertaPendiente: generarOferta(next) };
  }

  if (edad >= EDAD_RETIRO || temporada > TEMPORADAS_MAX) {
    next = {
      ...next,
      retirado: true,
      motivoRetiro:
        edad >= EDAD_RETIRO
          ? `Se retiró a los ${edad} años`
          : "Fin de la carrera tras muchas temporadas",
    };
  }

  return next;
}

export function forzarRetiro(
  partida: PartidaNuevaEstrella,
  motivo = "Retiro voluntario"
): PartidaNuevaEstrella {
  return { ...partida, retirado: true, motivoRetiro: motivo };
}

export function validarPartida(data: unknown): PartidaNuevaEstrella | null {
  if (!data || typeof data !== "object") return null;
  const p = data as PartidaNuevaEstrella;
  if (p.schemaVersion !== 1) return null;
  if (!p.jugador?.apellido || !p.jugador.atributos) return null;
  if (!Array.isArray(p.historialPartidos)) return null;
  if (typeof p.jugador.estatusClub !== "number") {
    p.jugador = { ...p.jugador, estatusClub: ESTATUS_INICIAL };
  }
  if (!p.temporadaLiga?.fixture?.length) {
    p.temporadaLiga = crearTemporadaLiga(
      p.jugador.ligaActualId,
      p.jugador.temporadaActual
    );
  }
  if (!p.jugador.semanasSinEntrenar) {
    p.jugador = {
      ...p.jugador,
      semanasSinEntrenar: semanasSinEntrenarInicial(),
    };
  }
  return p;
}
