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
  CHART_HEIGHT_MD,
  chartBarSeriesProps,
  chartGridProps,
  chartTooltipProps,
  chartXAxisProps,
  chartYAxisProps,
} from "./chartTheme";
import type { ChartDatum } from "@/utils/tournamentAnalytics";

interface GoalsByConfederationChartProps {
  data: ChartDatum[];
}

export function GoalsByConfederationChart({ data }: GoalsByConfederationChartProps) {
  return (
    <ChartCard
      title="Goles por confederación"
      description="Total de goles anotados por selecciones de cada confederación"
      empty={data.length === 0}
    >
      <ResponsiveContainer width="100%" height={CHART_HEIGHT}>
        <BarChart data={data} layout="vertical" margin={{ left: 8 }}>
          <CartesianGrid {...chartGridProps} />
          <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
          <YAxis type="category" dataKey="label" width={120} tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
          <Tooltip {...chartTooltipProps} />
          <Bar dataKey="value" name="Goles" {...chartBarSeriesProps} radius={[0, 4, 4, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}

interface ConfederacionEfficiencyChartProps {
  data: ChartDatum[];
}

export function ConfederacionEfficiencyChart({ data }: ConfederacionEfficiencyChartProps) {
  return (
    <ChartCard
      title="Eficiencia goleadora"
      description="Promedio de goles anotados por partido jugado (por confederación)"
      empty={data.length === 0}
    >
      <ResponsiveContainer width="100%" height={CHART_HEIGHT_MD}>
        <BarChart data={data}>
          <CartesianGrid {...chartGridProps} />
          <XAxis
            dataKey="label"
            tick={{ fontSize: 9, fill: "hsl(var(--muted-foreground))" }}
            interval={0}
            angle={-20}
            textAnchor="end"
            height={60}
          />
          <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
          <Tooltip {...chartTooltipProps} formatter={(v) => [`${v} goles/partido`, "Promedio"]} />
          <Bar dataKey="value" name="Promedio" {...chartBarSeriesProps} />
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}

interface PointsByConfederationChartProps {
  data: ChartDatum[];
}

export function PointsByConfederationChart({ data }: PointsByConfederationChartProps) {
  return (
    <ChartCard
      title="Puntos por confederación"
      description="Suma de puntos en fase de grupos de todas las selecciones por confederación"
      empty={data.length === 0}
      emptyMessage="Disponible cuando hay tablas de posiciones"
    >
      <ResponsiveContainer width="100%" height={CHART_HEIGHT}>
        <BarChart data={data} layout="vertical" margin={{ left: 8 }}>
          <CartesianGrid {...chartGridProps} />
          <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
          <YAxis type="category" dataKey="label" width={120} tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
          <Tooltip {...chartTooltipProps} formatter={(v) => [v, "Puntos"]} />
          <Bar dataKey="value" name="Puntos" {...chartBarSeriesProps} radius={[0, 4, 4, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}

interface ConfederationPointsEfficiencyChartProps {
  data: ChartDatum[];
}

export function ConfederationPointsEfficiencyChart({ data }: ConfederationPointsEfficiencyChartProps) {
  return (
    <ChartCard
      title="% eficiencia por confederación"
      description="Puntos obtenidos vs máximo posible (3 pts por partido)"
      empty={data.length === 0}
      emptyMessage="Disponible cuando hay partidos jugados en fase de grupos"
    >
      <ResponsiveContainer width="100%" height={CHART_HEIGHT}>
        <BarChart data={data}>
          <CartesianGrid {...chartGridProps} />
          <XAxis
            dataKey="label"
            tick={{ fontSize: 9, fill: "hsl(var(--muted-foreground))" }}
            interval={0}
            angle={-20}
            textAnchor="end"
            height={60}
          />
          <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} domain={[0, 100]} unit="%" />
          <Tooltip
            {...chartTooltipProps}
            formatter={(v, _n, item) => {
              const payload = item.payload as ChartDatum;
              return [`${v}% (${payload.points} de ${payload.maxPoints} pts posibles)`, "Eficiencia"];
            }}
          />
          <Bar dataKey="value" name="Eficiencia" {...chartBarSeriesProps} />
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}
