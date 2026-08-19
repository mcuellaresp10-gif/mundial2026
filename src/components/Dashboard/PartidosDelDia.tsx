"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { PartidoCard } from "@/components/Calendario/PartidoCard";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useFixtures } from "@/hooks/usePartidos";
import { useActiveLeague } from "@/hooks/useActiveLeague";
import { getAmericasFixturesForDashboard } from "@/services/apiFootball";
import {
  getLeagueById,
  WORLD_CUP_LEAGUE,
} from "@/data/americasLeagues";
import {
  getDashboardFixtures,
  getLocalDayKey,
  isPlausibleLiveFixture,
  isWithinKickoffWindow,
  LIVE_REFRESH_MS,
  shouldPollFixtures,
} from "@/lib/liveRefresh";
import { formatDayHeading } from "@/utils/formatters";
import { cn, WORLD_CUP_LEAGUE_ID } from "@/lib/utils";
import type { Fixture } from "@/types";

function groupFixturesByLeague(fixtures: Fixture[]): {
  leagueId: number;
  label: string;
  fixtures: Fixture[];
}[] {
  const byLeague = new Map<number, Fixture[]>();
  for (const f of fixtures) {
    const id = f.league.id;
    if (id === WORLD_CUP_LEAGUE_ID) continue;
    const list = byLeague.get(id) ?? [];
    list.push(f);
    byLeague.set(id, list);
  }

  return [...byLeague.entries()]
    .map(([leagueId, list]) => {
      const meta = getLeagueById(leagueId);
      const label =
        meta?.shortName ??
        list[0]?.league.name ??
        `Liga ${leagueId}`;
      return {
        leagueId,
        label,
        fixtures: [...list].sort(
          (a, b) =>
            new Date(a.fixture.date).getTime() - new Date(b.fixture.date).getTime()
        ),
      };
    })
    .sort((a, b) => a.label.localeCompare(b.label, "es"));
}

/** Hub Américas: partidos del día de todas las ligas (sin Mundial), agrupados. */
function PartidosDelDiaAmericas() {
  const { leagueIds } = useActiveLeague();
  const selectedIds = useMemo(() => new Set(leagueIds), [leagueIds]);
  const dayKey = getLocalDayKey(new Date());

  const { data: allFixtures = [], isLoading } = useQuery({
    queryKey: ["fixtures", { scope: "americas-dashboard", day: dayKey }],
    queryFn: () => getAmericasFixturesForDashboard(),
    staleTime: LIVE_REFRESH_MS.fixtures,
    refetchInterval: (query) =>
      shouldPollFixtures(query.state.data) ? LIVE_REFRESH_MS.fixtures : false,
  });

  const filteredFixtures = useMemo(
    () => allFixtures.filter((f) => selectedIds.has(f.league.id)),
    [allFixtures, selectedIds]
  );

  const dayGroup = useMemo(
    () => getDashboardFixtures(filteredFixtures),
    [filteredFixtures]
  );

  const byLeague = useMemo(
    () => groupFixturesByLeague(dayGroup.fixtures),
    [dayGroup.fixtures]
  );

  const liveCount = useMemo(
    () =>
      dayGroup.fixtures.filter(
        (f) =>
          isPlausibleLiveFixture(f) ||
          isWithinKickoffWindow(f.fixture.date, f.fixture.status.short)
      ).length,
    [dayGroup.fixtures]
  );

  const dayLabel = useMemo(() => {
    const first = dayGroup.fixtures[0];
    if (!first) return null;
    return formatDayHeading(first.fixture.date);
  }, [dayGroup.fixtures]);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-64 rounded-lg" />
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <Skeleton className="h-48 rounded-2xl" />
          <Skeleton className="h-48 rounded-2xl" />
        </div>
      </div>
    );
  }

  if (byLeague.length === 0) {
    return (
      <div className="rounded-2xl border bg-muted/30 p-8 text-center text-muted-foreground">
        No hay partidos programados hoy en las ligas seleccionadas
      </div>
    );
  }

  return (
    <section className="@container/day space-y-6">
      <div
        className={cn(
          "flex flex-wrap items-center justify-between gap-3 rounded-2xl border px-4 py-4 @md/day:px-6",
          liveCount > 0 ? "border-mundial-red/40 bg-mundial-red/5" : "bg-muted/30"
        )}
      >
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-lg font-semibold">{dayGroup.title}</h2>
            {liveCount > 0 && (
              <Badge className="bg-mundial-red text-white border-0 animate-pulse">
                {liveCount} en vivo
              </Badge>
            )}
          </div>
          {dayLabel && (
            <p className="text-sm capitalize text-muted-foreground">{dayLabel}</p>
          )}
        </div>
        <Badge variant="outline" className="shrink-0">
          {dayGroup.fixtures.length} partido
          {dayGroup.fixtures.length === 1 ? "" : "s"} · {byLeague.length} liga
          {byLeague.length === 1 ? "" : "s"}
        </Badge>
      </div>

      {byLeague.map((group) => (
        <div key={group.leagueId} className="space-y-3">
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-mundial-gold/90">
              {group.label}
            </h3>
            <span className="text-xs text-muted-foreground">
              {group.fixtures.length} partido
              {group.fixtures.length === 1 ? "" : "s"}
            </span>
          </div>
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {group.fixtures.map((fixture) => (
              <PartidoCard key={fixture.fixture.id} fixture={fixture} />
            ))}
          </div>
        </div>
      ))}
    </section>
  );
}

