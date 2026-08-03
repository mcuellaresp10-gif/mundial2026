/**
 * Registro de competencias Américas (API-Football).
 * IDs verificables contra https://www.api-football.com/documentation-v3
 */

export type LeagueType = "domestic" | "cup";
/** Solo aplica a type === "cup": continental vs nacional. */
export type CupScope = "continental" | "domestic";
export type SeasonMode = "annual" | "apertura_clausura";
export type LeaguePhase = "all" | "apertura" | "clausura";

export interface AmericasLeague {
  id: number;
  slug: string;
  name: string;
  shortName: string;
  country: string;
  countryCode: string;
  type: LeagueType;
  /** Presente cuando type === "cup". */
  cupScope?: CupScope;
  seasonMode: SeasonMode;
  /** Temporada API por defecto (año de inicio del ciclo). */
  defaultSeason: number;
  /** Patrones de round API para filtrar Apertura/Clausura (case-insensitive). */
  aperturaRoundPatterns?: string[];
  clausuraRoundPatterns?: string[];
}

/** Mundial 2026 — archivo, no parte del hub principal. */
export const WORLD_CUP_LEAGUE: AmericasLeague = {
  id: 1,
  slug: "mundial-2026",
  name: "FIFA World Cup",
  shortName: "Mundial",
  country: "World",
  countryCode: "WC",
  type: "cup",
  seasonMode: "annual",
  defaultSeason: 2026,
};

