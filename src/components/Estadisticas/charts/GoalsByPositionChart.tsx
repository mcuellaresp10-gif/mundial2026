"use client";

import {
  Bar,
  BarChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { ChartCard } from "./ChartCard";
import {
  CHART_HEIGHT_MD,
  CHART_HEIGHT_SM,
  chartBarSeriesProps,
  chartGridProps,
  chartTooltipProps,
  chartXAxisProps,
  chartYAxisProps,
} from "./chartTheme";
import type { ChartDatum } from "@/utils/tournamentAnalytics";

interface GoalsByPositionChartProps {
  data: ChartDatum[];
  loading?: boolean;
}

export function GoalsByPositionChart({ data, loading }: GoalsByPositionChartProps) {
  return (
    <ChartCard
      title="Goles por posición del goleador"
      description="Porteros, defensas, mediocampistas y delanteros"
      loading={loading}
      empty={!loading && data.length === 0}
      emptyMessage="Disponible cuando hay partidos finalizados con alineaciones"
    >
      <ResponsiveContainer width="100%" height={CHART_HEIGHT_MD}>
        <BarChart data={data}>
          <CartesianGrid {...chartGridProps} />
          <XAxis dataKey="label" {...chartXAxisProps} />
          <YAxis {...chartYAxisProps} />
          <Tooltip {...chartTooltipProps} />
          <Bar dataKey="value" name="Goles" {...chartBarSeriesProps} />
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}

interface GoalsByMinuteChartProps {
  data: ChartDatum[];
  loading?: boolean;
}

export function GoalsByMinuteChart({ data, loading }: GoalsByMinuteChartProps) {
  return (
    <ChartCard
      title="Goles por tramo de minuto"
      description="En qué momentos del partido caen más goles"
      loading={loading}
      empty={!loading && data.length === 0}
      emptyMessage="Disponible cuando hay partidos finalizados"
    >
      <ResponsiveContainer width="100%" height={CHART_HEIGHT_MD}>
        <BarChart data={data}>
          <CartesianGrid {...chartGridProps} />
          <XAxis dataKey="label" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
          <YAxis {...chartYAxisProps} />
          <Tooltip {...chartTooltipProps} />
          <Bar dataKey="value" name="Goles" {...chartBarSeriesProps} />
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}

interface GoalTypeChartProps {
  data: ChartDatum[];
  loading?: boolean;
}

export function GoalTypeChart({ data, loading }: GoalTypeChartProps) {
  return (
    <ChartCard
      title="Tipo de gol"
      description="Juego normal, penalti y autogol"
      loading={loading}
      empty={!loading && data.length === 0}
      emptyMessage="Disponible cuando hay partidos finalizados"
    >
      <ResponsiveContainer width="100%" height={CHART_HEIGHT_SM}>
        <BarChart data={data}>
          <CartesianGrid {...chartGridProps} />
          <XAxis dataKey="label" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
          <YAxis {...chartYAxisProps} />
          <Tooltip {...chartTooltipProps} />
          <Bar dataKey="value" name="Goles" {...chartBarSeriesProps} />
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}
