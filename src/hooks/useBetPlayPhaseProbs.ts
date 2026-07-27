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
  simulateBetPlayPhaseProbabilitiesDetailed,
  type BetPlayPhaseProbs,
  type BetPlaySimMeta,
} from "@/utils/betPlaySeasonSimulation";

const BETPLAY_SLUG = "liga-betplay";

const EMPTY_META: BetPlaySimMeta = {
  maxPlayed: 0,
  pendingCount: 0,
  simulations: BETPLAY_DEFAULT_SIMULATIONS,
  strengthWeight: 0,
  historyFixtureCount: 0,
};

/**
 * Torneo cuyas probs se estiman.
 * "all" → Clausura (2026-2) mientras ese sea el torneo vigente.
 * Apertura solo se usa como historial H2H/forma, no como tabla de puntos.
 */
export function resolveBetPlayTournamentPhase(phase: LeaguePhase): "apertura" | "clausura" {
  return phase === "apertura" ? "apertura" : "clausura";
}

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

/** Tabla del torneo actual (fase); no mezcla grupos de otra fase. */
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
    // Fallback: grupo más grande (API a veces no etiqueta la fase).
    const all: StandingTeam[][] = [];
    for (const sg of standingsRaw) {
      for (const group of sg.league.standings) {
        if (group.length) all.push(group);
      }
    }
    if (all.length === 0) return flattenStandings(standingsRaw);
    all.sort((a, b) => b.length - a.length);
    return all[0];
  }

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

function isPendingFixture(f: Fixture): boolean {
  const s = f.fixture.status.short;
  return s === "NS" || s === "PST" || s === "TBD";
}

export function useBetPlayPhaseProbs() {
  const { league, phase } = useActiveLeague();
  const enabled = league.slug === BETPLAY_SLUG;
  const tournamentPhase = resolveBetPlayTournamentPhase(phase);

  const { data: standingsRaw = [], isLoading: loadingStandings } = useStandings();
  // Temporada completa (Apertura + Clausura) para historial H2H/forma.
  const { data: seasonFixtures = [], isLoading: loadingFixtures } = useFixtures({
    applyPhaseFilter: false,
  });

  const standings = useMemo(
    () =>
      enabled ? pickRegularSeasonTable(standingsRaw, tournamentPhase, league) : [],
    [enabled, standingsRaw, tournamentPhase, league]
  );

  /** Solo torneo actual: pendientes a simular + resultados de esta fase. */
  const tournamentFixtures = useMemo(() => {
    if (!enabled) return [];
    return seasonFixtures.filter((f) =>
      matchesLeaguePhase(f.league.round, league, tournamentPhase)
    );
  }, [enabled, seasonFixtures, league, tournamentPhase]);

  /** Historial de temporada para H2H/forma (no suma puntos a la tabla). */
  const historyFixtures = useMemo(
    () => (enabled ? seasonFixtures : []),
    [enabled, seasonFixtures]
  );

  const scoreSig = useMemo(
    () => fixturesScoreSignature(tournamentFixtures),
    [tournamentFixtures]
  );
  const historySig = useMemo(
    () => fixturesScoreSignature(historyFixtures),
    [historyFixtures]
  );
  const standingsSig = useMemo(
    () =>
      standings
        .map((s) => `${s.team.id}:${s.points}:${s.all.played}:${s.goalsDiff}`)
        .sort()
        .join("|"),
    [standings]
  );

  const pendingCountPreview = useMemo(
    () =>
      tournamentFixtures.filter(
        (f) =>
          isPendingFixture(f) &&
          standings.some((s) => s.team.id === f.teams.home.id) &&
          standings.some((s) => s.team.id === f.teams.away.id)
      ).length,
    [tournamentFixtures, standings]
  );

  const maxPlayedPreview = useMemo(
    () => (standings.length ? Math.max(...standings.map((s) => s.all.played)) : 0),
    [standings]
  );

  const {
    data,
    isLoading: loadingProbs,
    isFetching,
  } = useQuery({
    queryKey: [
      "betPlayPhaseProbs",
      league.id,
      league.defaultSeason,
      tournamentPhase,
      standingsSig,
      scoreSig,
      historySig,
      BETPLAY_DEFAULT_SIMULATIONS,
    ],
    queryFn: () =>
      simulateBetPlayPhaseProbabilitiesDetailed({
        standings,
        fixtures: tournamentFixtures,
        historyFixtures,
        simulations: BETPLAY_DEFAULT_SIMULATIONS,
      }),
    enabled: enabled && standings.length >= 8,
    staleTime: CACHE_TTL_MS,
  });

  const probs: BetPlayPhaseProbs[] = data?.rows ?? [];
  const meta: BetPlaySimMeta = data?.meta ?? {
    ...EMPTY_META,
    maxPlayed: maxPlayedPreview,
    pendingCount: pendingCountPreview,
    historyFixtureCount: historyFixtures.length,
  };

  return {
    enabled,
    probs,
    meta,
    isLoading:
      enabled &&
      (loadingStandings ||
        loadingFixtures ||
        (loadingProbs && probs.length === 0)),
    isFetching: enabled && isFetching,
    phase: tournamentPhase,
    teamCount: standings.length,
  };
}
