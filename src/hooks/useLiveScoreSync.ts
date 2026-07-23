"use client";

import { useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  getFixtures,
  getLiveFixtures,
  mergeLiveIntoFixtures,
} from "@/services/apiFootball";
import { isLiveSessionActive, syncLiveSession, clearPlayerStatsLocalCache } from "@/services/liveSession";
import {
  getLivePollInterval,
  isPlausibleLiveFixture,
  LIVE_REFRESH_MS,
  shouldPollFixtures,
} from "@/lib/liveRefresh";
import { isFixtureListIncomplete, mergeFixtureLists } from "@/utils/fixtureMerge";
import { useUIStore } from "@/stores/useUIStore";
import { WORLD_CUP_LEAGUE_ID } from "@/lib/utils";
import { ALLOWED_LEAGUE_IDS } from "@/data/americasLeagues";
import type { Fixture } from "@/types";

const FULL_LIST_REFRESH_MS = 5 * 60 * 1000;
const LIVE_SESSION_FULL_LIST_REFRESH_MS = 90 * 1000;
const LIST_INCOMPLETE_POLL_MS = 5 * 60 * 1000;

type FixtureQueryParams = {
  league?: number;
  season?: number;
  id?: number;
  team?: number;
  status?: string;
};

function getFixtureQueryParams(key: readonly unknown[]): FixtureQueryParams | null {
  if (key[0] !== "fixtures") return null;
  const p = key[1];
  if (p == null) return {};
  if (typeof p !== "object") return null;
  return p as FixtureQueryParams;
}

function isFixtureListQuery(params: FixtureQueryParams): boolean {
  return params.id == null && params.team == null && params.status == null;
}

/** Agrega partidos de todas las queries de lista en caché (para decidir si hay live). */
function collectCachedListFixtures(qc: ReturnType<typeof useQueryClient>): Fixture[] {
  const byId = new Map<number, Fixture>();
  for (const [key, data] of qc.getQueriesData<Fixture[]>({ queryKey: ["fixtures"] })) {
    const params = getFixtureQueryParams(key as readonly unknown[]);
    if (!params || !isFixtureListQuery(params) || !Array.isArray(data)) continue;
    for (const f of data) byId.set(f.fixture.id, f);
  }
  return [...byId.values()];
}

function collectLeaguesFromCache(
  qc: ReturnType<typeof useQueryClient>
): Map<number, number> {
  const leagues = new Map<number, number>();
  for (const [key, data] of qc.getQueriesData<Fixture[]>({ queryKey: ["fixtures"] })) {
    const params = getFixtureQueryParams(key as readonly unknown[]);
    if (!params || !isFixtureListQuery(params)) continue;
    const leagueId = params.league ?? data?.[0]?.league?.id;
    const season = params.season ?? data?.[0]?.league?.season;
    if (leagueId != null && season != null) {
      leagues.set(leagueId, season);
    }
  }
  return leagues;
}

/** Actualiza solo queries de la misma liga (nunca cuela Mundial en Américas). */
function setLeagueFixtureQueries(
  qc: ReturnType<typeof useQueryClient>,
  leagueId: number,
  season: number,
  fixtures: Fixture[]
): void {
  for (const [key, data] of qc.getQueriesData<Fixture[]>({ queryKey: ["fixtures"] })) {
    const params = getFixtureQueryParams(key as readonly unknown[]);
    if (!params || !isFixtureListQuery(params)) continue;

    if (params.league != null && params.league !== leagueId) continue;
    if (params.season != null && params.season !== season) continue;

    if (params.league == null) {
      // Queries legacy sin league: solo Mundial.
      if (leagueId !== WORLD_CUP_LEAGUE_ID) continue;
    }

    if (!Array.isArray(data) || data.length === 0) {
      if (params.league === leagueId) {
        qc.setQueryData(key, fixtures);
      }
      continue;
    }

    const dataLeague = data[0]?.league?.id;
    if (dataLeague != null && dataLeague !== leagueId) continue;

    qc.setQueryData(key, mergeFixtureLists(data, fixtures));
  }
}

function mergeLiveIntoFixtureQueries(
  qc: ReturnType<typeof useQueryClient>,
  live: Fixture[]
): void {
  if (live.length === 0) return;

  const liveById = new Map(live.map((f) => [f.fixture.id, f]));

  for (const [key, data] of qc.getQueriesData<Fixture[]>({ queryKey: ["fixtures"] })) {
    const params = getFixtureQueryParams(key as readonly unknown[]);
    if (!params || !isFixtureListQuery(params)) continue;
    if (!Array.isArray(data)) continue;

    if (data.length === 0) {
      // No rellenar queries vacías con live de otra liga.
      if (params.league == null) continue;
      const leagueLive = live.filter((f) => f.league.id === params.league);
      if (leagueLive.length > 0) qc.setQueryData(key, leagueLive);
      continue;
    }

    qc.setQueryData(key, mergeLiveIntoFixtures(data, live));
  }

  for (const lf of live) {
    qc.setQueryData(["fixtures", { id: lf.fixture.id }], [lf]);
    qc.setQueryData(["fixtures", { id: lf.fixture.id, season: undefined }], [lf]);
  }

  const nextFixture = qc.getQueryData<Fixture | null>(["nextFixture"]);
  if (nextFixture && liveById.has(nextFixture.fixture.id)) {
    qc.setQueryData(["nextFixture"], liveById.get(nextFixture.fixture.id)!);
  }
}

