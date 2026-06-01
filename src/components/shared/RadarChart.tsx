"use client";

import {
  Radar,
  RadarChart as RechartsRadar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Legend,
} from "recharts";
import type { RadarStats } from "@/types";

interface RadarChartProps {
  data: RadarStats;
  compare?: RadarStats;
  labelA?: string;
  labelB?: string;
  height?: number;
}

export function RadarChart({
  data,
  compare,
  labelA = "Jugador",
  labelB = "Promedio",
  height = 300,
}: RadarChartProps) {
  const chartData = [
    { stat: "Velocidad", A: data.velocidad, B: compare?.velocidad },
    { stat: "Defensa", A: data.defensa, B: compare?.defensa },
    { stat: "Pase", A: data.pase, B: compare?.pase },
    { stat: "Dribbling", A: data.dribbling, B: compare?.dribbling },
    { stat: "Tiro", A: data.tiro, B: compare?.tiro },
    { stat: "Físico", A: data.fisico, B: compare?.fisico },
  ];

  return (
    <ResponsiveContainer width="100%" height={height}>
      <RechartsRadar data={chartData}>
        <PolarGrid />
        <PolarAngleAxis dataKey="stat" tick={{ fontSize: 12 }} />
        <PolarRadiusAxis angle={30} domain={[0, 10]} tick={{ fontSize: 10 }} />
        <Radar name={labelA} dataKey="A" stroke="#003DA5" fill="#003DA5" fillOpacity={0.4} />
        {compare && (
          <Radar name={labelB} dataKey="B" stroke="#EF4444" fill="#EF4444" fillOpacity={0.2} />
        )}
        <Legend />
      </RechartsRadar>
    </ResponsiveContainer>
  );
}

export function ComparativaRadar({
  dataA,
  dataB,
  labelA,
  labelB,
  height = 320,
}: {
  dataA: RadarStats;
  dataB: RadarStats;
  labelA: string;
  labelB: string;
  height?: number;
}) {
  return <RadarChart data={dataA} compare={dataB} labelA={labelA} labelB={labelB} height={height} />;
}

export function TeamRadarChart({
  stats,
  height = 280,
}: {
  stats: { label: string; value: number }[];
  height?: number;
}) {
  const radarData: RadarStats = {
    velocidad: stats.find((s) => s.label === "Ataque")?.value ?? 5,
    defensa: stats.find((s) => s.label === "Defensa")?.value ?? 5,
    pase: stats.find((s) => s.label === "Posesión")?.value ?? 5,
    dribbling: stats.find((s) => s.label === "Transición")?.value ?? 5,
    tiro: stats.find((s) => s.label === "Ataque")?.value ?? 5,
    fisico: stats.find((s) => s.label === "Físico")?.value ?? 5,
  };
  return <RadarChart data={radarData} height={height} />;
}
