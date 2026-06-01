"use client";

import { use, useEffect, useState } from "react";
import { AnalisisPartido } from "@/components/Analisis/AnalisisPartido";
import { getFixtures } from "@/services/apiFootball";
import type { Fixture } from "@/types";
import { GridSkeleton } from "@/components/shared/Loading";
import { Card, CardContent } from "@/components/ui/card";

export default function PartidoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const fixtureId = Number(id);
  const [fixture, setFixture] = useState<Fixture | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getFixtures({ id: fixtureId })
      .then((fixtures) => setFixture(fixtures[0] ?? null))
      .catch(() => setFixture(null))
      .finally(() => setLoading(false));
  }, [fixtureId]);

  if (loading) return <GridSkeleton count={4} />;

  if (!fixture) {
    return (
      <Card>
        <CardContent className="p-8 text-center text-muted-foreground">
          Partido no encontrado
        </CardContent>
      </Card>
    );
  }

  const isNotStarted = fixture.fixture.status.short === "NS";
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
        <p className="text-muted-foreground mt-1">{fixture.league.round}</p>
      </div>

      <AnalisisPartido fixture={fixture} />
    </div>
  );
}
