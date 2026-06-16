"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { ChevronDown, ChevronUp } from "lucide-react";
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
import { Button } from "@/components/ui/button";
import { CHART_COLORS } from "@/components/Estadisticas/charts/ChartCard";
import { useFixtureDetail } from "@/hooks/usePartidos";
import { useFixtureStatTimeline } from "@/hooks/useFixtureStatTimeline";
import { isFixtureLive, isWithinKickoffWindow } from "@/lib/liveRefresh";
import type { Fixture } from "@/types";
import { translateTeamName } from "@/utils/teamNames";
import {
  hasMeaningfulStats,
  parseFixtureStats,
  type ParsedFixtureStats,
} from "@/utils/fixtureStatsParser";
import {
  computeEnrichedMatchMomentum,
  resolveMaxMinute,
  summarizeMomentum,
} from "@/utils/matchMomentum";
import { cn } from "@/lib/utils";

interface MatchMomentumChartProps {
  fixture: Fixture;
  defaultExpanded?: boolean;
  compact?: boolean;
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

function StatBar({
  label,
  home,
  away,
}: {
  label: string;
  home: number;
  away: number;
}) {
  const total = home + away || 1;
  const homePct = (home / total) * 100;

  return (
    <div className="space-y-1">
      <div className="flex justify-between text-[10px] text-zinc-400">
        <span className="font-mono">{home}</span>
        <span>{label}</span>
        <span className="font-mono">{away}</span>
      </div>
      <div className="flex h-1.5 overflow-hidden rounded-full bg-zinc-700">
        <div
          className="bg-[#FCD116] transition-all"
          style={{ width: `${homePct}%` }}
        />
        <div
          className="bg-[#CE1126] transition-all"
          style={{ width: `${100 - homePct}%` }}
        />
      </div>
    </div>
  );
}

function StatsSummary({ parsed }: { parsed: ParsedFixtureStats }) {
  return (
    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
      <StatBar
        label="Posesión %"
        home={parsed.home.possession}
        away={parsed.away.possession}
      />
      <StatBar
        label="Tiros a puerta"
        home={parsed.home.shotsOn}
        away={parsed.away.shotsOn}
      />
      <StatBar
        label="Ataques peligrosos"
        home={parsed.home.dangerousAttacks}
        away={parsed.away.dangerousAttacks}
      />
      <StatBar
        label="Tiros en área"
        home={parsed.home.shotsInside}
        away={parsed.away.shotsInside}
      />
    </div>
  );
}

export function MatchMomentumChart({
  fixture,
  defaultExpanded = false,
  compact = false,
}: MatchMomentumChartProps) {
  const [expanded, setExpanded] = useState(defaultExpanded);

  const live =
    isFixtureLive(fixture.fixture.status.short) ||
    isWithinKickoffWindow(fixture.fixture.date, fixture.fixture.status.short);
  const { events, stats } = useFixtureDetail(fixture.fixture.id, live);

  const statusShort = fixture.fixture.status.short;
  const elapsed = fixture.fixture.status.elapsed;
  const isLiveOrHt = isFixtureLive(statusShort) || statusShort === "HT";

  const statTimeline = useFixtureStatTimeline(
    fixture.fixture.id,
    live,
    stats.data,
    fixture.teams.home.id,
    fixture.teams.away.id,
    elapsed
  );

  const parsedStats = useMemo(
    () => parseFixtureStats(stats.data, fixture.teams.home.id, fixture.teams.away.id),
    [stats.data, fixture.teams.home.id, fixture.teams.away.id]
  );

  const chartData = useMemo(() => {
    const eventList = events.data ?? [];
    const maxMinute = resolveMaxMinute(statusShort, elapsed, eventList);
    return computeEnrichedMatchMomentum(
      eventList,
      fixture.teams.home.id,
      fixture.teams.away.id,
      maxMinute,
      parsedStats,
      statTimeline
    );
  }, [
    events.data,
    statusShort,
    elapsed,
    fixture.teams.home.id,
    fixture.teams.away.id,
    parsedStats,
    statTimeline,
  ]);

  const summary = useMemo(() => summarizeMomentum(chartData), [chartData]);

  const yLimit = useMemo(() => {
    const peak = chartData.reduce((max, p) => Math.max(max, Math.abs(p.momentum)), 0);
    const padded = Math.ceil((peak * 1.15) / 10) * 10;
    return Math.min(100, Math.max(40, padded || 40));
  }, [chartData]);

  const yTicks = useMemo(() => {
    const half = yLimit / 2;
    return [-yLimit, -half, 0, half, yLimit];
  }, [yLimit]);

  const currentMinute = isLiveOrHt ? (elapsed ?? chartData.at(-1)?.minute ?? 0) : null;
  const hasData =
    chartData.some((p) => p.momentum !== 0) ||
    hasMeaningfulStats(parsedStats) ||
    (events.data?.length ?? 0) > 0;

  const leaderLabel =
    summary.leader === "home"
      ? translateTeamName(fixture.teams.home.name)
      : summary.leader === "away"
        ? translateTeamName(fixture.teams.away.name)
        : "Partido equilibrado";

  const summaryText =
    summary.leader === "even"
      ? "Partido equilibrado"
      : `${leaderLabel} domina ~${summary.dominancePct}%`;

  if (events.isLoading && stats.isLoading) {
    return <Skeleton className={cn("w-full rounded-xl", compact ? "h-[140px]" : "h-[180px]")} />;
  }

  return (
    <div
      className={cn(
        "overflow-hidden rounded-xl border border-white/10 bg-zinc-900 shadow-lg",
        compact && "text-sm"
      )}
    >
      <div className="flex items-center justify-between bg-[#003DA5] px-4 py-2">
        <h2 className="text-sm font-bold uppercase tracking-wider text-white">
          Momento del partido
        </h2>
        <Button
          size="sm"
          variant="ghost"
          className="h-7 text-white hover:bg-white/10 hover:text-white"
          onClick={() => setExpanded(!expanded)}
        >
          {expanded ? (
            <>
              <ChevronUp className="mr-1 h-4 w-4" />
              Ocultar
            </>
          ) : (
            <>
              <ChevronDown className="mr-1 h-4 w-4" />
              Expandir
            </>
          )}
        </Button>
      </div>

      <div className={cn("relative px-3 py-3", compact && "px-2 py-2")}>
        <p className="mb-3 text-center text-xs text-zinc-300">{summaryText}</p>

        {parsedStats && (
          <div className="mb-3">
            <StatsSummary parsed={parsedStats} />
          </div>
        )}

        {expanded && (
          <div className="animate-in fade-in duration-300">
            {!hasData ? (
              <p className="py-8 text-center text-sm text-zinc-400">
                El gráfico se actualizará cuando haya eventos o estadísticas
              </p>
            ) : (
              <>
                <div className="relative">
                  <div className="absolute left-10 top-1/2 z-10 flex -translate-y-1/2 flex-col gap-6">
                    <Image
                      src={fixture.teams.home.logo}
                      alt={translateTeamName(fixture.teams.home.name)}
                      width={24}
                      height={24}
                      className="rounded-sm bg-white/10 p-0.5"
                      unoptimized
                    />
                    <Image
                      src={fixture.teams.away.logo}
                      alt={translateTeamName(fixture.teams.away.name)}
                      width={24}
                      height={24}
                      className="rounded-sm bg-white/10 p-0.5"
                      unoptimized
                    />
                  </div>

                  <ResponsiveContainer width="100%" height={compact ? 200 : 260}>
                    <ComposedChart
                      data={chartData}
                      margin={{ top: 8, right: 12, left: 8, bottom: 4 }}
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
                      <YAxis
                        domain={[-yLimit, yLimit]}
                        ticks={yTicks}
                        width={40}
                        tick={{ fill: "#a1a1aa", fontSize: 10 }}
                        axisLine={{ stroke: "#52525b" }}
                        tickLine={{ stroke: "#52525b" }}
                        tickFormatter={(v) => (v > 0 ? `+${v}` : String(v))}
                      />
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
                </div>

                <div className="mt-2 flex flex-wrap justify-center gap-3 text-[10px] text-zinc-400">
                  <span className="flex items-center gap-1">
                    <span className="inline-block h-2 w-2 rounded-sm bg-[#FCD116]" />
                    Eventos + stats local
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="inline-block h-2 w-2 rounded-sm bg-[#CE1126]" />
                    Eventos + stats visitante
                  </span>
                </div>
              </>
            )}
          </div>
        )}

        <p className="mt-2 text-center text-[10px] text-zinc-500">
          Estimado con eventos + estadísticas acumuladas del partido
        </p>
      </div>
    </div>
  );
}
