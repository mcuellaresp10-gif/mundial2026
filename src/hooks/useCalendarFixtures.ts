"use client";

import { useMemo } from "react";
import { useFixtures } from "@/hooks/usePartidos";
import { useKnockoutBracket } from "@/hooks/useKnockoutBracket";
import type { CalendarMatchEntry, Fixture, PhaseFilter } from "@/types";
import {
  buildCalendarEntries,
  filterCalendarEntriesByPhase,
} from "@/utils/calendarKnockout";
import { getLocalDayKey } from "@/lib/liveRefresh";

export function useCalendarFixtures(phase: PhaseFilter = "Todos") {
  const { data: fixtures = [], isLoading: fixturesLoading } = useFixtures();
  const { bracket, isLoading: bracketLoading } = useKnockoutBracket();

  const allEntries = useMemo(
    () => buildCalendarEntries(fixtures, bracket),
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
  };
}

export function getEntriesForDay(
  entries: CalendarMatchEntry[],
  dayKey: string
): CalendarMatchEntry[] {
  return entries.filter((entry) => getLocalDayKey(entry.date) === dayKey);
}
