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

interface HomeAwayChartProps {
  data: ChartDatum[];
}

export function HomeAwayChart({ data }: HomeAwayChartProps) {
  return (
    <ChartCard title="Local vs visitante" description="Goles anotados en casa vs fuera" empty={data.length === 0}>
      <ResponsiveContainer width="100%" height={CHART_HEIGHT_SM}>
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

interface GoalsByPhaseChartProps {
  data: ChartDatum[];
}

export function GoalsByPhaseChart({ data }: GoalsByPhaseChartProps) {
  return (
    <ChartCard title="Goles por fase" description="Fase de grupos vs eliminatorias" empty={data.length === 0}>
      <ResponsiveContainer width="100%" height={CHART_HEIGHT_SM}>
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
