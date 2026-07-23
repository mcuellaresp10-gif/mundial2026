"use client";

import { useState } from "react";
import { SelectorFase } from "@/components/Calendario/SelectorFase";
import { CalendarioMensual } from "@/components/Calendario/CalendarioMensual";
import {
  useAmericasCalendarFixtures,
  useWorldCupCalendarFixtures,
} from "@/hooks/useCalendarFixtures";
import { useActiveLeague } from "@/hooks/useActiveLeague";
import type { PhaseFilter } from "@/types";

function CalendarioAmericas() {
  const [visibleMonth, setVisibleMonth] = useState(() => new Date());
  const { leagues, leagueIds, isMulti } = useActiveLeague();
  const { entries, fixtureById, isLoading } =
    useAmericasCalendarFixtures(visibleMonth);

  const selectedIds = new Set(leagueIds);
  const filteredEntries = entries.filter((e) => {
    const leagueId = fixtureById.get(e.fixtureId)?.league.id;
    return leagueId != null && selectedIds.has(leagueId);
  });
  const filteredFixtureById = new Map(
    [...fixtureById.entries()].filter(([, f]) => selectedIds.has(f.league.id))
  );

  const label = isMulti
    ? `${leagues.length} competiciones`
    : leagues[0]?.shortName ?? "Américas";

  return (
    <div className="space-y-6 animate-in fade-in">
      <div>
        <h1 className="text-3xl font-bold">Calendario & Resultados</h1>
        <p className="text-muted-foreground mt-1">
          {isLoading
            ? "Cargando partidos del mes…"
            : `${filteredEntries.length} partidos · ${label}`}
        </p>
      </div>
      <CalendarioMensual
        entries={filteredEntries}
        fixtureById={filteredFixtureById}
        isLoading={isLoading}
        phase="Todos"
        visibleMonth={visibleMonth}
        onVisibleMonthChange={setVisibleMonth}
      />
    </div>
  );
}

function CalendarioMundial() {
  const [phase, setPhase] = useState<PhaseFilter>("Todos");
  const [visibleMonth, setVisibleMonth] = useState(() => new Date());
  const { entries, fixtureById, isLoading } = useWorldCupCalendarFixtures(phase);

  return (
    <div className="space-y-6 animate-in fade-in">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Calendario & Resultados</h1>
          <p className="text-muted-foreground mt-1">
            {entries.length} partidos · fase de grupos y eliminatorias
          </p>
        </div>
        <SelectorFase value={phase} onChange={setPhase} />
      </div>
      <CalendarioMensual
        entries={entries}
        fixtureById={fixtureById}
        isLoading={isLoading}
        phase={phase}
        visibleMonth={visibleMonth}
        onVisibleMonthChange={setVisibleMonth}
      />
    </div>
  );
}

export default function CalendarioPage() {
  const { isScoped } = useActiveLeague();
  return isScoped ? <CalendarioMundial /> : <CalendarioAmericas />;
}
