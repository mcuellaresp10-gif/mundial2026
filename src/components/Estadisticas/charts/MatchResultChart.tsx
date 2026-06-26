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
  chartBarSeriesProps,
  chartGridProps,
  chartTooltipProps,
  chartXAxisProps,
  chartYAxisProps,
} from "./chartTheme";
import type { ChartDatum } from "@/utils/tournamentAnalytics";

interface MatchResultChartProps {
  data: ChartDatum[];
}

export function MatchResultChart({ data }: MatchResultChartProps) {
  return (
    <ChartCard
      title="Resultados de partidos"
      description="Victorias locales, empates, visitantes y 0-0"
      empty={data.length === 0}
    >
      <ResponsiveContainer width="100%" height={CHART_HEIGHT_MD}>
        <BarChart data={data}>
          <CartesianGrid {...chartGridProps} />
          <XAxis dataKey="label" {...chartXAxisProps} />
          <YAxis {...chartYAxisProps} />
          <Tooltip {...chartTooltipProps} />
          <Bar dataKey="value" name="Partidos" {...chartBarSeriesProps} />
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}

interface ScoreDistributionChartProps {
  data: ChartDatum[];
}

export function ScoreDistributionChart({ data }: ScoreDistributionChartProps) {
  return (
    <ChartCard
      title="Marcadores totales"
      description="Cuántos partidos terminaron con X goles en total"
      empty={data.length === 0}
    >
      <ResponsiveContainer width="100%" height={CHART_HEIGHT_MD}>
        <BarChart data={data}>
          <CartesianGrid {...chartGridProps} />
          <XAxis dataKey="label" {...chartXAxisProps} />
          <YAxis {...chartYAxisProps} />
          <Tooltip {...chartTooltipProps} />
          <Bar dataKey="value" name="Partidos" {...chartBarSeriesProps} />
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}
