"use client";

import { useMemo, useState } from "react";
import { GridJugadores } from "@/components/Jugadores/GridJugadores";
import { useTeams } from "@/hooks/usePartidos";
import { useAllPlayers } from "@/hooks/useJugadores";
import { Select } from "@/components/ui/select";

export default function JugadoresPage() {
  const { data: teams = [], isLoading: teamsLoading } = useTeams();
  const [loadScope, setLoadScope] = useState<"colombia" | "all">("colombia");

  const teamIds = useMemo(() => {
    if (loadScope === "colombia") {
      const col = teams.find((t) => t.name.toLowerCase().includes("colombia"));
      return col ? [col.id] : [];
    }
    return teams.map((t) => t.id);
  }, [teams, loadScope]);

  const { data: players = [], isLoading: playersLoading } = useAllPlayers(teamIds);

  return (
    <div className="space-y-6 animate-in fade-in">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Jugadores Convocados</h1>
          <p className="text-muted-foreground mt-1">
            {players.length} jugadores cargados · Fuente: convocatorias oficiales (API squads)
          </p>
        </div>
        <Select value={loadScope} onChange={(e) => setLoadScope(e.target.value as "colombia" | "all")}>
          <option value="colombia">Solo Colombia</option>
          <option value="all">Todas las selecciones (48)</option>
        </Select>
      </div>
      <GridJugadores
        players={players}
        teams={teams}
        isLoading={teamsLoading || playersLoading}
      />
    </div>
  );
}
