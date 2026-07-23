"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { ChartCard } from "./ChartCard";
import {
  CHART_HEIGHT,
  chartAreaSeriesProps,
  chartGridProps,
  chartTooltipProps,
  chartXAxisProps,
  chartYAxisProps,
} from "./chartTheme";
import type { ChartDatum } from "@/utils/tournamentAnalytics";

interface GoalsByDayChartProps {
  data: ChartDatum[];
  compact?: boolean;
}

export function GoalsByDayChart({ data, compact }: GoalsByDayChartProps) {
  return (
    <ChartCard
      title={compact ? "Goles por día" : "Goles por día"}
      description={compact ? "Últimos 7 días con partidos" : "Total de goles anotados cada jornada calendario"}
      empty={data.length === 0}
    >
      <ResponsiveContainer width="100%" height={compact ? 160 : CHART_HEIGHT}>
        <AreaChart data={data}>
          <CartesianGrid {...chartGridProps} />
          <XAxis dataKey="label" {...chartXAxisProps} />
          <YAxis {...chartYAxisProps} />
          <Tooltip {...chartTooltipProps} />
          <Area dataKey="value" name="Goles" {...chartAreaSeriesProps} />
        </AreaChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}