async function refreshCachedLeagueLists(
  qc: ReturnType<typeof useQueryClient>,
  onlyLeagueIds?: Set<number>
): Promise<void> {
  const leagues = collectLeaguesFromCache(qc);
  for (const [leagueId, season] of leagues) {
    if (onlyLeagueIds && !onlyLeagueIds.has(leagueId)) continue;
    const full = await getFixtures({ league: leagueId, season });
    if (full.length > 0) {
      setLeagueFixtureQueries(qc, leagueId, season, full);
    }
  }
}

function getNextPollDelay(fixtures: Fixture[], listIncomplete: boolean, aggressive: boolean): number {
  if (listIncomplete && !aggressive) return LIST_INCOMPLETE_POLL_MS;
  if (aggressive) return getLivePollInterval(true);
  return LIVE_REFRESH_MS.livePollIdle;
}

/** Poll live=all y fusiona marcadores en la caché de React Query (por liga). */
export function useLiveScoreSync() {
  const qc = useQueryClient();
  const setLastRefresh = useUIStore((s) => s.setLastRefresh);
  const lastFullRefreshRef = useRef(0);
  const prevLiveIdsRef = useRef<Set<number>>(new Set());

  useEffect(() => {
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | null = null;

    const scheduleNext = (fixtures: Fixture[], listIncomplete: boolean, aggressive: boolean) => {
      if (cancelled) return;
      timer = setTimeout(tick, getNextPollDelay(fixtures, listIncomplete, aggressive));
    };

    const tick = async () => {
      const fixtures = collectCachedListFixtures(qc);
      const wcFixtures = fixtures.filter((f) => f.league.id === WORLD_CUP_LEAGUE_ID);
      const listIncomplete = isFixtureListIncomplete(wcFixtures);
      const aggressive = shouldPollFixtures(fixtures.length ? fixtures : undefined);

      syncLiveSession({
        fixtures,
        liveWorldCupCount: fixtures.filter((f) => isPlausibleLiveFixture(f)).length,
      });

      const shouldPollApi = listIncomplete || aggressive;

      if (shouldPollApi && !cancelled) {
        try {
          const now = Date.now();
          const liveSession = isLiveSessionActive();
          const fullListInterval = aggressive
            ? liveSession
              ? LIVE_SESSION_FULL_LIST_REFRESH_MS
              : FULL_LIST_REFRESH_MS
            : LIST_INCOMPLETE_POLL_MS;
          const needsFullRefresh =
            listIncomplete || (aggressive && now - lastFullRefreshRef.current >= fullListInterval);

          if (needsFullRefresh) {
            await refreshCachedLeagueLists(
              qc,
              listIncomplete && !aggressive
                ? new Set([WORLD_CUP_LEAGUE_ID])
                : undefined
            );
            if (!cancelled) lastFullRefreshRef.current = now;
          }

          if (aggressive) {
            const live = await getLiveFixtures([...ALLOWED_LEAGUE_IDS]);
            if (cancelled) return;

            const liveIds = new Set(live.map((f) => f.fixture.id));
            const droppedFromLive = [...prevLiveIdsRef.current].filter((id) => !liveIds.has(id));
            prevLiveIdsRef.current = liveIds;

            if (droppedFromLive.length > 0) {
              clearPlayerStatsLocalCache();
              qc.invalidateQueries({ queryKey: ["worldCupPlayerStatsPool"] });
              qc.invalidateQueries({ queryKey: ["worldCupTopScorers"] });
              qc.invalidateQueries({ queryKey: ["worldCupTopAssists"] });

              const droppedLeagues = new Set<number>();
              for (const id of droppedFromLive) {
                const cached = qc.getQueryData<Fixture[]>(["fixtures", { id }]);
                const leagueId = cached?.[0]?.league?.id;
                if (leagueId != null) droppedLeagues.add(leagueId);
              }
              // Si no sabemos la liga, refrescar todas las listas en caché.
              await refreshCachedLeagueLists(
                qc,
                droppedLeagues.size > 0 ? droppedLeagues : undefined
              );
              if (!cancelled) lastFullRefreshRef.current = Date.now();
            }

            const currentBase = collectCachedListFixtures(qc);

            syncLiveSession({
              fixtures: currentBase,
              liveWorldCupCount: live.filter((f) => f.league.id === WORLD_CUP_LEAGUE_ID).length,
            });

            mergeLiveIntoFixtureQueries(qc, live);
            setLastRefresh(Date.now());
          }
        } catch {
          /* ignore transient errors */
        }
      }

      const latestFixtures = collectCachedListFixtures(qc);
      const latestWc = latestFixtures.filter((f) => f.league.id === WORLD_CUP_LEAGUE_ID);
      const latestIncomplete = isFixtureListIncomplete(latestWc);
      const latestAggressive = shouldPollFixtures(
        latestFixtures.length ? latestFixtures : undefined
      );
      scheduleNext(latestFixtures, latestIncomplete, latestAggressive);
    };

    tick();
    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
    };
  }, [qc, setLastRefresh]);
}
