"use client";

import { useState } from "react";
import { SelectorFase } from "@/components/Calendario/SelectorFase";
import { CalendarioGrid } from "@/components/Calendario/CalendarioGrid";
import { useFixtures, filterFixturesByPhase } from "@/hooks/usePartidos";
import type { PhaseFilter } from "@/types";

export default function CalendarioPage() {
  const [phase, setPhase] = useState<PhaseFilter>("Todos");
  const { data: fixtures = [], isLoading } = useFixtures();
  const filtered = filterFixturesByPhase(fixtures, phase);

  return (
    <div className="space-y-6 animate-in fade-in">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Calendario & Resultados</h1>
          <p className="text-muted-foreground mt-1">{filtered.length} partidos</p>
        </div>
        <SelectorFase value={phase} onChange={setPhase} />
      </div>
      <CalendarioGrid fixtures={filtered} isLoading={isLoading} />
    </div>
  );
}
