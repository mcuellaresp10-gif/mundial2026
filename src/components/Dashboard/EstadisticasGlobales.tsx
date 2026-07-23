"use client";

import Image from "next/image";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PlayerAvatar } from "@/components/shared/PlayerAvatar";
import { Skeleton } from "@/components/ui/skeleton";
import { useEstadisticasAggregadas } from "@/hooks/useEstadisticasAggregadas";
import { useLeagueTopScorers, useWorldCupTopScorers } from "@/hooks/useJugadores";
import { useActiveLeague } from "@/hooks/useActiveLeague";
import { olympicRank } from "@/utils/formatters";
import { GoalsByDayChart } from "@/components/Estadisticas/charts/GoalsByDayChart";
import { aggregateGoalsByDayLastN } from "@/utils/tournamentAnalytics";
import { useMemo } from "react";
import { formatRoundLabel } from "@/utils/formatters";
import { translateTeamName } from "@/utils/teamNames";

export function EstadisticasGlobales() {
  const { isScoped } = useActiveLeague();
  return isScoped ? <EstadisticasMundialArchive /> : <EstadisticasAmericas />;
}

function EstadisticasAmericas() {
  const stats = useEstadisticasAggregadas();
  const { league, leagues, isMulti } = useActiveLeague();
  const leagueScorers = useLeagueTopScorers(10);
  const topScorers = leagueScorers.data;
  const loadingScorers = leagueScorers.isLoading;
  const scopeLabel = isMulti
    ? leagues.map((l) => l.shortName).join(" · ")
    : league.shortName;
  const scorersTitle = `Top 10 Goleadores · ${scopeLabel}`;
  const goalsByDay = useMemo(
    () => aggregateGoalsByDayLastN(stats.fixtures ?? [], 7),
    [stats.fixtures]
  );

  return (
    <EstadisticasGlobalesView
      stats={stats}
      topScorers={topScorers}
      loadingScorers={loadingScorers}
      isLiveRefreshing={false}
      scorersTitle={scorersTitle}
      goalsByDay={goalsByDay}
      subtitle={`Resumen de ${scopeLabel} en tiempo real`}
      leadersTitle="Líderes de tabla"
      emptyScorersMessage="Sin goles registrados en las ligas seleccionadas aún"
      showGroupLeaders={stats.groupLeaders.length > 0}
    />
  );
}

function EstadisticasMundialArchive() {
  const stats = useEstadisticasAggregadas();
  const wcScorers = useWorldCupTopScorers(10);
  const topScorers = wcScorers.scorers;
  const loadingScorers = wcScorers.isLoading;
  const isLiveRefreshing = wcScorers.isLiveRefreshing;
  const goalsByDay = useMemo(
    () => aggregateGoalsByDayLastN(stats.fixtures ?? [], 7),
    [stats.fixtures]
  );

  return (
    <EstadisticasGlobalesView
      stats={stats}
      topScorers={topScorers}
      loadingScorers={loadingScorers}
      isLiveRefreshing={isLiveRefreshing}
      scorersTitle="Top 10 Goleadores del Mundial 2026"
      goalsByDay={goalsByDay}
      subtitle="Resumen de Mundial 2026 en tiempo real"
      leadersTitle="Líderes de Grupo"
      emptyScorersMessage="Sin goles registrados en el torneo aún"
      showGroupLeaders
    />
  );
}

