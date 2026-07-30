import type { Atributos, PiernaHabil, Posicion } from "@/data/carrera/types";

export type TipoResultadoTiming = "perfecto" | "bien" | "fallo";

export type TipoAccionSemanal =
  | "entrenar"
  | "socializar_familia"
  | "socializar_pareja"
  | "socializar_agente"
  | "medios"
  | "descansar";

export type TipoMomentoPartido =
  | "definicion"
  | "cabezazo"
  | "gambeta"
  | "atajada"
  | "pase_clave";

export type ResultadoJugada =
  | "gol"
  | "atajado"
  | "desviado"
  | "asistencia"
  | "parada"
  | "fallo";

export type FaseNuevaEstrella =
  | "continuar"
  | "setup"
  | "hub"
  | "entrenar"
  | "medios"
  | "partido"
  | "resultado_partido"
  | "tienda"
  | "transferencia"
  | "retiro";

export type AtributoEntrenable = keyof Pick<
  Atributos,
  "ritmo" | "tiro" | "pase" | "regate" | "defensa" | "fisico"
>;

/** Rol / peso dentro del plantel; sube o baja con el rendimiento. */
export type EstatusClub =
  | "reserva"
  | "titular"
  | "figura"
  | "capitan"
  | "idolo";

export interface EstadoRelaciones {
  familia: number;
  pareja: number;
  agente: number;
}

export interface EstadoJugadorNE {
  apellido: string;
  edad: number;
  posicion: Posicion;
  piernaHabil: PiernaHabil;
  nacionalidad: string;
  atributos: Atributos;
  energiaActual: number;
  energiaMaxima: number;
  dinero: number;
  fama: number;
  moral: number;
  /** 0–100: reserva → titular → figura → capitán → ídolo */
  estatusClub: number;
  relaciones: EstadoRelaciones;
  clubActualId: string;
  ligaActualId: string;
  salarioSemanal: number;
  semanaActual: number;
  temporadaActual: number;
}

export interface ResultadoMinijuego {
  tipo: TipoResultadoTiming;
  timestampToqueMs: number;
  zonaObjetivoCentro: number;
  zonaObjetivoAncho: number;
  posicionIndicador: number;
}

export interface AccionSemanal {
  tipo: TipoAccionSemanal;
  costoEnergia: number;
  atributoEntrenado?: AtributoEntrenable;
  resultadoMinijuego?: ResultadoMinijuego;
  respuestaMediosId?: string;
}

export interface MomentoPartido {
  tipo: TipoMomentoPartido;
  resultadoMinijuego: ResultadoMinijuego;
  resultadoJugada: ResultadoJugada;
}

export interface PartidoSemana {
  semana: number;
  temporada: number;
  rivalId: string;
  rivalNombre: string;
  local: boolean;
  golesFavor: number;
  golesContra: number;
  momentos: MomentoPartido[];
  calificacion: number;
  bonoDinero: number;
  /** Cambio de estatus en el club tras este partido. */
  estatusDelta?: number;
  estatusTras?: number;
}

export interface ItemTienda {
  id: string;
  nombre: string;
  descripcion: string;
  precio: number;
  categoria: "vehiculo" | "vivienda" | "estilo" | "riesgo";
  deltaFama: number;
  deltaMoral: number;
  deltaEnergiaMax?: number;
  unico: boolean;
}

export interface OpcionEntrevista {
  id: string;
  texto: string;
  deltaFama: number;
  deltaMoral: number;
  tono: "diplomatica" | "polemica" | "graciosa";
}

export interface PreguntaEntrevista {
  id: string;
  pregunta: string;
  opciones: OpcionEntrevista[];
}

export interface OfertaTransferencia {
  clubId: string;
  clubNombre: string;
  ligaId: string;
  salarioSemanal: number;
  nivel: "intermedia" | "grande_europa" | "colombia_primera";
}

export interface StatsCarreraNE {
  goles: number;
  asistencias: number;
  partidos: number;
  famaMax: number;
  dineroMax: number;
}

export interface PartidaNuevaEstrella {
  schemaVersion: 1;
  jugador: EstadoJugadorNE;
  historialPartidos: PartidoSemana[];
  accionesSemana: AccionSemanal[];
  semanasDescansoSeguidas: number;
  itemsComprados: string[];
  ofertaPendiente: OfertaTransferencia | null;
  momentoPartidoIndex: number;
  partidoEnCurso: PartidoSemana | null;
  stats: StatsCarreraNE;
  retirado: boolean;
  motivoRetiro: string | null;
}

export interface CrearJugadorNEInput {
  apellido: string;
  posicion: Posicion;
  piernaHabil: PiernaHabil;
  nacionalidad: string;
  clubOrigenId: string;
}

export interface ConfigTiming {
  /** Velocidad del indicador: ciclos por segundo (ida y vuelta = 1 ciclo completo 0→1→0). */
  velocidad: number;
  /** Centro de la zona verde 0–1. */
  zonaCentro: number;
  /** Ancho total zona verde 0–1. */
  zonaVerdeAncho: number;
  /** Ancho total zona amarilla (incluye verde) 0–1. */
  zonaAmarillaAncho: number;
}
