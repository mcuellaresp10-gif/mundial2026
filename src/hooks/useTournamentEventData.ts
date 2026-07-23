"use client";

import { useMemo } from "react";
import { useQueries } from "@tanstack/react-query";
import { getFixtureEvents, getFixtureLineups } from "@/services/apiFootball";
import { isFixtureFinished } from "@/lib/liveRefresh";
import { CACHE_TTL_MS } from "@/lib/utils";
import type { Fixture, FixtureEvent, Lineup } from "@/types";

const EVENTS_STALE_MS = CACHE_TTL_MS;
/** Evita N×400 llamadas al abrir Estadísticas de una liga completa. */
const MAX_EVENT_FIXTURES = 48;

export function useTournamentEventData(fixtures: Fixture[], enabled = true) {
  const finishedIds = useMemo(() => {
    const finished = fixtures
      .filter((f) => isFixtureFinished(f.fixture.status.short))
      .sort(
        (a, b) =>
          new Date(b.fixture.date).getTime() - new Date(a.fixture.date).getTime()
      );
    return finished.slice(0, MAX_EVENT_FIXTURES).map((f) => f.fixture.id);
  }, [fixtures]);

  const eventQueries = useQueries({
    queries: finishedIds.map((fixtureId) => ({
      queryKey: ["fixtureEvents", fixtureId],
      queryFn: () => getFixtureEvents(fixtureId),
      staleTime: EVENTS_STALE_MS,
      enabled: enabled && fixtureId > 0,
    })),
  });

  const lineupQueries = useQueries({
    queries: finishedIds.map((fixtureId) => ({
      queryKey: ["fixtureLineups", fixtureId],
      queryFn: () => getFixtureLineups(fixtureId),
      staleTime: EVENTS_STALE_MS,
      enabled: enabled && fixtureId > 0,
    })),
  });

  const eventDataKey = eventQueries.map((q) => q.dataUpdatedAt).join("|");
  const lineupDataKey = lineupQueries.map((q) => q.dataUpdatedAt).join("|");
  const idsKey = finishedIds.join(",");

  const eventsByFixture = useMemo(
    () =>
      eventQueries.map(
        (q) => (q.data as FixtureEvent[] | undefined) ?? []
      ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [idsKey, eventDataKey]
  );

  const lineupsByFixture = useMemo(
    () =>
      lineupQueries.map((q) => (q.data as Lineup[] | undefined) ?? []),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [idsKey, lineupDataKey]
  );

  const isLoading =
    enabled &&
    finishedIds.length > 0 &&
    (eventQueries.some((q) => q.isLoading) || lineupQueries.some((q) => q.isLoading));

  return {
    finishedIds,
    eventsByFixture,
    lineupsByFixture,
    isLoading,
    hasFinished: finishedIds.length > 0,
  };
}
