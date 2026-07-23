"use client";

import {
  OnceIdealDisplay,
  OnceIdealJornadaDisplay,
  ArmarMiXI,
} from "@/components/OnceIdeal/OnceIdealDisplay";
import { LeagueSelector } from "@/components/shared/LeagueSelector";
import { useActiveLeague } from "@/hooks/useActiveLeague";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

export default function OnceIdealPage() {
  const { leagues, isMulti } = useActiveLeague();
  const label = isMulti
    ? leagues.map((l) => l.shortName).join(" · ")
    : leagues[0]?.shortName ?? "Américas";

  return (
    <div className="space-y-6 animate-in fade-in">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Once Ideal</h1>
          <p className="text-muted-foreground mt-1">
            {label} · temporada completa, jornada a jornada o tu propio XI
          </p>
        </div>
        <LeagueSelector variant="page" />
      </div>

      <Tabs defaultValue="torneo">
        <TabsList>
          <TabsTrigger value="torneo">Once de la temporada</TabsTrigger>
          <TabsTrigger value="jornada">Por jornada</TabsTrigger>
          <TabsTrigger value="mi-xi">Armar Mi XI</TabsTrigger>
        </TabsList>
        <TabsContent value="torneo">
          <OnceIdealDisplay />
        </TabsContent>
        <TabsContent value="jornada">
          <OnceIdealJornadaDisplay />
        </TabsContent>
        <TabsContent value="mi-xi">
          <ArmarMiXI />
        </TabsContent>
      </Tabs>
    </div>
  );
}
