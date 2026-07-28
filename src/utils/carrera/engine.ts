import { construirAfectacion } from "@/data/carrera/afectaciones";
import { ATRIBUTOS_INICIALES, PESOS_RENDIMIENTO, calcularMedia, clipAtributo, clipScore } from "@/data/carrera/atributos";
import {
  getClubById,
  getClubesBetPlay,
  getClubesByLiga,
  getClubesByNivel,
  getLigaById,
} from "@/data/carrera/clubes";
import { getEventosByTramo } from "@/data/carrera/eventos";
import type {
  Atributos,
  ComparacionEstilo,
  CrearJugadorInput,
  DecisionResuelta,
  EfectosDecision,
  EstadoCarrera,
  EventoDecision,
  Jugador,
  Lesion,
  MotivoRetiro,
  NivelLiga,
  NivelSeleccion,
  OfertaTransferencia,
  PartidoClave,
  Posicion,
  PrimeCarrera,
  ResultadoTemporada,
  ResumenCarrera,
  StatsEtapaCarrera,
  TitulosPorClub,
  TramoCarrera,
} from "@/data/carrera/types";

export const EDAD_INICIO = 15;
export const EDAD_RETIRO_OPCION = 38;
export const EDAD_RETIRO_FORZADO = 42;
/** Cada periodo de carrera cubre 2 años de fútbol (stats sumadas). */
export const ANIOS_POR_PERIODO = 2;
/** Temporada “buena” para racha de transferencia. */
export const UMBRAL_RENDIMIENTO_TRANSFERENCIA = 0.62;
/** Temporadas buenas consecutivas para saltos de liga serios. */
export const RACHA_TRANSFERENCIA = 1;
export const UMBRAL_RACHA_BAJA = -60;
export const BASE_RIESGO_LESION_GRAVE = 0.028;

export function statsEtapaVacias(): StatsEtapaCarrera {
  return {
    partidos: 0,
    goles: 0,
    asistencias: 0,
    titulos: [],
    premiosIndividuales: [],
  };
}

export function sumarStatsEtapa(
  a: StatsEtapaCarrera,
  b: StatsEtapaCarrera
): StatsEtapaCarrera {
  return {
    partidos: a.partidos + b.partidos,
    goles: a.goles + b.goles,
    asistencias: a.asistencias + b.asistencias,
    titulos: [...a.titulos, ...b.titulos],
    premiosIndividuales: [...a.premiosIndividuales, ...b.premiosIndividuales],
  };
}

export function tramoDesdeEdad(edad: number): TramoCarrera {
  if (edad <= 18) return "cantera";
  if (edad <= 25) return "consolidacion";
  if (edad <= 32) return "prime";
  return "veteran";
}

export const TRAMO_LABELS: Record<TramoCarrera, string> = {
  cantera: "Cantera / juveniles",
  consolidacion: "Consolidación",
  prime: "Plenitud",
  veteran: "Veteranía",
};

/**
 * Decide si el jugador asciende al plantel profesional esta temporada.
 * Garantizado a los 19; antes exige muy buen rendimiento.
 */
export function evaluarAscensoProfesional(input: {
  yaProfesional: boolean;
  edad: number;
  rendimiento: number;
  reputacion: number;
  rng?: () => number;
}): boolean {
  if (input.yaProfesional) return false;
  const rng = input.rng ?? Math.random;

  // A más tardar a los 19
  if (input.edad >= 19) return true;

  if (input.edad >= 18 && input.rendimiento >= 0.55) {
    const p = Math.min(
      0.65,
      0.28 +
        (input.rendimiento - 0.55) * 0.75 +
        (input.reputacion >= 15 ? 0.1 : 0)
    );
    return rng() < p;
  }

  if (input.edad >= 17 && input.rendimiento >= 0.65) {
    const p = Math.min(0.45, 0.16 + (input.rendimiento - 0.65) * 0.65);
    return rng() < p;
  }

  return false;
}

export function crearJugador(input: CrearJugadorInput): Jugador {
  const club = getClubById(input.clubOrigenId);
  if (!club || club.ligaId !== "liga-betplay") {
    throw new Error("El club de origen debe ser de Liga BetPlay");
  }
  const apellido = input.apellido.trim();
  if (!apellido) throw new Error("Apellido requerido");

  return {
    apellido,
    posicion: input.posicion,
    piernaHabil: input.piernaHabil,
    nacionalidad: input.nacionalidad,
    clubOrigenId: input.clubOrigenId,
    edad: EDAD_INICIO,
    atributos: { ...ATRIBUTOS_INICIALES[input.posicion] },
    reputacion: 10,
    moral: 20,
    historialLesiones: [],
    clubActualId: input.clubOrigenId,
    ligaActualId: club.ligaId,
    convocatoriaSeleccion: null,
    esProfesional: false,
    edadDebutProfesional: null,
  };
}

export function estadoInicial(jugador: Jugador): EstadoCarrera {
  return {
    jugador,
    historialTemporadas: [],
    eventosVistos: [],
    rachaAltoRendimiento: 0,
    rachaBaja: 0,
    retirado: false,
    motivoRetiro: null,
    ofertaPendiente: null,
    eventosPendientes: [],
    decisionesTemporada: [],
    fase: "temporada_eventos",
  };
}

/**
 * Rendimiento de temporada a partir de atributos.
 * Cantera (~50 attrs) suele dar ~50–70% con la curva actual.
 */
export function calcularRendimiento(
  atributos: Atributos,
  posicion: Posicion,
  rng: () => number = Math.random
): number {
  const pesos = PESOS_RENDIMIENTO[posicion];
  let sum = 0;
  let wSum = 0;
  for (const [key, w] of Object.entries(pesos)) {
    if (w == null) continue;
    const raw = atributos[key as keyof Atributos];
    const val = typeof raw === "number" ? raw : 40;
    sum += val * w;
    wSum += w;
  }
  const base = wSum > 0 ? sum / wSum / 100 : 0.5;
  const eased = Math.min(0.92, base * 1.08 + 0.04);
  const factor = 0.88 + rng() * 0.28; // [0.88, 1.16]
  return Math.max(0.2, Math.min(1.12, eased * factor));
}

export function aplicarEfectosAtributos(
  attrs: Atributos,
  delta?: Partial<Atributos>
): Atributos {
  if (!delta) return { ...attrs };
  const next: Atributos = { ...attrs };
  for (const [k, v] of Object.entries(delta)) {
    if (typeof v !== "number") continue;
    const key = k as keyof Atributos;
    const cur = next[key] ?? 40;
    next[key] = clipAtributo(cur + v);
  }
  return next;
}

export function seleccionarEventosTemporada(
  edad: number,
  vistos: string[],
  count: number,
  rng: () => number = Math.random
): EventoDecision[] {
  const tramo = tramoDesdeEdad(edad);
  const pool = getEventosByTramo(tramo).filter((e) => !vistos.includes(e.id));
  const source = pool.length >= count ? pool : getEventosByTramo(tramo);
  const shuffled = [...source];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  const n = Math.min(count, shuffled.length, 2);
  return shuffled.slice(0, Math.max(1, n));
}

