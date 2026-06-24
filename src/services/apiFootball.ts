import axios from "axios";
import type {
  ApiResponse,
  Coach,
  Fixture,
  FixtureEvent,
  FixturePlayersTeam,
  FixtureStatistic,
  Lineup,
  Player,
  PlayerStatistics,
  StandingsGroup,
  Team,
  TeamSquad,
  TopScorerEntry,
} from "@/types";
import { cacheKey, getLocalCache, getStaleLocalCache, removeLocalCache, setLocalCache } from "./cache";
import { isLiveSessionActive } from "./liveSession";
import {
  resolveFixturesFromSnapshotOr,
  resolvePlayerFromSnapshotOr,
  resolvePlayersFromSnapshotOr,
  resolveRadarPoolFromSnapshotOr,
  resolveStandingsFromSnapshotOr,
  resolveTeamsFromSnapshotOr,
} from "./catalogResolver";
import { DEFAULT_SEASON, LEAGUE_ID, PLAYER_STAT_SEASONS } from "@/lib/utils";
import {
  isFixtureLive,
  isFixtureStarted,
  isPlausibleLiveFixture,
  isWithinKickoffWindow,
  pickFeaturedFixture,
} from "@/lib/liveRefresh";
import { enrichPlayerWithStatBundle, mapSquadPlayerToPlayer, mergeSquadWithPlayerStats } from "@/utils/squad";
import { isWorldCupStatRow, pickClubStat } from "@/utils/playerStats";
import { mapPlayersToTopScorers, mapPlayersToTopAssists, mergeTopAssistLists } from "@/utils/tournamentScorers";
import { isGoalkeeperStat } from "@/utils/tournamentGoalkeepers";
import { mergeLiveIntoFixtures, mergeFixtureLists, isFixtureListIncomplete } from "@/utils/fixtureMerge";
import {
  applyFixtureHistory,
  upsertFixtureHistory,
} from "@/services/fixtureHistory";
import { getSnapshotCatalogFixtures } from "@/services/snapshotStore";

const client = axios.create({ baseURL: "/api/football" });
const LIVE_TOP_SCORERS_CACHE_MS = 30 * 1000;

function liveRequestConfig() {
  return isLiveSessionActive()
    ? { headers: { "X-Mundial-Live": "1" } as Record<string, string> }
    : {};
}

function isFixtureRelatedCacheKey(path: string): boolean {
  return path === "fixtures" || path.startsWith("fixtures/");
}

async function fetchApi<T>(
  path: string,
  params?: Record<string, string | number | undefined>
): Promise<T> {
  const cleanParams = Object.fromEntries(
    Object.entries(params ?? {}).filter(([, v]) => v !== undefined)
  ) as Record<string, string | number>;

  const key = cacheKey(path, cleanParams);
  const bypassCache = isLiveSessionActive() && isFixtureRelatedCacheKey(path);

  if (!bypassCache) {
    const cached = getLocalCache<T>(key);
    if (cached) return cached;
  }

  try {
    const { data } = await client.get<ApiResponse<T>>(path, {
      params: cleanParams,
      ...liveRequestConfig(),
    });
    if (data.errors && Object.keys(data.errors).length > 0) {
      const stale = getStaleLocalCache<T>(key);
      if (stale) return stale;
      console.warn(`[API-Football] ${path}`, data.errors);
      if (Array.isArray(data.response)) {
        if (!bypassCache) setLocalCache(key, data.response);
        return data.response as T;
      }
      return [] as T;
    }
    if (!bypassCache) setLocalCache(key, data.response);
    return data.response;
  } catch (error) {
    const stale = getStaleLocalCache<T>(key);
    if (stale) return stale;
    throw error;
  }
}

const LIVE_FIXTURE_CACHE_MS = 30 * 1000;
const LIVE_SESSION_LIST_CACHE_MS = 30 * 1000;
const EMPTY_LIVE_CACHE_MS = 10 * 1000;

let tournamentStartedFlag: boolean | null = null;

function fixtureNeedsFreshScore(fixture: Fixture): boolean {
  return (
    isPlausibleLiveFixture(fixture) ||
    isFixtureLive(fixture.fixture.status.short) ||
    isWithinKickoffWindow(fixture.fixture.date, fixture.fixture.status.short)
  );
}

