"use client";

import Image from "next/image";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useBetPlayPhaseProbs } from "@/hooks/useBetPlayPhaseProbs";
import { translateTeamName } from "@/utils/teamNames";
import { cn } from "@/lib/utils";
import type { BetPlayPhaseProbs } from "@/utils/betPlaySeasonSimulation";

function formatPct(value: number): string {
  return `${(value * 100).toFixed(1)}%`;
}

/** Escala mint (alto) → oscuro (bajo). */
function heatStyle(value: number): { backgroundColor: string; color: string } {
  const t = Math.min(1, Math.max(0, value));
  // t=1 → #9ef0c8; t=0 → #0b1020
  const r = Math.round(0x0b + (0x9e - 0x0b) * t);
  const g = Math.round(0x10 + (0xf0 - 0x10) * t);
  const b = Math.round(0x20 + (0xc8 - 0x20) * t);
  const backgroundColor = `rgb(${r}, ${g}, ${b})`;
  const color = t > 0.45 ? "#0f172a" : "#e2e8f0";
  return { backgroundColor, color };
}

function HeatCell({ value }: { value: number }) {
  const style = heatStyle(value);
  return (
    <td
      className="py-2 px-2 text-center font-mono text-sm font-semibold tabular-nums"
      style={style}
    >
      {formatPct(value)}
    </td>
  );
}

function HeatmapTable({ rows }: { rows: BetPlayPhaseProbs[] }) {
  return (
    <div className="overflow-x-auto rounded-lg border border-border/60">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b bg-muted/40 text-muted-foreground">
            <th className="py-2.5 px-3 text-left font-medium">Equipo</th>
            <th className="py-2.5 px-2 text-center font-medium whitespace-nowrap">
              Cuadrangulares (%)
            </th>
            <th className="py-2.5 px-2 text-center font-medium whitespace-nowrap">
              Final (%)
            </th>
            <th className="py-2.5 px-2 text-center font-medium whitespace-nowrap">
              Campeón (%)
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.teamId} className="border-b border-border/40 last:border-0">
              <td className="py-1.5 px-3">
                <Link
                  href={`/equipos/${row.teamId}`}
                  className="inline-flex items-center gap-2 hover:underline min-w-0"
                >
                  {row.teamLogo ? (
                    <Image
                      src={row.teamLogo}
                      alt=""
                      width={22}
                      height={22}
                      className="rounded-full shrink-0"
                    />
                  ) : (
                    <span className="h-[22px] w-[22px] rounded-full bg-muted shrink-0" />
                  )}
                  <span className="truncate font-medium">
                    {translateTeamName(row.teamName)}
                  </span>
                </Link>
              </td>
              <HeatCell value={row.probCuadrangulares} />
              <HeatCell value={row.probFinal} />
              <HeatCell value={row.probChampion} />
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function BetPlayPhaseProbsHeatmap() {
  const { enabled, probs, isLoading, isFetching, phase } = useBetPlayPhaseProbs();

  if (!enabled) return null;

  const phaseLabel =
    phase === "apertura" ? " · Apertura" : phase === "clausura" ? " · Clausura" : "";

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">
          Liga BetPlay — Probabilidades de éxito por fase{phaseLabel}
        </CardTitle>
        <p className="text-sm text-muted-foreground font-normal">
          Monte Carlo sobre el calendario restante · se actualiza con cada resultado
          {isFetching && !isLoading ? " · recalculando…" : ""}
        </p>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className={cn("h-9 w-full", i === 0 && "h-10")} />
            ))}
          </div>
        ) : probs.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4 text-center">
            Necesitamos la tabla de posiciones (mín. 8 equipos) para estimar
            probabilidades.
          </p>
        ) : (
          <HeatmapTable rows={probs} />
        )}
      </CardContent>
    </Card>
  );
}