/** Un partido emblemático del periodo según rendimiento. */
export function generarPartidoClave(input: {
  clubId: string;
  ligaId: string;
  rendimiento: number;
  lesionGrave: boolean;
  debutProfesional: boolean;
  rng?: () => number;
}): PartidoClave {
  const rng = input.rng ?? Math.random;
  const propios = getClubesByLiga(input.ligaId).filter((c) => c.id !== input.clubId);
  const pool =
    propios.length > 0 ? propios : getClubesBetPlay().filter((c) => c.id !== input.clubId);
  const rival =
    pool.length > 0
      ? pool[Math.floor(rng() * pool.length)]!.nombre
      : "el rival";

  const condicion: "local" | "visitante" = rng() < 0.55 ? "local" : "visitante";
  let golesFavor = 0;
  let golesContra = 0;
  let nota = "";

  if (input.lesionGrave) {
    golesFavor = Math.floor(rng() * 2);
    golesContra = 1 + Math.floor(rng() * 2);
    nota = "Saliste lesionado; el partido se te complicó.";
  } else if (input.debutProfesional) {
    golesFavor = 1 + Math.floor(rng() * 2);
    golesContra = Math.floor(rng() * 2);
    nota = "Debut en Primera: entraste y aportaste.";
  } else if (input.rendimiento >= 0.78) {
    golesFavor = 2 + Math.floor(rng() * 2);
    golesContra = Math.floor(rng() * 2);
    nota = "Partidazo: decidiste el encuentro.";
  } else if (input.rendimiento >= 0.6) {
    golesFavor = 1 + Math.floor(rng() * 2);
    golesContra = Math.floor(rng() * 2);
    if (golesFavor === golesContra) golesFavor += 1;
    nota = "Buen partido; la hinchada lo celebró.";
  } else if (input.rendimiento >= 0.45) {
    golesFavor = Math.floor(rng() * 2);
    golesContra = Math.floor(rng() * 2);
    nota = "Empate trabado; poco brillo individual.";
  } else {
    golesFavor = Math.floor(rng() * 2);
    golesContra = 1 + Math.floor(rng() * 3);
    nota = "Noche negra: el rival te pasó por encima.";
  }

  return { rival, golesFavor, golesContra, condicion, nota };
}

export function evaluarConvocatoria(
  edad: number,
  rendimiento: number,
  reputacion: number,
  actual: NivelSeleccion | null
): { nivel: NivelSeleccion | null; narrativa: string | null } {
  if (edad < 17) return { nivel: null, narrativa: null };

  if (edad <= 20 && rendimiento >= 0.62 && reputacion >= 0) {
    const nivel: NivelSeleccion = "sub20";
    if (actual === nivel) {
      return {
        nivel,
        narrativa: "Seguís en el radar de la Sub-20 de Colombia.",
      };
    }
    return {
      nivel,
      narrativa: "¡Primera convocatoria a la Sub-20 de Colombia!",
    };
  }

  if (edad <= 23 && rendimiento >= 0.68 && reputacion >= 10) {
    const nivel: NivelSeleccion = edad <= 20 ? "sub20" : "sub23";
    return {
      nivel,
      narrativa:
        nivel === "sub23"
          ? "La Sub-23 te tiene en mente para el ciclo olímpico."
          : "La Sub-20 te mantiene en el grupo.",
    };
  }

  if (edad >= 21 && rendimiento >= 0.72 && reputacion >= 25) {
    return {
      nivel: "mayor",
      narrativa:
        actual === "mayor"
          ? "Renovás convocatoria con la Selección Colombia mayor."
          : "¡Convocado a la Selección Colombia mayor!",
    };
  }

  if (actual && rendimiento < 0.55) {
    return {
      nivel: null,
      narrativa: "Te quedás fuera de la nómina de la Selección esta temporada.",
    };
  }

  return { nivel: actual, narrativa: null };
}

function pickRandomClub(
  nivel: NivelLiga,
  excludeId: string,
  rng: () => number
): OfertaTransferencia | null {
  const pool = getClubesByNivel(nivel).filter((c) => c.id !== excludeId);
  if (pool.length === 0) return null;
  const club = pool[Math.floor(rng() * pool.length)];
  const liga = getLigaById(club.ligaId);
  if (!liga) return null;
  return {
    clubId: club.id,
    ligaId: club.ligaId,
    clubNombre: club.nombre,
    ligaNombre: liga.nombre,
  };
}

/**
 * Escalera de transferencias:
 * - Dentro de BetPlay (otros clubes Colombia)
 * - BetPlay → intermedia (MX / BR / AR / MLS)
 * - Intermedia → grande Europa
 * - Cambios laterales en intermedia / Europa
 *
 * Usa rendimiento de la temporada + racha + reputación (no solo racha estricta).
 */
export function evaluarOfertaTransferencia(
  ligaActualId: string,
  clubActualId: string,
  edad: number,
  rachaAlto: number,
  reputacion: number,
  rendimiento: number = 0.55,
  rng: () => number = Math.random,
  esProfesional: boolean = true,
  /** Empujado por decisión «pedir la salida». */
  buscarSalida: boolean = false
): OfertaTransferencia | null {
  const liga = getLigaById(ligaActualId);
  if (!liga) return null;

  const boostSalida = buscarSalida ? 0.28 : 0;
  const rachaEff = rachaAlto + (buscarSalida ? 1 : 0);

  if (liga.nivel === "colombia_primera") {
    const eligibleAbroad =
      esProfesional &&
      edad >= 18 &&
      edad <= 29 &&
      reputacion >= (buscarSalida ? 4 : 8) &&
      (rachaEff >= RACHA_TRANSFERENCIA ||
        (rendimiento >= 0.7 && reputacion >= 18 && rachaEff >= 1) ||
        buscarSalida);

    if (eligibleAbroad) {
      const pAbroad = Math.min(
        0.85,
        0.18 +
          Math.min(0.3, rachaEff * 0.14) +
          Math.max(0, (rendimiento - 0.6) * 0.5) +
          (reputacion >= 25 ? 0.06 : 0) +
          boostSalida
      );
      if (rng() < pAbroad) {
        return pickRandomClub("intermedia", clubActualId, rng);
      }
    }

    // Fichaje doméstico a otro club BetPlay
    if (edad >= 17 && edad <= 33 && (rendimiento >= 0.5 || buscarSalida) && reputacion >= 0) {
      const pDom = Math.min(
        0.75,
        0.12 +
          Math.max(0, (rendimiento - 0.5) * 0.45) +
          (reputacion >= 14 ? 0.07 : 0) +
          (rachaEff >= 1 ? 0.05 : 0) +
          boostSalida
      );
      if (rng() < pDom) {
        return pickRandomClub("colombia_primera", clubActualId, rng);
      }
    }
    return null;
  }

  // Fuera de Colombia solo si ya sos profesional
  if (!esProfesional) return null;

  if (liga.nivel === "intermedia") {
    if (
      edad >= 20 &&
      edad <= 31 &&
      reputacion >= (buscarSalida ? 8 : 14) &&
      (rachaEff >= RACHA_TRANSFERENCIA ||
        (rendimiento >= 0.72 && reputacion >= 22 && rachaEff >= 1) ||
        buscarSalida)
    ) {
      const pEu = Math.min(
        0.75,
        0.14 +
          Math.min(0.24, rachaEff * 0.12) +
          Math.max(0, (rendimiento - 0.62) * 0.45) +
          boostSalida
      );
      if (rng() < pEu) {
        return pickRandomClub("grande_europa", clubActualId, rng);
      }
    }

    if (edad >= 19 && edad <= 33 && (rendimiento >= 0.55 || buscarSalida) && reputacion >= 5) {
      const pLat = Math.min(
        0.55,
        0.08 + Math.max(0, (rendimiento - 0.55) * 0.35) + boostSalida
      );
      if (rng() < pLat) {
        return pickRandomClub("intermedia", clubActualId, rng);
      }
    }
    return null;
  }

  if (liga.nivel === "grande_europa") {
    if (edad >= 21 && edad <= 33 && (rendimiento >= 0.6 || buscarSalida) && reputacion >= 8) {
      const p = Math.min(
        0.55,
        0.06 + Math.max(0, (rendimiento - 0.6) * 0.32) + boostSalida
      );
      if (rng() < p) {
        return pickRandomClub("grande_europa", clubActualId, rng);
      }
    }
    if (buscarSalida && rng() < 0.45) {
      return pickRandomClub("intermedia", clubActualId, rng);
    }
  }

  return null;
}

export function riesgoLesionGrave(
  fisico: number,
  riesgoExtraEventos: number
): number {
  const fisicoPenalty = fisico < 45 ? (45 - fisico) * 0.004 : 0;
  return Math.min(
    0.55,
    BASE_RIESGO_LESION_GRAVE + fisicoPenalty + riesgoExtraEventos
  );
}

