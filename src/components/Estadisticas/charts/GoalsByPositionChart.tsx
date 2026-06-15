"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { ChartCard, CHART_COLORS, PIE_COLORS } from "./ChartCard";
import type { ChartDatum } from "@/utils/tournamentAnalytics";

const POSITION_COLORS: Record<string, string> = {
  G: "#9333ea",
  D: CHART_COLORS.blue,
  M: CHART_COLORS.green,
  F: CHART_COLORS.gold,
};

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
      <ResponsiveContainer width="100%" height={240}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
          <XAxis dataKey="label" tick={{ fontSize: 11 }} />
          <YAxis allowDecimals={false} />
          <Tooltip />
          <Bar dataKey="value" name="Goles" radius={[4, 4, 0, 0]}>
            {data.map((entry, i) => (
              <Cell key={i} fill={POSITION_COLORS[String(entry.pos)] ?? CHART_COLORS.blue} />
            ))}
          </Bar>
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
      <ResponsiveContainer width="100%" height={240}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
          <XAxis dataKey="label" tick={{ fontSize: 10 }} />
          <YAxis allowDecimals={false} />
          <Tooltip />
          <Bar dataKey="value" name="Goles" fill={CHART_COLORS.red} radius={[4, 4, 0, 0]} />
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
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
          <XAxis dataKey="label" tick={{ fontSize: 10 }} />
          <YAxis allowDecimals={false} />
          <Tooltip />
          <Bar dataKey="value" name="Goles" radius={[4, 4, 0, 0]}>
            {data.map((_, i) => (
              <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}
