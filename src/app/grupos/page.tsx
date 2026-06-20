"use client";

import { GruposSection } from "@/components/Estadisticas/GruposSection";
import { BestThirdsSection } from "@/components/Grupos/BestThirdsSection";
import { KnockoutBracketSection } from "@/components/Grupos/KnockoutBracketSection";

export default function GruposPage() {
  return (
    <div className="space-y-8 animate-in fade-in">
      <div>
        <h1 className="text-3xl font-bold">Grupos</h1>
        <p className="text-muted-foreground mt-1">
          Posiciones de la fase de grupos · Clasifican los 2 primeros de cada grupo y los 8 mejores terceros
        </p>
      </div>
      <GruposSection />
      <BestThirdsSection />
      <KnockoutBracketSection />
    </div>
  );
}
