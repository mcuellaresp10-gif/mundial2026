/**
 * Generador de carrera por ruleta (juego 5).
 */

import type { Atributos, Posicion } from "@/data/carrera/types";

export type Region =
  | "colombia"
  | "sudamerica"
  | "europa"
  | "norteamerica"
  | "asia";

export interface OpcionRuleta<T = string> {
  id: string;
  label: string;
  valor: T;
  /** Probabilidad relativa; default 1. */
  peso?: number;
  /** Color de segmento (opcional). */
  color?: string;
}

export interface RangoNumerico {
  min: number;
  max: number;
}

export type AtributoRuletaField =
  | "ritmo"
  | "tiro"
  | "pase"
  | "regate"
  | "defensa"
  | "fisico";

export type AtributoRuletaGk =
  | "atajadas"
  | "reflejos"
  | "pase"
  | "fisico"
  | "ritmo"
  | "defensa";

export type AtributoRuleta = AtributoRuletaField | AtributoRuletaGk;

export interface NivelStat {
  valor: number; // 1–10
  nombre: string;
}

export interface HabilidadEspecial {
  id: string;
  nombre: string;
  descripcion: string;
  efecto: { atributo: AtributoRuleta | "liderazgo"; bono: number };
  /** Si true, solo arquero/defensas. */
  soloDefensivo?: boolean;
}

export type TituloNacional = "ninguno" | "campeon" | "bicampeon_o_mas";

export type CopaContinental =
  | "ninguna"
  | "jugo_sin_titulo"
  | "campeon"
  | "finalista"
  | "jugo_sudamericana"
  | "campeon_sudamericana"
  | "jugo_libertadores"
  | "campeon_libertadores"
  | "jugo_europa_league"
  | "campeon_europa_league"
  | "jugo_champions"
  | "campeon_champions"
  | "jugo_concachampions"
  | "campeon_concachampions"
  | "jugo_acl"
  | "campeon_acl";

export interface PasoEquipo {
  region: Region;
  clubId: string;
  equipo: string;
  ligaNombre: string;
  /** Prestigio 1–5 para ponderar títulos. */
  prestigio: number;
  tituloNacional: TituloNacional;
  copaContinental: CopaContinental;
  motivoSalida: string | null;
}

export interface CarreraGenerada {
  apellido: string;
  piernaHabil: "izquierda" | "derecha" | "ambidiestro";
  posicion: Posicion;
  edadDebut: number;
  temporadas: number;
  edadRetiro: number;
  equipoDebut: string;
  clubDebutId: string;
  /** Valores 1–10 por atributo (antes de *10 y bonus). */
  statsBase: Partial<Record<AtributoRuleta, number>>;
  /** Nombres flavor del nivel sacado. */
  statsNombres: Partial<Record<AtributoRuleta, string>>;
  atributosFinales: Atributos;
  habilidadEspecial: HabilidadEspecial | null;
  cantidadEquipos: number;
  equipos: PasoEquipo[];
  golesTotales: number;
  asistenciasTotales: number;
  vallasInvictas: number | null;
  convocadoSeleccion: boolean;
  logroSeleccion: string | null;
  motivoRetiro: string;
}

export type PasoRuleta =
  | { id: string; kind: "posicion"; titulo: string }
  | { id: string; kind: "edadDebut"; titulo: string }
  | { id: string; kind: "equipoDebut"; titulo: string }
  | { id: string; kind: "temporadas"; titulo: string }
  | {
      id: string;
      kind: "stat";
      titulo: string;
      atributo: AtributoRuleta;
      labelAtributo: string;
    }
  | { id: string; kind: "tieneHabilidad"; titulo: string }
  | { id: string; kind: "habilidad"; titulo: string }
  | { id: string; kind: "cantidadEquipos"; titulo: string }
  | { id: string; kind: "region"; titulo: string; teamIndex: number }
  | { id: string; kind: "equipo"; titulo: string; teamIndex: number }
  | { id: string; kind: "motivoSalida"; titulo: string; fromTeamIndex: number }
  | {
      id: string;
      kind: "mejoraEnClub";
      titulo: string;
      teamIndex: number;
    }
  | {
      id: string;
      kind: "mejoraStatCual";
      titulo: string;
      teamIndex: number;
    }
  | {
      id: string;
      kind: "mejoraStatValor";
      titulo: string;
      teamIndex: number;
      atributo: AtributoRuleta;
      labelAtributo: string;
    }
  | { id: string; kind: "tituloNacional"; titulo: string; teamIndex: number }
  | { id: string; kind: "copaContinental"; titulo: string; teamIndex: number }
  | { id: string; kind: "goles"; titulo: string }
  | { id: string; kind: "golesExacto"; titulo: string }
  | { id: string; kind: "asistencias"; titulo: string }
  | { id: string; kind: "asistenciasExacto"; titulo: string }
  | { id: string; kind: "vallas"; titulo: string }
  | { id: string; kind: "vallasExacto"; titulo: string }
  | { id: string; kind: "seleccionConvocado"; titulo: string }
  | { id: string; kind: "seleccionLogro"; titulo: string }
  | { id: string; kind: "retiro"; titulo: string };