function EstadisticasGlobalesView({
  stats,
  topScorers,
  loadingScorers,
  isLiveRefreshing,
  scorersTitle,
  goalsByDay,
  subtitle,
  leadersTitle,
  emptyScorersMessage,
  showGroupLeaders,
}: {
  stats: ReturnType<typeof useEstadisticasAggregadas>;
  topScorers: ReturnType<typeof useLeagueTopScorers>["data"];
  loadingScorers: boolean;
  isLiveRefreshing: boolean;
  scorersTitle: string;
  goalsByDay: ReturnType<typeof aggregateGoalsByDayLastN>;
  subtitle: string;
  leadersTitle: string;
  emptyScorersMessage: string;
  showGroupLeaders: boolean;
}) {
  if (loadingScorers && topScorers.length === 0) {
    return (
      <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,140px),1fr))] gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-28 rounded-xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="@container/stats space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-1">Estadísticas globales</h2>
        <p className="text-sm text-muted-foreground">{subtitle}</p>
      </div>

      {/* Auto-fit stat grid */}
      <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,140px),1fr))] gap-3 @md/stats:gap-4">
        <StatCard
          label={stats.liveCount > 0 ? "En vivo ahora" : "Partidos jugados"}
          value={stats.liveCount > 0 ? stats.liveCount : stats.playedCount}
          live={stats.liveCount > 0}
        />
        <StatCard label="Partidos pendientes" value={stats.pendingCount} />
        <StatCard label="Goles totales" value={stats.totalGoals} highlight />
        <StatCard label="Promedio goles/partido" value={stats.avgGoalsPerMatch} />
      </div>

      {goalsByDay.length > 0 && (
        <GoalsByDayChart data={goalsByDay} compact />
      )}

      {/* Two-column section — container-query responsive */}
      <div className="grid grid-cols-1 gap-4 @lg/stats:grid-cols-2 @lg/stats:gap-6 min-w-0">
        <Card className="rounded-2xl break-inside-avoid min-w-0">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between gap-2">
              <CardTitle className="text-lg">{scorersTitle}</CardTitle>
              {isLiveRefreshing && (
                <span className="text-[10px] font-medium uppercase tracking-wide text-mundial-red shrink-0">
                  En vivo
                </span>
              )}
            </div>
          </CardHeader>
          <CardContent className="divide-y divide-border max-h-[28rem] overflow-y-auto scrollbar-thin">
            {topScorers.length === 0 ? (
              <p className="text-muted-foreground text-sm py-2">
                {emptyScorersMessage}
              </p>
            ) : (
              topScorers.map((s, i) => (
                <Link
                  key={s.playerId}
                  href={`/jugadores/${s.playerId}`}
                  className="flex min-w-0 items-center gap-3 py-3 first:pt-0 last:pb-0 hover:bg-muted/50 -mx-2 px-2 rounded-lg transition-colors"
                >
                  <span className="text-lg font-bold font-mono text-mundial-gold w-6 shrink-0 tabular-nums">
                    {olympicRank(topScorers, s.goals, "goals")}
                  </span>
                  <div className="relative aspect-square w-10 shrink-0 overflow-hidden rounded-full bg-muted">
                    <PlayerAvatar
                      photo={s.photo}
                      teamLogo={s.teamLogo}
                      alt={s.name}
                      size={40}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{s.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{s.team}</p>
                  </div>
                  <div className="shrink-0 text-right font-mono tabular-nums">
                    <span className="text-xl font-bold text-mundial-gold">{s.goals}⚽</span>
                    {s.assists > 0 && (
                      <p className="text-[11px] text-muted-foreground">{s.assists} asist.</p>
                    )}
                  </div>
                </Link>
              ))
            )}
          </CardContent>
        </Card>

        {showGroupLeaders && (
          <Card className="rounded-2xl break-inside-avoid min-w-0">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">{leadersTitle}</CardTitle>
            </CardHeader>
            <CardContent className="divide-y divide-border max-h-[28rem] overflow-y-auto scrollbar-thin">
              {stats.groupLeaders.length === 0 ? (
                <p className="text-muted-foreground text-sm py-2">Tablas por definir</p>
              ) : (
                stats.groupLeaders.map((s) => (
                  <Link
                    key={s.team.id}
                    href={`/equipos/${s.team.id}`}
                    className="flex min-w-0 items-center gap-3 py-2.5 first:pt-0 last:pb-0 hover:bg-muted/50 -mx-2 px-2 rounded-lg transition-colors"
                  >
                    <div className="relative aspect-square w-7 shrink-0">
                      <Image src={s.team.logo} alt={s.team.name} fill className="object-contain" sizes="28px" />
                    </div>
                    <span className="flex-1 font-medium truncate min-w-0">{translateTeamName(s.team.name)}</span>
                    <BadgeGroup group={s.group} />
                    <span className="font-mono font-bold shrink-0 tabular-nums">{s.points} pts</span>
                  </Link>
                ))
              )}
            </CardContent>
          </Card>
        )}
      </div>

      <Card className="rounded-2xl bg-mundial-gold/5 border-mundial-gold/20 -mx-0">
        <CardContent className="p-4 @md/stats:p-5">
          <p className="text-sm leading-relaxed">
            <span className="font-semibold text-mundial-gold">Dato del día: </span>
            {stats.datoDelDia}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

function StatCard({
  label,
  value,
  highlight,
  live,
}: {
  label: string;
  value: number;
  highlight?: boolean;
  live?: boolean;
}) {
  return (
    <Card
      className={`rounded-xl overflow-hidden ${live ? "border-mundial-red/40 ring-1 ring-mundial-red/20" : ""}`}
    >
      <CardContent className="flex flex-col items-center justify-center p-4 text-center min-h-[5.5rem]">
        <p className="text-xs @md/stats:text-sm text-muted-foreground leading-tight">{label}</p>
        <p
          className={`text-2xl @md/stats:text-3xl font-bold font-mono mt-1 tabular-nums ${
            highlight ? "text-mundial-gold" : live ? "text-mundial-red" : ""
          }`}
        >
          {value}
        </p>
      </CardContent>
    </Card>
  );
}

function BadgeGroup({ group }: { group: string }) {
  return (
    <span className="text-xs px-2 py-0.5 rounded bg-muted text-muted-foreground shrink-0">
      {formatRoundLabel(group)}
    </span>
  );
}
