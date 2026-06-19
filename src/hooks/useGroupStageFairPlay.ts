"use client";

import { useMemo } from "react";
import { useQueries } from "@tanstack/react-query";
import { getFixtureEvents } from "@/services/apiFootball";
import { CACHE_TTL_MS } from "@/lib/utils";
import { buildFairPlayMapFromFixtures, type FairPlayRecord } from "@/utils/fairPlay";
import {
  fairPlaySignature,
  listFtGroupStageFixtureRows,
} from "@/utils/groupFairPlayFixtures";
import type { Fixture, StandingsGroup } from "@/types";

export function useGroupStageFairPlay(
  fixtures: Fixture[],
  standings: StandingsGroup[]
): {
  fairPlayByTeam: Map<number, FairPlayRecord>;
  fairPlaySignature: string;
  isLoading: boolean;
} {
  const ftRows = useMemo(
    () => listFtGroupStageFixtureRows(fixtures, standings),
    [fixtures, standings]
  );

  const eventQueries = useQueries({
    queries: ftRows.map((row) => ({
      queryKey: ["fixtureEvents", row.fixtureId],
      queryFn: () => getFixtureEvents(row.fixtureId),
      enabled: ftRows.length > 0,
      staleTime: CACHE_TTL_MS,
    })),
  });

  const fairPlayByTeam = useMemo(() => {
    return buildFairPlayMapFromFixtures(
      ftRows.map((row, i) => ({
        fixtureId: row.fixtureId,
        homeId: row.homeId,
        awayId: row.awayId,
        events: eventQueries[i]?.data ?? [],
      }))
    );
  }, [ftRows, eventQueries]);

  const signature = useMemo(
    () => fairPlaySignature(fairPlayByTeam),
    [fairPlayByTeam]
  );

  const isLoading = eventQueries.some((q) => q.isLoading);

  return {
    fairPlayByTeam,
    fairPlaySignature: signature,
    isLoading,
  };
}