/** Partidos en curso del Mundial — siempre API (el snapshot puede tener status NS obsoleto). */
async function fetchLiveWorldCupFixtures(): Promise<Fixture[]> {
  const params = { live: "all" };
  const key = cacheKey("fixtures", { ...params, scope: "worldcup-live" });
  const bypassCache = isLiveSessionActive();

  if (!bypassCache) {
    const cached = getLocalCache<Fixture[]>(key);
    if (cached && cached.length > 0) {
      const filtered = cached.filter((f) => isPlausibleLiveFixture(f));
      if (filtered.length > 0) return filtered;
    }
  }

  try {
    const { data } = await client.get<ApiResponse<Fixture[]>>("fixtures", {
      params,
      ...liveRequestConfig(),
    });
    const list = (data.response ?? [])
      .filter((f) => f.league.id === LEAGUE_ID)
      .filter((f) => isPlausibleLiveFixture(f));
    if (!bypassCache) {
      setLocalCache(key, list, list.length > 0 ? LIVE_FIXTURE_CACHE_MS : EMPTY_LIVE_CACHE_MS);
    }
    return list;
  } catch {
    if (!bypassCache) removeLocalCache(key);
    return [];
  }
}

/** Poll dedicado live=all — exportado para useLiveScoreSync. */
export async function getLiveWorldCupFixtures(): Promise<Fixture[]> {
  return fetchLiveWorldCupFixtures();
}

async function fetchFixtureFromApiById(
  id: number,
  options?: { force?: boolean }
): Promise<Fixture | null> {
  const key = cacheKey("fixture-by-id", { id });
  const bypassCache = isLiveSessionActive();

  if (!options?.force && !bypassCache) {
    const cached = getLocalCache<Fixture>(key);
    if (cached) {
      const staleNsInWindow =
        cached.fixture.status.short === "NS" &&
        isWithinKickoffWindow(cached.fixture.date, cached.fixture.status.short);
      if (isFixtureLive(cached.fixture.status.short) && !isPlausibleLiveFixture(cached)) {
        removeLocalCache(key);
      } else if (!staleNsInWindow) {
        return cached;
      }
    }
  } else if (options?.force) {
    removeLocalCache(key);
  }

  try {
    const { data } = await client.get<ApiResponse<Fixture[]>>("fixtures", {
      params: { id },
      ...liveRequestConfig(),
    });
    const fixture = data.response?.[0] ?? null;
    if (fixture && !isLiveSessionActive()) {
      setLocalCache(key, fixture, LIVE_FIXTURE_CACHE_MS);
    }
    return fixture;
  } catch {
    removeLocalCache(key);
    return null;
  }
}

export { mergeLiveIntoFixtures } from "@/utils/fixtureMerge";

/** Detalle de un partido — API fresca primero (status FT/live real). */
export async function getFixtureById(id: number): Promise<Fixture | null> {
  const fromApi = await fetchFixtureFromApiById(id);
  if (fromApi) return fromApi;

  const live = await fetchLiveWorldCupFixtures();
  const liveMatch = live.find((f) => f.fixture.id === id);
  if (liveMatch) return liveMatch;

  const snapList = await resolveFixturesFromSnapshotOr(() => Promise.resolve([] as Fixture[]));
  return snapList.find((f) => f.fixture.id === id) ?? null;
}

async function fetchFixturesPaginated(
  season: number = DEFAULT_SEASON,
  extraParams: Record<string, string | number> = {}
): Promise<Fixture[]> {
  let page = 1;
  let totalPages = 1;
  const all: Fixture[] = [];

  while (page <= totalPages) {
    const { data } = await client.get<ApiResponse<Fixture[]>>("fixtures", {
      params: { league: LEAGUE_ID, season, page, ...extraParams },
      ...liveRequestConfig(),
    });

    if (data.errors && Object.keys(data.errors).length > 0) {
      if (all.length > 0) break;
      throw new Error(`[API-Football] fixtures page ${page}`);
    }

    all.push(...(data.response ?? []));
    totalPages = data.paging?.total ?? 1;
    page++;
  }

  return all;
}