export function evaluarFinCarreraAnticipado(input: {
  reputacion: number;
  moral: number;
  rachaBaja: number;
  riesgoFinCarrera: number;
  rng?: () => number;
}): MotivoRetiro | null {
  const rng = input.rng ?? Math.random;
  if (input.riesgoFinCarrera > 0 && rng() < input.riesgoFinCarrera) {
    return "lesion_grave";
  }
  if (
    input.rachaBaja >= 2 &&
    (input.reputacion < UMBRAL_RACHA_BAJA || input.moral < UMBRAL_RACHA_BAJA)
  ) {
    return "mala_racha";
  }
  return null;
}

export function statsDesdeRendimiento(
  rendimiento: number,
  posicion: Posicion,
  edad: number,
  rng: () => number = Math.random
): { partidos: number; goles: number; asistencias: number } {
  const partidosBase = 18 + Math.floor(rendimiento * 22);
  const partidos = Math.min(45, Math.max(4, partidosBase + Math.floor(rng() * 5) - 2));

  let goles = 0;
  let asistencias = 0;
  if (posicion === "delantero") {
    goles = Math.round(partidos * rendimiento * (0.35 + rng() * 0.2));
    asistencias = Math.round(partidos * rendimiento * 0.12);
  } else if (posicion === "extremo") {
    goles = Math.round(partidos * rendimiento * 0.22);
    asistencias = Math.round(partidos * rendimiento * 0.25);
  } else if (posicion === "mediocampista") {
    goles = Math.round(partidos * rendimiento * 0.1);
    asistencias = Math.round(partidos * rendimiento * 0.28);
  } else if (posicion === "lateral") {
    goles = Math.round(partidos * rendimiento * 0.04);
    asistencias = Math.round(partidos * rendimiento * 0.15);
  } else if (posicion === "defensa_central") {
    goles = Math.round(partidos * rendimiento * 0.03);
    asistencias = Math.round(partidos * rendimiento * 0.05);
  } else {
    goles = 0;
    asistencias = Math.round(partidos * rendimiento * 0.02);
  }

  return { partidos, goles, asistencias };
}

function esLigaAmericana(ligaId: string, nivel: NivelLiga): boolean {
  return (
    nivel === "colombia_primera" ||
    nivel === "intermedia" ||
    ligaId === "liga-betplay"
  );
}

/**
 * Trofeos de club + premios individuales según región y campaña.
 * América: Libertadores / Sudamericana (+ Concacaf en MLS).
 * Europa: Champions / Europa League.
 */
export function evaluarTrofeosYPremios(input: {
  rendimiento: number;
  posicion: Posicion;
  edad: number;
  ligaId: string;
  nivelLiga: NivelLiga;
  esProfesional: boolean;
  reputacion: number;
  goles: number;
  asistencias: number;
  rng?: () => number;
}): { titulos: string[]; premios: string[] } {
  const rng = input.rng ?? Math.random;
  const {
    rendimiento,
    posicion,
    edad,
    ligaId,
    nivelLiga,
    esProfesional,
    reputacion,
    goles,
    asistencias,
  } = input;
  const titulos: string[] = [];
  const premios: string[] = [];
  const contrib = goles + asistencias;

  // —— Domestic / youth ——
  if (!esProfesional || edad <= 18) {
    const pJuv = Math.min(0.4, 0.1 + Math.max(0, rendimiento - 0.45) * 0.5);
    if (rng() < pJuv) titulos.push("Título juvenil / reserva");
  }

  if (esProfesional || edad >= 17) {
    const excess = rendimiento - 0.5;
    const pLiga = excess <= 0 ? 0.04 : Math.min(0.4, 0.08 + excess * 0.6);
    if (rng() < pLiga) {
      titulos.push(edad <= 19 ? "Título de liga (primera/juvenil)" : "Título de liga");
    }

    const excessCopa = rendimiento - 0.48;
    const pCopa =
      excessCopa <= 0 ? 0.03 : Math.min(0.3, 0.05 + excessCopa * 0.45);
    if (rng() < pCopa) {
      if (ligaId === "liga-betplay") titulos.push("Copa Colombia");
      else if (ligaId === "liga-mx") titulos.push("Copa MX / Campeón de Campeones");
      else if (nivelLiga === "grande_europa") titulos.push("Copa doméstica (FA Cup / Copa del Rey…)");
      else titulos.push("Copa doméstica");
    }
  }

  // —— International cups by region ——
  if (esProfesional && edad >= 18) {
    if (nivelLiga === "grande_europa") {
      if (rendimiento >= 0.72) {
        const pUcl = Math.min(
          0.18,
          0.025 +
            (rendimiento - 0.72) * 0.3 +
            (reputacion >= 40 ? 0.03 : 0) +
            (contrib >= 22 ? 0.02 : 0)
        );
        if (rng() < pUcl) titulos.push("UEFA Champions League");
      }
      if (!titulos.includes("UEFA Champions League") && rendimiento >= 0.64) {
        const pUel = Math.min(
          0.26,
          0.06 + (rendimiento - 0.64) * 0.35 + (reputacion >= 25 ? 0.03 : 0)
        );
        if (rng() < pUel) titulos.push("UEFA Europa League");
      }
      if (
        !titulos.includes("UEFA Champions League") &&
        !titulos.includes("UEFA Europa League") &&
        rendimiento >= 0.6 &&
        rng() < 0.05 + (rendimiento - 0.6) * 0.18
      ) {
        titulos.push("UEFA Conference League");
      }
    } else if (ligaId === "mls") {
      if (rendimiento >= 0.65) {
        const p = Math.min(0.2, 0.05 + (rendimiento - 0.65) * 0.35);
        if (rng() < p) titulos.push("Concacaf Champions Cup");
      }
      if (
        !titulos.includes("Concacaf Champions Cup") &&
        rendimiento >= 0.58 &&
        rng() < 0.07 + (rendimiento - 0.58) * 0.25
      ) {
        titulos.push("Leagues Cup");
      }
    } else if (esLigaAmericana(ligaId, nivelLiga)) {
      if (rendimiento >= 0.68) {
        const pLib = Math.min(
          0.2,
          0.035 +
            (rendimiento - 0.68) * 0.32 +
            (reputacion >= 28 ? 0.03 : 0) +
            (nivelLiga === "intermedia" ? 0.025 : 0)
        );
        if (rng() < pLib) titulos.push("Copa Libertadores");
      }
      if (!titulos.includes("Copa Libertadores") && rendimiento >= 0.58) {
        const pSud = Math.min(
          0.28,
          0.06 + (rendimiento - 0.58) * 0.35 + (reputacion >= 15 ? 0.03 : 0)
        );
        if (rng() < pSud) titulos.push("Copa Sudamericana");
      }
      if (
        (titulos.includes("Copa Libertadores") ||
          titulos.includes("Copa Sudamericana")) &&
        rendimiento >= 0.72 &&
        rng() < 0.08
      ) {
        titulos.push("Recopa Sudamericana");
      }
    }
  } else if (!esProfesional && rendimiento >= 0.62 && rng() < 0.1) {
    titulos.push("Torneo internacional juvenil");
  }

  // —— Individual awards ——
  if (esProfesional) {
    if (rendimiento >= 0.76) {
      const pMvp = Math.min(0.24, 0.05 + (rendimiento - 0.76) * 0.45);
      if (rng() < pMvp) {
        if (ligaId === "liga-betplay") premios.push("Mejor jugador de la Liga BetPlay");
        else if (nivelLiga === "grande_europa")
          premios.push("Jugador del año de la liga");
        else premios.push("MVP / mejor jugador de la liga");
      }
    }

    if (
      (posicion === "delantero" || posicion === "extremo") &&
      goles >= 12 &&
      rendimiento >= 0.62
    ) {
      const pBota = Math.min(0.28, 0.05 + (goles - 12) * 0.015);
      if (rng() < pBota) {
        premios.push(
          nivelLiga === "grande_europa"
            ? "Bota de oro de la liga"
            : "Goleador del torneo"
        );
      }
    }

    if (posicion === "arquero" && rendimiento >= 0.74 && rng() < 0.12) {
      premios.push("Guante de oro");
    }

    if (goles >= 5 && rendimiento >= 0.6) {
      const pPuskas = Math.min(0.08, 0.015 + goles * 0.002 + (rendimiento - 0.6) * 0.06);
      if (rng() < pPuskas) premios.push("Premio Puskas");
    }

    if (edad <= 21 && rendimiento >= 0.72) {
      const pGb = Math.min(
        0.14,
        0.025 +
          (rendimiento - 0.72) * 0.25 +
          (nivelLiga === "grande_europa" ? 0.05 : 0.015) +
          (reputacion >= 25 ? 0.025 : 0)
      );
      if (rng() < pGb) premios.push("Golden Boy");
    }

    if (
      esLigaAmericana(ligaId, nivelLiga) &&
      ligaId !== "mls" &&
      edad >= 19 &&
      rendimiento >= 0.76
    ) {
      const pRey = Math.min(
        0.14,
        0.025 +
          (rendimiento - 0.76) * 0.3 +
          (reputacion >= 28 ? 0.03 : 0) +
          (contrib >= 18 ? 0.025 : 0)
      );
      if (rng() < pRey) premios.push("Mejor jugador de América (Rey de América)");
    }

    if (edad >= 21 && edad <= 34 && rendimiento >= 0.84 && reputacion >= 38) {
      const pBallon = Math.min(
        0.07,
        0.008 +
          (rendimiento - 0.84) * 0.14 +
          (nivelLiga === "grande_europa" ? 0.025 : 0.008) +
          (contrib >= 26 ? 0.018 : 0) +
          (titulos.some((t) =>
            t.includes("Champions") || t.includes("Libertadores")
          )
            ? 0.018
            : 0)
      );
      if (rng() < pBallon) premios.push("Balón de Oro");
    }

    if (
      rendimiento >= 0.88 &&
      reputacion >= 48 &&
      rng() < 0.02 + (nivelLiga === "grande_europa" ? 0.015 : 0)
    ) {
      premios.push("The Best FIFA");
    }
  }

  return { titulos, premios };
}

