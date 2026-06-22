"use client";

import { useState } from "react";
import { SelectorFase } from "@/components/Calendario/SelectorFase";
import { CalendarioMensual } from "@/components/Calendario/CalendarioMensual";
import { useCalendarFixtures } from "@/hooks/useCalendarFixtures";
import type { PhaseFilter } from "@/types";

export default function CalendarioPage() {
  const [phase, setPhase] = useState<PhaseFilter>("Todos");
  const { entries, fixtureById, isLoading } = useCalendarFixtures(phase);

  return (
    <div className="space-y-6 animate-in fade-in">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Calendario & Resultados</h1>
          <p className="text-muted-foreground mt-1">
            {entries.length} partidos · fase de grupos y eliminatorias proyectadas
          </p>
        </div>
        <SelectorFase value={phase} onChange={setPhase} />
      </div>
      <CalendarioMensual
        entries={entries}
        fixtureById={fixtureById}
        isLoading={isLoading}
        phase={phase}
      />
    </div>
  );
}
