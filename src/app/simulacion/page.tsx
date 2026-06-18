"use client";

import { MatchSimulationPanel } from "@/components/Estadisticas/MatchSimulationPanel";

export default function SimulacionPage() {
  return (
    <div className="space-y-8 animate-in fade-in">
      <div>
        <h1 className="text-3xl font-bold">Simulación de partido</h1>
        <p className="text-muted-foreground mt-1 max-w-2xl">
          Predicción de marcador mediante simulaciones Monte Carlo con modelo Poisson. Combina
          historial H2H, rendimiento actual en el mundial, estado de la plantilla y el ritmo
          goleador del torneo.
        </p>
      </div>

      <MatchSimulationPanel />
    </div>
  );
}
