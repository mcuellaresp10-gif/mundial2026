import type { EstatusClub } from "./types";

export const ESTATUS_CLUB_ORDEN: EstatusClub[] = [
  "reserva",
  "titular",
  "figura",
  "capitan",
  "idolo",
];

export const ESTATUS_CLUB_LABEL: Record<EstatusClub, string> = {
  reserva: "Reserva",
  titular: "Titular",
  figura: "Figura",
  capitan: "Capitán",
  idolo: "Ídolo",
};

/** Puntos mínimos para cada estatus (0–100). */
export const ESTATUS_CLUB_UMBRAL: Record<EstatusClub, number> = {
  reserva: 0,
  titular: 20,
  figura: 40,
  capitan: 60,
  idolo: 80,
};

export const ESTATUS_INICIAL = 12;
/** Al cambiar de club, volvés cerca de reserva/titular. */
export const ESTATUS_TRAS_TRANSFERENCIA = 18;

export function estatusDesdePuntos(puntos: number): EstatusClub {
  const p = Math.max(0, Math.min(100, puntos));
  if (p >= ESTATUS_CLUB_UMBRAL.idolo) return "idolo";
  if (p >= ESTATUS_CLUB_UMBRAL.capitan) return "capitan";
  if (p >= ESTATUS_CLUB_UMBRAL.figura) return "figura";
  if (p >= ESTATUS_CLUB_UMBRAL.titular) return "titular";
  return "reserva";
}

export function labelEstatusClub(puntos: number): string {
  return ESTATUS_CLUB_LABEL[estatusDesdePuntos(puntos)];
}

/**
 * Ajusta puntos de estatus según la nota del partido y aportes.
 * Buenas actuaciones suben; malas bajan.
 */
export function deltaEstatusPorPartido(
  calificacion: number,
  goles: number,
  asistencias: number
): number {
  let delta = 0;
  if (calificacion >= 9) delta += 10;
  else if (calificacion >= 8) delta += 7;
  else if (calificacion >= 7) delta += 4;
  else if (calificacion >= 6) delta += 2;
  else if (calificacion >= 5) delta += 0;
  else if (calificacion >= 4) delta -= 4;
  else delta -= 8;

  delta += goles * 2;
  delta += asistencias;
  return delta;
}

export function aplicarDeltaEstatus(puntos: number, delta: number): number {
  return Math.max(0, Math.min(100, Math.round(puntos + delta)));
}
