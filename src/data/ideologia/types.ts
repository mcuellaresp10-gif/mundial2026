/**
 * Tipos del test de ideología futbolística (dilemas → arquetipo de DT).
 * Contenido pre-escrito; sin LLM ni persistencia en v1.
 */

export interface EjesIdeologicos {
  /** -100 Resultadismo … +100 Idealismo */
  resultadismoIdealismo: number;
  /** -100 Orden … +100 Libertad */
  ordenLibertad: number;
  /** -100 Posesión … +100 Verticalidad */
  posesionVerticalidad: number;
  /** -100 Individual … +100 Colectivo */
  individualColectivo: number;
}

export type EjeKey = keyof EjesIdeologicos;

export interface OpcionDilema {
  texto: string;
  efectos: Partial<EjesIdeologicos>;
}

export interface PreguntaDilema {
  id: string;
  texto: string;
  opcionA: OpcionDilema;
  opcionB: OpcionDilema;
}

export type OrigenDT = "internacional" | "colombia";

export interface ArquetipoDT {
  id: string;
  nombre: string;
  apodoOFrase: string;
  /** Etiqueta corta para el callout del mapa (estilo Copero). */
  etiquetaMapa: string;
  origen: OrigenDT;
  vectorIdeologico: EjesIdeologicos;
  descripcion: string;
}

export interface PorcentajeEje {
  eje: EjeKey;
  etiqueta: string;
  ladoIzquierdo: string;
  ladoDerecho: string;
  /** 0–100, peso del polo derecho (valor positivo del eje). */
  porcentajeDerecho: number;
  valor: number;
}

export interface ResultadoTest {
  ejesUsuario: EjesIdeologicos;
  arquetipoGanador: ArquetipoDT;
  distanciaAlGanador: number;
  porcentajesPorEje: PorcentajeEje[];
  ranking: { arquetipo: ArquetipoDT; distancia: number }[];
}

export type EleccionDilema = "A" | "B";
