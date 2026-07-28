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
  /** Fuerza convocatoria a ese nivel (el momento lo promete). */
  convocatoria?: NivelSeleccion;
  /** Lesión segura al elegir (no solo probabilidad). */
  forzarLesion?: "leve" | "grave";
  /** Pide salida: no muda ya, pero empuja oferta al cierre del periodo. */
  buscarSalida?: boolean;
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
  /** Etiqueta corta para la UI (Lesión, Contrato, Partido…). */
  etiqueta?: string;
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

/** Totales de una etapa (cantera o profesional). */
export interface StatsEtapaCarrera {
  partidos: number;
  goles: number;
  asistencias: number;
  titulos: string[];
  premiosIndividuales: string[];
}

/** Partido emblemático del periodo (1 highlight, no calendario completo). */
export interface PartidoClave {
  rival: string;
  golesFavor: number;
  golesContra: number;
  /** Local | Visitante */
  condicion: "local" | "visitante";
  /** Nota corta tipo crónica de 1 línea. */
  nota: string;
}

export interface ResultadoTemporada {
  /** Edad al inicio del periodo (primer año). */
  edadInicio: number;
  /** Edad al cierre del periodo (segundo año). */
  edad: number;
  clubId: string;
  ligaId: string;
  partidosJugados: number;
  goles: number;
  asistencias: number;
  titulos: string[];
  /** Premios individuales del periodo (Balón de Oro, Puskas, etc.). */
  premiosIndividuales: string[];
  /** Stats del periodo en cantera / juveniles. */
  cantera: StatsEtapaCarrera;
  /** Stats del periodo como profesional. */
  profesional: StatsEtapaCarrera;
  /** Un partido emblemático del periodo. */
  partidoClave: PartidoClave | null;
  rendimientoPromedio: number;
  eventosResolvidos: DecisionResuelta[];
  /** Relato corto del periodo (decisiones + hechos clave). */
  resumenAnio: string;
  convocatoriaSeleccion: NivelSeleccion | null;
  narrativaSeleccion: string | null;
  ofertaTransferencia: OfertaTransferencia | null;
  aceptoTransferencia: boolean;
  lesion: Lesion | null;
  notas: string[];
  /** Atributos al cierre del periodo. */
  atributos: Atributos;
  /** Delta vs inicio del periodo (antes de decisiones/lesión/rendimiento). */
  deltasAtributos: Partial<Record<keyof Atributos, number>>;
  reputacion: number;
  moral: number;
  deltaReputacion: number;
  deltaMoral: number;
  /** true si en este periodo ascendiste / debutaste en el plantel profesional. */
  debutProfesional: boolean;
}

export interface ComparacionEstilo {
  figura: string;
  razon: string;
  disclaimer: string;
}

/** Mejor media (OVR) alcanzada en la carrera. */
export interface PrimeCarrera {
  media: number;
  /** Edad al cierre del periodo del peak. */
  edad: number;
  edadInicio: number;
  clubId: string;
  clubNombre: string;
  atributos: Atributos;
  reputacion: number;
  moral: number;
}

export interface TituloClubDetalle {
  nombre: string;
  cantidad: number;
}

export interface TitulosPorClub {
  clubId: string;
  clubNombre: string;
  titulos: TituloClubDetalle[];
}

export interface ResumenCarrera {
  partidos: number;
  goles: number;
  asistencias: number;
  titulos: string[];
  premiosIndividuales: string[];
  cantera: StatsEtapaCarrera;
  profesional: StatsEtapaCarrera;
  clubes: string[];
  /** Títulos agrupados por club (orden de aparición en la carrera). */
  titulosPorClub: TitulosPorClub[];
  /** Mejor valoración media de la carrera. */
  prime: PrimeCarrera | null;
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
