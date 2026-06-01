"use client";

import { useFixtureDetail } from "@/hooks/usePartidos";
import { Skeleton } from "@/components/ui/skeleton";
import type { Fixture } from "@/types";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

interface PartidoDetalleProps {
  fixtureId: number;
  fixture?: Fixture;
}

export function PartidoDetalle({ fixtureId }: PartidoDetalleProps) {
  const { events, stats, lineups } = useFixtureDetail(fixtureId);
  const isLoading = events.isLoading || stats.isLoading || lineups.isLoading;

  if (isLoading) return <Skeleton className="h-48 w-full" />;

  return (
    <Tabs defaultValue="stats">
      <TabsList>
        <TabsTrigger value="stats">Estadísticas</TabsTrigger>
        <TabsTrigger value="events">Eventos</TabsTrigger>
        <TabsTrigger value="lineups">Alineaciones</TabsTrigger>
      </TabsList>

      <TabsContent value="stats">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {stats.data?.map((teamStats) => (
            <div key={teamStats.team.id} className="space-y-2">
              <p className="font-semibold text-sm">{teamStats.team.name}</p>
              {teamStats.statistics.map((s) => (
                <div key={s.type} className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{s.type}</span>
                  <span className="font-mono font-medium">{s.value ?? "-"}</span>
                </div>
              ))}
            </div>
          ))}
          {!stats.data?.length && (
            <p className="text-sm text-muted-foreground col-span-2">Estadísticas no disponibles</p>
          )}
        </div>
      </TabsContent>

      <TabsContent value="events">
        <div className="space-y-2">
          {events.data?.map((e, i) => (
            <div key={i} className="flex items-center gap-3 text-sm p-2 rounded bg-muted/50">
              <span className="font-mono font-bold w-8">{e.time.elapsed}&apos;</span>
              <span>{e.type === "Goal" ? "⚽" : e.type === "subst" ? "🔄" : "🟨"}</span>
              <span className="font-medium">{e.player.name}</span>
              <span className="text-muted-foreground">{e.detail}</span>
              <span className="ml-auto text-xs">{e.team.name}</span>
            </div>
          ))}
          {!events.data?.length && (
            <p className="text-sm text-muted-foreground">Sin eventos registrados</p>
          )}
        </div>
      </TabsContent>

      <TabsContent value="lineups">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {lineups.data?.map((lu) => (
            <div key={lu.team.id}>
              <p className="font-semibold mb-2">{lu.team.name} — {lu.formation}</p>
              <p className="text-xs text-muted-foreground mb-2">DT: {lu.coach.name}</p>
              <div className="space-y-1">
                {lu.startXI.map((p) => (
                  <div key={p.player.id} className="flex items-center gap-2 text-sm">
                    <span className="font-mono w-6 text-muted-foreground">{p.player.number}</span>
                    <span>{p.player.name}</span>
                    <span className="text-xs text-muted-foreground ml-auto">{p.player.pos}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
          {!lineups.data?.length && (
            <p className="text-sm text-muted-foreground col-span-2">Alineaciones no confirmadas</p>
          )}
        </div>
      </TabsContent>
    </Tabs>
  );
}
