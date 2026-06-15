"use client";

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { ChartCard, PIE_COLORS } from "./ChartCard";
import type { ChartDatum } from "@/utils/tournamentAnalytics";

interface MatchResultChartProps {
  data: ChartDatum[];
}

export function MatchResultChart({ data }: MatchResultChartProps) {
  return (
    <ChartCard title="Resultados de partidos" description="Victorias locales, empates, visitantes y 0-0" empty={data.length === 0}>
      <ResponsiveContainer width="100%" height={240}>
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="label"
            cx="50%"
            cy="50%"
            innerRadius={50}
            outerRadius={80}
            paddingAngle={2}
          >
            {data.map((_, i) => (
              <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}

interface ScoreDistributionChartProps {
  data: ChartDatum[];
}

export function ScoreDistributionChart({ data }: ScoreDistributionChartProps) {
  return (
    <ChartCard title="Marcadores totales" description="Cuántos partidos terminaron con X goles en total" empty={data.length === 0}>
      <ResponsiveContainer width="100%" height={220}>
        <PieChart>
          <Pie data={data} dataKey="value" nameKey="label" cx="50%" cy="50%" outerRadius={75}>
            {data.map((_, i) => (
              <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}
