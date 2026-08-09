"use client";

import { useMemo } from "react";
import { useQueries } from "@tanstack/react-query";
import { getFixturePlayers } from "@/services/apiFootball";
import { useFixtures } from "@/hooks/usePartidos";
import { isFixtureFinished } from "@/lib/liveRefresh";
import { parseRating } from "@/utils/formatters";
import { CACHE_TTL_MS } from "@/lib/utils";

export interface PlayerFormAppearance {
  fixtureId: number;
  date: string;
  opponent: string;
  minutes: number;
  rating: number;
  goals: number;
  assists: number;
}

const MAX_FIXTURES = 6;

/**
 * Últimos partidos del jugador vía fixtures del club + fixtures/players
 * (mismo endpoint que Once Ideal). Limita llamadas a MAX_FIXTURES.
 */
export function usePlayerRecentForm(
  playerId: number | null | undefined,
  teamId: number | null | undefined,
  enabled = true
) {
  const { data: fixtures = [], isLoading: fixturesLoading } = useFixtures({
    applyPhaseFilter: true,
  });

  const recentFixtureIds = useMemo(() => {
    if (!teamId) return [] as number[];
    return fixtures
      .filter(
        (f) =>
          isFixtureFinished(f.fixture.status.short) &&
          (f.teams.home.id === teamId || f.teams.away.id === teamId)
      )
      .sort(
        (a, b) =>
          new Date(b.fixture.date).getTime() - new Date(a.fixture.date).getTime()
      )
      .slice(0, MAX_FIXTURES)
      .map((f) => f.fixture.id);
  }, [fixtures, teamId]);

  const fixtureMeta = useMemo(() => {
    const map = new Map<
      number,
      { date: string; opponent: string; teamId: number }
    >();
    if (!teamId) return map;
    for (const f of fixtures) {
      if (!recentFixtureIds.includes(f.fixture.id)) continue;
      const opponent =
        f.teams.home.id === teamId ? f.teams.away.name : f.teams.home.name;
      map.set(f.fixture.id, {
        date: f.fixture.date,
        opponent,
        teamId,
      });
    }
    return map;
  }, [fixtures, recentFixtureIds, teamId]);

  const queries = useQueries({
    queries: recentFixtureIds.map((fixtureId) => ({
      queryKey: ["fixturePlayers", "scoutingForm", fixtureId],
      queryFn: () => getFixturePlayers(fixtureId),
      enabled: Boolean(enabled && playerId && teamId && fixtureId),
      staleTime: CACHE_TTL_MS,
    })),
  });

  const playersDataKey = queries.map((q) => q.dataUpdatedAt).join("|");

  const appearances = useMemo(() => {
    if (!playerId) return [] as PlayerFormAppearance[];
    const rows: PlayerFormAppearance[] = [];
    queries.forEach((q, i) => {
      const fixtureId = recentFixtureIds[i];
      const meta = fixtureMeta.get(fixtureId);
      if (!q.data || !meta) return;
      for (const teamBlock of q.data) {
        const entry = teamBlock.players.find((p) => p.player.id === playerId);
        if (!entry) continue;
        const stat = entry.statistics[0];
        if (!stat) continue;
        const minutes = stat.games.minutes ?? 0;
        if (minutes <= 0) continue;
        rows.push({
          fixtureId,
          date: meta.date,
          opponent: meta.opponent,
          minutes,
          rating: parseRating(stat.games.rating),
          goals: stat.goals.total ?? 0,
          assists: stat.goals.assists ?? 0,
        });
      }
    });
    return rows.sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playersDataKey, recentFixtureIds, fixtureMeta, playerId]);

  const loading =
    fixturesLoading ||
    (recentFixtureIds.length > 0 && queries.some((q) => q.isLoading));

  return { appearances, isLoading: loading, fixtureCount: recentFixtureIds.length };
}
