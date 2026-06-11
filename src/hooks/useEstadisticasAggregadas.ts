"use client";

import { useMemo } from "react";
import { useFixtures, useStandings } from "./usePartidos";
import { aggregateFixtureGoals, getBiggestWin } from "@/utils/calculations";
import {
  isFixtureFinished,
  isFixtureLive,
  isFixtureStarted,
} from "@/lib/liveRefresh";
import type { StandingTeam } from "@/types";

export function useEstadisticasAggregadas() {
  const { data: fixtures = [] } = useFixtures();
  const { data: standings = [] } = useStandings();

  return useMemo(() => {
    const finished = fixtures.filter((f) => isFixtureFinished(f.fixture.status.short));
    const liveNow = fixtures.filter((f) => isFixtureLive(f.fixture.status.short));
    const started = fixtures.filter((f) => isFixtureStarted(f.fixture.status.short));
    const pending = fixtures.filter((f) => f.fixture.status.short === "NS");

    const totalGoals = aggregateFixtureGoals(fixtures);
    const biggestWin = getBiggestWin(fixtures);
    const avgGoalsPerMatch =
      started.length > 0 ? totalGoals / started.length : 0;

    const groupLeaders: StandingTeam[] = [];
    for (const sg of standings) {
      for (const group of sg.league.standings) {
        if (group[0]) groupLeaders.push(group[0]);
      }
    }

    const goalsByRound = new Map<string, number>();
    for (const f of started) {
      const round = f.league.round;
      const goals = (f.goals.home ?? 0) + (f.goals.away ?? 0);
      goalsByRound.set(round, (goalsByRound.get(round) ?? 0) + goals);
    }

    const datoDelDia = liveNow.length
      ? `En vivo: ${liveNow
          .map(
            (f) =>
              `${f.teams.home.name} ${f.goals.home ?? 0}-${f.goals.away ?? 0} ${f.teams.away.name}`
          )
          .join(" · ")}`
      : biggestWin
        ? `Mayor goleada: ${biggestWin.fixture.teams.home.name} ${biggestWin.fixture.goals.home}-${biggestWin.fixture.goals.away} ${biggestWin.fixture.teams.away.name}`
        : "El torneo está por comenzar";

    return {
      playedCount: finished.length,
      liveCount: liveNow.length,
      startedCount: started.length,
      pendingCount: pending.length,
      totalGoals,
      avgGoalsPerMatch: Math.round(avgGoalsPerMatch * 100) / 100,
      groupLeaders,
      biggestWin,
      goalsByRound: Array.from(goalsByRound.entries()).map(([round, goals]) => ({ round, goals })),
      datoDelDia,
      fixtures,
    };
  }, [fixtures, standings]);
}

export function useColombiaData(colombiaTeamId?: number | null) {
  const { data: fixtures = [] } = useFixtures({ team: colombiaTeamId ?? undefined });
  const { data: standings = [] } = useStandings();

  return useMemo(() => {
    if (!colombiaTeamId) return null;

    let colStanding: StandingTeam | null = null;
    for (const sg of standings) {
      for (const group of sg.league.standings) {
        const found = group.find((s) => s.team.id === colombiaTeamId);
        if (found) colStanding = found;
      }
    }

    const colFixtures = fixtures.filter(
      (f) => f.teams.home.id === colombiaTeamId || f.teams.away.id === colombiaTeamId
    );
    const sorted = [...colFixtures].sort(
      (a, b) => new Date(a.fixture.date).getTime() - new Date(b.fixture.date).getTime()
    );
    const nextMatch = sorted.find((f) => f.fixture.status.short === "NS") ?? null;
    const lastResults = sorted
      .filter((f) => f.fixture.status.short === "FT")
      .slice(-3)
      .reverse();

    return { standing: colStanding, nextMatch, lastResults, fixtures: colFixtures };
  }, [colombiaTeamId, fixtures, standings]);
}