export const AMERICAS_LEAGUES: AmericasLeague[] = [
  {
    id: 128,
    slug: "liga-profesional-arg",
    name: "Liga Profesional",
    shortName: "Argentina",
    country: "Argentina",
    countryCode: "AR",
    type: "domestic",
    seasonMode: "apertura_clausura",
    defaultSeason: 2026,
    aperturaRoundPatterns: ["apertura", "torneo apertura"],
    clausuraRoundPatterns: ["clausura", "torneo clausura"],
  },
  {
    id: 71,
    slug: "brasileirao",
    name: "Serie A",
    shortName: "Brasil",
    country: "Brazil",
    countryCode: "BR",
    type: "domestic",
    seasonMode: "annual",
    defaultSeason: 2026,
  },
  {
    id: 72,
    slug: "brasileirao-serie-b",
    name: "Serie B",
    shortName: "Brasil B",
    country: "Brazil",
    countryCode: "BR",
    type: "domestic",
    seasonMode: "annual",
    defaultSeason: 2026,
  },
  {
    id: 239,
    slug: "liga-betplay",
    name: "Primera A",
    shortName: "Colombia",
    country: "Colombia",
    countryCode: "CO",
    type: "domestic",
    seasonMode: "apertura_clausura",
    defaultSeason: 2026,
    aperturaRoundPatterns: ["apertura", "torneo apertura"],
    clausuraRoundPatterns: ["clausura", "torneo clausura", "finalización", "finalizacion"],
  },
  {
    id: 265,
    slug: "primera-chile",
    name: "Primera División",
    shortName: "Chile",
    country: "Chile",
    countryCode: "CL",
    type: "domestic",
    seasonMode: "annual",
    defaultSeason: 2026,
  },
  {
    id: 281,
    slug: "liga-1-peru",
    name: "Liga 1",
    shortName: "Perú",
    country: "Peru",
    countryCode: "PE",
    type: "domestic",
    seasonMode: "apertura_clausura",
    defaultSeason: 2026,
    aperturaRoundPatterns: ["apertura"],
    clausuraRoundPatterns: ["clausura"],
  },
  {
    id: 242,
    slug: "liga-pro-ecu",
    name: "Liga Pro",
    shortName: "Ecuador",
    country: "Ecuador",
    countryCode: "EC",
    type: "domestic",
    seasonMode: "apertura_clausura",
    defaultSeason: 2026,
    aperturaRoundPatterns: ["primera etapa", "1st stage", "apertura"],
    clausuraRoundPatterns: ["segunda etapa", "2nd stage", "clausura"],
  },
  {
    id: 268,
    slug: "primera-uruguay",
    name: "Primera División",
    shortName: "Uruguay",
    country: "Uruguay",
    countryCode: "UY",
    type: "domestic",
    seasonMode: "apertura_clausura",
    defaultSeason: 2026,
    aperturaRoundPatterns: ["apertura"],
    clausuraRoundPatterns: ["clausura"],
  },
  {
    id: 250,
    slug: "division-profesional-par",
    name: "División Profesional",
    shortName: "Paraguay",
    country: "Paraguay",
    countryCode: "PY",
    type: "domestic",
    seasonMode: "apertura_clausura",
    defaultSeason: 2026,
    aperturaRoundPatterns: ["apertura"],
    clausuraRoundPatterns: ["clausura"],
  },
  {
    id: 344,
    slug: "division-profesional-bol",
    name: "División Profesional",
    shortName: "Bolivia",
    country: "Bolivia",
    countryCode: "BO",
    type: "domestic",
    seasonMode: "apertura_clausura",
    defaultSeason: 2026,
    aperturaRoundPatterns: ["apertura"],
    clausuraRoundPatterns: ["clausura"],
  },
  {
    id: 299,
    slug: "primera-venezuela",
    name: "Primera División",
    shortName: "Venezuela",
    country: "Venezuela",
    countryCode: "VE",
    type: "domestic",
    seasonMode: "apertura_clausura",
    defaultSeason: 2026,
    aperturaRoundPatterns: ["apertura"],
    clausuraRoundPatterns: ["clausura"],
  },
  {
    id: 262,
    slug: "liga-mx",
    name: "Liga MX",
    shortName: "Liga MX",
    country: "Mexico",
    countryCode: "MX",
    type: "domestic",
    seasonMode: "apertura_clausura",
    defaultSeason: 2026,
    aperturaRoundPatterns: ["apertura"],
    clausuraRoundPatterns: ["clausura"],
  },
  {
    id: 253,
    slug: "mls",
    name: "Major League Soccer",
    shortName: "MLS",
    country: "USA",
    countryCode: "US",
    type: "domestic",
    seasonMode: "annual",
    defaultSeason: 2026,
  },
  {
    id: 13,
    slug: "libertadores",
    name: "Copa Libertadores",
    shortName: "Libertadores",
    country: "World",
    countryCode: "SA",
    type: "cup",
    cupScope: "continental",
    seasonMode: "annual",
    defaultSeason: 2026,
  },
  {
    id: 11,
    slug: "sudamericana",
    name: "Copa Sudamericana",
    shortName: "Sudamericana",
    country: "World",
    countryCode: "SA",
    type: "cup",
    cupScope: "continental",
    seasonMode: "annual",
    defaultSeason: 2026,
  },
  {
    id: 772,
    slug: "leagues-cup",
    name: "Leagues Cup",
    shortName: "Leagues Cup",
    country: "World",
    countryCode: "NA",
    type: "cup",
    cupScope: "continental",
    seasonMode: "annual",
    defaultSeason: 2026,
  },
  // Copas domésticas (IDs verificados API-Football; MX omitida — sin copa nacional activa 2026)
  {
    id: 130,
    slug: "copa-argentina",
    name: "Copa Argentina",
    shortName: "Copa ARG",
    country: "Argentina",
    countryCode: "AR",
    type: "cup",
    cupScope: "domestic",
    seasonMode: "annual",
    defaultSeason: 2026,
  },
  {
    id: 73,
    slug: "copa-do-brasil",
    name: "Copa Do Brasil",
    shortName: "Copa BRA",
    country: "Brazil",
    countryCode: "BR",
    type: "cup",
    cupScope: "domestic",
    seasonMode: "annual",
    defaultSeason: 2026,
  },
  {
    id: 241,
    slug: "copa-colombia",
    name: "Copa Colombia",
    shortName: "Copa COL",
    country: "Colombia",
    countryCode: "CO",
    type: "cup",
    cupScope: "domestic",
    seasonMode: "annual",
    defaultSeason: 2026,
  },
  {
    id: 267,
    slug: "copa-chile",
    name: "Copa Chile",
    shortName: "Copa CHI",
    country: "Chile",
    countryCode: "CL",
    type: "cup",
    cupScope: "domestic",
    seasonMode: "annual",
    defaultSeason: 2026,
  },
  {
    id: 1232,
    slug: "copa-de-la-liga-peru",
    name: "Copa De La Liga",
    shortName: "Copa PER",
    country: "Peru",
    countryCode: "PE",
    type: "cup",
    cupScope: "domestic",
    seasonMode: "annual",
    defaultSeason: 2026,
  },
  {
    id: 917,
    slug: "copa-ecuador",
    name: "Copa Ecuador",
    shortName: "Copa ECU",
    country: "Ecuador",
    countryCode: "EC",
    type: "cup",
    cupScope: "domestic",
    seasonMode: "annual",
    /** Última temporada con cobertura API (2026 aún no publicada). */
    defaultSeason: 2025,
  },
  {
    id: 1212,
    slug: "copa-de-la-liga-auf",
    name: "Copa De La Liga Auf",
    shortName: "Copa URU",
    country: "Uruguay",
    countryCode: "UY",
    type: "cup",
    cupScope: "domestic",
    seasonMode: "annual",
    defaultSeason: 2026,
  },
  {
    id: 501,
    slug: "copa-paraguay",
    name: "Copa Paraguay",
    shortName: "Copa PAR",
    country: "Paraguay",
    countryCode: "PY",
    type: "cup",
    cupScope: "domestic",
    seasonMode: "annual",
    defaultSeason: 2025,
  },
  {
    id: 964,
    slug: "copa-division-profesional-bol",
    name: "Copa de la División Profesional",
    shortName: "Copa BOL",
    country: "Bolivia",
    countryCode: "BO",
    type: "cup",
    cupScope: "domestic",
    seasonMode: "annual",
    defaultSeason: 2025,
  },
  {
    id: 1113,
    slug: "copa-venezuela",
    name: "Copa Venezuela",
    shortName: "Copa VEN",
    country: "Venezuela",
    countryCode: "VE",
    type: "cup",
    cupScope: "domestic",
    seasonMode: "annual",
    defaultSeason: 2026,
  },
  {
    id: 257,
    slug: "us-open-cup",
    name: "US Open Cup",
    shortName: "US Open Cup",
    country: "USA",
    countryCode: "US",
    type: "cup",
    cupScope: "domestic",
    seasonMode: "annual",
    defaultSeason: 2026,
  },
];

