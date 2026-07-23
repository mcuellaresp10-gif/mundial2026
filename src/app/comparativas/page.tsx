"use client";

import { ComparativaSelecciones } from "@/components/Comparativas/ComparativaSelecciones";
import { ComparativaJugadores } from "@/components/Comparativas/ComparativaJugadores";
import { LeagueSelector } from "@/components/shared/LeagueSelector";
import { useTeams, useStandings } from "@/hooks/usePartidos";
import { useMemo } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

export default function ComparativasPage() {
  const { data: teams = [] } = useTeams();
  const { data: standingsRaw = [] } = useStandings();

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
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Comparativas</h1>
          <p className="text-muted-foreground mt-1">
            Equipo vs equipo · Jugador vs jugador (liga activa)
          </p>
        </div>
        <LeagueSelector variant="page" />
      </div>

      <Tabs defaultValue="teams">
        <TabsList>
          <TabsTrigger value="teams">Equipos</TabsTrigger>
          <TabsTrigger value="players">Jugadores</TabsTrigger>
        </TabsList>
        <TabsContent value="teams">
          <ComparativaSelecciones teams={teams} standings={allStandings} />
        </TabsContent>
        <TabsContent value="players">
          <ComparativaJugadores />
        </TabsContent>
      </Tabs>
    </div>
  );
}
