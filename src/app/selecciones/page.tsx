"use client";

import { GridSelecciones } from "@/components/Selecciones/GridSelecciones";
import { useTeams } from "@/hooks/usePartidos";

export default function SeleccionesPage() {
  const { data: teams = [], isLoading } = useTeams();

  return (
    <div className="space-y-6 animate-in fade-in">
      <div>
        <h1 className="text-3xl font-bold">Selecciones</h1>
        <p className="text-muted-foreground mt-1">{teams.length} selecciones en el torneo</p>
      </div>
      <GridSelecciones teams={teams} isLoading={isLoading} />
    </div>
  );
}