/** Liga activa por defecto del hub (Colombia BetPlay). */
export const DEFAULT_AMERICAS_LEAGUE_SLUG = "liga-betplay";

export const ALL_CONFIGURED_LEAGUES: AmericasLeague[] = [
  ...AMERICAS_LEAGUES,
  WORLD_CUP_LEAGUE,
];

export const ALLOWED_LEAGUE_IDS = new Set(ALL_CONFIGURED_LEAGUES.map((l) => l.id));

export const ALLOWED_SEASONS = new Set([2025, 2026]);

export function getLeagueById(id: number): AmericasLeague | undefined {
  return ALL_CONFIGURED_LEAGUES.find((l) => l.id === id);
}

export function getLeagueBySlug(slug: string): AmericasLeague | undefined {
  return ALL_CONFIGURED_LEAGUES.find((l) => l.slug === slug);
}

export function getDefaultAmericasLeague(): AmericasLeague {
  return (
    getLeagueBySlug(DEFAULT_AMERICAS_LEAGUE_SLUG) ??
    AMERICAS_LEAGUES[0]
  );
}

export function isAllowedLeagueId(id: number): boolean {
  return ALLOWED_LEAGUE_IDS.has(id);
}

export function isWorldCupLeague(id: number): boolean {
  return id === WORLD_CUP_LEAGUE.id;
}

export function domesticLeagues(): AmericasLeague[] {
  return AMERICAS_LEAGUES.filter((l) => l.type === "domestic");
}

export function cupLeagues(): AmericasLeague[] {
  return AMERICAS_LEAGUES.filter((l) => l.type === "cup");
}

export function continentalCupLeagues(): AmericasLeague[] {
  return AMERICAS_LEAGUES.filter(
    (l) => l.type === "cup" && l.cupScope === "continental"
  );
}

export function domesticCupLeagues(): AmericasLeague[] {
  return AMERICAS_LEAGUES.filter(
    (l) => l.type === "cup" && l.cupScope === "domestic"
  );
}

function roundMatchesPatterns(round: string, patterns: string[] | undefined): boolean {
  if (!patterns?.length) return false;
  const lower = round.toLowerCase();
  return patterns.some((p) => lower.includes(p.toLowerCase()));
}

/** Filtra fixtures/standings rows por fase Apertura/Clausura. */
export function matchesLeaguePhase(
  round: string | null | undefined,
  league: AmericasLeague,
  phase: LeaguePhase
): boolean {
  if (phase === "all" || league.seasonMode === "annual") return true;
  if (!round) return true;
  if (phase === "apertura") {
    return roundMatchesPatterns(round, league.aperturaRoundPatterns);
  }
  if (phase === "clausura") {
    return roundMatchesPatterns(round, league.clausuraRoundPatterns);
  }
  return true;
}
