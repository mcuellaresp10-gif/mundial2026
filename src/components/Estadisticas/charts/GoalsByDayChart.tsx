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
import { ChartCard, CHART_COLORS } from "./ChartCard";
import type { ChartDatum } from "@/utils/tournamentAnalytics";

interface GoalsByDayChartProps {
  data: ChartDatum[];
  compact?: boolean;
}

export function GoalsByDayChart({ data, compact }: GoalsByDayChartProps) {
  return (
    <ChartCard
      title={compact ? "Goles por día" : "Goles por día del torneo"}
      description={compact ? "Últimos 7 días con partidos" : "Total de goles anotados cada jornada calendario"}
      empty={data.length === 0}
    >
      <ResponsiveContainer width="100%" height={compact ? 160 : 260}>
        <AreaChart data={data}>
          <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
          <XAxis dataKey="label" tick={{ fontSize: 11 }} />
          <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
          <Tooltip />
          <Area
            type="monotone"
            dataKey="value"
            name="Goles"
            stroke={CHART_COLORS.gold}
            fill={CHART_COLORS.gold}
            fillOpacity={0.25}
            strokeWidth={2}
          />
        </AreaChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}
