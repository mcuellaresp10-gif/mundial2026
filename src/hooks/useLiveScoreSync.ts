"use client";

import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { getLiveWorldCupFixtures, mergeLiveIntoFixtures } from "@/services/apiFootball";
import { isLiveSessionActive, syncLiveSession } from "@/services/liveSession";
import { getLiveRefreshInterval, isPlausibleLiveFixture, shouldPollFixtures } from "@/lib/liveRefresh";
import { useUIStore } from "@/stores/useUIStore";
import type { Fixture } from "@/types";

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

/** Poll live=all y fusiona marcadores en la caché de React Query. */
export function useLiveScoreSync() {
  const qc = useQueryClient();
  const setLastRefresh = useUIStore((s) => s.setLastRefresh);

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
