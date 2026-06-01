"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";
import { useEstadisticasAggregadas } from "@/hooks/useEstadisticasAggregadas";

export function EstadisticasAgregadas() {
  const stats = useEstadisticasAggregadas();

  const lineData = stats.goalsByRound.map((g, i) => ({
    jornada: `J${i + 1}`,
    goles: g.goals,
    round: g.round,
  }));

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MiniCard label="Partidos jugados" value={stats.playedCount} />
        <MiniCard label="Goles totales" value={stats.totalGoals} highlight />
        <MiniCard label="Promedio goles/partido" value={stats.avgGoalsPerMatch} />
        <MiniCard label="Pendientes" value={stats.pendingCount} />
      </div>

      {lineData.length > 0 && (
        <Card>
          <CardHeader><CardTitle>Goles por Jornada</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={lineData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="jornada" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="goles" stroke="#FCD116" strokeWidth={2} dot={{ fill: "#FCD116" }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {lineData.length > 0 && (
        <Card>
          <CardHeader><CardTitle>Distribución de Goles</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={lineData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="jornada" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="goles" fill="#003DA5" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      <Card className="bg-mundial-gold/5">
        <CardContent className="p-4">
          <p className="text-sm">
            <span className="font-semibold">Dato destacado: </span>
            {stats.datoDelDia}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

function MiniCard({ label, value, highlight }: { label: string; value: number; highlight?: boolean }) {
  return (
    <Card>
      <CardContent className="p-4 text-center">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className={`text-2xl font-bold font-mono ${highlight ? "text-mundial-gold" : ""}`}>{value}</p>
      </CardContent>
    </Card>
  );
}