async function fetchFinishedFixturesPaginated(
  season: number = DEFAULT_SEASON,
  forceRefresh = false
): Promise<Fixture[]> {
  const key = cacheKey("fixtures-wc-ft", { league: LEAGUE_ID, season });
  const bypassCache = forceRefresh || isLiveSessionActive() || tournamentStartedFlag === true;
  if (!bypassCache) {
    const cached = getLocalCache<Fixture[]>(key);
    if (cached?.length) return cached;
  }

  try {
    // status=FT no admite paginación en API-Football (page → error y response vacío).
    const { data } = await client.get<ApiResponse<Fixture[]>>("fixtures", {
      params: { league: LEAGUE_ID, season, status: "FT" },
      ...liveRequestConfig(),
    });
    if (data.errors && Object.keys(data.errors).length > 0 && !(data.response?.length)) {
      throw new Error("[API-Football] fixtures status=FT");
    }
    const list = data.response ?? [];
    if (!bypassCache && list.length > 0) {
      setLocalCache(key, list, LIVE_FIXTURE_CACHE_MS);
    }
    return list;
  } catch {
    return getStaleLocalCache<Fixture[]>(key) ?? [];
  }
}

async function fetchAllWorldCupFixturesFromApi(
  season: number = DEFAULT_SEASON,
  forceRefresh = false
): Promise<Fixture[]> {
  const key = cacheKey("fixtures-wc-all", { league: LEAGUE_ID, season });
  const bypassCache = forceRefresh || isLiveSessionActive() || tournamentStartedFlag === true;
  const cached = bypassCache ? null : getLocalCache<Fixture[]>(key);
  const kickoffSoon = cached?.some((f) => fixtureNeedsFreshScore(f)) ?? false;
  if (cached && !kickoffSoon) return cached;

  const fallbackWithHistory = async (): Promise<Fixture[]> => {
    const stale = getStaleLocalCache<Fixture[]>(key) ?? cached ?? [];
    return applyFixtureHistory(stale);
  };

  try {
    const list = await fetchFixturesPaginated(season);
    if (list.length === 0) return fallbackWithHistory();

    const ttl = bypassCache
      ? LIVE_SESSION_LIST_CACHE_MS
      : kickoffSoon
        ? EMPTY_LIVE_CACHE_MS
        : LIVE_FIXTURE_CACHE_MS;
    if (!bypassCache) setLocalCache(key, list, ttl);
    return list;
  } catch {
    return fallbackWithHistory();
  }
}

/** Fallback: partidos en ventana kickoff que no aparecieron en live=all ni en la lista. */
async function refreshMissingKickoffFixtures(
  fixtures: Fixture[],
  liveIds: Set<number>
): Promise<Fixture[]> {
  const missing = fixtures.filter(
    (f) =>
      fixtureNeedsFreshScore(f) &&
      !liveIds.has(f.fixture.id) &&
      (f.fixture.status.short === "NS" || isFixtureLive(f.fixture.status.short))
  );
  if (missing.length === 0) return fixtures;

  const toRefresh = missing.slice(0, 2);
  const byId = new Map(fixtures.map((f) => [f.fixture.id, f]));
  await Promise.all(
    toRefresh.map(async (f) => {
      const fresh = await fetchFixtureFromApiById(f.fixture.id, { force: true });
      if (fresh) byId.set(f.fixture.id, fresh);
    })
  );
  return fixtures.map((f) => byId.get(f.fixture.id) ?? f);
}

async function fetchStandingsFromApi(
  season: number = DEFAULT_SEASON
): Promise<StandingsGroup[]> {
  const key = cacheKey("standings-wc-live", { league: LEAGUE_ID, season });
  const bypassCache = isLiveSessionActive();
  if (!bypassCache) {
    const cached = getLocalCache<StandingsGroup[]>(key);
    if (cached) return cached;
  }

  try {
    const { data } = await client.get<ApiResponse<StandingsGroup[]>>("standings", {
      params: { league: LEAGUE_ID, season },
      ...liveRequestConfig(),
    });
    const list = data.response ?? [];
    if (!bypassCache) setLocalCache(key, list, LIVE_FIXTURE_CACHE_MS);
    return list;
  } catch {
    return getStaleLocalCache<StandingsGroup[]>(key) ?? [];
  }
}

async function isWorldCupSessionActive(): Promise<boolean> {
  if (isLiveSessionActive() || tournamentStartedFlag) return true;

  const live = await fetchLiveWorldCupFixtures();
  if (live.length > 0) {
    tournamentStartedFlag = true;
    return true;
  }

  const all = await fetchAllWorldCupFixturesFromApi();
  const started = all.some((f) => isFixtureStarted(f.fixture.status.short));
  if (started) tournamentStartedFlag = true;
  return started;
}

let loadWorldCupFixturesInFlight: Promise<Fixture[]> | null = null;

