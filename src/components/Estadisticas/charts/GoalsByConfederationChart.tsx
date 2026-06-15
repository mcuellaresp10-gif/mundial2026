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
import { ChartCard } from "./ChartCard";
import { CONFEDERATION_COLORS, type Confederation } from "@/utils/confederations";
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
      <ResponsiveContainer width="100%" height={260}>
        <BarChart data={data} layout="vertical" margin={{ left: 8 }}>
          <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
          <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11 }} />
          <YAxis type="category" dataKey="label" width={120} tick={{ fontSize: 10 }} />
          <Tooltip />
          <Bar dataKey="value" name="Goles" radius={[0, 4, 4, 0]}>
            {data.map((entry, i) => (
              <Cell
                key={i}
                fill={CONFEDERATION_COLORS[(entry.confed as Confederation) ?? "UEFA"]}
              />
            ))}
          </Bar>
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
      <ResponsiveContainer width="100%" height={240}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
          <XAxis dataKey="label" tick={{ fontSize: 9 }} interval={0} angle={-20} textAnchor="end" height={60} />
          <YAxis tick={{ fontSize: 11 }} />
          <Tooltip formatter={(v) => [`${v} goles/partido`, "Promedio"]} />
          <Bar dataKey="value" name="Promedio" radius={[4, 4, 0, 0]}>
            {data.map((entry, i) => (
              <Cell
                key={i}
                fill={CONFEDERATION_COLORS[(entry.confed as Confederation) ?? "UEFA"]}
              />
            ))}
          </Bar>
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
      <ResponsiveContainer width="100%" height={260}>
        <BarChart data={data} layout="vertical" margin={{ left: 8 }}>
          <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
          <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11 }} />
          <YAxis type="category" dataKey="label" width={120} tick={{ fontSize: 10 }} />
          <Tooltip formatter={(v) => [v, "Puntos"]} />
          <Bar dataKey="value" name="Puntos" radius={[0, 4, 4, 0]}>
            {data.map((entry, i) => (
              <Cell
                key={i}
                fill={CONFEDERATION_COLORS[(entry.confed as Confederation) ?? "UEFA"]}
              />
            ))}
          </Bar>
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
      <ResponsiveContainer width="100%" height={260}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
          <XAxis dataKey="label" tick={{ fontSize: 9 }} interval={0} angle={-20} textAnchor="end" height={60} />
          <YAxis tick={{ fontSize: 11 }} domain={[0, 100]} unit="%" />
          <Tooltip
            formatter={(v, _n, item) => {
              const payload = item.payload as ChartDatum;
              return [`${v}% (${payload.points} de ${payload.maxPoints} pts posibles)`, "Eficiencia"];
            }}
          />
          <Bar dataKey="value" name="Eficiencia" radius={[4, 4, 0, 0]}>
            {data.map((entry, i) => (
              <Cell
                key={i}
                fill={CONFEDERATION_COLORS[(entry.confed as Confederation) ?? "UEFA"]}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}