export function declivePorEdad(attrs: Atributos, edad: number): Atributos {
  if (edad < 32) return attrs;

  // Curva de ocaso: primero piernas/físico; luego técnica y resto.
  let ritmo = 0;
  let fisico = 0;
  let regate = 0;
  let tiro = 0;
  let pase = 0;
  let defensa = 0;
  let reflejos = 0;
  let atajadas = 0;

  if (edad >= 38) {
    ritmo = -3;
    fisico = -3;
    regate = -2;
    tiro = -1;
    pase = -1;
    defensa = -1;
    reflejos = -2;
    atajadas = -1;
  } else if (edad >= 36) {
    ritmo = -2;
    fisico = -2;
    regate = -1;
    tiro = -1;
    reflejos = -1;
  } else if (edad >= 34) {
    ritmo = -2;
    fisico = -1;
    regate = -1;
    reflejos = -1;
  } else {
    // 32–33: primer desgaste
    ritmo = -1;
    fisico = -1;
  }

  return aplicarEfectosAtributos(attrs, {
    ritmo,
    fisico,
    regate,
    tiro,
    pase,
    defensa,
    reflejos,
    atajadas,
  });
}

function ofertaDesdeClub(
  club: { id: string; ligaId: string; nombre: string },
): OfertaTransferencia | null {
  const liga = getLigaById(club.ligaId);
  if (!liga) return null;
  return {
    clubId: club.id,
    ligaId: club.ligaId,
    clubNombre: club.nombre,
    ligaNombre: liga.nombre,
  };
}

/**
 * Resuelve un destino de transferencia pedido por una decisión de evento.
 */
export function resolverTransferenciaPorDestino(
  jugador: Jugador,
  destino: NonNullable<EfectosDecision["transferencia"]>,
  rng: () => number = Math.random
): OfertaTransferencia | null {
  const exclude = new Set([jugador.clubActualId]);
  const ligaActual = getLigaById(jugador.ligaActualId);

  const pickFrom = (pool: ReturnType<typeof getClubesByNivel>) => {
    const filtered = pool.filter((c) => !exclude.has(c.id));
    if (filtered.length === 0) return null;
    return ofertaDesdeClub(filtered[Math.floor(rng() * filtered.length)]);
  };

  switch (destino) {
    case "club_origen": {
      const origen = getClubById(jugador.clubOrigenId);
      if (origen && origen.id !== jugador.clubActualId) {
        return ofertaDesdeClub(origen);
      }
      // Ya estás en el de origen: otro BetPlay
      return pickFrom(getClubesByNivel("colombia_primera"));
    }
    case "colombia_rival": {
      const pool = getClubesByNivel("colombia_primera").filter(
        (c) => c.id !== jugador.clubOrigenId && c.id !== jugador.clubActualId
      );
      if (pool.length === 0) return pickFrom(getClubesByNivel("colombia_primera"));
      return ofertaDesdeClub(pool[Math.floor(rng() * pool.length)]);
    }
    case "colombia_primera":
      return pickFrom(getClubesByNivel("colombia_primera"));
    case "intermedia":
      return pickFrom(getClubesByNivel("intermedia"));
    case "grande_europa":
      return pickFrom(getClubesByNivel("grande_europa"));
    case "mls": {
      const mls = getClubesByLiga("mls").filter((c) => !exclude.has(c.id));
      if (mls.length === 0) return pickFrom(getClubesByNivel("intermedia"));
      return ofertaDesdeClub(mls[Math.floor(rng() * mls.length)]);
    }
    case "ascenso": {
      if (!ligaActual || ligaActual.nivel === "colombia_primera") {
        return pickFrom(getClubesByNivel("intermedia"));
      }
      if (ligaActual.nivel === "intermedia") {
        return pickFrom(getClubesByNivel("grande_europa"));
      }
      return pickFrom(getClubesByNivel("grande_europa"));
    }
    case "mismo_nivel": {
      const nivel = ligaActual?.nivel ?? "colombia_primera";
      return pickFrom(getClubesByNivel(nivel));
    }
    case "liga_menos_exigente": {
      if (!ligaActual || ligaActual.nivel === "grande_europa") {
        return pickFrom(getClubesByNivel("intermedia"));
      }
      if (ligaActual.nivel === "intermedia") {
        return pickFrom(getClubesByNivel("colombia_primera"));
      }
      return pickFrom(getClubesByNivel("colombia_primera"));
    }
    default:
      return null;
  }
}

