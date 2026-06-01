"use client";

import { useMemo } from "react";
import { ComparativaSelecciones } from "@/components/Comparativas/ComparativaSelecciones";
import { ComparativaJugadores } from "@/components/Comparativas/ComparativaJugadores";
import { useTeams, useStandings } from "@/hooks/usePartidos";
import { useAllPlayers } from "@/hooks/useJugadores";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

export default function ComparativasPage() {
  const { data: teams = [] } = useTeams();
  const { data: standingsRaw = [] } = useStandings();
  const teamIds = useMemo(() => teams.slice(0, 12).map((t) => t.id), [teams]);
  const { data: players = [] } = useAllPlayers(teamIds);

  const allStandings = useMemo(() => {
    const result = [];
    for (const sg of standingsRaw) {
      for (const group of sg.league.standings) {
        result.push(...group);
      }
    }
    return result;
  }, [standingsRaw]);

  return (
    <div className="space-y-6 animate-in fade-in">
      <div>
        <h1 className="text-3xl font-bold">Comparativas</h1>
        <p className="text-muted-foreground mt-1">Selección vs selección · Jugador vs jugador</p>
      </div>

      <Tabs defaultValue="teams">
        <TabsList>
          <TabsTrigger value="teams">Selecciones</TabsTrigger>
          <TabsTrigger value="players">Jugadores</TabsTrigger>
        </TabsList>
        <TabsContent value="teams">
          <ComparativaSelecciones teams={teams} standings={allStandings} />
        </TabsContent>
        <TabsContent value="players">
          <ComparativaJugadores players={players} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
