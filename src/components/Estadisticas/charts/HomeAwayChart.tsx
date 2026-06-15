"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { ChartCard, CHART_COLORS } from "./ChartCard";
import type { ChartDatum } from "@/utils/tournamentAnalytics";

interface HomeAwayChartProps {
  data: ChartDatum[];
}

export function HomeAwayChart({ data }: HomeAwayChartProps) {
  return (
    <ChartCard title="Local vs visitante" description="Goles anotados en casa vs fuera" empty={data.length === 0}>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
          <XAxis dataKey="label" tick={{ fontSize: 11 }} />
          <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
          <Tooltip />
          <Legend />
          <Bar dataKey="value" name="Goles" fill={CHART_COLORS.blue} radius={[4, 4, 0, 0]} />
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
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
          <XAxis dataKey="label" tick={{ fontSize: 11 }} />
          <YAxis allowDecimals={false} />
          <Tooltip />
          <Bar dataKey="value" name="Goles" fill={CHART_COLORS.gold} radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}
