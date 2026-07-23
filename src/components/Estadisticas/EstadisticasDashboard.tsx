"use client";

import { Card, CardContent } from "@/components/ui/card";
import { useTournamentAnalytics } from "@/hooks/useTournamentAnalytics";
import { GoalsByDayChart } from "./charts/GoalsByDayChart";
import { GoalsByRoundChart } from "./charts/GoalsByRoundChart";
import { MatchResultChart, ScoreDistributionChart } from "./charts/MatchResultChart";
import {
  GoalsByConfederationChart,
  ConfederacionEfficiencyChart,
  PointsByConfederationChart,
  ConfederationPointsEfficiencyChart,
} from "./charts/GoalsByConfederationChart";
import {
  GoalsByLeagueChart,
  LeagueEfficiencyChart,
  MatchesByLeagueChart,
} from "./charts/GoalsByLeagueChart";
import { HomeAwayChart, GoalsByPhaseChart } from "./charts/HomeAwayChart";
import {
  GoalsByPositionChart,
  GoalsByMinuteChart,
  GoalTypeChart,
} from "./charts/GoalsByPositionChart";
import { InsightsPanel } from "./InsightsPanel";

function MiniCard({
  label,
  value,
  highlight,
}: {
  label: string;
  value: number;
  highlight?: boolean;
}) {
  return (
    <Card>
      <CardContent className="p-4 text-center">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p
          className={`text-2xl font-bold font-mono ${highlight ? "text-mundial-gold" : ""}`}
        >
          {value}
        </p>
      </CardContent>
    </Card>
  );
}

export function EstadisticasDashboard() {
  const stats = useTournamentAnalytics(true);
  const isWc = stats.isWorldCupScope;

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MiniCard
          label={stats.liveCount > 0 ? "En vivo ahora" : "Partidos jugados"}
          value={stats.liveCount > 0 ? stats.liveCount : stats.playedCount}
        />
        <MiniCard label="Goles totales" value={stats.totalGoals} highlight />
        <MiniCard label="Promedio goles/partido" value={stats.avgGoalsPerMatch} />
        <MiniCard label="Pendientes" value={stats.pendingCount} />
      </div>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold">
          {isWc ? "Ritmo del torneo" : "Ritmo de la competición"}
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <GoalsByDayChart data={stats.goalsByDay} />
          <GoalsByRoundChart data={stats.goalsByRound} />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <MatchResultChart data={stats.matchResults} />
          <ScoreDistributionChart data={stats.scoreDistribution} />
        </div>
      </section>

      {isWc ? (
        <section className="space-y-4">
          <h2 className="text-lg font-semibold">Geografía y confederaciones</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <GoalsByConfederationChart data={stats.goalsByConfederation} />
            <ConfederacionEfficiencyChart data={stats.confederationEfficiency} />
            <PointsByConfederationChart data={stats.pointsByConfederation} />
            <ConfederationPointsEfficiencyChart
              data={stats.pointsEfficiencyByConfederation}
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <HomeAwayChart data={stats.homeAwayGoals} />
            <GoalsByPhaseChart data={stats.goalsByPhase} />
          </div>
        </section>
      ) : (
        <section className="space-y-4">
          <h2 className="text-lg font-semibold">Por liga / copa</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <GoalsByLeagueChart data={stats.goalsByLeague} />
            <LeagueEfficiencyChart data={stats.leagueEfficiency} />
            <MatchesByLeagueChart data={stats.matchesByLeague} />
            <HomeAwayChart data={stats.homeAwayGoals} />
          </div>
        </section>
      )}

      <section className="space-y-4">
        <h2 className="text-lg font-semibold">Quién anota y cuándo</h2>
        {!stats.hasFinished && (
          <p className="text-sm text-muted-foreground">
            Los análisis de minuto, posición y tipo de gol aparecerán cuando haya partidos
            finalizados.
          </p>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <GoalsByPositionChart
            data={stats.goalsByPosition}
            loading={stats.eventsLoading && stats.hasFinished}
          />
          <GoalsByMinuteChart
            data={stats.goalsByMinute}
            loading={stats.eventsLoading && stats.hasFinished}
          />
          <GoalTypeChart
            data={stats.goalTypes}
            loading={stats.eventsLoading && stats.hasFinished}
          />
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold">Análisis destacados</h2>
        <InsightsPanel
          lateGoals={stats.lateGoals}
          comebacks={stats.comebacks}
          topMatches={stats.topMatches}
          topCities={stats.topCities}
          redCardsByConfederation={
            isWc ? stats.redCardsByConfederation : stats.redCardsByLeague
          }
          redCardsTitle={
            isWc ? "Tarjetas rojas por confederación" : "Tarjetas rojas por liga / país"
          }
          earlyVsLateFirstGoal={stats.earlyVsLateFirstGoal}
          dynamicInsight={stats.dynamicInsight}
          loading={stats.eventsLoading && stats.hasFinished}
        />
      </section>
    </div>
  );
}