async function loadWorldCupFixturesImpl(season = DEFAULT_SEASON): Promise<Fixture[]> {
  const live = await fetchLiveWorldCupFixtures();
  const liveIds = new Set(live.map((f) => f.fixture.id));
  const sessionActive = await isWorldCupSessionActive();
  const inLiveMode = sessionActive || isLiveSessionActive();

  const catalog = await getSnapshotCatalogFixtures();
  let list: Fixture[] = catalog.length > 0 ? [...catalog] : [];

  if (inLiveMode) {
    const fromApi = await fetchAllWorldCupFixturesFromApi(season, sessionActive);
    list = mergeFixtureLists(list, fromApi);
  } else {
    const snap = await resolveFixturesFromSnapshotOr(() =>
      fetchApi<Fixture[]>("fixtures", { league: LEAGUE_ID, season })
    );
    list = list.length > 0 ? mergeFixtureLists(list, snap) : snap;
  }

  // Siempre traer FT: el snapshot/catálogo trae NS y sin esto J1 desaparece en la 1ª carga.
  let finished = await fetchFinishedFixturesPaginated(season, sessionActive);
  list = mergeFixtureLists(list, finished);
  if (finished.length > 0) await upsertFixtureHistory(finished);

  list = mergeLiveIntoFixtures(list, live);
  list = await refreshMissingKickoffFixtures(list, liveIds);
  list = await applyFixtureHistory(list);
  await upsertFixtureHistory(list);

  if (isFixtureListIncomplete(list)) {
    finished = await fetchFinishedFixturesPaginated(season, true);
    if (finished.length > 0) {
      list = mergeFixtureLists(list, finished);
      await upsertFixtureHistory(finished);
      list = await applyFixtureHistory(list);
    }
    if (isFixtureListIncomplete(list)) {
      console.warn(`[fixtures] Lista incompleta tras ensamblaje: ${list.length} partidos`);
    }
  }

  if (
    live.length > 0 ||
    list.some((f) => isFixtureStarted(f.fixture.status.short))
  ) {
    tournamentStartedFlag = true;
  }

  return list;
}

async function loadWorldCupFixtures(season = DEFAULT_SEASON): Promise<Fixture[]> {
  if (loadWorldCupFixturesInFlight) return loadWorldCupFixturesInFlight;

  loadWorldCupFixturesInFlight = loadWorldCupFixturesImpl(season).finally(() => {
    loadWorldCupFixturesInFlight = null;
  });
  return loadWorldCupFixturesInFlight;
}

export async function getTeams(season: number = DEFAULT_SEASON): Promise<Team[]> {
  return resolveTeamsFromSnapshotOr(async () => {
    const data = await fetchApi<{ team: Team }[]>("teams", { league: LEAGUE_ID, season });
    return data.map((t) => t.team);
  });
}

export async function getFixtures(params: {
  season?: number;
  status?: string;
  team?: number;
  round?: string;
  id?: number;
} = {}): Promise<Fixture[]> {
  if (params.id) {
    const fixture = await getFixtureById(params.id);
    return fixture ? [fixture] : [];
  }

  const applyFilters = (list: Fixture[]) => {
    let out = list;
    if (params.team) {
      out = out.filter(
        (f) => f.teams.home.id === params.team || f.teams.away.id === params.team
      );
    }
    if (params.status) {
      out = out.filter((f) => f.fixture.status.short === params.status);
    }
    if (params.id) {
      out = out.filter((f) => f.fixture.id === params.id);
    }
    if (params.round) {
      out = out.filter((f) => f.league.round === params.round);
    }
    return out;
  };

  return loadWorldCupFixtures(params.season ?? DEFAULT_SEASON).then((list) =>
    applyFilters(list)
  );
}

export async function getNextFixture(): Promise<Fixture | null> {
  const all = await getFixtures({});
  return pickFeaturedFixture(all);
}

export async function getStandings(season: number = DEFAULT_SEASON): Promise<StandingsGroup[]> {
  if (isLiveSessionActive() || (await isWorldCupSessionActive())) {
    return fetchStandingsFromApi(season);
  }
  return resolveStandingsFromSnapshotOr(async () =>
    fetchApi<StandingsGroup[]>("standings", { league: LEAGUE_ID, season })
  );
}

export async function getTeamSquad(teamId: number): Promise<TeamSquad | null> {
  const data = await fetchApi<TeamSquad[]>("players/squads", { team: teamId });
  return data[0] ?? null;
}