export function resolverDecisiones(
  jugador: Jugador,
  decisiones: { eventoId: string; opcionIndex: number }[],
  eventos: EventoDecision[],
  rng: () => number = Math.random
): {
  jugador: Jugador;
  riesgoLesionAcum: number;
  riesgoFinCarrera: number;
  lesion: Lesion | null;
  notas: string[];
  transferenciaPorDecision: OfertaTransferencia | null;
  convocatoriaForzada: NivelSeleccion | null;
  buscarSalida: boolean;
} {
  let attrs = { ...jugador.atributos };
  let reputacion = jugador.reputacion;
  let moral = jugador.moral;
  let clubActualId = jugador.clubActualId;
  let ligaActualId = jugador.ligaActualId;
  let riesgoLesionAcum = 0;
  let riesgoFinCarrera = 0;
  const notas: string[] = [];
  const lesiones = [...jugador.historialLesiones];
  let lesion: Lesion | null = null;
  let transferenciaPorDecision: OfertaTransferencia | null = null;
  let convocatoriaForzada: NivelSeleccion | null = null;
  let buscarSalida = false;
  let forzarLesion: "leve" | "grave" | null = null;

  for (const d of decisiones) {
    const ev = eventos.find((e) => e.id === d.eventoId);
    if (!ev) continue;
    const op = ev.opciones[d.opcionIndex];
    if (!op) continue;
    attrs = aplicarEfectosAtributos(attrs, op.efectos.atributos);
    reputacion = clipScore(reputacion + (op.efectos.reputacion ?? 0));
    moral = clipScore(moral + (op.efectos.moral ?? 0));
    riesgoLesionAcum += op.efectos.riesgoLesion ?? 0;
    riesgoFinCarrera = Math.max(riesgoFinCarrera, op.efectos.riesgoFinCarrera ?? 0);

    if (op.efectos.buscarSalida) {
      buscarSalida = true;
      notas.push(
        `Pediste la salida («${op.texto}»): el mercado te mira más de cerca.`
      );
    }

    if (op.efectos.convocatoria) {
      convocatoriaForzada = op.efectos.convocatoria;
    }

    if (op.efectos.forzarLesion) {
      forzarLesion = op.efectos.forzarLesion;
    }

    if (op.efectos.transferencia) {
      const jugadorTemp: Jugador = {
        ...jugador,
        clubActualId,
        ligaActualId,
        atributos: attrs,
        reputacion,
        moral,
      };
      const oferta = resolverTransferenciaPorDestino(
        jugadorTemp,
        op.efectos.transferencia,
        rng
      );
      if (oferta) {
        clubActualId = oferta.clubId;
        ligaActualId = oferta.ligaId;
        transferenciaPorDecision = oferta;
        moral = clipScore(moral + 4);
        notas.push(
          `Por tu decisión («${op.texto}»), fichas por ${oferta.clubNombre} (${oferta.ligaNombre}).`
        );
      }
    }
  }

  if (forzarLesion) {
    const grave = forzarLesion === "grave";
    lesion = {
      temporadaEdad: jugador.edad,
      descripcion: grave ? "Lesión grave" : "Lesión muscular",
      grave,
    };
    lesiones.push(lesion);
    attrs = aplicarEfectosAtributos(attrs, {
      ritmo: grave ? -4 : -2,
      fisico: grave ? -4 : -1,
    });
    moral = clipScore(moral - (grave ? 15 : 6));
    notas.push(
      grave
        ? "La decisión te costó una lesión grave esta temporada."
        : "La decisión te dejó una lesión muscular."
    );
    if (grave) riesgoFinCarrera = Math.max(riesgoFinCarrera, 0.2);
  } else {
    const pLesion = riesgoLesionGrave(attrs.fisico ?? 50, riesgoLesionAcum);
    if (rng() < pLesion) {
      const grave = rng() < 0.22 + riesgoFinCarrera;
      lesion = {
        temporadaEdad: jugador.edad,
        descripcion: grave ? "Lesión grave" : "Lesión muscular",
        grave,
      };
      lesiones.push(lesion);
      attrs = aplicarEfectosAtributos(attrs, {
        ritmo: grave ? -4 : -2,
        fisico: grave ? -4 : -1,
      });
      moral = clipScore(moral - (grave ? 15 : 6));
      notas.push(
        grave
          ? "Sufriste una lesión grave esta temporada."
          : "Una lesión te frena unas semanas."
      );
      if (grave) riesgoFinCarrera = Math.max(riesgoFinCarrera, 0.2);
    }
  }

  return {
    jugador: {
      ...jugador,
      atributos: attrs,
      reputacion,
      moral,
      historialLesiones: lesiones,
      clubActualId,
      ligaActualId,
    },
    riesgoLesionAcum,
    riesgoFinCarrera,
    lesion,
    notas,
    transferenciaPorDecision,
    convocatoriaForzada,
    buscarSalida,
  };
}

export function snapshotDecisiones(
  decisiones: { eventoId: string; opcionIndex: number }[],
  eventos: EventoDecision[]
): DecisionResuelta[] {
  return decisiones.map((d) => {
    const ev = eventos.find((e) => e.id === d.eventoId);
    const op = ev?.opciones[d.opcionIndex];
    const situacion = ev?.texto ?? "Situación desconocida";
    const decision = op?.texto ?? "Decisión desconocida";
    const efectos = op?.efectos ?? {};
    return {
      eventoId: d.eventoId,
      opcionIndex: d.opcionIndex,
      situacion,
      decision,
      afectacion: construirAfectacion(
        situacion,
        decision,
        efectos,
        op?.consecuencia
      ),
    };
  });
}

/** Relato en prosa del periodo (2 años) a partir de decisiones, stats y hechos. */
export function construirResumenAnio(input: {
  apellido: string;
  edadInicio: number;
  edad: number;
  clubNombre: string;
  ligaNombre: string;
  partidos: number;
  goles: number;
  asistencias: number;
  titulos: string[];
  premios?: string[];
  rendimiento: number;
  decisiones: DecisionResuelta[];
  notas: string[];
  lesion: Lesion | null;
  oferta: OfertaTransferencia | null;
}): string {
  const partes: string[] = [];
  const rendPct = Math.round(input.rendimiento * 100);
  const rangoEdad =
    input.edadInicio === input.edad
      ? `${input.edad} años`
      : `${input.edadInicio}–${input.edad} años`;

  partes.push(
    `En el periodo de ${rangoEdad}, ${input.apellido} vistió la camiseta de ${input.clubNombre} (${input.ligaNombre}). Sumó ${input.partidos} partidos, ${input.goles} goles y ${input.asistencias} asistencias (rendimiento medio ${rendPct}%).`
  );

  if (input.decisiones.length > 0) {
    const lineas = input.decisiones.map(
      (d, i) =>
        `${i + 1}) Ante «${acortar(d.situacion, 90)}», eligió: «${d.decision}».`
    );
    partes.push(`Decisiones del periodo: ${lineas.join(" ")}`);
  }

  if (input.titulos.length > 0) {
    partes.push(`Levantó: ${input.titulos.join(", ")}.`);
  }

  if (input.premios && input.premios.length > 0) {
    partes.push(`Premios individuales: ${input.premios.join(", ")}.`);
  }

  if (input.lesion) {
    partes.push(
      input.lesion.grave
        ? "Una lesión grave marcó el periodo y redujo su participación."
        : "Una lesión menor le hizo perder algunos partidos."
    );
  }

  for (const n of input.notas) {
    if (!partes.some((p) => p.includes(n))) partes.push(n);
  }

  if (input.oferta) {
    partes.push(
      `Al cierre del periodo llegó una oferta de ${input.oferta.clubNombre} (${input.oferta.ligaNombre}).`
    );
  }

  return partes.join(" ");
}

function acortar(texto: string, max: number): string {
  const t = texto.trim();
  if (t.length <= max) return t;
  return `${t.slice(0, max - 1).trimEnd()}…`;
}

export function calcularDeltasAtributos(
  antes: Atributos,
  despues: Atributos
): Partial<Record<keyof Atributos, number>> {
  const keys = new Set([
    ...Object.keys(antes),
    ...Object.keys(despues),
  ]) as Set<keyof Atributos>;
  const deltas: Partial<Record<keyof Atributos, number>> = {};
  for (const key of keys) {
    const a = antes[key];
    const b = despues[key];
    if (typeof a !== "number" && typeof b !== "number") continue;
    const delta = (b ?? 0) - (a ?? 0);
    if (delta !== 0) deltas[key] = delta;
  }
  return deltas;
}

/**
 * Ajusta atributos base según rendimiento de la temporada.
 * Buena campaña sube; mala baja. En el ocaso el cuerpo ya no absorbe subidas.
 */
