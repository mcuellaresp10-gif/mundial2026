import axios from "axios";
import type {
  ApiResponse,
  Coach,
  Fixture,
  FixtureEvent,
  FixtureStatistic,
  Lineup,
  Player,
  StandingsGroup,
  Team,
  TeamSquad,
} from "@/types";
import { cacheKey, getLocalCache, getStaleLocalCache, setLocalCache } from "./cache";
import {
  resolveFixturesFromSnapshotOr,
  resolvePlayerFromSnapshotOr,
  resolvePlayersFromSnapshotOr,
  resolveRadarPoolFromSnapshotOr,
  resolveStandingsFromSnapshotOr,
  resolveTeamsFromSnapshotOr,
} from "./catalogResolver";
import { DEFAULT_SEASON, LEAGUE_ID, PLAYER_STAT_SEASONS } from "@/lib/utils";
import { enrichPlayerWithStatBundle, mapSquadPlayerToPlayer, mergeSquadWithPlayerStats } from "@/utils/squad";
import { pickClubStat } from "@/utils/playerStats";

const client = axios.create({ baseURL: "/api/football" });

async function fetchApi<T>(
  path: string,
  params?: Record<string, string | number | undefined>
): Promise<T> {
  const cleanParams = Object.fromEntries(
    Object.entries(params ?? {}).filter(([, v]) => v !== undefined)
  ) as Record<string, string | number>;

  const key = cacheKey(path, cleanParams);
  const cached = getLocalCache<T>(key);
  if (cached) return cached;

  try {
    const { data } = await client.get<ApiResponse<T>>(path, { params: cleanParams });
    if (data.errors && Object.keys(data.errors).length > 0) {
      const stale = getStaleLocalCache<T>(key);
      if (stale) return stale;
      console.warn(`[API-Football] ${path}`, data.errors);
      if (Array.isArray(data.response)) {
        setLocalCache(key, data.response);
        return data.response as T;
      }
      return [] as T;
    }
    setLocalCache(key, data.response);
    return data.response;
  } catch (error) {
    const stale = getStaleLocalCache<T>(key);
    if (stale) return stale;
    throw error;
  }
}

const LIVE_FIXTURE_CACHE_MS = 30 * 1000;

/** Partidos en curso del Mundial — siempre API (el snapshot puede tener status NS obsoleto). */
async function fetchLiveWorldCupFixtures(): Promise<Fixture[]> {
  const params = { live: "all" };
  const key = cacheKey("fixtures", { ...params, scope: "worldcup-live" });

  const cached = getLocalCache<Fixture[]>(key);
  if (cached) return cached;

  try {
    const { data } = await client.get<ApiResponse<Fixture[]>>("fixtures", { params });
    const list = (data.response ?? []).filter((f) => f.league.id === LEAGUE_ID);
    setLocalCache(key, list, LIVE_FIXTURE_CACHE_MS);
    return list;
  } catch {
    return getStaleLocalCache<Fixture[]>(key) ?? [];
  }
}

