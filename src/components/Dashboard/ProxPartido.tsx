"use client";

import Link from "next/link";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useNextFixture } from "@/hooks/usePartidos";
import { formatFixtureDate, formatStatus, getFixtureScore } from "@/utils/formatters";
import { isEffectivelyFinished, isPlausibleLiveFixture } from "@/lib/liveRefresh";
import { getTeamColors } from "@/utils/colors";
import { cn } from "@/lib/utils";

export function ProxPartido() {
  const { data: fixture, isLoading } = useNextFixture();

  if (isLoading) return <Skeleton className="h-52 w-full rounded-xl" />;
  if (!fixture) {
    return (
      <Card>
        <CardContent className="p-8 text-center text-muted-foreground">
          No hay partidos programados próximamente
        </CardContent>
      </Card>
    );
  }

  const live = isPlausibleLiveFixture(fixture);
  const finished = isEffectivelyFinished(fixture);
  const elapsed = fixture.fixture.status.elapsed;
  const statusLabel =
    live && elapsed != null
      ? `${formatStatus(fixture.fixture.status.short)} · ${elapsed}'`
      : formatStatus(fixture.fixture.status.short);

  const cardTitle = live
    ? "Partido en vivo"
    : finished
      ? "Último resultado"
      : "Próximo Partido";

  const isColombia =
    fixture.teams.home.name.toLowerCase().includes("colombia") ||
    fixture.teams.away.name.toLowerCase().includes("colombia");

  return (
    <Card
      className={cn(
        "overflow-hidden transition-all duration-300 hover:shadow-lg",
        isColombia && "border-colombia-yellow/50 bg-gradient-to-br from-colombia-blue/5 via-colombia-yellow/5 to-colombia-red/5",
        live && "border-mundial-red/60 ring-1 ring-mundial-red/30"
      )}
    >
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{cardTitle}</CardTitle>
          <Badge variant="outline">{formatFixtureDate(fixture.fixture.date)}</Badge>
        </div>
        <p className="text-sm text-muted-foreground">{fixture.league.round}</p>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-center gap-6 py-4">
          <div className="flex flex-col items-center gap-2 flex-1">
            <Image src={fixture.teams.home.logo} alt={fixture.teams.home.name} width={56} height={56} />
            <span className="font-bold text-center" style={{ color: getTeamColors(fixture.teams.home.name).primary }}>
              {fixture.teams.home.name}
            </span>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold font-mono">
              {getFixtureScore(fixture.goals.home, fixture.goals.away, fixture.fixture.status.short)}
            </p>
            <Badge
              className={cn("mt-1", live && "bg-mundial-red text-white animate-pulse border-0")}
            >
              {statusLabel}
            </Badge>
          </div>
          <div className="flex flex-col items-center gap-2 flex-1">
            <Image src={fixture.teams.away.logo} alt={fixture.teams.away.name} width={56} height={56} />
            <span className="font-bold text-center" style={{ color: getTeamColors(fixture.teams.away.name).primary }}>
              {fixture.teams.away.name}
            </span>
          </div>
        </div>
        <div className="flex items-center justify-between text-sm text-muted-foreground mt-2">
          <span>📍 {fixture.fixture.venue.city}</span>
          {fixture.fixture.referee && <span>⚖️ {fixture.fixture.referee}</span>}
        </div>
        <div className="mt-4 flex justify-center">
          <Button asChild>
            <Link href={`/partidos/${fixture.fixture.id}`}>Ver análisis</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
