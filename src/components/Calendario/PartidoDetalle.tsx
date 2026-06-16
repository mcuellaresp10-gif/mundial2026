"use client";

import { useFixtureDetail } from "@/hooks/usePartidos";
import { isFixtureLive, isWithinKickoffWindow } from "@/lib/liveRefresh";
import { Skeleton } from "@/components/ui/skeleton";
import type { Fixture } from "@/types";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { translateTeamName } from "@/utils/teamNames";
import {
  eventTypeIcon,
  translateEventDetail,
  translateFixtureStatType,
} from "@/utils/statLabels";
import { LineupSection } from "@/components/Calendario/LineupSection";

interface PartidoDetalleProps {
  fixtureId: number;
  fixture?: Fixture;
}

export function PartidoDetalle({ fixtureId, fixture }: PartidoDetalleProps) {
  const live = fixture
    ? isFixtureLive(fixture.fixture.status.short) ||
      isWithinKickoffWindow(fixture.fixture.date, fixture.fixture.status.short)
    : false;
  const { events, stats, lineups } = useFixtureDetail(fixtureId, live);
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
              <p className="font-semibold text-sm">{translateTeamName(teamStats.team.name)}</p>
              {teamStats.statistics.map((s) => (
                <div key={s.type} className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{translateFixtureStatType(s.type)}</span>
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
              <span>{eventTypeIcon(e.type)}</span>
              <span className="font-medium">{e.player.name}</span>
              <span className="text-muted-foreground">{translateEventDetail(e.detail)}</span>
              <span className="ml-auto text-xs">{translateTeamName(e.team.name)}</span>
            </div>
          ))}
          {!events.data?.length && (
            <p className="text-sm text-muted-foreground">Sin eventos registrados</p>
          )}
        </div>
      </TabsContent>

      <TabsContent value="lineups">
        <LineupSection lineups={lineups.data ?? []} />
      </TabsContent>
    </Tabs>
  );
}
