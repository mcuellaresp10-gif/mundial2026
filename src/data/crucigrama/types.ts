/**
 * Tipos del crucigrama didáctico (fútbol COL / Sudamérica / Mundiales).
 * Sin backend ni persistencia en v1.
 */

export type CategoriaCrucigrama = "colombia" | "sudamerica" | "mundiales";

export type DireccionPalabra = "across" | "down";

export interface PalabraPista {
  id: string;
  /** Mayúsculas, sin tildes, sin espacios; Ñ permitida. */
  palabra: string;
  longitud: number;
  pista: string;
  categoria: CategoriaCrucigrama;
}

export interface CeldaGrilla {
  fila: number;
  columna: number;
  /** null = celda no usada (bloqueada). */
  letra: string | null;
  perteneceA: { across?: string; down?: string };
  /** Número visible si inicia una palabra. */
  numero?: number;
}

export interface PalabraUbicada {
  id: string;
  palabraPistaId: string;
  direccion: DireccionPalabra;
  filaInicio: number;
  columnaInicio: number;
  numero: number;
  palabra: string;
  pista: string;
}

export interface CrucigramaGenerado {
  tamano: { filas: number; columnas: number };
  celdas: CeldaGrilla[][];
  palabrasUbicadas: PalabraUbicada[];
  bancoUsado: PalabraPista[];
}

export interface EstadoJuegoCrucigrama {
  crucigrama: CrucigramaGenerado;
  respuestasUsuario: Record<string, string>;
  celdaSeleccionada: { fila: number; columna: number } | null;
  direccionActiva: DireccionPalabra;
  tiempoSegundos: number;
  errores: number;
  completado: boolean;
}

export function claveCelda(fila: number, columna: number): string {
  return `${fila}-${columna}`;
}
