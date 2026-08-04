"use client";

import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useFixtures, useStandings } from "@/hooks/usePartidos";
import { useActiveLeague } from "@/hooks/useActiveLeague";
import {
  matchesLeaguePhase,
  type AmericasLeague,
} from "@/data/americasLeagues";
import { CACHE_TTL_MS } from "@/lib/utils";
import type { StandingTeam, StandingsGroup } from "@/types";
import {
  resolveBetPlayTournamentPhase,
} from "@/hooks/useBetPlayPhaseProbs";
import {
  BETPLAY_EVOLUTION_SIMULATIONS,
  buildPointsEvolution,
  finishedFixturesSignature,
  loadCachedProbEvolution,
  runBetPlayProbBacktest,
  saveCachedProbEvolution,
  teamMetasFromStandings,
  type BetPlayPointsSnapshot,
  type BetPlayProbSnapshot,
  type BetPlayTeamMeta,
} from "@/utils/betPlayEvolution";

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
  tournamentPhase: "apertura" | "clausura",
  league: AmericasLeague
): StandingTeam[] {
  const tables: StandingTeam[][] = [];
  for (const sg of standingsRaw) {
    for (const group of sg.league.standings) {
      if (!group.length) continue;
      const groupLabel = group[0]?.group ?? "";
      const matches =
        matchesLeaguePhase(groupLabel, league, tournamentPhase) ||
        group.some((r) => matchesLeaguePhase(r.group, league, tournamentPhase));
      if (matches) tables.push(group);
    }
  }

  if (tables.length === 0) {
    const all: StandingTeam[][] = [];
    for (const sg of standingsRaw) {
      for (const group of sg.league.standings) {
        if (group.length) all.push(group);
      }
    }
    if (all.length === 0) return flattenStandings(standingsRaw);
    all.sort((a, b) => b.length - a.length);
    return all[0]!;
  }

  tables.sort((a, b) => b.length - a.length);
  return tables[0]!;
}

export function useBetPlayEvolution() {
  const { league, phase } = useActiveLeague();
  const enabled = league.slug === BETPLAY_SLUG;
  const tournamentPhase = resolveBetPlayTournamentPhase(phase);

  const { data: standingsRaw = [], isLoading: loadingStandings } = useStandings();
  const { data: seasonFixtures = [], isLoading: loadingFixtures } = useFixtures({
    applyPhaseFilter: false,
  });

  const standings = useMemo(
    () =>
      enabled ? pickRegularSeasonTable(standingsRaw, tournamentPhase, league) : [],
    [enabled, standingsRaw, tournamentPhase, league]
  );

  const teams: BetPlayTeamMeta[] = useMemo(
    () => teamMetasFromStandings(standings),
    [standings]
  );

  const tournamentFixtures = useMemo(() => {
    if (!enabled) return [];
    return seasonFixtures.filter((f) =>
      matchesLeaguePhase(f.league.round, league, tournamentPhase)
    );
  }, [enabled, seasonFixtures, league, tournamentPhase]);

  const historyFixtures = useMemo(
    () => (enabled ? seasonFixtures : []),
    [enabled, seasonFixtures]
  );

  const finishedSig = useMemo(
    () => finishedFixturesSignature(tournamentFixtures),
    [tournamentFixtures]
  );

  const pointsSeries: BetPlayPointsSnapshot[] = useMemo(() => {
    if (!enabled || teams.length === 0) return [];
    return buildPointsEvolution(tournamentFixtures, teams);
  }, [enabled, tournamentFixtures, teams]);

  const cacheKey = useMemo(
    () =>
      [
        league.id,
        league.defaultSeason,
        tournamentPhase,
        finishedSig.slice(0, 120),
        BETPLAY_EVOLUTION_SIMULATIONS,
      ].join("|"),
    [league.id, league.defaultSeason, tournamentPhase, finishedSig]
  );

  const [progress, setProgress] = useState({ done: 0, total: 0 });

  const {
    data: probSeries = [],
    isLoading: loadingProbs,
    isFetching: fetchingProbs,
  } = useQuery({
    queryKey: ["betPlayProbEvolution", cacheKey],
    queryFn: async ({ signal }) => {
      const cached = loadCachedProbEvolution(cacheKey);
      if (cached && cached.length > 0) {
        setProgress({ done: cached.length, total: cached.length });
        return cached;
      }

      const snapshots = await runBetPlayProbBacktest({
        tournamentFixtures,
        historyFixtures,
        teams,
        simulations: BETPLAY_EVOLUTION_SIMULATIONS,
        groupLabel: tournamentPhase === "apertura" ? "Apertura" : "Clausura",
        signal,
        onProgress: (done, total) => setProgress({ done, total }),
      });

      if (!signal?.aborted && snapshots.length > 0) {
        saveCachedProbEvolution(cacheKey, snapshots);
      }
      return snapshots;
    },
    enabled: enabled && teams.length >= 8 && tournamentFixtures.length > 0,
    staleTime: CACHE_TTL_MS,
  });

  useEffect(() => {
    if (!enabled) {
      setProgress({ done: 0, total: 0 });
    }
  }, [enabled, cacheKey]);

  return {
    enabled,
    teams,
    pointsSeries,
    probSeries: probSeries as BetPlayProbSnapshot[],
    progress,
    phase: tournamentPhase,
    isLoading:
      enabled &&
      (loadingStandings ||
        loadingFixtures ||
        (loadingProbs && probSeries.length === 0 && pointsSeries.length === 0)),
    isComputingProbs: enabled && fetchingProbs && progress.total > 0 && progress.done < progress.total,
    hasPoints: pointsSeries.length > 0,
    hasProbs: (probSeries as BetPlayProbSnapshot[]).length > 0,
  };
}
