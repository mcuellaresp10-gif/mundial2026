import { getClubById, getClubesByLiga } from "@/data/carrera/clubes";
import type {
  FilaTabla,
  OverrideResultadoJugador,
  PartidoFixture,
  ResultadoLiga,
  TemporadaLiga,
} from "@/data/nueva-estrella/types";

function filaVacia(clubId: string): FilaTabla {
  return { clubId, pj: 0, pg: 0, pe: 0, pp: 0, gf: 0, gc: 0, pts: 0 };
}

/** Round-robin solo ida (algoritmo del círculo). N par; si impar, se agrega bye. */
export function generarFixtureSoloIda(clubIds: string[]): PartidoFixture[][] {
  const ids = [...clubIds];
  if (ids.length < 2) return [];

  const bye = "__bye__";
  const odd = ids.length % 2 === 1;
  if (odd) ids.push(bye);

  const n = ids.length;
  const rounds = n - 1;
  const half = n / 2;
  const arr = [...ids];
  const jornadas: PartidoFixture[][] = [];

  for (let r = 0; r < rounds; r++) {
    const partidos: PartidoFixture[] = [];
    for (let i = 0; i < half; i++) {
      const a = arr[i]!;
      const b = arr[n - 1 - i]!;
      if (a === bye || b === bye) continue;
      // Alternar local/visitante por ronda para equilibrar
      if (r % 2 === 0) partidos.push({ localId: a, visitanteId: b });
      else partidos.push({ localId: b, visitanteId: a });
    }
    jornadas.push(partidos);
    // Rotar: fijo arr[0], rotar el resto
    const fixed = arr[0]!;
    const rest = arr.slice(1);
    rest.unshift(rest.pop()!);
    arr.splice(0, arr.length, fixed, ...rest);
  }

  return jornadas;
}

export function semanasPorLiga(ligaId: string): number {
  const n = getClubesByLiga(ligaId).length;
  return Math.max(1, n - 1);
}

export function crearTemporadaLiga(
  ligaId: string,
  temporada: number
): TemporadaLiga {
  const clubes = getClubesByLiga(ligaId);
  if (clubes.length < 2) {
    throw new Error(`Liga ${ligaId} sin clubes suficientes`);
  }
  const clubIds = clubes.map((c) => c.id);
  return {
    ligaId,
    temporada,
    clubIds,
    fixture: generarFixtureSoloIda(clubIds),
    resultados: [],
    tabla: clubIds.map(filaVacia),
    jornadaActual: 1,
  };
}

export function simularMarcadorAleatorio(
  rng: () => number = Math.random
): { golesLocal: number; golesVisitante: number } {
  // Sesgo leve a marcadores bajos (0–4)
  const roll = () => {
    const r = rng();
    if (r < 0.28) return 0;
    if (r < 0.55) return 1;
    if (r < 0.78) return 2;
    if (r < 0.92) return 3;
    return 4;
  };
  return { golesLocal: roll(), golesVisitante: roll() };
}

function aplicarResultadoATabla(
  tabla: FilaTabla[],
  localId: string,
  visitanteId: string,
  golesLocal: number,
  golesVisitante: number
): FilaTabla[] {
  const next = tabla.map((f) => ({ ...f }));
  const local = next.find((f) => f.clubId === localId);
  const visita = next.find((f) => f.clubId === visitanteId);
  if (!local || !visita) return next;

  local.pj += 1;
  visita.pj += 1;
  local.gf += golesLocal;
  local.gc += golesVisitante;
  visita.gf += golesVisitante;
  visita.gc += golesLocal;

  if (golesLocal > golesVisitante) {
    local.pg += 1;
    local.pts += 3;
    visita.pp += 1;
  } else if (golesLocal < golesVisitante) {
    visita.pg += 1;
    visita.pts += 3;
    local.pp += 1;
  } else {
    local.pe += 1;
    visita.pe += 1;
    local.pts += 1;
    visita.pts += 1;
  }
  return next;
}

export function ordenarTabla(tabla: FilaTabla[]): FilaTabla[] {
  return [...tabla].sort((a, b) => {
    if (b.pts !== a.pts) return b.pts - a.pts;
    const difA = a.gf - a.gc;
    const difB = b.gf - b.gc;
    if (difB !== difA) return difB - difA;
    if (b.gf !== a.gf) return b.gf - a.gf;
    const na = getClubById(a.clubId)?.nombre ?? a.clubId;
    const nb = getClubById(b.clubId)?.nombre ?? b.clubId;
    return na.localeCompare(nb, "es");
  });
}

export function partidoJugadorEnJornada(
  temporadaLiga: TemporadaLiga,
  jornada: number,
  clubId: string
): PartidoFixture | null {
  const partidos = temporadaLiga.fixture[jornada - 1];
  if (!partidos) return null;
  return (
    partidos.find((p) => p.localId === clubId || p.visitanteId === clubId) ??
    null
  );
}

export function posicionClub(
  temporadaLiga: TemporadaLiga,
  clubId: string
): number {
  const ordered = ordenarTabla(temporadaLiga.tabla);
  const idx = ordered.findIndex((f) => f.clubId === clubId);
  return idx < 0 ? ordered.length : idx + 1;
}

/**
 * Resuelve una jornada: simula NPCs; si hay override del jugador, usa ese marcador.
 * Avanza jornadaActual al terminar.
 */
export function resolverJornada(
  temporadaLiga: TemporadaLiga,
  jornada: number,
  overrideJugador?: OverrideResultadoJugador | null,
  rng: () => number = Math.random
): TemporadaLiga {
  if (jornada < 1 || jornada > temporadaLiga.fixture.length) {
    return temporadaLiga;
  }
  // Evitar resolver dos veces la misma jornada
  if (temporadaLiga.resultados.some((r) => r.jornada === jornada)) {
    return temporadaLiga;
  }

  const partidos = temporadaLiga.fixture[jornada - 1] ?? [];
  let tabla = temporadaLiga.tabla.map((f) => ({ ...f }));
  const nuevos: ResultadoLiga[] = [];

  for (const p of partidos) {
    let golesLocal: number;
    let golesVisitante: number;

    if (
      overrideJugador &&
      (p.localId === overrideJugador.clubId ||
        p.visitanteId === overrideJugador.clubId)
    ) {
      if (p.localId === overrideJugador.clubId) {
        golesLocal = overrideJugador.golesFavor;
        golesVisitante = overrideJugador.golesContra;
      } else {
        golesLocal = overrideJugador.golesContra;
        golesVisitante = overrideJugador.golesFavor;
      }
    } else {
      const m = simularMarcadorAleatorio(rng);
      golesLocal = m.golesLocal;
      golesVisitante = m.golesVisitante;
    }

    nuevos.push({
      jornada,
      localId: p.localId,
      visitanteId: p.visitanteId,
      golesLocal,
      golesVisitante,
    });
    tabla = aplicarResultadoATabla(
      tabla,
      p.localId,
      p.visitanteId,
      golesLocal,
      golesVisitante
    );
  }

  return {
    ...temporadaLiga,
    resultados: [...temporadaLiga.resultados, ...nuevos],
    tabla: ordenarTabla(tabla),
    jornadaActual: Math.min(
      temporadaLiga.fixture.length + 1,
      jornada + 1
    ),
  };
}

export function temporadaLigaTerminada(t: TemporadaLiga): boolean {
  return t.jornadaActual > t.fixture.length;
}