export function aplicarCrecimientoPorRendimiento(
  attrs: Atributos,
  rendimiento: number,
  lesionGrave: boolean,
  edad = 20
): Atributos {
  let delta = 0;
  if (rendimiento >= 0.85) delta = 3;
  else if (rendimiento >= 0.72) delta = 2;
  else if (rendimiento >= 0.58) delta = 1;
  else if (rendimiento >= 0.45) delta = 0;
  else if (rendimiento >= 0.34) delta = -1;
  else if (rendimiento >= 0.24) delta = -2;
  else delta = -3;

  if (lesionGrave && delta > 0) delta = 0;
  if (lesionGrave && delta === 0) delta = -1;

  // Tope de crecimiento por edad (el declive anual actúa aparte).
  if (edad >= 37) {
    // Ocaso: aun con gran campaña, como mucho se mantiene; lo normal es bajar.
    delta = Math.min(delta, rendimiento >= 0.88 ? 0 : -1);
  } else if (edad >= 35) {
    delta = Math.min(delta, 0);
  } else if (edad >= 33) {
    delta = Math.min(delta, 1);
  }

  const core: (keyof Atributos)[] = [
    "ritmo",
    "tiro",
    "pase",
    "regate",
    "defensa",
    "fisico",
  ];
  const next: Atributos = { ...attrs };
  for (const key of core) {
    next[key] = clipAtributo((next[key] ?? 40) + delta);
  }
  if (typeof next.atajadas === "number") {
    next.atajadas = clipAtributo(next.atajadas + delta);
  }
  if (typeof next.reflejos === "number") {
    next.reflejos = clipAtributo(next.reflejos + delta);
  }
  return next;
}

/** Reputación/moral reaccionan al rendimiento de la campaña. */
export function ajustarReputacionMoralPorRendimiento(
  reputacion: number,
  moral: number,
  rendimiento: number,
  lesionGrave: boolean
): { reputacion: number; moral: number } {
  let dRep = 0;
  let dMoral = 0;
  if (rendimiento >= 0.8) {
    dRep = 6;
    dMoral = 8;
  } else if (rendimiento >= 0.7) {
    dRep = 3;
    dMoral = 4;
  } else if (rendimiento >= 0.55) {
    dRep = 1;
    dMoral = 1;
  } else if (rendimiento >= 0.42) {
    dRep = -2;
    dMoral = -3;
  } else {
    dRep = -5;
    dMoral = -7;
  }
  if (lesionGrave) {
    dMoral -= 4;
    dRep -= 2;
  }
  return {
    reputacion: clipScore(reputacion + dRep),
    moral: clipScore(moral + dMoral),
  };
}

