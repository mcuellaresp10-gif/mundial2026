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
  historySearchQuery?: string;
}

function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

export function extractPlayerQuery(raw: string): string | null {
  const text = raw.trim();
  const patterns = [
    /(?:en\s+qu[eé]|donde|dónde)\s+(?:club|equipo)\s+juega\s+(.+)/i,
    /(?:en\s+qu[eé]|donde|dónde)\s+juega\s+(.+)/i,
    /(?:a\s+qu[eé]|que)\s+club\s+juega\s+(.+)/i,
    /(?:club|equipo)\s+(?:de|del)\s+(?:el\s+jugador\s+)?(.+)/i,
    /(?:info|datos|informaci[oó]n)\s+(?:de|del|sobre)\s+(?:el\s+jugador\s+)?(.+)/i,
    /(?:jugador|futbolista)\s+(.+)/i,
    /(?:qui[eé]n\s+es)\s+(.+)/i,
  ];
  for (const re of patterns) {
    const m = text.match(re);
    if (m?.[1]) {
      const name = m[1].trim().replace(/[?.!]+$/, "").trim();
      if (name.length >= 2) return name;
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

  const wantsLineups =
    /alineacion|formacion|titular|convocator|xi inicial|once inicial|quien juega|quién juega|plantilla/.test(
      text
    );

  const wantsPlayerInfo =
    !!playerFromPattern ||
    /club juega|equipo juega|en que club|en qué club|donde juega|dónde juega|jugador|futbolista/.test(
      text
    );

  const wantsHistory =
    /historia|historico|histórico|mundial de|campeon|campeón|campeones|record|records|récord|record|goleador historico|goleador histórico|balon de oro|balón de oro|bota de oro|maradona|pele|pelé|messi|final del|semifinal|curiosidad|curiosidades|edicion|edición/.test(
      text
    ) || !!historyYear;

  const wantsProbabilities =
    /probabil|favorit|chance|opcion|opción|clasifica|clasific|monte carlo|simul|predic|pronost|percent|porcent/.test(
      text
    );

  const wantsRecords =
    /record|records|récord|maximo|máximo|mas titulos|más títulos|goleador historico|goleador histórico|mayor goleada|todos los tiempos/.test(
      text
    );

  const wantsBestThirds =
    /mejor tercer|mejores tercer|terceros|3er puesto|tercer puesto|8 mejores/.test(text);

  const wantsTeamStats =
    /como va|tabla|puntos|grupo|posicion|posición|ranking/.test(text) ||
    !!extractTeamKey(text);

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
    historySearchQuery: wantsHistory && !historyYear ? raw : undefined,
  };
}

export function isLineupQuestion(raw: string): boolean {
  return analyzeAgentQuestion(raw).wantsLineups;
}

export function isPlayerQuestion(raw: string): boolean {
  const h = analyzeAgentQuestion(raw);
  return h.wantsPlayerInfo && !!h.playerQuery;
}