async function fetchFixtureFromApiById(id: number): Promise<Fixture | null> {
  const key = cacheKey("fixture-by-id", { id });
  const cached = getLocalCache<Fixture>(key);
  if (cached) return cached;

  try {
    const { data } = await client.get<ApiResponse<Fixture[]>>("fixtures", { params: { id } });
    const fixture = data.response?.[0] ?? null;
    if (fixture) setLocalCache(key, fixture, LIVE_FIXTURE_CACHE_MS);
    return fixture;
  } catch {
    return getStaleLocalCache<Fixture>(key);
  }
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

/** Detalle de un partido — API en vivo primero (evita snapshot/caché NS obsoleto). */
export async function getFixtureById(id: number): Promise<Fixture | null> {
  const live = await fetchLiveWorldCupFixtures();
  const liveMatch = live.find((f) => f.fixture.id === id);
  if (liveMatch) return liveMatch;

  const fromApi = await fetchFixtureFromApiById(id);
  if (fromApi) return fromApi;

  const snapList = await resolveFixturesFromSnapshotOr(() => Promise.resolve([] as Fixture[]));
  const fromSnap = snapList.find((f) => f.fixture.id === id);
  if (!fromSnap) return null;

  return mergeLiveIntoFixtures([fromSnap], live)[0] ?? fromSnap;
}

async function fetchAllWorldCupFixturesFromApi(
  season: number = DEFAULT_SEASON
): Promise<Fixture[]> {
  const key = cacheKey("fixtures-wc-all", { league: LEAGUE_ID, season });
  const cached = getLocalCache<Fixture[]>(key);
  if (cached) return cached;

  try {
    const { data } = await client.get<ApiResponse<Fixture[]>>("fixtures", {
      params: { league: LEAGUE_ID, season },
    });
    const list = data.response ?? [];
    setLocalCache(key, list, LIVE_FIXTURE_CACHE_MS);
    return list;
  } catch {
    return getStaleLocalCache<Fixture[]>(key) ?? [];
  }
}

async function fetchStandingsFromApi(
  season: number = DEFAULT_SEASON
): Promise<StandingsGroup[]> {
  const key = cacheKey("standings-wc-live", { league: LEAGUE_ID, season });
  const cached = getLocalCache<StandingsGroup[]>(key);
  if (cached) return cached;

  try {
    const { data } = await client.get<ApiResponse<StandingsGroup[]>>("standings", {
      params: { league: LEAGUE_ID, season },
    });
    const list = data.response ?? [];
    setLocalCache(key, list, LIVE_FIXTURE_CACHE_MS);
    return list;
  } catch {
    return getStaleLocalCache<StandingsGroup[]>(key) ?? [];
  }
}

async function isWorldCupSessionActive(): Promise<boolean> {
  const live = await fetchLiveWorldCupFixtures();
  return live.length > 0;
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

  return resolveFixturesFromSnapshotOr(async () =>
    fetchApi<Fixture[]>("fixtures", {
      league: LEAGUE_ID,
      season: params.season ?? DEFAULT_SEASON,
      status: params.status,
      team: params.team,
      round: params.round,
      id: params.id,
    })
  ).then(async (list) => {
    const live = await fetchLiveWorldCupFixtures();
    const base =
      live.length > 0
        ? await fetchAllWorldCupFixturesFromApi(params.season ?? DEFAULT_SEASON)
        : list;
    const merged = mergeLiveIntoFixtures(base, live);
    return applyFilters(merged);
  });
}

export async function getNextFixture(): Promise<Fixture | null> {
  const live = await fetchLiveWorldCupFixtures();
  if (live.length > 0) {
    return [...live].sort(
      (a, b) => new Date(a.fixture.date).getTime() - new Date(b.fixture.date).getTime()
    )[0];
  }

  const fixtures = await getFixtures({ status: "NS" });
  const sorted = [...fixtures].sort(
    (a, b) => new Date(a.fixture.date).getTime() - new Date(b.fixture.date).getTime()
  );
  return sorted[0] ?? null;
}

export async function getStandings(season: number = DEFAULT_SEASON): Promise<StandingsGroup[]> {
  if (await isWorldCupSessionActive()) {
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

async function fetchPlayerFullStats(playerId: number): Promise<Player["statistics"]> {
  const rows = await Promise.all(
    PLAYER_STAT_SEASONS_LIST.map((season) => fetchPlayerByIdRaw(playerId, season))
  );
  return rows.flatMap((p) => p?.statistics ?? []);
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
    const [p2025, p2026] = await Promise.all([
      fetchPlayerByIdRaw(id, 2025),
      fetchPlayerByIdRaw(id, 2026),
    ]);

    const base = p2025 ?? p2026;
    if (!base) return null;

    const allStats = [...(p2025?.statistics ?? []), ...(p2026?.statistics ?? [])];

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

export async function getFixtureEvents(fixtureId: number): Promise<FixtureEvent[]> {
  return fetchApi<FixtureEvent[]>("fixtures/events", { fixture: fixtureId });
}

export async function getFixtureStatistics(fixtureId: number): Promise<FixtureStatistic[]> {
  return fetchApi<FixtureStatistic[]>("fixtures/statistics", { fixture: fixtureId });
}

export async function getFixtureLineups(fixtureId: number): Promise<Lineup[]> {
  return fetchApi<Lineup[]>("fixtures/lineups", { fixture: fixtureId });
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
