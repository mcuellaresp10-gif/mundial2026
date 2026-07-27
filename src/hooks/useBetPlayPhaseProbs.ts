"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useFixtures, useStandings } from "@/hooks/usePartidos";
import { useActiveLeague } from "@/hooks/useActiveLeague";
import {
  matchesLeaguePhase,
  type AmericasLeague,
  type LeaguePhase,
} from "@/data/americasLeagues";
import { CACHE_TTL_MS } from "@/lib/utils";
import { isFixtureFinished } from "@/lib/liveRefresh";
import type { Fixture, StandingTeam, StandingsGroup } from "@/types";
import {
  BETPLAY_DEFAULT_SIMULATIONS,
  simulateBetPlayPhaseProbabilities,
  type BetPlayPhaseProbs,
} from "@/utils/betPlaySeasonSimulation";

const BETPLAY_SLUG = "liga-betplay";

function flattenStandings(standingsRaw: StandingsGroup[]): StandingTeam[] {
  const byId = new Map<number, StandingTeam>();
  for (const sg of standingsRaw) {
    for (const group of sg.league.standings) {
      for (const row of group) {
        const existing = byId.get(row.team.id);
        if (!existing || row.all.played >= existing.all.played) {
          byId.set(row.team.id, row);
        }
      }
    }
  }
  return [...byId.values()];
}

function pickRegularSeasonTable(
  standingsRaw: StandingsGroup[],
  phase: LeaguePhase,
  league: AmericasLeague,
  supportsPhaseFilter: boolean
): StandingTeam[] {
  const tables: StandingTeam[][] = [];
  for (const sg of standingsRaw) {
    for (const group of sg.league.standings) {
      if (!group.length) continue;
      const groupLabel = group[0]?.group ?? "";
      if (supportsPhaseFilter && phase !== "all") {
        const matches =
          matchesLeaguePhase(groupLabel, league, phase) ||
          group.some((r) => matchesLeaguePhase(r.group, league, phase));
        if (!matches && group.length < 10) continue;
        if (matches || group.length >= 10) tables.push(group);
      } else {
        tables.push(group);
      }
    }
  }

  if (tables.length === 0) return flattenStandings(standingsRaw);
  tables.sort((a, b) => b.length - a.length);
  return tables[0];
}

function fixturesScoreSignature(fixtures: Fixture[]): string {
  return fixtures
    .filter((f) => isFixtureFinished(f.fixture.status.short))
    .map(
      (f) =>
        `${f.fixture.id}:${f.goals.home ?? "x"}-${f.goals.away ?? "x"}:${f.fixture.status.short}`
    )
    .sort()
    .join("|");
}

export function useBetPlayPhaseProbs() {
  const { league, phase, supportsPhaseFilter } = useActiveLeague();
  const enabled = league.slug === BETPLAY_SLUG;

  const { data: standingsRaw = [], isLoading: loadingStandings } = useStandings();
  const { data: fixturesAll = [], isLoading: loadingFixtures } = useFixtures();

  const standings = useMemo(
    () =>
      enabled
        ? pickRegularSeasonTable(standingsRaw, phase, league, supportsPhaseFilter)
        : [],
    [enabled, standingsRaw, phase, league, supportsPhaseFilter]
  );

  const fixtures = useMemo(() => {
    if (!enabled) return [];
    if (!supportsPhaseFilter || phase === "all") return fixturesAll;
    return fixturesAll.filter((f) =>
      matchesLeaguePhase(f.league.round, league, phase)
    );
  }, [enabled, fixturesAll, supportsPhaseFilter, phase, league]);

  const scoreSig = useMemo(() => fixturesScoreSignature(fixtures), [fixtures]);
  const standingsSig = useMemo(
    () =>
      standings
        .map((s) => `${s.team.id}:${s.points}:${s.all.played}:${s.goalsDiff}`)
        .sort()
        .join("|"),
    [standings]
  );

  const {
    data: probs = [],
    isLoading: loadingProbs,
    isFetching,
  } = useQuery({
    queryKey: [
      "betPlayPhaseProbs",
      league.id,
      league.defaultSeason,
      phase,
      standingsSig,
      scoreSig,
      BETPLAY_DEFAULT_SIMULATIONS,
    ],
    queryFn: (): BetPlayPhaseProbs[] =>
      simulateBetPlayPhaseProbabilities({
        standings,
        fixtures,
        simulations: BETPLAY_DEFAULT_SIMULATIONS,
      }),
    enabled: enabled && standings.length >= 8,
    staleTime: CACHE_TTL_MS,
  });

  return {
    enabled,
    probs,
    isLoading:
      enabled &&
      (loadingStandings ||
        loadingFixtures ||
        (loadingProbs && probs.length === 0)),
    isFetching: enabled && isFetching,
    phase,
    teamCount: standings.length,
  };
}
