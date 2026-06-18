"use client";

import { useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  getFixtures,
  getLiveWorldCupFixtures,
  mergeLiveIntoFixtures,
} from "@/services/apiFootball";
import { isLiveSessionActive, syncLiveSession } from "@/services/liveSession";
import { getLiveRefreshInterval, isPlausibleLiveFixture, shouldPollFixtures } from "@/lib/liveRefresh";
import { mergeFixtureLists } from "@/utils/fixtureMerge";
import { useUIStore } from "@/stores/useUIStore";
import type { Fixture } from "@/types";

const FULL_LIST_REFRESH_MS = 5 * 60 * 1000;

function mergeLiveIntoFixtureQueries(
  qc: ReturnType<typeof useQueryClient>,
  live: Fixture[]
): void {
  if (live.length === 0) return;

  const liveById = new Map(live.map((f) => [f.fixture.id, f]));

  for (const [key, data] of qc.getQueriesData<Fixture[]>({ queryKey: ["fixtures"] })) {
    if (!Array.isArray(data) || data.length === 0) continue;
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

function mergeFullListIntoFixtureQueries(
  qc: ReturnType<typeof useQueryClient>,
  fullList: Fixture[]
): void {
  if (fullList.length === 0) return;

  for (const [key, data] of qc.getQueriesData<Fixture[]>({ queryKey: ["fixtures"] })) {
    if (!Array.isArray(data)) continue;
    const merged = data.length > 0 ? mergeFixtureLists(fullList, data) : fullList;
    qc.setQueryData(key, merged);
  }
}

/** Poll live=all y fusiona marcadores en la caché de React Query. */
export function useLiveScoreSync() {
  const qc = useQueryClient();
  const setLastRefresh = useUIStore((s) => s.setLastRefresh);
  const lastFullRefreshRef = useRef(0);

  useEffect(() => {
    let cancelled = false;

    const tick = async () => {
      const fixtures =
        qc.getQueryData<Fixture[]>(["fixtures", undefined]) ??
        qc.getQueryData<Fixture[]>(["fixtures", {}]) ??
        [];

      syncLiveSession({
        fixtures,
        liveWorldCupCount: fixtures.filter((f) => isPlausibleLiveFixture(f)).length,
      });

      const shouldPoll =
        isLiveSessionActive() || shouldPollFixtures(fixtures.length ? fixtures : undefined);
      if (!shouldPoll || cancelled) return;

      try {
        const live = await getLiveWorldCupFixtures();
        if (cancelled) return;

        syncLiveSession({
          fixtures,
          liveWorldCupCount: live.length,
        });

        mergeLiveIntoFixtureQueries(qc, live);

        const now = Date.now();
        if (now - lastFullRefreshRef.current >= FULL_LIST_REFRESH_MS) {
          const full = await getFixtures({});
          if (!cancelled && full.length > 0) {
            mergeFullListIntoFixtureQueries(qc, full);
            lastFullRefreshRef.current = now;
          }
        }

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
