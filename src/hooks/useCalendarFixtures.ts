"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useFixtures } from "@/hooks/usePartidos";
import { useKnockoutBracket } from "@/hooks/useKnockoutBracket";
import { getAmericasFixturesForMonth } from "@/services/apiFootball";
import {
  buildCalendarEntries,
  filterCalendarEntriesByPhase,
  fixturesToCalendarEntries,
} from "@/utils/calendarKnockout";
import { getLocalDayKey, NORMAL_STALE_MS } from "@/lib/liveRefresh";
import type { CalendarMatchEntry, Fixture, PhaseFilter } from "@/types";

/** Hub Américas: fixtures del mes visible vía date= (no temporadas completas). */
export function useAmericasCalendarFixtures(visibleMonth: Date) {
  const year = visibleMonth.getFullYear();
  const month = visibleMonth.getMonth();

  const { data: fixtures = [], isLoading, isFetching } = useQuery({
    queryKey: ["fixtures", { scope: "americas-month", year, month }],
    queryFn: () => getAmericasFixturesForMonth(year, month),
    staleTime: NORMAL_STALE_MS,
  });

  const entries = useMemo(
    () => fixturesToCalendarEntries(fixtures),
    [fixtures]
  );

  const fixtureById = useMemo(() => {
    const map = new Map<number, Fixture>();
    for (const fixture of fixtures) {
      map.set(fixture.fixture.id, fixture);
    }
    return map;
  }, [fixtures]);

  return {
    entries,
    allEntries: entries,
    fixtures,
    fixtureById,
    bracket: null as null,
    isLoading: isLoading && fixtures.length === 0,
    isFetching,
    mode: "americas" as const,
  };
}

/** Archivo Mundial: fixtures + cuadro eliminatorio proyectado. */
export function useWorldCupCalendarFixtures(phase: PhaseFilter = "Todos") {
  const { data: fixtures = [], isLoading: fixturesLoading } = useFixtures({
    applyPhaseFilter: false,
  });
  const { bracket, isLoading: bracketLoading } = useKnockoutBracket();

  const allEntries = useMemo(
    () => buildCalendarEntries(fixtures, bracket ?? null),
    [fixtures, bracket]
  );

  const entries = useMemo(
    () => filterCalendarEntriesByPhase(allEntries, phase),
    [allEntries, phase]
  );

  const fixtureById = useMemo(() => {
    const map = new Map<number, Fixture>();
    for (const fixture of fixtures) {
      map.set(fixture.fixture.id, fixture);
    }
    return map;
  }, [fixtures]);

  return {
    entries,
    allEntries,
    fixtures,
    fixtureById,
    bracket,
    isLoading: fixturesLoading || bracketLoading,
    mode: "mundial" as const,
  };
}

/** @deprecated Usar useAmericasCalendarFixtures(month). */
export function useCalendarFixtures(_phase: PhaseFilter = "Todos") {
  return useAmericasCalendarFixtures(new Date());
}

export function getEntriesForDay(
  entries: CalendarMatchEntry[],
  dayKey: string
): CalendarMatchEntry[] {
  return entries.filter((entry) => getLocalDayKey(entry.date) === dayKey);
}
