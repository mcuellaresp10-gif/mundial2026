"use client";

import { createContext, useContext, type ReactNode } from "react";
import {
  getDefaultAmericasLeague,
  getLeagueById,
  getLeagueBySlug,
  WORLD_CUP_LEAGUE,
  type AmericasLeague,
  type LeaguePhase,
} from "@/data/americasLeagues";
import { useLeagueStore } from "@/stores/useLeagueStore";

interface LeagueScopeValue {
  league: AmericasLeague;
  phase: LeaguePhase;
}

const LeagueScopeContext = createContext<LeagueScopeValue | null>(null);

/** Fija liga/fase para un subárbol (p. ej. archivo /mundial). */
export function LeagueScopeProvider({
  league,
  phase = "all",
  children,
}: {
  league: AmericasLeague;
  phase?: LeaguePhase;
  children: ReactNode;
}) {
  return (
    <LeagueScopeContext.Provider value={{ league, phase }}>
      {children}
    </LeagueScopeContext.Provider>
  );
}

export function WorldCupScopeProvider({ children }: { children: ReactNode }) {
  return (
    <LeagueScopeProvider league={WORLD_CUP_LEAGUE} phase="all">
      {children}
    </LeagueScopeProvider>
  );
}

export function useLeagueScope(): LeagueScopeValue | null {
  return useContext(LeagueScopeContext);
}

export function useActiveLeague(): {
  /** Primera liga seleccionada (compatibilidad / vistas de una tabla). */
  league: AmericasLeague;
  leagueId: number;
  season: number;
  /** Todas las ligas seleccionadas (orden de selección). */
  leagues: AmericasLeague[];
  leagueIds: number[];
  leagueSlugs: string[];
  isMulti: boolean;
  phase: LeaguePhase;
  setLeagueSlug: (slug: string) => void;
  setLeagueSlugs: (slugs: string[]) => void;
  toggleLeagueSlug: (slug: string) => void;
  setPhase: (phase: LeaguePhase) => void;
  supportsPhaseFilter: boolean;
  isScoped: boolean;
} {
  const scope = useLeagueScope();
  const leagueSlugs = useLeagueStore((s) => s.leagueSlugs);
  const storePhase = useLeagueStore((s) => s.phase);
  const setLeagueSlug = useLeagueStore((s) => s.setLeagueSlug);
  const setLeagueSlugs = useLeagueStore((s) => s.setLeagueSlugs);
  const toggleLeagueSlug = useLeagueStore((s) => s.toggleLeagueSlug);
  const setPhase = useLeagueStore((s) => s.setPhase);

  if (scope) {
    return {
      league: scope.league,
      leagueId: scope.league.id,
      season: scope.league.defaultSeason,
      leagues: [scope.league],
      leagueIds: [scope.league.id],
      leagueSlugs: [scope.league.slug],
      isMulti: false,
      phase: scope.phase,
      setLeagueSlug,
      setLeagueSlugs,
      toggleLeagueSlug,
      setPhase,
      supportsPhaseFilter: false,
      isScoped: true,
    };
  }

  const resolved = leagueSlugs
    .map((slug) => getLeagueBySlug(slug))
    .filter((l): l is AmericasLeague => !!l && l.id !== WORLD_CUP_LEAGUE.id);

  const leagues =
    resolved.length > 0 ? resolved : [getDefaultAmericasLeague()];
  const primary = leagues[0];

  return {
    league: primary,
    leagueId: primary.id,
    season: primary.defaultSeason,
    leagues,
    leagueIds: leagues.map((l) => l.id),
    leagueSlugs: leagues.map((l) => l.slug),
    isMulti: leagues.length > 1,
    phase: primary.seasonMode === "apertura_clausura" ? storePhase : "all",
    setLeagueSlug,
    setLeagueSlugs,
    toggleLeagueSlug,
    setPhase,
    supportsPhaseFilter: leagues.some((l) => l.seasonMode === "apertura_clausura"),
    isScoped: false,
  };
}

export function useLeagueByIdOrActive(leagueId?: number): AmericasLeague {
  const active = useActiveLeague();
  if (leagueId == null) return active.league;
  return getLeagueById(leagueId) ?? active.league;
}
