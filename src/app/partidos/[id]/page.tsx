"use client";

import { use } from "react";
import { AnalisisPartido } from "@/components/Analisis/AnalisisPartido";
import { useFixture } from "@/hooks/usePartidos";
import { GridSkeleton } from "@/components/shared/Loading";
import { Card, CardContent } from "@/components/ui/card";
import { isFixtureLive, isWithinKickoffWindow } from "@/lib/liveRefresh";
import { formatRoundLabel } from "@/utils/formatters";

export default function PartidoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const fixtureId = Number(id);
  const { data: fixture, isLoading } = useFixture(fixtureId);

  if (isLoading) return <GridSkeleton count={4} />;

  if (!fixture) {
    return (
      <Card>
        <CardContent className="p-8 text-center text-muted-foreground">
          Partido no encontrado
        </CardContent>
      </Card>
    );
  }

  const isNotStarted =
    fixture.fixture.status.short === "NS" &&
    !isFixtureLive(fixture.fixture.status.short) &&
    !isWithinKickoffWindow(fixture.fixture.date, fixture.fixture.status.short);
  const isScheduledFuture = new Date(fixture.fixture.date) > new Date();

  return (
    <div className="space-y-6 animate-in fade-in">
      {isNotStarted && isScheduledFuture && (
        <Card className="border-mundial-gold/50 bg-mundial-gold/5">
          <CardContent className="p-4 text-sm">
            ⚠️ <strong>Aviso de spoilers:</strong> Este partido aún no se ha jugado en tu zona horaria.
          </CardContent>
        </Card>
      )}

      <div>
        <h1 className="text-3xl font-bold">Análisis Táctico</h1>
        <p className="text-muted-foreground mt-1">{formatRoundLabel(fixture.league.round)}</p>
      </div>

      <AnalisisPartido fixture={fixture} />
    </div>
  );
}