export interface SquadPlayersOptions {
  /** true = stats club + selección por jugador (más lento). false = solo selección vía team (rápido). */
  fullStats?: boolean;
  /** Modo benchmark radar: más concurrencia, menos delay entre jugadores. */
  benchmarkFast?: boolean;
}

/** Convocatoria + stats club/selección/mundial (temporadas 2025 y 2026). */
export async function getTeamSquadPlayers(
  teamId: number,
  options: SquadPlayersOptions = {}
): Promise<Player[]> {
  return resolvePlayersFromSnapshotOr([teamId], async () => {
    const { fullStats = true } = options;
    const squad = await getTeamSquad(teamId);
    if (!squad?.players.length) {
      return fetchPlayersByTeam(teamId, DEFAULT_SEASON);
    }

    if (!fullStats) {
      return getTeamSquadPlayersFromTeamFetch(squad);
    }

    const enriched = await mapAsyncWithConcurrency(
      squad.players,
      options.benchmarkFast ? 5 : 2,
      async (sp) => {
        try {
          const fullStatsRows = await fetchPlayerFullStats(sp.id);
          const enrichedPlayer: Player | null = fullStatsRows.length
            ? {
                player: {
                  id: sp.id,
                  name: sp.name,
                  firstname: sp.name,
                  lastname: "",
                  age: sp.age,
                  birth: { date: null, place: null, country: null },
                  nationality: squad.team.country,
                  height: null,
                  weight: null,
                  injured: false,
                  photo: sp.photo,
                },
                statistics: fullStatsRows,
              }
            : null;
          return mapSquadPlayerToPlayer(sp, squad.team, enrichedPlayer);
        } catch {
          return mapSquadPlayerToPlayer(sp, squad.team, null);
        }
      },
      options.benchmarkFast ? 25 : 120
    );

    return enriched;
  });
}

async function getTeamSquadPlayersFromTeamFetch(squad: TeamSquad): Promise<Player[]> {
  const [stats2025, stats2026] = await Promise.all([
    fetchPlayersByTeam(squad.team.id, 2025),
    fetchPlayersByTeam(squad.team.id, 2026),
  ]);

  const mergedById = new Map<number, Player>();
  for (const p of [...stats2025, ...stats2026]) {
    const existing = mergedById.get(p.player.id);
    if (existing) {
      existing.statistics = [...existing.statistics, ...p.statistics];
    } else {
      mergedById.set(p.player.id, { ...p, statistics: [...p.statistics] });
    }
  }

  return mergeSquadWithPlayerStats(squad.players, squad.team, [...mergedById.values()]);
}

const PLAYER_STAT_SEASONS_LIST = [...PLAYER_STAT_SEASONS];

async function fetchPlayerByIdRaw(id: number, season: number): Promise<Player | null> {
  try {
    const data = await fetchApi<Player[]>("players", { id, season });
    return data[0] ?? null;
  } catch {
    return null;
  }
}

/** Stats del Mundial — requiere league=1 además de id+season. */
async function fetchWorldCupPlayerStatsById(playerId: number): Promise<Player["statistics"]> {
  try {
    const data = await fetchApi<Player[]>("players", {
      id: playerId,
      season: DEFAULT_SEASON,
      league: LEAGUE_ID,
    });
    return data[0]?.statistics ?? [];
  } catch {
    return [];
  }
}