/** Cierra un periodo de 2 años tras las decisiones; deja oferta pendiente si aplica. */
export function cerrarTemporada(
  estado: EstadoCarrera,
  rng: () => number = Math.random
): EstadoCarrera {
  const { jugador: j0, decisionesTemporada, eventosPendientes } = estado;
  const edadInicio = j0.edad;
  const edadFin = Math.min(edadInicio + ANIOS_POR_PERIODO - 1, EDAD_RETIRO_FORZADO);
  const attrsAntes: Atributos = { ...j0.atributos };
  const repAntes = j0.reputacion;
  const moralAntes = j0.moral;

  const resolved = resolverDecisiones(j0, decisionesTemporada, eventosPendientes, rng);
  let jugador = resolved.jugador;
  const lesionGrave = resolved.lesion?.grave === true;
  const notasExtra: string[] = [];

  let partidosTot = 0;
  let golesTot = 0;
  let asistenciasTot = 0;
  const titulos: string[] = [];
  const premios: string[] = [];
  const cantera = statsEtapaVacias();
  const profesional = statsEtapaVacias();
  const rendimientos: number[] = [];
  let debutProfesional = false;
  let añosBuenos = 0;

  const ligaTemporada = getLigaById(j0.ligaActualId);
  const nivelLiga: NivelLiga = ligaTemporada?.nivel ?? "colombia_primera";

  for (let edadAnio = edadInicio; edadAnio <= edadFin; edadAnio++) {
    // Declive de edad cada año del periodo (no solo al cumplir años a mitad).
    jugador = {
      ...jugador,
      edad: edadAnio,
      atributos: declivePorEdad(jugador.atributos, edadAnio),
    };

    const rendimiento = calcularRendimiento(jugador.atributos, jugador.posicion, rng);
    rendimientos.push(rendimiento);
    if (rendimiento > UMBRAL_RENDIMIENTO_TRANSFERENCIA) añosBuenos += 1;

    const stats = statsDesdeRendimiento(
      rendimiento,
      jugador.posicion,
      edadAnio,
      rng
    );

    if (lesionGrave) {
      stats.partidos = Math.max(2, Math.floor(stats.partidos * 0.45));
      stats.goles = Math.floor(stats.goles * 0.5);
      stats.asistencias = Math.floor(stats.asistencias * 0.5);
    }

    const subePro = evaluarAscensoProfesional({
      yaProfesional: jugador.esProfesional,
      edad: edadAnio,
      rendimiento,
      reputacion: jugador.reputacion,
      rng,
    });

    const cuentaComoProfesional = jugador.esProfesional || subePro;

    if (!jugador.esProfesional && !subePro) {
      stats.partidos = Math.max(4, Math.floor(stats.partidos * 0.4));
      stats.goles = Math.floor(stats.goles * 0.45);
      stats.asistencias = Math.floor(stats.asistencias * 0.45);
    } else if (subePro) {
      stats.partidos = Math.max(stats.partidos, 10 + Math.floor(rng() * 12));
      const clubDebut =
        getClubById(jugador.clubActualId)?.nombre ??
        getClubById(j0.clubActualId)?.nombre ??
        "tu club";
      jugador = {
        ...jugador,
        esProfesional: true,
        edadDebutProfesional: edadAnio,
        reputacion: clipScore(jugador.reputacion + 8),
        moral: clipScore(jugador.moral + 12),
        atributos: aplicarEfectosAtributos(jugador.atributos, {
          ritmo: 1,
          fisico: 1,
        }),
      };
      debutProfesional = true;
      notasExtra.push(
        `¡Ascenso a profesional! ${clubDebut} te incorpora al plantel de Primera. Debutas a los ${edadAnio} años.`
      );
    }

    partidosTot += stats.partidos;
    golesTot += stats.goles;
    asistenciasTot += stats.asistencias;

    const yearTrophies = evaluarTrofeosYPremios({
      rendimiento,
      posicion: jugador.posicion,
      edad: edadAnio,
      ligaId: j0.ligaActualId,
      nivelLiga,
      esProfesional: jugador.esProfesional,
      reputacion: jugador.reputacion,
      goles: stats.goles,
      asistencias: stats.asistencias,
      rng,
    });
    titulos.push(...yearTrophies.titulos);
    premios.push(...yearTrophies.premios);

    const bucket = cuentaComoProfesional ? profesional : cantera;
    bucket.partidos += stats.partidos;
    bucket.goles += stats.goles;
    bucket.asistencias += stats.asistencias;
    bucket.titulos.push(...yearTrophies.titulos);
    bucket.premiosIndividuales.push(...yearTrophies.premios);

    jugador = {
      ...jugador,
      atributos: aplicarCrecimientoPorRendimiento(
        jugador.atributos,
        rendimiento,
        lesionGrave,
        edadAnio
      ),
    };
    const rm = ajustarReputacionMoralPorRendimiento(
      jugador.reputacion,
      jugador.moral,
      rendimiento,
      lesionGrave && edadAnio === edadInicio
    );
    jugador = { ...jugador, reputacion: rm.reputacion, moral: rm.moral };
  }

  jugador = { ...jugador, edad: edadFin };

  const rendimiento =
    rendimientos.length > 0
      ? rendimientos.reduce((a, b) => a + b, 0) / rendimientos.length
      : 0.5;

  // Prestigio por copas y premios del periodo
  let bonusRep = 0;
  let bonusMoral = 0;
  for (const t of titulos) {
    if (t.includes("Champions") || t.includes("Libertadores")) {
      bonusRep += 10;
      bonusMoral += 12;
    } else if (
      t.includes("Europa League") ||
      t.includes("Sudamericana") ||
      t.includes("Concacaf")
    ) {
      bonusRep += 6;
      bonusMoral += 8;
    } else if (t.includes("liga") || t.includes("Copa")) {
      bonusRep += 3;
      bonusMoral += 4;
    }
  }
  for (const p of premios) {
    if (p.includes("Balón de Oro") || p.includes("The Best")) {
      bonusRep += 15;
      bonusMoral += 14;
    } else if (p.includes("Golden Boy") || p.includes("América")) {
      bonusRep += 10;
      bonusMoral += 10;
    } else if (p.includes("Puskas")) {
      bonusRep += 5;
      bonusMoral += 8;
    } else {
      bonusRep += 4;
      bonusMoral += 5;
    }
  }
  if (bonusRep || bonusMoral) {
    jugador = {
      ...jugador,
      reputacion: clipScore(jugador.reputacion + bonusRep),
      moral: clipScore(jugador.moral + bonusMoral),
    };
  }
  for (const t of titulos) {
    if (
      t.includes("Champions") ||
      t.includes("Libertadores") ||
      t.includes("Europa League") ||
      t.includes("Sudamericana")
    ) {
      notasExtra.push(`Trofeo internacional: ${t}.`);
    }
  }
  for (const p of premios) {
    notasExtra.push(`Premio individual: ${p}.`);
  }

  const deltasAtributos = calcularDeltasAtributos(attrsAntes, jugador.atributos);
  const deltaReputacion = jugador.reputacion - repAntes;
  const deltaMoral = jugador.moral - moralAntes;

  const selec = evaluarConvocatoria(
    jugador.edad,
    rendimiento,
    jugador.reputacion,
    jugador.convocatoriaSeleccion
  );
  if (resolved.convocatoriaForzada) {
    const nivel = resolved.convocatoriaForzada;
    const label =
      nivel === "mayor" ? "Selección mayor" : nivel === "sub23" ? "Sub-23" : "Sub-20";
    jugador = { ...jugador, convocatoriaSeleccion: nivel };
    notasExtra.push(
      `Por tu decisión quedaste en el radar de la ${label} de Colombia.`
    );
  } else {
    jugador = { ...jugador, convocatoriaSeleccion: selec.nivel };
    if (selec.narrativa) notasExtra.push(selec.narrativa);
  }

  let rachaAlto = estado.rachaAltoRendimiento;
  if (añosBuenos >= 2) rachaAlto += 2;
  else if (añosBuenos === 1) rachaAlto += 1;
  else if (rendimiento >= 0.5) rachaAlto = Math.max(0, rachaAlto - 1);
  else rachaAlto = 0;

  let rachaBaja = estado.rachaBaja;
  if (jugador.reputacion < UMBRAL_RACHA_BAJA || jugador.moral < UMBRAL_RACHA_BAJA) {
    rachaBaja += 1;
  } else {
    rachaBaja = 0;
  }

  const oferta = resolved.transferenciaPorDecision
    ? null
    : evaluarOfertaTransferencia(
        jugador.ligaActualId,
        jugador.clubActualId,
        jugador.edad,
        rachaAlto,
        jugador.reputacion,
        rendimiento,
        rng,
        jugador.esProfesional,
        resolved.buscarSalida
      );

  if (oferta && resolved.buscarSalida) {
    notasExtra.push(
      `Tras pedir la salida, llegó una oferta de ${oferta.clubNombre} (${oferta.ligaNombre}).`
    );
  }

  const motivoAnticipado = evaluarFinCarreraAnticipado({
    reputacion: jugador.reputacion,
    moral: jugador.moral,
    rachaBaja,
    riesgoFinCarrera: resolved.riesgoFinCarrera,
    rng,
  });

  const eventosResolvidos = snapshotDecisiones(
    decisionesTemporada,
    eventosPendientes
  );
  const clubTemporada = getClubById(j0.clubActualId);
  const liga = ligaTemporada ?? getLigaById(j0.ligaActualId);
  const notas = [...notasExtra, ...resolved.notas];
  if (!jugador.esProfesional) {
    notas.push("Sigues en la cantera / juveniles; el ascenso a Primera aún no llegó.");
  }
  if (rendimiento >= 0.72) {
    notas.push("El buen periodo también empujó tus atributos físicos/técnicos.");
  } else if (rendimiento <= 0.42) {
    notas.push("El bajo rendimiento del periodo te restó ritmo y condición.");
  }

  const partidoClave = generarPartidoClave({
    clubId: j0.clubActualId,
    ligaId: j0.ligaActualId,
    rendimiento,
    lesionGrave,
    debutProfesional,
    rng,
  });

  const resumenAnio = construirResumenAnio({
    apellido: jugador.apellido,
    edadInicio,
    edad: edadFin,
    clubNombre: clubTemporada?.nombre ?? "su club",
    ligaNombre: liga?.nombre ?? "su liga",
    partidos: partidosTot,
    goles: golesTot,
    asistencias: asistenciasTot,
    titulos,
    premios,
    rendimiento,
    decisiones: eventosResolvidos,
    notas,
    lesion: resolved.lesion,
    oferta,
  });

  const nivelSeleccionFinal = resolved.convocatoriaForzada ?? selec.nivel;
  const narrativaSeleccionFinal = resolved.convocatoriaForzada
    ? `Convocado a la ${resolved.convocatoriaForzada === "mayor" ? "Selección mayor" : "Sub-20"} por tu decisión.`
    : selec.narrativa;

  const resultado: ResultadoTemporada = {
    edadInicio,
    edad: edadFin,
    clubId: j0.clubActualId,
    ligaId: j0.ligaActualId,
    partidosJugados: partidosTot,
    goles: golesTot,
    asistencias: asistenciasTot,
    titulos,
    premiosIndividuales: premios,
    cantera: { ...cantera, titulos: [...cantera.titulos], premiosIndividuales: [...cantera.premiosIndividuales] },
    profesional: {
      ...profesional,
      titulos: [...profesional.titulos],
      premiosIndividuales: [...profesional.premiosIndividuales],
    },
    partidoClave,
    rendimientoPromedio: rendimiento,
    eventosResolvidos,
    resumenAnio,
    convocatoriaSeleccion: nivelSeleccionFinal,
    narrativaSeleccion: narrativaSeleccionFinal,
    ofertaTransferencia: oferta,
    aceptoTransferencia: false,
    lesion: resolved.lesion,
    notas,
    atributos: { ...jugador.atributos },
    deltasAtributos,
    reputacion: jugador.reputacion,
    moral: jugador.moral,
    deltaReputacion,
    deltaMoral,
    debutProfesional,
  };

  const eventosVistos = [
    ...estado.eventosVistos,
    ...decisionesTemporada.map((d) => d.eventoId),
  ];

  if (motivoAnticipado) {
    return {
      ...estado,
      jugador,
      historialTemporadas: [...estado.historialTemporadas, resultado],
      eventosVistos,
      rachaAltoRendimiento: rachaAlto,
      rachaBaja,
      ofertaPendiente: null,
      eventosPendientes: [],
      decisionesTemporada: [],
      retirado: true,
      motivoRetiro: motivoAnticipado,
      fase: "retiro",
    };
  }

  return {
    ...estado,
    jugador,
    historialTemporadas: [...estado.historialTemporadas, resultado],
    eventosVistos,
    rachaAltoRendimiento: rachaAlto,
    rachaBaja,
    ofertaPendiente: oferta,
    eventosPendientes: [],
    decisionesTemporada: [],
    fase: "temporada_resultado",
  };
}

export function aceptarOferta(
  estado: EstadoCarrera,
  aceptar: boolean
): EstadoCarrera {
  if (!estado.ofertaPendiente) {
    return { ...estado, ofertaPendiente: null };
  }
  const oferta = estado.ofertaPendiente;
  let jugador = estado.jugador;
  const historial = [...estado.historialTemporadas];
  const last = historial[historial.length - 1];

  if (aceptar) {
    jugador = {
      ...jugador,
      clubActualId: oferta.clubId,
      ligaActualId: oferta.ligaId,
      moral: clipScore(jugador.moral + 8),
      reputacion: clipScore(jugador.reputacion + 5),
    };
    if (last) {
      const nota = `Fichás por ${oferta.clubNombre} (${oferta.ligaNombre}).`;
      historial[historial.length - 1] = {
        ...last,
        aceptoTransferencia: true,
        notas: [...last.notas, nota],
        resumenAnio: `${last.resumenAnio} ${nota}`,
      };
    }
  } else if (last) {
    const nota = `Rechazás la oferta de ${oferta.clubNombre}.`;
    historial[historial.length - 1] = {
      ...last,
      aceptoTransferencia: false,
      notas: [...last.notas, nota],
      resumenAnio: `${last.resumenAnio} ${nota}`,
    };
  }

  return {
    ...estado,
    jugador,
    historialTemporadas: historial,
    ofertaPendiente: null,
    rachaAltoRendimiento: aceptar ? 0 : estado.rachaAltoRendimiento,
  };
}

