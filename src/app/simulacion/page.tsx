"use client";

import { MatchSimulationPanel } from "@/components/Estadisticas/MatchSimulationPanel";
import { LeagueSelector } from "@/components/shared/LeagueSelector";

export default function SimulacionPage() {
  return (
    <div className="space-y-8 animate-in fade-in">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Simulación de partido</h1>
          <p className="text-muted-foreground mt-1 max-w-2xl">
            Equipo A es local y B visitante. Monte Carlo con Poisson calibrado: localía dinámica,
            forma reciente, ritmo goleador de la liga, H2H (más peso si coincidió la cancha) y mix
            tabla + plantilla.
          </p>
        </div>
        <LeagueSelector variant="page" />
      </div>

      <MatchSimulationPanel />
    </div>
  );
}
