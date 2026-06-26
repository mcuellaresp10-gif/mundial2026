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
  CHART_HEIGHT,
  chartBarSeriesProps,
  chartGridProps,
  chartTooltipProps,
  chartYAxisProps,
} from "./chartTheme";
import type { ChartDatum } from "@/utils/tournamentAnalytics";

interface GoalsByRoundChartProps {
  data: ChartDatum[];
}

export function GoalsByRoundChart({ data }: GoalsByRoundChartProps) {
  return (
    <ChartCard
      title="Goles por jornada"
      description="Distribución de goles por fecha de la fase de grupos / ronda"
      empty={data.length === 0}
    >
      <ResponsiveContainer width="100%" height={CHART_HEIGHT}>
        <BarChart data={data}>
          <CartesianGrid {...chartGridProps} />
          <XAxis dataKey="label" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
          <YAxis {...chartYAxisProps} />
          <Tooltip
            {...chartTooltipProps}
            formatter={(value) => [value, "Goles"]}
            labelFormatter={(_, payload) => {
              const item = payload?.[0]?.payload as ChartDatum | undefined;
              return item?.roundLabel ?? item?.label ?? "";
            }}
          />
          <Bar dataKey="value" name="Goles" {...chartBarSeriesProps} />
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}
