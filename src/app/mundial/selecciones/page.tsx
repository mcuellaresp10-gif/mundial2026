"use client";

import { GridSelecciones } from "@/components/Selecciones/GridSelecciones";
import { useTeams } from "@/hooks/usePartidos";

export default function MundialSeleccionesPage() {
  const { data: teams = [], isLoading } = useTeams();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Selecciones</h2>
        <p className="text-muted-foreground mt-1">
          {teams.length} selecciones del Mundial 2026
        </p>
      </div>
      <GridSelecciones
        teams={teams}
        isLoading={isLoading}
        baseHref="/mundial/selecciones"
        searchPlaceholder="Buscar selección por país..."
      />
    </div>
  );
}
