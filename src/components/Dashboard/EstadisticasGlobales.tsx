"use client";

import Image from "next/image";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useEstadisticasAggregadas } from "@/hooks/useEstadisticasAggregadas";
import { useTeams } from "@/hooks/usePartidos";
import { useAllPlayers, extractTopScorers } from "@/hooks/useJugadores";
import { PLAYER_STAT_SEASON_LABEL } from "@/lib/utils";
import { useMemo } from "react";

export function EstadisticasGlobales() {
  const stats = useEstadisticasAggregadas();
  const { data: teams = [] } = useTeams();
  const teamIds = useMemo(() => teams.slice(0, 12).map((t) => t.id), [teams]);
  const { data: players = [], isLoading } = useAllPlayers(teamIds);

  const topScorers = useMemo(() => {
    const wc = extractTopScorers(players, "worldcup");
    return (wc.length > 0 ? wc : extractTopScorers(players, "national")).slice(0, 3);
  }, [players]);
  const scorersLabel = useMemo(() => {
    const wc = extractTopScorers(players, "worldcup");
    return wc.length > 0
      ? "Top 3 Goleadores (Mundial 2026)"
      : `Top 3 Goleadores (Selección · Temp. ${PLAYER_STAT_SEASON_LABEL})`;
  }, [players]);

  if (isLoading && teams.length === 0) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-32 rounded-xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          label={stats.liveCount > 0 ? "En vivo ahora" : "Partidos jugados"}
          value={stats.liveCount > 0 ? stats.liveCount : stats.playedCount}
        />
        <StatCard label="Partidos pendientes" value={stats.pendingCount} />
        <StatCard label="Goles totales" value={stats.totalGoals} highlight />
        <StatCard label="Promedio goles/partido" value={stats.avgGoalsPerMatch} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">{scorersLabel}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {topScorers.length === 0 ? (
              <p className="text-muted-foreground text-sm">Sin goles registrados aún</p>
            ) : (
              topScorers.map((s, i) => (
                <Link
                  key={s.playerId}
                  href={`/jugadores/${s.playerId}`}
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted transition-colors"
                >
                  <span className="text-2xl font-bold font-mono text-mundial-gold w-6">{i + 1}</span>
                  <Image src={s.photo} alt={s.name} width={40} height={40} className="rounded-full" />
                  <div className="flex-1">
                    <p className="font-medium">{s.name}</p>
                    <p className="text-xs text-muted-foreground">{s.team}</p>
                  </div>
                  <span className="text-xl font-bold font-mono text-mundial-gold">{s.goals}⚽</span>
                </Link>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Líderes de Grupo</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {stats.groupLeaders.length === 0 ? (
              <p className="text-muted-foreground text-sm">Tablas por definir</p>
            ) : (
              stats.groupLeaders.slice(0, 8).map((s) => (
                <Link
                  key={s.team.id}
                  href={`/selecciones/${s.team.id}`}
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted transition-colors"
                >
                  <Image src={s.team.logo} alt={s.team.name} width={28} height={28} />
                  <span className="flex-1 font-medium">{s.team.name}</span>
                  <BadgeGroup group={s.group} />
                  <span className="font-mono font-bold">{s.points} pts</span>
                </Link>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="bg-mundial-gold/5 border-mundial-gold/20">
        <CardContent className="p-4">
          <p className="text-sm">
            <span className="font-semibold text-mundial-gold">Dato del día: </span>
            {stats.datoDelDia}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

function StatCard({ label, value, highlight }: { label: string; value: number; highlight?: boolean }) {
  return (
    <Card>
      <CardContent className="p-4 text-center">
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className={`text-3xl font-bold font-mono mt-1 ${highlight ? "text-mundial-gold" : ""}`}>
          {value}
        </p>
      </CardContent>
    </Card>
  );
}

function BadgeGroup({ group }: { group: string }) {
  return (
    <span className="text-xs px-2 py-0.5 rounded bg-muted text-muted-foreground">{group}</span>
  );
}
