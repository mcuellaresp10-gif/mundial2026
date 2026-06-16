"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  ResponsiveContainer,
} from "recharts";
import { CHART_COLORS } from "@/components/Estadisticas/charts/ChartCard";

interface PossessionStripProps {
  data: { minute: number; homePoss: number; awayPoss: number }[];
  maxMinute: number;
  compact?: boolean;
}

export function PossessionStrip({ data, maxMinute, compact }: PossessionStripProps) {
  if (data.length === 0) return null;

  return (
    <div className="mb-2">
      <p className="mb-1 text-[10px] uppercase tracking-wide text-zinc-500">
        Control de balón
      </p>
      <ResponsiveContainer width="100%" height={compact ? 28 : 36}>
        <AreaChart data={data} margin={{ top: 0, right: 8, left: 40, bottom: 0 }}>
          <XAxis
            dataKey="minute"
            type="number"
            domain={[0, maxMinute]}
            hide
          />
          <YAxis hide domain={[0, 100]} />
          <Area
            type="stepAfter"
            dataKey="homePoss"
            stackId="poss"
            stroke={CHART_COLORS.gold}
            fill={CHART_COLORS.gold}
            fillOpacity={0.9}
            isAnimationActive={false}
          />
          <Area
            type="stepAfter"
            dataKey="awayPoss"
            stackId="poss"
            stroke={CHART_COLORS.red}
            fill={CHART_COLORS.red}
            fillOpacity={0.9}
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