/** Archivo Mundial: solo liga 1. */
function PartidosDelDiaMundial() {
  const { data: fixtures = [], isLoading } = useFixtures({
    league: WORLD_CUP_LEAGUE.id,
    season: WORLD_CUP_LEAGUE.defaultSeason,
    applyPhaseFilter: false,
  });

  const group = useMemo(() => getDashboardFixtures(fixtures), [fixtures]);

  const liveCount = useMemo(
    () =>
      group.fixtures.filter(
        (f) =>
          isPlausibleLiveFixture(f) ||
          isWithinKickoffWindow(f.fixture.date, f.fixture.status.short)
      ).length,
    [group.fixtures]
  );

  const dayLabel = useMemo(() => {
    const first = group.fixtures[0];
    if (!first) return null;
    return formatDayHeading(first.fixture.date);
  }, [group.fixtures]);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-64 rounded-lg" />
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <Skeleton className="h-48 rounded-2xl" />
          <Skeleton className="h-48 rounded-2xl" />
        </div>
      </div>
    );
  }

  if (group.fixtures.length === 0) {
    return (
      <div className="rounded-2xl border bg-muted/30 p-8 text-center text-muted-foreground">
        No hay partidos programados próximamente
      </div>
    );
  }

  return (
    <section className="@container/day space-y-4">
      <div
        className={cn(
          "flex flex-wrap items-center justify-between gap-3 rounded-2xl border px-4 py-4 @md/day:px-6",
          liveCount > 0 ? "border-mundial-red/40 bg-mundial-red/5" : "bg-muted/30"
        )}
      >
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-lg font-semibold">{group.title}</h2>
            {liveCount > 0 && (
              <Badge className="bg-mundial-red text-white border-0 animate-pulse">
                {liveCount} en vivo
              </Badge>
            )}
          </div>
          {dayLabel && (
            <p className="text-sm capitalize text-muted-foreground">{dayLabel}</p>
          )}
        </div>
        <Badge variant="outline" className="shrink-0">
          {group.fixtures.length} partido{group.fixtures.length === 1 ? "" : "s"}
        </Badge>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {group.fixtures.map((fixture) => (
          <PartidoCard key={fixture.fixture.id} fixture={fixture} />
        ))}
      </div>
    </section>
  );
}

export function PartidosDelDia() {
  const { isScoped } = useActiveLeague();
  return isScoped ? <PartidosDelDiaMundial /> : <PartidosDelDiaAmericas />;
}