function dedupePlayerStatistics(stats: PlayerStatistics[]): PlayerStatistics[] {
  const seen = new Set<string>();
  const out: PlayerStatistics[] = [];
  for (const s of stats) {
    const key = `${s.league.id}:${s.league.season}:${s.team.id}:${s.games.appearences ?? 0}:${s.games.minutes ?? 0}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(s);
  }
  return out;
}

async function fetchPlayerFullStats(playerId: number): Promise<Player["statistics"]> {
  const [seasonRows, wcRows] = await Promise.all([
    Promise.all(PLAYER_STAT_SEASONS_LIST.map((season) => fetchPlayerByIdRaw(playerId, season))),
    fetchWorldCupPlayerStatsById(playerId),
  ]);
  const fromSeasons = seasonRows.flatMap((p) => p?.statistics ?? []);
  return dedupePlayerStatistics([...fromSeasons, ...wcRows]);
}

async function mapAsyncWithConcurrency<T, R>(
  items: T[],
  limit: number,
  fn: (item: T) => Promise<R>,
  delayMs = 120
): Promise<R[]> {
  const results: R[] = new Array(items.length);
  let index = 0;

  async function worker() {
    while (index < items.length) {
      const i = index++;
      results[i] = await fn(items[i]);
      if (delayMs > 0) await delay(delayMs);
    }
  }

  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, () => worker()));
  return results;
}

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function getPlayerProfile(
  id: number,
  nationalTeamId?: number
): Promise<Player | null> {
  return resolvePlayerFromSnapshotOr(id, async () => {
    const [p2025, p2026, wcStats] = await Promise.all([
      fetchPlayerByIdRaw(id, 2025),
      fetchPlayerByIdRaw(id, 2026),
      fetchWorldCupPlayerStatsById(id),
    ]);

    const base = p2025 ?? p2026;
    if (!base) return null;

    const allStats = dedupePlayerStatistics([
      ...(p2025?.statistics ?? []),
      ...(p2026?.statistics ?? []),
      ...wcStats,
    ]);

    let nationalTeam: Team | undefined;
    if (nationalTeamId) {
      const teams = await getTeams();
      nationalTeam = teams.find((t) => t.id === nationalTeamId);
    }
    if (!nationalTeam) {
      const intlStat = allStats.find(
        (s) =>
          s.league.country === "World" ||
          s.league.id === LEAGUE_ID ||
          s.league.name.toLowerCase().includes("friend")
      );
      if (intlStat) {
        nationalTeam = {
          id: intlStat.team.id,
          name: intlStat.team.name,
          logo: intlStat.team.logo,
          code: null,
          country: base.player.nationality ?? intlStat.team.name,
          founded: null,
          national: true,
        };
      }
    }
    if (!nationalTeam) {
      const club = pickClubStat(allStats, -1);
      const anyNational = allStats.find((s) => s.team.id !== club?.team.id);
      if (anyNational) {
        nationalTeam = {
          id: anyNational.team.id,
          name: anyNational.team.name,
          logo: anyNational.team.logo,
          code: null,
          country: base.player.nationality ?? "",
          founded: null,
          national: true,
        };
      }
    }
    if (!nationalTeam) return base;

    return enrichPlayerWithStatBundle(
      { ...base, player: base.player, statistics: allStats },
      nationalTeam
    );
  });
}

async function fetchPlayersByTeam(teamId: number, season: number): Promise<Player[]> {
  const all: Player[] = [];
  let page = 1;
  let total = 1;
  while (page <= total) {
    const response = await client.get<ApiResponse<Player[]>>("players", {
      params: { team: teamId, season, page },
    });
    if (response.data.errors && Object.keys(response.data.errors).length > 0) {
      break;
    }
    all.push(...(response.data.response ?? []));
    total = response.data.paging?.total ?? 1;
    page++;
  }
  return all;
}

export async function getAllSquadsForTeams(
  teamIds: number[],
  options: SquadPlayersOptions = {}
): Promise<Player[]> {
  return getAllSquadsForTeamsParallel(teamIds, options, 1);
}

export async function getAllSquadsForTeamsParallel(
  teamIds: number[],
  options: SquadPlayersOptions = {},
  concurrency = 6
): Promise<Player[]> {
  return resolvePlayersFromSnapshotOr(teamIds, async () => {
    const all: Player[] = [];
    let index = 0;

    async function worker() {
      while (index < teamIds.length) {
        const i = index++;
        const players = await getTeamSquadPlayers(teamIds[i], options);
        all.push(...players);
      }
    }

    await Promise.all(
      Array.from({ length: Math.min(concurrency, teamIds.length) }, () => worker())
    );
    return all;
  });
}

export async function getRadarBenchmarkPool(teamIds: number[]): Promise<Player[]> {
  return resolveRadarPoolFromSnapshotOr(() =>
    getAllSquadsForTeamsParallel(teamIds, {
      fullStats: true,
      benchmarkFast: true,
    })
  );
}

export async function getPlayers(params: {
  team?: number;
  season?: number;
  page?: number;
  search?: string;
  id?: number;
}): Promise<{ players: Player[]; paging: { current: number; total: number } }> {
  const response = await client.get<ApiResponse<Player[]>>("players", {
    params: {
      league: LEAGUE_ID,
      season: params.season ?? DEFAULT_SEASON,
      team: params.team,
      page: params.page ?? 1,
      search: params.search,
      id: params.id,
    },
  });
  const key = cacheKey("players", params as Record<string, unknown>);
  setLocalCache(key, response.data.response);
  return {
    players: response.data.response,
    paging: response.data.paging ?? { current: 1, total: 1 },
  };
}

export async function getPlayerById(
  id: number,
  nationalTeamId?: number
): Promise<Player | null> {
  return getPlayerProfile(id, nationalTeamId);
}

export async function getH2H(teamA: number, teamB: number): Promise<Fixture[]> {
  return fetchApi<Fixture[]>("fixtures/headtohead", { h2h: `${teamA}-${teamB}` });
}

function shouldBypassPlayerStatsCache(): boolean {
  return isLiveSessionActive();
}

export async function getWorldCupTopScorers(
  season: number = DEFAULT_SEASON
): Promise<TopScorerEntry[]> {
  const params = { league: LEAGUE_ID, season };
  const key = cacheKey("players/topscorers", params);
  if (!shouldBypassPlayerStatsCache()) {
    const cached = getLocalCache<TopScorerEntry[]>(key);
    if (cached) return cached;
  }

  try {
    const { data } = await client.get<ApiResponse<Player[]>>("players/topscorers", {
      params,
      ...liveRequestConfig(),
    });
    const list = mapPlayersToTopScorers(data.response ?? []);
    if (!shouldBypassPlayerStatsCache()) {
      setLocalCache(key, list, LIVE_TOP_SCORERS_CACHE_MS);
    }
    return list;
  } catch {
    return getStaleLocalCache<TopScorerEntry[]>(key) ?? [];
  }
}

const WORLD_CUP_ASSIST_PLAYER_PAGES = 8;
const WORLD_CUP_PLAYER_POOL_PAGES = 6;
const WORLD_CUP_GK_TEAM_CONCURRENCY = 6;

function mergePlayerPoolRows(into: Map<number, Player>, rows: Player[]): void {
  for (const p of rows) {
    const existing = into.get(p.player.id);
    if (!existing) {
      into.set(p.player.id, p);
      continue;
    }
    const existingStats = existing.statistics?.length ?? 0;
    const nextStats = p.statistics?.length ?? 0;
    if (nextStats >= existingStats) into.set(p.player.id, p);
  }
}

function enrichWorldCupPoolPlayer(player: Player): Player {
  const wcTeam = player.statistics.find((s) => isWorldCupStatRow(s))?.team;
  if (!wcTeam) return player;
  return enrichPlayerWithStatBundle({ ...player, nationalTeam: wcTeam }, wcTeam);
}

/** Pool de jugadores con stats del Mundial para enriquecer filas derivadas de eventos. */
export async function getWorldCupPlayerStatsPool(
  season: number = DEFAULT_SEASON
): Promise<Player[]> {
  const key = cacheKey("worldCupPlayerStatsPool", { season });
  if (!shouldBypassPlayerStatsCache()) {
    const cached = getLocalCache<Player[]>(key);
    if (cached) return cached;
  }

  try {
    const byId = new Map<number, Player>();

    const { data: topscorerPayload } = await client.get<ApiResponse<Player[]>>(
      "players/topscorers",
      { params: { league: LEAGUE_ID, season }, ...liveRequestConfig() }
    );
    mergePlayerPoolRows(byId, topscorerPayload.response ?? []);

    for (let page = 1; page <= WORLD_CUP_PLAYER_POOL_PAGES; page++) {
      const { players, paging } = await getPlayers({ season, page });
      mergePlayerPoolRows(byId, players);
      if (page >= paging.total || players.length === 0) break;
    }

    const pool = [...byId.values()].map(enrichWorldCupPoolPlayer);
    if (!shouldBypassPlayerStatsCache()) {
      setLocalCache(key, pool, LIVE_TOP_SCORERS_CACHE_MS);
    }
    return pool;
  } catch {
    return getStaleLocalCache<Player[]>(key) ?? [];
  }
}

/** Porteros del Mundial — una consulta por selección (los GK no salen en topscorers). */
export async function getWorldCupGoalkeepersForTeams(
  teamIds: number[],
  season: number = DEFAULT_SEASON
): Promise<Player[]> {
  const uniqueIds = [...new Set(teamIds)].filter((id) => id > 0).sort((a, b) => a - b);
  if (uniqueIds.length === 0) return [];

  const key = cacheKey("worldCupGoalkeeperPool", {
    season,
    teams: uniqueIds.join(","),
  });
  if (!shouldBypassPlayerStatsCache()) {
    const cached = getLocalCache<Player[]>(key);
    if (cached) return cached;
  }

  try {
    const byId = new Map<number, Player>();
    let index = 0;

    async function fetchTeamGoalkeepers(teamId: number) {
      let page = 1;
      let total = 1;
      while (page <= total) {
        const { players, paging } = await getPlayers({ season, team: teamId, page });
        for (const p of players) {
          const wcStat =
            p.statistics.find(
              (s) => s.league.id === LEAGUE_ID && s.team.id === teamId
            ) ?? p.statistics.find((s) => s.league.id === LEAGUE_ID);
          if (!wcStat || !isGoalkeeperStat(wcStat)) continue;
          if ((wcStat.games.minutes ?? 0) < 1) continue;
          mergePlayerPoolRows(byId, [{ ...p, statistics: [wcStat] }]);
        }
        total = paging.total;
        page++;
        if (players.length === 0) break;
      }
    }

    async function worker() {
      while (index < uniqueIds.length) {
        const teamId = uniqueIds[index++];
        await fetchTeamGoalkeepers(teamId);
      }
    }

    await Promise.all(
      Array.from(
        { length: Math.min(WORLD_CUP_GK_TEAM_CONCURRENCY, uniqueIds.length) },
        () => worker()
      )
    );

    const pool = [...byId.values()];
    if (!shouldBypassPlayerStatsCache()) {
      setLocalCache(key, pool, LIVE_TOP_SCORERS_CACHE_MS);
    }
    return pool;
  } catch {
    return getStaleLocalCache<Player[]>(key) ?? [];
  }
}

/** Asistidores del Mundial — incluye jugadores sin goles vía paginación de players. */
export async function getWorldCupAssistLeaders(
  season: number = DEFAULT_SEASON
): Promise<TopScorerEntry[]> {
  const key = cacheKey("worldCupAssistLeaders", { season });
  if (!shouldBypassPlayerStatsCache()) {
    const cached = getLocalCache<TopScorerEntry[]>(key);
    if (cached) return cached;
  }

  try {
    const lists: TopScorerEntry[][] = [];

    const { data: topscorerPayload } = await client.get<ApiResponse<Player[]>>(
      "players/topscorers",
      { params: { league: LEAGUE_ID, season }, ...liveRequestConfig() }
    );
    lists.push(mapPlayersToTopAssists(topscorerPayload.response ?? []));

    for (let page = 1; page <= WORLD_CUP_ASSIST_PLAYER_PAGES; page++) {
      const { players, paging } = await getPlayers({ season, page });
      lists.push(mapPlayersToTopAssists(players));
      if (page >= paging.total || players.length === 0) break;
    }

    const merged = mergeTopAssistLists(...lists);
    if (!shouldBypassPlayerStatsCache()) {
      setLocalCache(key, merged, LIVE_TOP_SCORERS_CACHE_MS);
    }
    return merged;
  } catch {
    return getStaleLocalCache<TopScorerEntry[]>(key) ?? [];
  }
}

export async function getFixtureEvents(fixtureId: number): Promise<FixtureEvent[]> {
  return fetchApi<FixtureEvent[]>("fixtures/events", { fixture: fixtureId });
}

export async function getFixtureStatistics(fixtureId: number): Promise<FixtureStatistic[]> {
  return fetchApi<FixtureStatistic[]>("fixtures/statistics", { fixture: fixtureId });
}

export async function getFixtureLineups(fixtureId: number): Promise<Lineup[]> {
  return fetchApi<Lineup[]>("fixtures/lineups", { fixture: fixtureId });
}

export async function getFixturePlayers(fixtureId: number): Promise<FixturePlayersTeam[]> {
  return fetchApi<FixturePlayersTeam[]>("fixtures/players", { fixture: fixtureId });
}

export async function getCoaches(teamId: number): Promise<Coach[]> {
  return fetchApi<Coach[]>("coachs", { team: teamId });
}

export async function getAllPlayersForTeams(
  teamIds: number[],
  _season: number = DEFAULT_SEASON
): Promise<Player[]> {
  return getAllSquadsForTeams(teamIds);
}

export async function getColombiaTeamId(): Promise<number | null> {
  const teams = await getTeams();
  const col = teams.find((t) => t.name.toLowerCase().includes("colombia"));
  return col?.id ?? null;
}
