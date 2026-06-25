"use client";

import { ScoutingExplorer } from "@/components/Jugadores/Scouting";

export default function ScoutingPage() {
  return (
    <div className="space-y-6 animate-in fade-in">
      <div>
        <h1 className="text-3xl font-bold">Estadísticas jugadores</h1>
        <p className="text-muted-foreground mt-1">
          Mundial 2026 · radar, scatter y percentiles vs pares del torneo (≥90 min, misma posición)
        </p>
      </div>
      <ScoutingExplorer />
    </div>
  );
}
