"use client";

import { NuevaEstrellaGame } from "@/components/Juegos/NuevaEstrella/NuevaEstrellaGame";

export default function NuevaEstrellaPage() {
  return (
    <div className="space-y-6 animate-in fade-in">
      <div>
        <h1 className="text-3xl font-bold">Nueva Estrella</h1>
        <p className="text-muted-foreground mt-1 max-w-2xl">
          Loop semanal con energía, fama y relaciones. Resolvé entrenamientos y
          momentos de partido con un minijuego de timing.
        </p>
      </div>
      <NuevaEstrellaGame />
    </div>
  );
}
