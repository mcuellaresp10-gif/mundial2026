import { LEAGUE_ID, PLAYER_STAT_SEASONS } from "@/lib/utils";

const ALLOWED_PATHS = new Set([
  "fixtures",
  "fixtures/events",
  "fixtures/statistics",
  "fixtures/lineups",
  "fixtures/players",
  "fixtures/headtohead",
  "standings",
  "teams",
  "players",
  "players/squads",
  "players/topscorers",
  "coachs",
]);

const ALLOWED_SEASONS = new Set(PLAYER_STAT_SEASONS.map(String));
const MAX_PAGE = 20;
const MAX_SEARCH_LENGTH = 48;
const ALLOWED_FIXTURE_STATUSES = new Set([
  "NS",
  "FT",
  "LIVE",
  "1H",
  "2H",
  "HT",
  "ET",
  "BT",
  "P",
  "INT",
  "AET",
  "PEN",
  "CANC",
  "ABD",
  "PST",
]);

export interface FootballAllowlistResult {
  ok: true;
  path: string;
  search: string;
}

export interface FootballAllowlistError {
  ok: false;
  status: number;
  message: string;
}

function positiveInt(value: string): number | null {
  const n = Number(value);
  if (!Number.isInteger(n) || n <= 0 || n > 9_999_999) return null;
  return n;
}

function reject(status: number, message: string): FootballAllowlistError {
  return { ok: false, status, message };
}

/** Valida ruta y query params antes de proxy a API-Football. */
export function validateFootballProxyRequest(
  pathSegments: string[],
  searchParams: URLSearchParams
): FootballAllowlistResult | FootballAllowlistError {
  const path = pathSegments.join("/");

  if (!ALLOWED_PATHS.has(path)) {
    return reject(403, "Ruta no permitida");
  }

  const entries = [...searchParams.entries()];
  if (entries.length === 0 && path !== "fixtures") {
    return reject(400, "Parámetros requeridos");
  }

  for (const [key, rawValue] of entries) {
    const value = rawValue.trim();
    if (!value) return reject(400, `Parámetro vacío: ${key}`);

    switch (key) {
      case "league":
        if (value !== String(LEAGUE_ID)) return reject(403, "Liga no permitida");
        break;
      case "season":
        if (!ALLOWED_SEASONS.has(value)) return reject(403, "Temporada no permitida");
        break;
      case "page": {
        const page = positiveInt(value);
        if (page == null || page > MAX_PAGE) return reject(403, "Página no permitida");
        break;
      }
      case "live":
        if (value !== "all") return reject(403, "Parámetro live no permitido");
        break;
      case "id":
      case "fixture":
      case "team": {
        if (positiveInt(value) == null) return reject(400, `Valor inválido: ${key}`);
        break;
      }
      case "h2h":
        if (!/^\d{1,7}-\d{1,7}$/.test(value)) return reject(400, "Formato h2h inválido");
        break;
      case "status":
        if (!ALLOWED_FIXTURE_STATUSES.has(value)) return reject(403, "Status no permitido");
        break;
      case "search":
        if (value.length > MAX_SEARCH_LENGTH) return reject(403, "Búsqueda demasiado larga");
        break;
      case "round":
        if (value.length > 80) return reject(403, "Ronda no permitida");
        break;
      default:
        return reject(403, `Parámetro no permitido: ${key}`);
    }
  }

  if (path === "fixtures") {
    const hasLeague = searchParams.has("league");
    const hasSeason = searchParams.has("season");
    const hasId = searchParams.has("id");
    const hasLive = searchParams.has("live");
    const hasTeam = searchParams.has("team");

    if (hasLeague !== hasSeason && !hasId && !hasLive) {
      return reject(400, "fixtures requiere league+season, id o live");
    }
    if (hasLive && entries.length !== 1) {
      return reject(403, "live=all debe ir solo");
    }
  }

  if (
    path === "fixtures/events" ||
    path === "fixtures/statistics" ||
    path === "fixtures/lineups" ||
    path === "fixtures/players"
  ) {
    if (!searchParams.has("fixture") || entries.length !== 1) {
      return reject(400, "fixture requerido");
    }
  }

  if (path === "fixtures/headtohead") {
    if (!searchParams.has("h2h") || entries.length !== 1) {
      return reject(400, "h2h requerido");
    }
  }

  if (path === "standings" || path === "teams" || path === "players/topscorers") {
    const league = searchParams.get("league");
    const season = searchParams.get("season");
    if (league !== String(LEAGUE_ID) || !season || !ALLOWED_SEASONS.has(season)) {
      return reject(403, "Solo Mundial 2025/2026");
    }
  }

  if (path === "players/squads" || path === "coachs") {
    if (!searchParams.has("team") || entries.length !== 1) {
      return reject(400, "team requerido");
    }
  }

  if (path === "players") {
    const hasId = searchParams.has("id");
    const hasTeam = searchParams.has("team");
    const hasSearch = searchParams.has("search");
    const hasLeagueList = searchParams.has("league") && searchParams.has("season");

    if (!hasId && !hasTeam && !hasSearch && !hasLeagueList) {
      return reject(400, "players requiere id, team, search o league+season");
    }

    if (hasLeagueList) {
      const league = searchParams.get("league");
      const season = searchParams.get("season");
      if (league !== String(LEAGUE_ID) || !season || !ALLOWED_SEASONS.has(season)) {
        return reject(403, "Solo jugadores del Mundial");
      }
    }

    if (hasId || hasTeam || hasSearch) {
      const season = searchParams.get("season");
      if (season && !ALLOWED_SEASONS.has(season)) {
        return reject(403, "Temporada no permitida");
      }
    }
  }

  const search = searchParams.toString();
  return { ok: true, path, search };
}
