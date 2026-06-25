/** Detecta qué datos extra hace falta cargar según la pregunta. */
export interface QuestionHints {
  wantsLineups: boolean;
  wantsPlayerInfo: boolean;
  playerQuery?: string;
  teamKey?: string;
  wantsHistory: boolean;
  historyYear?: number;
  wantsProbabilities: boolean;
  wantsRecords: boolean;
  wantsBestThirds: boolean;
  wantsTeamStats: boolean;
  wantsTournamentPlayerStats: boolean;
  wantsHistoricalAnalysis: boolean;
  wantsFullTimeline: boolean;
  wantsTeamHistory: boolean;
  historySearchQuery?: string;
}

function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

/** Pregunta agregada ("jugador con más pases"), no búsqueda por nombre. */
export function isAggregatePlayerStatQuestion(raw: string): boolean {
  const text = normalize(raw);
  return (
    /jugador(es)?\s+(con|de)\s+(mas|más|mayor|mejor|top|maximo|máximo)/.test(text) ||
    /(mas|más|mayor|mejor|top|maximo|máximo|lider|líder)\s+(cantidad|numero|número|total)/.test(text) ||
    /(pases|goles|asistencias|tarjetas)\s+(realizados|completados|exitosos|acertados|del mundial)/.test(text) ||
    /quien\s+(es el|tiene|ha hecho|realizo|realizó)\s+(mas|más|mayor)/.test(text) ||
    /cual\s+es\s+el\s+jugador/.test(text)
  );
}

export function extractPlayerQuery(raw: string): string | null {
  if (isAggregatePlayerStatQuestion(raw)) return null;

  const text = raw.trim();
  const patterns = [
    /(?:en\s+qu[eé]|donde|dónde)\s+(?:club|equipo)\s+juega\s+(.+)/i,
    /(?:en\s+qu[eé]|donde|dónde)\s+juega\s+(.+)/i,
    /(?:a\s+qu[eé]|que)\s+club\s+juega\s+(.+)/i,
    /(?:club|equipo)\s+(?:de|del)\s+(?:el\s+jugador\s+)?(.+)/i,
    /(?:info|datos|informaci[oó]n)\s+(?:de|del|sobre)\s+(?:el\s+jugador\s+)?(.+)/i,
    /(?:qui[eé]n\s+es)\s+(.+)/i,
  ];
  for (const re of patterns) {
    const m = text.match(re);
    if (m?.[1]) {
      const name = m[1].trim().replace(/[?.!]+$/, "").trim();
      if (name.length >= 2 && name.length <= 40) return name;
    }
  }
  return null;
}

function extractHistoryYear(text: string): number | undefined {
  const m = text.match(/\b(19(?:3[0-9]|4[0-9]|5[0-9]|6[0-9]|7[0-9]|8[0-9]|9[0-9])|20(?:0[0-9]|1[0-9]|2[0-2]))\b/);
  return m ? Number(m[0]) : undefined;
}

function extractTeamKey(text: string): string | undefined {
  const teams = [
    "colombia",
    "argentina",
    "brasil",
    "brazil",
    "españa",
    "espana",
    "spain",
    "francia",
    "france",
    "alemania",
    "germany",
    "italia",
    "italy",
    "inglaterra",
    "england",
    "portugal",
    "uruguay",
    "mexico",
    "méxico",
    "usa",
    "estados unidos",
    "canada",
    "canadá",
    "holanda",
    "netherlands",
    "croacia",
    "croatia",
    "belgica",
    "bélgica",
    "japon",
    "japón",
    "japan",
    "corea",
    "korea",
    "ecuador",
    "chile",
    "peru",
    "perú",
  ];
  for (const t of teams) {
    if (text.includes(t)) return t;
  }
  const groupMatch = text.match(/grupo\s+([a-l])/i);
  if (groupMatch) return `grupo ${groupMatch[1].toUpperCase()}`;
  return undefined;
}

