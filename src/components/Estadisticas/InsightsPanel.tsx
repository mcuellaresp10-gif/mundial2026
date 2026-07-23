"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { ChartDatum, ComebackMatch, TopMatch } from "@/utils/tournamentAnalytics";

interface InsightsPanelProps {
  lateGoals: number;
  comebacks: ComebackMatch[];
  topMatches: TopMatch[];
  topCities: ChartDatum[];
  redCardsByConfederation: ChartDatum[];
  redCardsTitle?: string;
  earlyVsLateFirstGoal: { early: number; late: number; total: number };
  dynamicInsight: string;
  loading?: boolean;
}

export function InsightsPanel({
  lateGoals,
  comebacks,
  topMatches,
  topCities,
  redCardsByConfederation,
  redCardsTitle = "Tarjetas rojas por confederación",
  earlyVsLateFirstGoal,
  dynamicInsight,
  loading,
}: InsightsPanelProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-36 rounded-xl" />
        ))}
      </div>
    );
  }

  const earlyPct =
    earlyVsLateFirstGoal.total > 0
      ? Math.round((earlyVsLateFirstGoal.early / earlyVsLateFirstGoal.total) * 100)
      : 0;

  return (
    <div className="space-y-4">
      <Card className="bg-mundial-gold/5 border-mundial-gold/20">
        <CardContent className="p-4">
          <p className="text-sm">
            <span className="font-semibold text-mundial-gold">Insight: </span>
            {dynamicInsight}
          </p>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <InsightCard title="Índice de drama" value={lateGoals} suffix="goles 85'+">
          Goles marcados en el minuto 85 o posterior
        </InsightCard>

        <InsightCard title="Primer gol temprano" value={earlyPct} suffix="%">
          Partidos con primer gol antes del min 30
          {earlyVsLateFirstGoal.total > 0 && (
            <span className="block text-xs mt-1 opacity-70">
              {earlyVsLateFirstGoal.early} de {earlyVsLateFirstGoal.total} partidos
            </span>
          )}
        </InsightCard>

        <InsightCard title="Remontadas" value={comebacks.length} suffix="">
          Equipos que iban perdiendo al HT y empataron o ganaron
        </InsightCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Partidos más goleadores</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {topMatches.length === 0 ? (
              <p className="text-sm text-muted-foreground">Sin partidos finalizados aún</p>
            ) : (
              topMatches.map((m, i) => (
                <Link
                  key={m.fixture.fixture.id}
                  href={`/calendario/${m.fixture.fixture.id}`}
                  className="flex items-center gap-3 py-2 hover:bg-muted/50 -mx-2 px-2 rounded-lg transition-colors"
                >
                  <span className="text-mundial-gold font-bold font-mono w-5">{i + 1}</span>
                  <span className="text-sm flex-1 truncate">{m.label}</span>
                  <span className="text-sm font-mono font-bold text-mundial-gold">{m.totalGoals}⚽</span>
                </Link>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Ciudades más goleadoras</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {topCities.length === 0 ? (
              <p className="text-sm text-muted-foreground">Sin datos de sedes aún</p>
            ) : (
              topCities.map((c, i) => (
                <div key={c.label} className="flex items-center gap-3 py-1.5">
                  <span className="text-muted-foreground font-mono w-5">{i + 1}</span>
                  <span className="text-sm flex-1">{c.label}</span>
                  <span className="text-sm font-mono font-bold">{c.value} goles</span>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      {comebacks.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Remontadas del torneo</CardTitle>
          </CardHeader>
          <CardContent className="divide-y divide-border">
            {comebacks.slice(0, 5).map((c) => (
              <div key={c.fixture.fixture.id} className="py-2.5 first:pt-0 last:pb-0 text-sm">
                <span className="font-medium">{c.teamName}</span>
                <span className="text-muted-foreground">
                  {" "}— HT {c.htScore} → FT {c.ftScore}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {redCardsByConfederation.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">{redCardsTitle}</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-3">
            {redCardsByConfederation.map((r) => (
              <span
                key={r.label}
                className="text-sm px-3 py-1.5 rounded-full bg-muted"
              >
                {r.label}: <strong>{r.value}</strong>
              </span>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function InsightCard({
  title,
  value,
  suffix,
  children,
}: {
  title: string;
  value: number;
  suffix: string;
  children: ReactNode;
}) {
  return (
    <Card>
      <CardContent className="p-4">
        <p className="text-xs text-muted-foreground">{title}</p>
        <p className="text-3xl font-bold font-mono text-mundial-gold mt-1">
          {value}
          {suffix && <span className="text-base font-normal text-muted-foreground ml-1">{suffix}</span>}
        </p>
        <p className="text-xs text-muted-foreground mt-2">{children}</p>
      </CardContent>
    </Card>
  );
}
