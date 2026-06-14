import type { ApiResponse, Fixture, Lineup, Player, StandingsGroup } from "@/types";
import { DEFAULT_SEASON, LEAGUE_ID, PLAYER_STAT_SEASONS } from "@/lib/utils";
import { isFixtureLive, isPlausibleLiveFixture } from "@/lib/liveRefresh";

const TTL_LIVE_MS = 40 * 1000;
const TTL_LEAGUE_FIXTURES_MS = 3 * 60 * 1000;
const TTL_STANDINGS_MS = 5 * 60 * 1000;
const TTL_FIXTURE_BY_ID_MS = 60 * 1000;
const TTL_PLAYERS_MS = 5 * 60 * 1000;

const cache = new Map<string, { data: unknown; timestamp: number }>();

function cacheKey(path: string, params: Record<string, string | number>): string {
  const qs = new URLSearchParams(
    Object.entries(params).map(([k, v]) => [k, String(v)])
  ).toString();
  return `${path}?${qs}`;
}

function getCached<T>(key: string, ttlMs: number): T | null {
  const entry = cache.get(key);
  if (!entry) return null;
  if (Date.now() - entry.timestamp > ttlMs) return null;
  return entry.data as T;
}

function setCached(key: string, data: unknown): void {
  cache.set(key, { data, timestamp: Date.now() });
}

function mergeLiveIntoFixtures(fixtures: Fixture[], live: Fixture[]): Fixture[] {
  if (live.length === 0) return fixtures;
  const liveById = new Map(live.map((f) => [f.fixture.id, f]));
  const merged = fixtures.map((f) => liveById.get(f.fixture.id) ?? f);
  for (const lf of live) {
    if (!merged.some((f) => f.fixture.id === lf.fixture.id)) merged.push(lf);
  }
  return merged;
}

function getApiBaseUrl(): string {
  const fallback = "https://v3.football.api-sports.io";
  const raw = process.env.API_FOOTBALL_BASE_URL?.trim();
  if (!raw || raw === "API_FOOTBALL_BASE_URL" || !raw.startsWith("http")) {
    return fallback;
  }
  try {
    return new URL(raw).origin + new URL(raw).pathname.replace(/\/$/, "");
  } catch {
    return fallback;
  }
}

function getApiKey(): string {
  const key = process.env.API_FOOTBALL_KEY?.trim();
  if (!key || key === "your_api_football_key_here" || key === "API_FOOTBALL_KEY") {
    throw new Error("API_FOOTBALL_KEY not configured");
  }
  return key;
}

async function apiGet<T>(path: string, params: Record<string, string | number> = {}): Promise<T> {
  const qs = new URLSearchParams(
    Object.entries(params).map(([k, v]) => [k, String(v)])
  ).toString();
  const url = `${getApiBaseUrl()}/${path}${qs ? `?${qs}` : ""}`;
  const res = await fetch(url, {
    headers: { "x-apisports-key": getApiKey() },
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`API-Football ${path} → ${res.status}`);
  const json = (await res.json()) as ApiResponse<T>;
  if (json.errors && Object.keys(json.errors).length > 0) {
    console.warn(`[footballClient] ${path}`, json.errors);
  }
  return json.response ?? ([] as T);
}

async function apiGetCached<T>(
  path: string,
  params: Record<string, string | number>,
  ttlMs: number
): Promise<T> {
  const key = cacheKey(path, params);
  const cached = getCached<T>(key, ttlMs);
  if (cached !== null) return cached;
  const data = await apiGet<T>(path, params);
  setCached(key, data);
  return data;
}

/** Partidos en vivo del Mundial (filtrados). */
export async function getLiveFixtures(): Promise<Fixture[]> {
  const all = await apiGetCached<Fixture[]>("fixtures", { live: "all" }, TTL_LIVE_MS);
  return all
    .filter((f) => f.league.id === LEAGUE_ID)
    .filter((f) => isPlausibleLiveFixture(f) || isFixtureLive(f.fixture.status.short));
}

/** Lista completa de fixtures del Mundial (caché larga + merge con live). */
export async function getWorldCupFixtures(season = DEFAULT_SEASON): Promise<Fixture[]> {
  const live = await getLiveFixtures();
  const list = await apiGetCached<Fixture[]>(
    "fixtures",
    { league: LEAGUE_ID, season },
    TTL_LEAGUE_FIXTURES_MS
  );
  return mergeLiveIntoFixtures(list, live);
}

/** Fixtures para alertas: prioriza live=all; lista completa desde caché. */
export async function getFixturesForNotifications(season = DEFAULT_SEASON): Promise<Fixture[]> {
  return getWorldCupFixtures(season);
}

/** Standings del Mundial. */
export async function getStandings(season = DEFAULT_SEASON): Promise<StandingsGroup[]> {
  return apiGetCached<StandingsGroup[]>(
    "standings",
    { league: LEAGUE_ID, season },
    TTL_STANDINGS_MS
  );
}

/** Detalle de un partido por id. */
export async function getFixtureById(id: number): Promise<Fixture | null> {
  const list = await apiGetCached<Fixture[]>("fixtures", { id }, TTL_FIXTURE_BY_ID_MS);
  return list[0] ?? null;
}

/** Alineaciones de un partido. */
export async function getFixtureLineups(fixtureId: number): Promise<Lineup[]> {
  return apiGetCached<Lineup[]>(
    "fixtures/lineups",
    { fixture: fixtureId },
    TTL_FIXTURE_BY_ID_MS
  );
}

/** Busca jugadores por nombre (temporada actual del Mundial). */
export async function searchPlayers(query: string): Promise<Player[]> {
  const trimmed = query.trim();
  if (trimmed.length < 2) return [];
  const withLeague = await apiGetCached<Player[]>(
    "players",
    { search: trimmed, league: LEAGUE_ID, season: DEFAULT_SEASON },
    TTL_PLAYERS_MS
  );
  if (withLeague.length > 0) return withLeague;
  return apiGetCached<Player[]>(
    "players",
    { search: trimmed, season: DEFAULT_SEASON },
    TTL_PLAYERS_MS
  );
}

/** Perfil completo de jugador por id. */
export async function getPlayerDetail(id: number): Promise<Player | null> {
  for (const season of PLAYER_STAT_SEASONS) {
    const list = await apiGetCached<Player[]>("players", { id, season }, TTL_PLAYERS_MS);
    if (list[0]) return list[0];
  }
  return null;
}
