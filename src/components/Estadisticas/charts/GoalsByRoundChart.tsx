"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { ChartCard, CHART_COLORS } from "./ChartCard";
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
      <ResponsiveContainer width="100%" height={260}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
          <XAxis dataKey="label" tick={{ fontSize: 11 }} />
          <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
          <Tooltip
            formatter={(value) => [value, "Goles"]}
            labelFormatter={(_, payload) => {
              const item = payload?.[0]?.payload as ChartDatum | undefined;
              return item?.roundLabel ?? item?.label ?? "";
            }}
          />
          <Bar dataKey="value" name="Goles" fill={CHART_COLORS.blue} radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}
