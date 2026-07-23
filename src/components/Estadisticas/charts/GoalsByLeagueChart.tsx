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
} from "./chartTheme";
import type { ChartDatum } from "@/utils/tournamentAnalytics";

export function GoalsByLeagueChart({ data }: { data: ChartDatum[] }) {
  return (
    <ChartCard
      title="Goles por liga / país"
      description="Ligas domésticas por competición · copas internacionales por país del club"
      empty={data.length === 0}
    >
      <ResponsiveContainer width="100%" height={CHART_HEIGHT}>
        <BarChart data={data} layout="vertical" margin={{ left: 8 }}>
          <CartesianGrid {...chartGridProps} />
          <XAxis
            type="number"
            allowDecimals={false}
            tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
          />
          <YAxis
            type="category"
            dataKey="label"
            width={110}
            tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
          />
          <Tooltip {...chartTooltipProps} />
          <Bar dataKey="value" name="Goles" {...chartBarSeriesProps} radius={[0, 4, 4, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}

export function LeagueEfficiencyChart({ data }: { data: ChartDatum[] }) {
  return (
    <ChartCard
      title="Ritmo goleador por liga / país"
      description="Promedio de goles por partido · copas internacionales por país del club"
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
          <Tooltip
            {...chartTooltipProps}
            formatter={(v) => [`${v} goles/partido`, "Promedio"]}
          />
          <Bar dataKey="value" name="Promedio" {...chartBarSeriesProps} />
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}

export function MatchesByLeagueChart({ data }: { data: ChartDatum[] }) {
  return (
    <ChartCard
      title="Partidos jugados por liga / país"
      description="Encuentros iniciados · copas internacionales por país del club"
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
          <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
          <Tooltip {...chartTooltipProps} />
          <Bar dataKey="value" name="Partidos" {...chartBarSeriesProps} />
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}