export function analyzeAgentQuestion(raw: string, teamKey?: string): QuestionHints {
  const text = normalize(raw);
  const playerFromPattern = extractPlayerQuery(raw);
  const historyYear = extractHistoryYear(text);
  const aggregatePlayerStats = isAggregatePlayerStatQuestion(raw);

  const wantsLineups =
    /alineacion|formacion|titular|convocator|xi inicial|once inicial|quien juega|quién juega|plantilla/.test(
      text
    );

  const wantsPlayerInfo =
    (!!playerFromPattern ||
      /club juega|equipo juega|en que club|en qué club|donde juega|dónde juega/.test(text)) &&
    !aggregatePlayerStats;

  const wantsFullTimeline =
    /todos los mundiales|todas las ediciones|historia completa|cronologia|cronología|linea de tiempo|línea de tiempo|desde 1930|22 ediciones|lista de campeones/.test(
      text
    );

  const wantsHistoricalAnalysis =
    wantsFullTimeline ||
    /compar|context|tradicion|tradición|a lo largo|paralel|como le ha ido|como le fue|leyenda|dinast|dinastía|historicamente|históricamente|en otros mundiales|antes vs|versus|vs\s+\d{4}|evolucion|evolución|palmar[eé]s|trayectoria en mundiales|camino al titulo|camino al título/.test(
      text
    );

  const wantsHistory =
    wantsHistoricalAnalysis ||
    wantsFullTimeline ||
    /historia|historico|historia|mundiales|mundial(es)?\s+(pasado|anterior|de\s+\d|del\s+\d)|campeon|campeón|campeones|record|records|récord|goleador historico|goleador histórico|balon de oro|balón de oro|bota de oro|maradona|pele|pelé|messi|final del|semifinal|curiosidad|curiosidades|edicion|edición|copa del mundo|world cup|cuantos mundiales|cuántos mundiales|todos los mundiales|primer mundial|ultimo mundial|último mundial/.test(
      text
    ) || !!historyYear;

  const wantsTeamHistory =
    !!extractTeamKey(text) &&
    (wantsHistory ||
      wantsHistoricalAnalysis ||
      /historia|titulo|título|campeon|campeón|tradicion|tradición|otras veces|en que mundiales|cuantas veces|cuántas veces/.test(text));

  const wantsProbabilities =
    /probabil|favorit|chance|opcion|opción|clasifica|clasific|monte carlo|simul|predic|pronost|percent|porcent/.test(
      text
    );

  const wantsRecords =
    /record|records|récord|maximo|máximo|mas titulos|más títulos|goleador historico|goleador histórico|mayor goleada|todos los tiempos|mas veces|más veces|quien gano mas|quién ganó más/.test(
      text
    );

  const wantsBestThirds =
    /mejor tercer|mejores tercer|terceros|3er puesto|tercer puesto|8 mejores/.test(text);

  const wantsTeamStats =
    (/como va|tabla|puntos|grupo|posicion|posición|ranking/.test(text) ||
      !!extractTeamKey(text)) &&
    !aggregatePlayerStats;

  const wantsTournamentPlayerStats =
    aggregatePlayerStats ||
    /pases|passes|asistencias|goleador|goleadores|bota de oro|estadistica|estadística|stats|rating|minutos|tarjetas|top goleador|ranking de jugadores/.test(
      text
    );

  return {
    wantsLineups,
    wantsPlayerInfo,
    playerQuery: playerFromPattern ?? undefined,
    teamKey: teamKey ?? extractTeamKey(text),
    wantsHistory,
    historyYear,
    wantsProbabilities,
    wantsRecords,
    wantsBestThirds,
    wantsTeamStats,
    wantsTournamentPlayerStats,
    wantsHistoricalAnalysis,
    wantsFullTimeline,
    wantsTeamHistory,
    historySearchQuery: wantsHistory || wantsHistoricalAnalysis ? raw : undefined,
  };
}

export function isLineupQuestion(raw: string): boolean {
  return analyzeAgentQuestion(raw).wantsLineups;
}

export function isPlayerQuestion(raw: string): boolean {
  const h = analyzeAgentQuestion(raw);
  return h.wantsPlayerInfo && !!h.playerQuery;
}
