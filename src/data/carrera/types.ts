/**
 * Tipos del simulador de carrera (elige tu propia aventura).
 * Contenido pre-escrito; sin LLM ni persistencia en v1.
 */

export type Posicion =
  | "arquero"
  | "defensa_central"
  | "lateral"
  | "mediocampista"
  | "extremo"
  | "delantero";

export type PiernaHabil = "izquierda" | "derecha" | "ambidiestro";

export type NivelLiga = "colombia_primera" | "intermedia" | "grande_europa";

export type TramoCarrera = "cantera" | "consolidacion" | "prime" | "veteran";

export type CategoriaEvento = "generico" | "colombia_especifico";

export type NivelSeleccion = "sub20" | "sub23" | "mayor";

export type MotivoRetiro = "edad" | "lesion_grave" | "mala_racha" | "voluntario";

export interface Atributos {
  ritmo: number;
  tiro: number;
  pase: number;
  regate: number;
  defensa: number;
  fisico: number;
  atajadas?: number;
  reflejos?: number;
}

export interface Lesion {
  temporadaEdad: number;
  descripcion: string;
  grave: boolean;
}

export interface Jugador {
  apellido: string;
  posicion: Posicion;
  piernaHabil: PiernaHabil;
  nacionalidad: string;
  clubOrigenId: string;
  edad: number;
  atributos: Atributos;
  /** -100 a 100 */
  reputacion: number;
  /** -100 a 100 */
  moral: number;
  historialLesiones: Lesion[];
  clubActualId: string;
  ligaActualId: string;
  convocatoriaSeleccion: NivelSeleccion | null;
  /** false mientras está en cantera/juveniles; true tras el ascenso a Primera. */
  esProfesional: boolean;
  /** Edad en la que debutó en el plantel profesional (si aplica). */
  edadDebutProfesional: number | null;
}

export interface Club {
  id: string;
  nombre: string;
  ligaId: string;
  pais: string;
  nivel: NivelLiga;
}

export interface Liga {
  id: string;
  nombre: string;
  pais: string;
  nivel: NivelLiga;
}

export interface EfectosDecision {
  atributos?: Partial<Atributos>;
  reputacion?: number;
  moral?: number;
  /** 0–1 */
  riesgoLesion?: number;
  /** 0–1, solo eventos graves */
  riesgoFinCarrera?: number;
  /**
   * Si la opción implica un cambio de club real.
   * - club_origen: volver al club donde empezaste
   * - colombia_primera / intermedia / grande_europa / mls: pool de ese nivel/liga
   * - colombia_rival: otro BetPlay (no el actual ni el de origen)
   * - ascenso: subís un escalón (BetPlay→intermedia→Europa)
   * - mismo_nivel: otro club del mismo nivel de liga
   * - liga_menos_exigente: bajás un escalón
   */
  transferencia?:
    | "club_origen"
    | "colombia_primera"
    | "colombia_rival"
    | "intermedia"
    | "grande_europa"
    | "mls"
    | "ascenso"
    | "mismo_nivel"
    | "liga_menos_exigente";
}

export interface OpcionEvento {
  texto: string;
  efectos: EfectosDecision;
  /**
   * Relato de lo que pasó tras elegir (afectación +/−).
   * Si falta, el motor genera uno a partir de efectos + textos.
   */
  consecuencia?: string;
}

export interface EventoDecision {
  id: string;
  tramoCarrera: TramoCarrera;
  categoria: CategoriaEvento;
  texto: string;
  opciones: OpcionEvento[];
}

export interface OfertaTransferencia {
  clubId: string;
  ligaId: string;
  clubNombre: string;
  ligaNombre: string;
}

export interface DecisionResuelta {
  eventoId: string;
  opcionIndex: number;
  /** Texto de la situación (snapshot). */
  situacion: string;
  /** Opción elegida (snapshot). */
  decision: string;
  /** Qué pasó después (positivo o negativo). */
  afectacion: string;
}

export interface ResultadoTemporada {
  edad: number;
  clubId: string;
  ligaId: string;
  partidosJugados: number;
  goles: number;
  asistencias: number;
  titulos: string[];
  /** Premios individuales de la temporada (Balón de Oro, Puskas, etc.). */
  premiosIndividuales: string[];
  rendimientoPromedio: number;
  eventosResolvidos: DecisionResuelta[];
  /** Relato corto de la temporada (decisiones + hechos clave). */
  resumenAnio: string;
  convocatoriaSeleccion: NivelSeleccion | null;
  narrativaSeleccion: string | null;
  ofertaTransferencia: OfertaTransferencia | null;
  aceptoTransferencia: boolean;
  lesion: Lesion | null;
  notas: string[];
  /** Atributos al cierre de la temporada. */
  atributos: Atributos;
  /** Delta vs inicio de temporada (antes de decisiones/lesión/rendimiento). */
  deltasAtributos: Partial<Record<keyof Atributos, number>>;
  reputacion: number;
  moral: number;
  deltaReputacion: number;
  deltaMoral: number;
  /** true si en esta temporada ascendiste / debutaste en el plantel profesional. */
  debutProfesional: boolean;
}

export interface ComparacionEstilo {
  figura: string;
  razon: string;
  disclaimer: string;
}

export interface ResumenCarrera {
  partidos: number;
  goles: number;
  asistencias: number;
  titulos: string[];
  premiosIndividuales: string[];
  clubes: string[];
  maxLigaNivel: NivelLiga;
  edadRetiro: number;
  motivoRetiro: MotivoRetiro;
  comparacion: ComparacionEstilo;
}

export interface EstadoCarrera {
  jugador: Jugador;
  historialTemporadas: ResultadoTemporada[];
  eventosVistos: string[];
  /** Racha de temporadas consecutivas con rendimiento alto (para transferencias). */
  rachaAltoRendimiento: number;
  /** Temporadas consecutivas con reputación o moral bajo umbral. */
  rachaBaja: number;
  retirado: boolean;
  motivoRetiro: MotivoRetiro | null;
  /** Oferta pendiente de aceptar/rechazar en la pantalla de resultado. */
  ofertaPendiente: OfertaTransferencia | null;
  /** Eventos de la temporada en curso (antes de resolver). */
  eventosPendientes: EventoDecision[];
  decisionesTemporada: { eventoId: string; opcionIndex: number }[];
  fase:
    | "creacion"
    | "temporada_eventos"
    | "temporada_resultado"
    | "retiro";
}

export interface CrearJugadorInput {
  apellido: string;
  posicion: Posicion;
  piernaHabil: PiernaHabil;
  nacionalidad: string;
  clubOrigenId: string;
}
