"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  getDefaultAmericasLeague,
  getLeagueBySlug,
  type LeaguePhase,
} from "@/data/americasLeagues";

const DEFAULT_SLUG = getDefaultAmericasLeague().slug;

function sanitizeSlugs(slugs: string[]): string[] {
  const unique: string[] = [];
  for (const slug of slugs) {
    const league = getLeagueBySlug(slug);
    if (!league || league.slug === "mundial-2026") continue;
    if (!unique.includes(slug)) unique.push(slug);
  }
  return unique.length > 0 ? unique : [DEFAULT_SLUG];
}

interface LeagueState {
  leagueSlugs: string[];
  phase: LeaguePhase;
  /** Reemplaza la selección por una sola liga. */
  setLeagueSlug: (slug: string) => void;
  /** Sustituye la selección completa (mínimo 1). */
  setLeagueSlugs: (slugs: string[]) => void;
  /** Activa/desactiva una liga; no permite dejar la lista vacía. */
  toggleLeagueSlug: (slug: string) => void;
  setPhase: (phase: LeaguePhase) => void;
}

export const useLeagueStore = create<LeagueState>()(
  persist(
    (set, get) => ({
      leagueSlugs: [DEFAULT_SLUG],
      phase: "all",
      setLeagueSlug: (slug) => {
        const league = getLeagueBySlug(slug);
        if (!league || league.slug === "mundial-2026") return;
        set({ leagueSlugs: [slug], phase: "all" });
      },
      setLeagueSlugs: (slugs) => {
        set({ leagueSlugs: sanitizeSlugs(slugs), phase: "all" });
      },
      toggleLeagueSlug: (slug) => {
        const league = getLeagueBySlug(slug);
        if (!league || league.slug === "mundial-2026") return;
        const current = get().leagueSlugs;
        if (current.includes(slug)) {
          if (current.length <= 1) return;
          set({ leagueSlugs: current.filter((s) => s !== slug) });
          return;
        }
        set({ leagueSlugs: [...current, slug] });
      },
      setPhase: (phase) => set({ phase }),
    }),
    {
      name: "americas-active-league",
      version: 2,
      migrate: (persisted) => {
        const state = (persisted ?? {}) as {
          leagueSlug?: string;
          leagueSlugs?: string[];
          phase?: LeaguePhase;
        };
        const fromLegacy =
          typeof state.leagueSlug === "string" ? [state.leagueSlug] : undefined;
        return {
          leagueSlugs: sanitizeSlugs(state.leagueSlugs ?? fromLegacy ?? [DEFAULT_SLUG]),
          phase: state.phase ?? "all",
        };
      },
    }
  )
);
