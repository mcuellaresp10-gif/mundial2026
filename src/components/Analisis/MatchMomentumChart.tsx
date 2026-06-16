"use client";

import { useMemo } from "react";
import Image from "next/image";
import {
  ComposedChart,
  Area,
  XAxis,
  YAxis,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { Skeleton } from "@/components/ui/skeleton";
import { CHART_COLORS } from "@/components/Estadisticas/charts/ChartCard";
import { useFixtureDetail } from "@/hooks/usePartidos";
import { isFixtureLive, isWithinKickoffWindow } from "@/lib/liveRefresh";
import type { Fixture } from "@/types";
import { translateTeamName } from "@/utils/teamNames";
import {
  computeMatchMomentum,
  resolveMaxMinute,
} from "@/utils/matchMomentum";

interface MatchMomentumChartProps {
  fixture: Fixture;
}

function MomentumTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: { payload: { minute: number; momentum: number } }[];
}) {
  if (!active || !payload?.length) return null;
  const { minute, momentum } = payload[0].payload;
  const leader =
    momentum > 5 ? "Local" : momentum < -5 ? "Visitante" : "Equilibrado";
  return (
    <div className="rounded-md border bg-popover px-3 py-2 text-xs shadow-md">
      <p className="font-mono font-semibold">{minute}&apos;</p>
      <p className="text-muted-foreground">{leader}</p>
    </div>
  );
}

export function MatchMomentumChart({ fixture }: MatchMomentumChartProps) {
  const live =
    isFixtureLive(fixture.fixture.status.short) ||
    isWithinKickoffWindow(fixture.fixture.date, fixture.fixture.status.short);
  const { events } = useFixtureDetail(fixture.fixture.id, live);

  const statusShort = fixture.fixture.status.short;
  const elapsed = fixture.fixture.status.elapsed;
  const isLiveOrHt = isFixtureLive(statusShort) || statusShort === "HT";

  const chartData = useMemo(() => {
    const eventList = events.data ?? [];
    const maxMinute = resolveMaxMinute(statusShort, elapsed, eventList);
    return computeMatchMomentum(
      eventList,
      fixture.teams.home.id,
      fixture.teams.away.id,
      maxMinute
    );
  }, [
    events.data,
    statusShort,
    elapsed,
    fixture.teams.home.id,
    fixture.teams.away.id,
  ]);

  const currentMinute = isLiveOrHt ? (elapsed ?? chartData.at(-1)?.minute ?? 0) : null;
  const hasMomentumEvents = chartData.some((p) => p.momentum !== 0);

  if (events.isLoading) {
    return <Skeleton className="h-[220px] w-full rounded-xl" />;
  }

  return (
    <div className="overflow-hidden rounded-xl border border-white/10 bg-zinc-900 shadow-lg">
      <div className="bg-[#003DA5] px-4 py-2">
        <h2 className="text-sm font-bold uppercase tracking-wider text-white">
          Momento del partido
        </h2>
      </div>

      <div className="relative px-2 py-3">
        <div className="absolute left-3 top-1/2 z-10 flex -translate-y-1/2 flex-col gap-6">
          <Image
            src={fixture.teams.home.logo}
            alt={translateTeamName(fixture.teams.home.name)}
            width={28}
            height={28}
            className="rounded-sm bg-white/10 p-0.5"
            unoptimized
          />
          <Image
            src={fixture.teams.away.logo}
            alt={translateTeamName(fixture.teams.away.name)}
            width={28}
            height={28}
            className="rounded-sm bg-white/10 p-0.5"
            unoptimized
          />
        </div>

        {!hasMomentumEvents ? (
          <p className="py-10 text-center text-sm text-zinc-400">
            El gráfico se actualizará cuando haya eventos en el partido
          </p>
        ) : (
          <ResponsiveContainer width="100%" height={200}>
            <ComposedChart
              data={chartData}
              margin={{ top: 8, right: 12, left: 36, bottom: 4 }}
            >
              <XAxis
                dataKey="minute"
                type="number"
                domain={[0, Math.max(90, chartData.at(-1)?.minute ?? 90)]}
                ticks={[0, 15, 30, 45, 60, 75, 90]}
                tick={{ fill: "#a1a1aa", fontSize: 10 }}
                axisLine={{ stroke: "#52525b" }}
                tickLine={false}
              />
              <YAxis hide domain={[-100, 100]} />
              <Tooltip content={<MomentumTooltip />} />
              <ReferenceLine y={0} stroke="#ffffff40" strokeWidth={1} />
              <ReferenceLine
                x={45}
                stroke="#ffffff30"
                strokeDasharray="4 4"
              />
              {currentMinute != null && currentMinute > 0 && (
                <ReferenceLine
                  x={currentMinute}
                  stroke="#ffffff80"
                  strokeWidth={1.5}
                />
              )}
              <Area
                type="monotone"
                dataKey="homePressure"
                baseValue={0}
                stroke={CHART_COLORS.gold}
                fill={CHART_COLORS.gold}
                fillOpacity={0.85}
                strokeWidth={0}
                isAnimationActive={false}
              />
              <Area
                type="monotone"
                dataKey="awayPressure"
                baseValue={0}
                stroke={CHART_COLORS.red}
                fill={CHART_COLORS.red}
                fillOpacity={0.85}
                strokeWidth={0}
                isAnimationActive={false}
              />
            </ComposedChart>
          </ResponsiveContainer>
        )}

        <p className="mt-1 px-3 text-center text-[10px] text-zinc-500">
          Estimado a partir de goles, tarjetas y VAR
        </p>
      </div>
    </div>
  );
}
