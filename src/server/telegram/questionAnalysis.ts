/** Detecta qué datos extra hace falta cargar según la pregunta. */
export interface QuestionHints {
  wantsLineups: boolean;
  wantsPlayerInfo: boolean;
  playerQuery?: string;
  teamKey?: string;
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

export function analyzeQuestion(raw: string, teamKey?: string): QuestionHints {
  const text = normalize(raw);
  const playerFromPattern = extractPlayerQuery(raw);

  const wantsLineups =
    /alineacion|formacion|titular|convocator|xi inicial|once inicial|quien juega|quién juega|plantilla/.test(
      text
    );

  const wantsPlayerInfo =
    !!playerFromPattern ||
    /club juega|equipo juega|en que club|en qué club|donde juega|dónde juega|jugador|futbolista/.test(
      text
    );

  return {
    wantsLineups,
    wantsPlayerInfo,
    playerQuery: playerFromPattern ?? undefined,
    teamKey,
  };
}

export function isLineupQuestion(raw: string): boolean {
  return analyzeQuestion(raw).wantsLineups;
}

export function isPlayerQuestion(raw: string): boolean {
  const h = analyzeQuestion(raw);
  return h.wantsPlayerInfo && !!h.playerQuery;
}
