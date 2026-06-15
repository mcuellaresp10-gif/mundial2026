"use client";

import { GruposSection } from "@/components/Estadisticas/GruposSection";

export default function GruposPage() {
  return (
    <div className="space-y-6 animate-in fade-in">
      <div>
        <h1 className="text-3xl font-bold">Grupos</h1>
        <p className="text-muted-foreground mt-1">
          Posiciones de la fase de grupos · Los 2 primeros de cada grupo clasifican
        </p>
      </div>
      <GruposSection />
    </div>
  );
}
