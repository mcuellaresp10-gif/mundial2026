import { ARQUETIPOS_DT } from "@/data/ideologia/arquetipos";
import { DILEMAS } from "@/data/ideologia/dilemas";
import type {
  ArquetipoDT,
  EjeKey,
  EjesIdeologicos,
  EleccionDilema,
  PorcentajeEje,
  PreguntaDilema,
  ResultadoTest,
} from "@/data/ideologia/types";

export const EJES_META: {
  key: EjeKey;
  etiqueta: string;
  ladoIzquierdo: string;
  ladoDerecho: string;
}[] = [
  {
    key: "resultadismoIdealismo",
    etiqueta: "Resultadismo ↔ Idealismo",
    ladoIzquierdo: "Resultadista",
    ladoDerecho: "Idealista",
  },
  {
    key: "ordenLibertad",
    etiqueta: "Orden ↔ Libertad",
    ladoIzquierdo: "Orden",
    ladoDerecho: "Libertad",
  },
  {
    key: "posesionVerticalidad",
    etiqueta: "Posesión ↔ Verticalidad",
    ladoIzquierdo: "Posesión",
    ladoDerecho: "Verticalidad",
  },
  {
    key: "individualColectivo",
    etiqueta: "Individual ↔ Colectivo",
    ladoIzquierdo: "Individual",
    ladoDerecho: "Colectivo",
  },
];

export function ejesVacios(): EjesIdeologicos {
  return {
    resultadismoIdealismo: 0,
    ordenLibertad: 0,
    posesionVerticalidad: 0,
    individualColectivo: 0,
  };
}

export function clipEje(n: number): number {
  return Math.max(-100, Math.min(100, Math.round(n)));
}

export function acumularRespuestas(
  dilemas: PreguntaDilema[],
  elecciones: EleccionDilema[]
): EjesIdeologicos {
  const raw = ejesVacios();
  for (let i = 0; i < dilemas.length; i++) {
    const d = dilemas[i];
    const eleccion = elecciones[i];
    if (!d || (eleccion !== "A" && eleccion !== "B")) continue;
    const efectos = eleccion === "A" ? d.opcionA.efectos : d.opcionB.efectos;
    for (const key of Object.keys(raw) as EjeKey[]) {
      raw[key] += efectos[key] ?? 0;
    }
  }
  return raw;
}

/** Máximo teórico absoluto por eje según el banco (para normalizar). */
export function maxAbsPorEje(dilemas: PreguntaDilema[] = DILEMAS): EjesIdeologicos {
  const maxAbs = ejesVacios();
  for (const d of dilemas) {
    for (const key of Object.keys(maxAbs) as EjeKey[]) {
      const a = Math.abs(d.opcionA.efectos[key] ?? 0);
      const b = Math.abs(d.opcionB.efectos[key] ?? 0);
      maxAbs[key] += Math.max(a, b);
    }
  }
  return maxAbs;
}

/**
 * Escala el vector crudo a −100…100 usando el techo teórico del banco.
 * Si el techo es 0, deja 0.
 */
export function normalizarEjes(
  crudo: EjesIdeologicos,
  techos: EjesIdeologicos = maxAbsPorEje()
): EjesIdeologicos {
  const out = ejesVacios();
  for (const key of Object.keys(out) as EjeKey[]) {
    const techo = techos[key] || 1;
    out[key] = clipEje((crudo[key] / techo) * 100);
  }
  return out;
}

export function distanciaEuclidiana(a: EjesIdeologicos, b: EjesIdeologicos): number {
  let sum = 0;
  for (const key of Object.keys(a) as EjeKey[]) {
    const d = a[key] - b[key];
    sum += d * d;
  }
  return Math.sqrt(sum);
}

/** valor −100…100 → % del polo derecho (0–100). */
export function porcentajePoloDerecho(valor: number): number {
  return Math.round(Math.max(0, Math.min(100, (valor + 100) / 2)));
}

export function desglosePorcentajes(ejes: EjesIdeologicos): PorcentajeEje[] {
  return EJES_META.map((meta) => {
    const valor = ejes[meta.key];
    const porcentajeDerecho = porcentajePoloDerecho(valor);
    return {
      eje: meta.key,
      etiqueta: meta.etiqueta,
      ladoIzquierdo: meta.ladoIzquierdo,
      ladoDerecho: meta.ladoDerecho,
      porcentajeDerecho,
      valor,
    };
  });
}

export function rankearArquetipos(
  ejesUsuario: EjesIdeologicos,
  pool: ArquetipoDT[] = ARQUETIPOS_DT
): { arquetipo: ArquetipoDT; distancia: number }[] {
  return pool
    .map((arquetipo) => ({
      arquetipo,
      distancia: distanciaEuclidiana(ejesUsuario, arquetipo.vectorIdeologico),
    }))
    .sort((a, b) => a.distancia - b.distancia);
}

export function calcularResultadoTest(
  elecciones: EleccionDilema[],
  dilemas: PreguntaDilema[] = DILEMAS,
  pool: ArquetipoDT[] = ARQUETIPOS_DT
): ResultadoTest {
  if (elecciones.length !== dilemas.length) {
    throw new Error(
      `Se esperaban ${dilemas.length} respuestas, llegaron ${elecciones.length}`
    );
  }
  const crudo = acumularRespuestas(dilemas, elecciones);
  const ejesUsuario = normalizarEjes(crudo, maxAbsPorEje(dilemas));
  const ranking = rankearArquetipos(ejesUsuario, pool);
  const ganador = ranking[0];
  if (!ganador) throw new Error("Sin arquetipos en el pool");

  return {
    ejesUsuario,
    arquetipoGanador: ganador.arquetipo,
    distanciaAlGanador: ganador.distancia,
    porcentajesPorEje: desglosePorcentajes(ejesUsuario),
    ranking,
  };
}
