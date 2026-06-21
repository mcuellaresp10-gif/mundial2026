export interface ApiResponse<T> {
  get: string;
  parameters: Record<string, string | number>;
  errors: string[] | Record<string, string>;
  results: number;
  paging?: { current: number; total: number };
  response: T;
}

export interface Team {
  id: number;
  name: string;
  code: string | null;
  country: string;
  founded: number | null;
  national: boolean;
  logo: string;
}

export interface TeamInfo extends Team {
  venue?: { name: string; city: string; capacity: number };
}

export interface Venue {
  id: number;
  name: string;
  city: string;
}

export interface FixtureTeams {
  home: { id: number; name: string; logo: string; winner: boolean | null };
  away: { id: number; name: string; logo: string; winner: boolean | null };
}

export interface FixtureGoals {
  home: number | null;
  away: number | null;
}

export interface FixtureScore {
  halftime: FixtureGoals;
  fulltime: FixtureGoals;
  extratime: FixtureGoals;
  penalty: FixtureGoals;
}

export interface FixtureStatus {
  long: string;
  short: string;
  elapsed: number | null;
}

export interface Fixture {
  fixture: {
    id: number;
    referee: string | null;
    timezone: string;
    date: string;
    timestamp: number;
    periods: { first: number | null; second: number | null };
    venue: Venue;
    status: FixtureStatus;
  };
  league: {
    id: number;
    name: string;
    country: string;
    logo: string;
    flag: string | null;
    season: number;
    round: string;
  };
  teams: FixtureTeams;
  goals: FixtureGoals;
  score: FixtureScore;
}

export interface StandingTeam {
  rank: number;
  team: Team;
  points: number;
  goalsDiff: number;
  group: string;
  form: string | null;
  status: string | null;
  description: string | null;
  all: { played: number; win: number; draw: number; lose: number; goals: { for: number; against: number } };
  home: { played: number; win: number; draw: number; lose: number; goals: { for: number; against: number } };
  away: { played: number; win: number; draw: number; lose: number; goals: { for: number; against: number } };
  update: string;
}

export interface StandingsGroup {
  league: {
    id: number;
    name: string;
    country: string;
    logo: string;
    flag: string | null;
    season: number;
    standings: StandingTeam[][];
  };
}

export interface PlayerBirth {
  date: string | null;
  place: string | null;
  country: string | null;
}

export interface PlayerInfo {
  id: number;
  name: string;
  firstname: string;
  lastname: string;
  age: number | null;
  birth: PlayerBirth;
  nationality: string | null;
  height: string | null;
  weight: string | null;
  injured: boolean;
  photo: string;
}

export interface PlayerStatisticsGames {
  appearences: number | null;
  lineups: number | null;
  minutes: number | null;
  number: number | null;
  position: string | null;
  rating: string | null;
  captain: boolean;
}

export interface PlayerStatisticsGoals {
  total: number | null;
  conceded: number | null;
  assists: number | null;
  saves: number | null;
}

export interface PlayerStatisticsCards {
  yellow: number | null;
  yellowred: number | null;
  red: number | null;
}

export interface PlayerStatistics {
  team: Team;
  league: { id: number; name: string; country: string; logo: string; flag: string | null; season: number };
  games: PlayerStatisticsGames;
  substitutes: { in: number | null; out: number | null; bench: number | null };
  shots: { total: number | null; on: number | null };
  goals: PlayerStatisticsGoals;
  passes: { total: number | null; key: number | null; accuracy: number | null };
  tackles: { total: number | null; blocks: number | null; interceptions: number | null };
  duels: { total: number | null; won: number | null };
  dribbles: { attempts: number | null; success: number | null; past: number | null };
  fouls: { drawn: number | null; committed: number | null };
  cards: PlayerStatisticsCards;
  penalty: { won: number | null; commited: number | null; scored: number | null; missed: number | null; saved: number | null };
}

export interface PlayerStatBundle {
  club: PlayerStatistics | null;
  national: PlayerStatistics | null;
  worldCup: PlayerStatistics | null;
}

export interface Player {
  player: PlayerInfo;
  statistics: PlayerStatistics[];
  /** Stats separadas: club, selección y Mundial 2026 */
  statBundle?: PlayerStatBundle;
  nationalTeam?: Team;
}

export interface FixtureEvent {
  time: { elapsed: number; extra: number | null };
  team: { id: number; name: string; logo: string };
  player: { id: number; name: string };
  assist: { id: number | null; name: string | null };
  type: string;
  detail: string;
  comments: string | null;
}

