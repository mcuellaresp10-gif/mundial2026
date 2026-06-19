"use client";

import { useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  getFixtures,
  getLiveWorldCupFixtures,
  mergeLiveIntoFixtures,
} from "@/services/apiFootball";
import { isLiveSessionActive, syncLiveSession } from "@/services/liveSession";
import {
  getLiveRefreshInterval,
  isPlausibleLiveFixture,
  shouldPollFixtures,
} from "@/lib/liveRefresh";
import { isFixtureListIncomplete, mergeFixtureLists } from "@/utils/fixtureMerge";
import { useUIStore } from "@/stores/useUIStore";
import type { Fixture } from "@/types";

const FULL_LIST_REFRESH_MS = 5 * 60 * 1000;
const LIVE_SESSION_FULL_LIST_REFRESH_MS = 90 * 1000;

function getBaseFixturesFromCache(qc: ReturnType<typeof useQueryClient>): Fixture[] {
  return (
    qc.getQueryData<Fixture[]>(["fixtures", undefined]) ??
    qc.getQueryData<Fixture[]>(["fixtures", {}]) ??
    []
  );
}

function setAllFixtureQueries(qc: ReturnType<typeof useQueryClient>, fixtures: Fixture[]): void {
  for (const [key, data] of qc.getQueriesData<Fixture[]>({ queryKey: ["fixtures"] })) {
    if (!Array.isArray(data)) continue;
    const isBaseQuery =
      key.length === 2 &&
      (key[1] === undefined ||
        (typeof key[1] === "object" &&
          key[1] !== null &&
          !(key[1] as { id?: number; team?: number; status?: string }).id &&
          !(key[1] as { team?: number }).team &&
          !(key[1] as { status?: string }).status));
    if (isBaseQuery || data.length === 0) {
      qc.setQueryData(key, data.length > 0 ? mergeFixtureLists(data, fixtures) : fixtures);
    } else if (data.length > 0) {
      qc.setQueryData(key, mergeFixtureLists(fixtures, data));
    }
  }
}

function mergeLiveIntoFixtureQueries(
  qc: ReturnType<typeof useQueryClient>,
  live: Fixture[],
  baseFixtures: Fixture[]
): void {
  if (live.length === 0) return;

  const liveById = new Map(live.map((f) => [f.fixture.id, f]));
  const mergedBase = baseFixtures.length > 0 ? mergeLiveIntoFixtures(baseFixtures, live) : live;

  for (const [key, data] of qc.getQueriesData<Fixture[]>({ queryKey: ["fixtures"] })) {
    if (!Array.isArray(data)) continue;
    const next =
      data.length > 0 ? mergeLiveIntoFixtures(data, live) : mergedBase;
    qc.setQueryData(key, next);
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

/** Poll live=all y fusiona marcadores en la caché de React Query. */
export function useLiveScoreSync() {
  const qc = useQueryClient();
  const setLastRefresh = useUIStore((s) => s.setLastRefresh);
  const lastFullRefreshRef = useRef(0);
  const prevLiveIdsRef = useRef<Set<number>>(new Set());

  useEffect(() => {
    let cancelled = false;

    const tick = async () => {
      const fixtures = getBaseFixturesFromCache(qc);
      const listIncomplete = isFixtureListIncomplete(fixtures);

      syncLiveSession({
        fixtures,
        liveWorldCupCount: fixtures.filter((f) => isPlausibleLiveFixture(f)).length,
      });

      const shouldPoll =
        listIncomplete ||
        isLiveSessionActive() ||
        shouldPollFixtures(fixtures.length ? fixtures : undefined);
      if (!shouldPoll || cancelled) return;

      try {
        const now = Date.now();
        const liveSession = isLiveSessionActive();
        const fullListInterval = liveSession
          ? LIVE_SESSION_FULL_LIST_REFRESH_MS
          : FULL_LIST_REFRESH_MS;
        const needsFullRefresh =
          listIncomplete || now - lastFullRefreshRef.current >= fullListInterval;

        if (needsFullRefresh) {
          const full = await getFixtures({});
          if (!cancelled && full.length > 0) {
            setAllFixtureQueries(qc, full);
            lastFullRefreshRef.current = now;
          }
        }

        const live = await getLiveWorldCupFixtures();
        if (cancelled) return;

        const liveIds = new Set(live.map((f) => f.fixture.id));
        const droppedFromLive = [...prevLiveIdsRef.current].filter((id) => !liveIds.has(id));
        prevLiveIdsRef.current = liveIds;

        if (droppedFromLive.length > 0) {
          const full = await getFixtures({});
          if (!cancelled && full.length > 0) {
            setAllFixtureQueries(qc, full);
            lastFullRefreshRef.current = Date.now();
          }
        }

        const currentBase = getBaseFixturesFromCache(qc);

        syncLiveSession({
          fixtures: currentBase,
          liveWorldCupCount: live.length,
        });

        mergeLiveIntoFixtureQueries(qc, live, currentBase);
        setLastRefresh(Date.now());
      } catch {
        /* ignore transient errors */
      }
    };

    tick();
    const interval = setInterval(tick, getLiveRefreshInterval());
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [qc, setLastRefresh]);
}
