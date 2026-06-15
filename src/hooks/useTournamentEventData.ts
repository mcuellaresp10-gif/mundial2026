"use client";

import { useMemo } from "react";
import { useQueries } from "@tanstack/react-query";
import { getFixtureEvents, getFixtureLineups } from "@/services/apiFootball";
import { isFixtureFinished } from "@/lib/liveRefresh";
import { CACHE_TTL_MS } from "@/lib/utils";
import type { Fixture } from "@/types";

const EVENTS_STALE_MS = CACHE_TTL_MS;

export function useTournamentEventData(fixtures: Fixture[], enabled = true) {
  const finishedIds = useMemo(
    () =>
      fixtures
        .filter((f) => isFixtureFinished(f.fixture.status.short))
        .map((f) => f.fixture.id),
    [fixtures]
  );

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

  const eventsByFixture = useMemo(
    () => eventQueries.map((q) => q.data ?? []),
    [eventQueries]
  );

  const lineupsByFixture = useMemo(
    () => lineupQueries.map((q) => q.data ?? []),
    [lineupQueries]
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