export interface FixtureStatistic {
  team: { id: number; name: string; logo: string };
  statistics: { type: string; value: number | string | null }[];
}

export interface LineupPlayer {
  player: { id: number; name: string; number: number; pos: string; grid: string | null };
}

export interface Lineup {
  team: { id: number; name: string; logo: string; colors: unknown };
  coach: { id: number; name: string; photo: string };
  formation: string;
  startXI: LineupPlayer[];
  substitutes: LineupPlayer[];
}

export interface Coach {
  id: number;
  name: string;
  firstname: string;
  lastname: string;
  age: number | null;
  birth: PlayerBirth;
  nationality: string | null;
  height: string | null;
  weight: string | null;
  photo: string;
  career: { team: Team; start: string; end: string | null }[];
}

export interface RadarStats {
  velocidad: number;
  defensa: number;
  pase: number;
  dribbling: number;
  tiro: number;
  fisico: number;
}

export interface OnceIdealPlayer {
  id: number;
  name: string;
  photo: string;
  team: string;
  teamLogo: string;
  position: string;
  rating: number;
  gridPosition: { x: number; y: number };
}

export type FormationType = "4-3-3" | "4-2-3-1" | "3-5-2";

export interface AnalysisPre {
  contexto: string;
  rival: string;
  clavesTacticas: string[];
  alineacionProbable: string;
  pronostico: string;
  colombiaFocus?: string;
}

export interface AnalysisPost {
  lecturaTactica: string;
  momentosClave: { minuto: number; descripcion: string }[];
  jugadorDestacado: { nombre: string; stats: string; razon: string };
  comparacionPrevia: string;
  impactoGrupo: string;
  proyeccion: string;
}

export interface AnalysisPlayer {
  convocatoria: string;
  rolEsperado: string;
  fortalezas: string[];
  debilidades: string[];
  posibleXI: string;
  comparativaCompetidores: string;
  riesgoOportunidad: string;
  historialMundiales?: string;
}

export interface TopScorerEntry {
  playerId: number;
  name: string;
  photo: string;
  team: string;
  teamLogo: string;
  goals: number;
  assists: number;
  matches: number;
  rating: number;
  /** Minutos jugados en el contexto de la stat. */
  minutes?: number | null;
  goalsPer90?: number | null;
  minsPerGoal?: number | null;
  totalShots?: number | null;
  /** Porcentaje goles / tiros totales. */
  goalConversion?: number | null;
  /** Porcentaje tiros a puerta / tiros totales. */
  shotAccuracy?: number | null;
  /** Pases clave / ocasiones creadas. */
  chancesCreated?: number | null;
  chancesPer90?: number | null;
  totalPasses?: number | null;
  passesComplete?: number | null;
  passesIncomplete?: number | null;
  passAccuracy?: number | null;
}

export interface TopGoalkeeperEntry {
  playerId: number;
  name: string;
  photo: string;
  team: string;
  teamLogo: string;
  matches: number;
  minutes: number;
  rating: number;
  goalsConceded: number;
  concededPer90: number | null;
  saves: number;
  savePercentage: number | null;
  cleanSheets: number;
}

export interface MiXIPlayer {
  id: number;
  name: string;
  photo: string;
  team: string;
  position: string;
  rating: number;
  slot: number;
}

export interface HistoricoMundial {
  year: number;
  host: string;
  champion: string;
  championFlag: string;
  topScorer: { name: string; goals: number; country: string };
  goldenBall: string;
  finalScore: string;
  totalGoals: number;
  totalMatches: number;
  groups: { name: string; teams: { rank: number; team: string; points: number }[] }[];
  memorableMatches: { description: string; score: string }[];
  curiosities: string[];
}

export type PhaseFilter =
  | "Todos"
  | "Grupo A" | "Grupo B" | "Grupo C" | "Grupo D"
  | "Grupo E" | "Grupo F" | "Grupo G" | "Grupo H"
  | "Octavos" | "Cuartos" | "Semis" | "Final";

export interface SearchResult {
  type: "team" | "player" | "fixture";
  id: number;
  label: string;
  subtitle?: string;
  href: string;
}

export interface SquadPlayer {
  id: number;
  name: string;
  age: number | null;
  number: number | null;
  position: string;
  photo: string;
}

export interface TeamSquad {
  team: Team;
  players: SquadPlayer[];
}
