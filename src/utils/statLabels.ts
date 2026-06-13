function normalizeKey(value: string): string {
  return value.toLowerCase().trim().replace(/\s+/g, " ");
}

/** Tipos de estadística de partido (API-Football). */
const FIXTURE_STAT_TYPES: Record<string, string> = {
  "shots on goal": "Tiros a puerta",
  "shots off goal": "Tiros fuera",
  "total shots": "Tiros totales",
  "blocked shots": "Tiros bloqueados",
  "shots insidebox": "Tiros dentro del área",
  "shots outsidebox": "Tiros fuera del área",
  "shots inside box": "Tiros dentro del área",
  "shots outside box": "Tiros fuera del área",
  fouls: "Faltas",
  "corner kicks": "Córners",
  corners: "Córners",
  offsides: "Fuera de juego",
  "ball possession": "Posesión de balón",
  "yellow cards": "Tarjetas amarillas",
  "red cards": "Tarjetas rojas",
  "goalkeeper saves": "Paradas del portero",
  "total passes": "Pases totales",
  "passes accurate": "Pases acertados",
  "passes accurate %": "Precisión de pases",
  "passes %": "Precisión de pases",
  "pass accuracy": "Precisión de pases",
  "expected goals": "Goles esperados (xG)",
  expected_goals: "Goles esperados (xG)",
  "goals prevented": "Goles evitados",
  goals_prevented: "Goles evitados",
  "goal attempts": "Ocasiones de gol",
  "free kicks": "Tiros libres",
  "throw ins": "Saques de banda",
  "ball safe": "Balón seguro",
  tackles: "Entradas",
  interceptions: "Intercepciones",
  "duels won": "Duelos ganados",
  "duels total": "Duelos totales",
  "aerials won": "Duelos aéreos ganados",
  "big chances created": "Grandes ocasiones creadas",
  "big chances missed": "Grandes ocasiones falladas",
  "hit woodwork": "Al palo",
  "counter attacks": "Contraataques",
  "counter attack shots": "Tiros en contraataque",
  "goal kicks": "Saques de meta",
  "long balls": "Balones largos",
  "crosses total": "Centros totales",
  "crosses accurate": "Centros acertados",
  "dribbles attempts": "Regates intentados",
  "dribbles success": "Regates exitosos",
  "fouls drawn": "Faltas recibidas",
  "offsides provoked": "Fueras de juego provocados",
  saves: "Paradas",
  "shots blocked": "Tiros bloqueados",
  "dangerous attacks": "Ataques peligrosos",
  attacks: "Ataques",
  "attacks dangerous": "Ataques peligrosos",
};

const EVENT_TYPES: Record<string, string> = {
  goal: "Gol",
  card: "Tarjeta",
  subst: "Cambio",
  var: "VAR",
};

const EVENT_DETAILS: Record<string, string> = {
  "normal goal": "Gol",
  "own goal": "Autogol",
  penalty: "Penalti",
  "missed penalty": "Penalti fallado",
  "yellow card": "Tarjeta amarilla",
  "red card": "Tarjeta roja",
  "second yellow card": "Segunda amarilla",
  substitution: "Cambio",
  "substitution 1": "Cambio",
  "substitution 2": "Cambio",
  "substitution 3": "Cambio",
  "substitution 4": "Cambio",
  "substitution 5": "Cambio",
  "goal cancelled": "Gol anulado",
  "penalty confirmed": "Penalti confirmado",
  "penalty cancelled": "Penalti anulado",
  "goal disallowed": "Gol anulado",
  "card upgrade": "Tarjeta revisada",
  "review": "Revisión VAR",
};

export function translateFixtureStatType(type: string): string {
  if (!type) return type;
  const key = normalizeKey(type);
  return FIXTURE_STAT_TYPES[key] ?? type;
}

export function translateEventType(type: string): string {
  if (!type) return type;
  const key = normalizeKey(type);
  return EVENT_TYPES[key] ?? type;
}

export function translateEventDetail(detail: string): string {
  if (!detail) return detail;
  const key = normalizeKey(detail);
  return EVENT_DETAILS[key] ?? detail;
}

export function eventTypeIcon(type: string): string {
  const key = normalizeKey(type);
  if (key === "goal") return "⚽";
  if (key === "subst") return "🔄";
  if (key === "card") return "🟨";
  if (key === "var") return "📺";
  return "•";
}