export function avanzarAnio(
  estado: EstadoCarrera,
  opts: { forzarRetiro?: boolean; rng?: () => number } = {}
): EstadoCarrera {
  const rng = opts.rng ?? Math.random;
  if (estado.retirado) return estado;

  const jugador = {
    ...estado.jugador,
    edad: estado.jugador.edad + 1,
    atributos: declivePorEdad(estado.jugador.atributos, estado.jugador.edad + 1),
  };

  const last = estado.historialTemporadas[estado.historialTemporadas.length - 1];
  const enDeclive = last != null && last.rendimientoPromedio < 0.55;

  if (opts.forzarRetiro || jugador.edad >= EDAD_RETIRO_FORZADO) {
    return {
      ...estado,
      jugador,
      retirado: true,
      motivoRetiro: "edad",
      fase: "retiro",
      eventosPendientes: [],
      decisionesTemporada: [],
      ofertaPendiente: null,
    };
  }

  if (jugador.edad >= EDAD_RETIRO_OPCION && enDeclive && rng() < 0.35) {
    // Ofrecer vía UI; aquí no forzamos — el caller puede preguntar.
  }

  const eventosPendientes = seleccionarEventosTemporada(
    jugador.edad,
    estado.eventosVistos,
    1 + Math.floor(rng() * 2),
    rng
  );

  return {
    ...estado,
    jugador,
    eventosPendientes,
    decisionesTemporada: [],
    ofertaPendiente: null,
    fase: "temporada_eventos",
  };
}

export function iniciarPrimeraTemporada(
  estado: EstadoCarrera,
  rng: () => number = Math.random
): EstadoCarrera {
  const eventosPendientes = seleccionarEventosTemporada(
    estado.jugador.edad,
    estado.eventosVistos,
    1 + Math.floor(rng() * 2),
    rng
  );
  return {
    ...estado,
    eventosPendientes,
    decisionesTemporada: [],
    fase: "temporada_eventos",
  };
}

export function compararEstilo(jugador: Jugador, resumen: Omit<ResumenCarrera, "comparacion">): ComparacionEstilo {
  const disclaimer =
    "Comparación estilística ficticia con fines de entretenimiento. No afirma equivalencia literal con la figura mencionada.";

  const pos = jugador.posicion;
  const golesPorPartido = resumen.partidos > 0 ? resumen.goles / resumen.partidos : 0;
  const llegoEuropa = resumen.maxLigaNivel === "grande_europa";

  let figura = "un crack de cantera colombiana";
  let razon = "Tu camino recuerda a muchos talentos formados en BetPlay.";

  if (pos === "arquero") {
    figura = llegoEuropa ? "David Ospina (trayectoria)" : "Franco Armani / ídolos locales de arco";
    razon = "Perfil de arquero con proyección y lectura de juego.";
  } else if (pos === "delantero") {
    figura = golesPorPartido > 0.4 ? "Radamel Falcao (etapa goleadora)" : "Duván Zapata";
    razon = "Definición y presencia ofensiva como sello de tu carrera.";
  } else if (pos === "extremo") {
    figura = llegoEuropa ? "Juan Cuadrado" : "Luis Díaz (desborde)";
    razon = "Desborde, ritmo y desequilibrio por banda.";
  } else if (pos === "mediocampista") {
    figura = llegoEuropa ? "James Rodríguez (creación)" : "Rueda / creativos BetPlay";
    razon = "Peso en la creación y el último pase.";
  } else if (pos === "lateral") {
    figura = "Stefan Medina / laterales ofensivos colombianos";
    razon = "Ida y vuelta, proyección y entrega.";
  } else {
    figura = "Yerry Mina (proyección defensiva)";
    razon = "Solidez, juego aéreo y liderazgo atrás.";
  }

  return { figura, razon, disclaimer };
}

export function construirResumen(estado: EstadoCarrera): ResumenCarrera {
  const historial = estado.historialTemporadas;
  const partidos = historial.reduce((s, t) => s + t.partidosJugados, 0);
  const goles = historial.reduce((s, t) => s + t.goles, 0);
  const asistencias = historial.reduce((s, t) => s + t.asistencias, 0);
  const titulos = historial.flatMap((t) => t.titulos);
  const premiosIndividuales = historial.flatMap((t) => t.premiosIndividuales ?? []);
  const cantera = historial.reduce(
    (acc, t) => sumarStatsEtapa(acc, t.cantera ?? statsEtapaVacias()),
    statsEtapaVacias()
  );
  const profesional = historial.reduce(
    (acc, t) => sumarStatsEtapa(acc, t.profesional ?? statsEtapaVacias()),
    statsEtapaVacias()
  );
  const clubIds = [...new Set(historial.map((t) => t.clubId))];
  const clubes = clubIds.map((id) => getClubById(id)?.nombre ?? id);

  let maxLigaNivel: NivelLiga = "colombia_primera";
  for (const t of historial) {
    const liga = getLigaById(t.ligaId);
    if (!liga) continue;
    if (liga.nivel === "grande_europa") maxLigaNivel = "grande_europa";
    else if (liga.nivel === "intermedia" && maxLigaNivel === "colombia_primera") {
      maxLigaNivel = "intermedia";
    }
  }

  const titulosPorClub = agruparTitulosPorClub(historial);
  const prime = calcularPrimeCarrera(historial, estado.jugador.posicion);

  const base = {
    partidos,
    goles,
    asistencias,
    titulos,
    premiosIndividuales,
    cantera,
    profesional,
    clubes,
    titulosPorClub,
    prime,
    maxLigaNivel,
    edadRetiro: estado.jugador.edad,
    motivoRetiro: estado.motivoRetiro ?? "edad",
  };

  return {
    ...base,
    comparacion: compararEstilo(estado.jugador, base),
  };
}

/** Mejor OVR del historial (periodo con mayor media). */
export function calcularPrimeCarrera(
  historial: ResultadoTemporada[],
  posicion: Posicion
): PrimeCarrera | null {
  let best: PrimeCarrera | null = null;
  for (const t of historial) {
    if (!t.atributos) continue;
    const media = calcularMedia(t.atributos, posicion);
    if (best && media < best.media) continue;
    // Empate: quedarse con el más joven (primer peak).
    if (best && media === best.media && t.edad >= best.edad) continue;
    best = {
      media,
      edad: t.edad,
      edadInicio: t.edadInicio,
      clubId: t.clubId,
      clubNombre: getClubById(t.clubId)?.nombre ?? t.clubId,
      atributos: { ...t.atributos },
      reputacion: t.reputacion,
      moral: t.moral,
    };
  }
  return best;
}

/** Títulos por club en orden de aparición en la carrera. */
export function agruparTitulosPorClub(
  historial: ResultadoTemporada[]
): TitulosPorClub[] {
  const order: string[] = [];
  const map = new Map<string, Map<string, number>>();

  for (const t of historial) {
    if (!t.titulos?.length) continue;
    if (!map.has(t.clubId)) {
      map.set(t.clubId, new Map());
      order.push(t.clubId);
    }
    const bag = map.get(t.clubId)!;
    for (const nombre of t.titulos) {
      bag.set(nombre, (bag.get(nombre) ?? 0) + 1);
    }
  }

  return order.map((clubId) => {
    const bag = map.get(clubId)!;
    return {
      clubId,
      clubNombre: getClubById(clubId)?.nombre ?? clubId,
      titulos: [...bag.entries()].map(([nombre, cantidad]) => ({
        nombre,
        cantidad,
      })),
    };
  });
}
