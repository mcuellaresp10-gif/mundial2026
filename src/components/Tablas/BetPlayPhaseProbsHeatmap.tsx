"use client";

import Image from "next/image";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useBetPlayPhaseProbs } from "@/hooks/useBetPlayPhaseProbs";
import { translateTeamName } from "@/utils/teamNames";
import { cn } from "@/lib/utils";
import {
  formatBetPlayPct,
  type BetPlayPhaseProbs,
} from "@/utils/betPlaySeasonSimulation";

function ProbBar({
  value,
  label,
  maxPlayed,
  mathematicallyEliminated,
}: {
  value: number;
  label: string;
  maxPlayed: number;
  mathematicallyEliminated: boolean;
}) {
  const pct = Math.min(100, Math.max(0, value * 100));
  return (
    <div className="min-w-[5.5rem]">
      <div className="flex items-baseline justify-between gap-2 mb-1">
        <span className="text-[10px] uppercase tracking-wide text-muted-foreground">
          {label}
        </span>
        <span className="font-mono text-xs font-semibold tabular-nums text-foreground">
          {formatBetPlayPct(value, { mathematicallyEliminated, maxPlayed })}
        </span>
      </div>
      <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
        <div
          className="h-full rounded-full bg-primary/80 transition-[width] duration-300"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

function ProbsTable({
  rows,
  maxPlayed,
}: {
  rows: BetPlayPhaseProbs[];
  maxPlayed: number;
}) {
  return (
    <div className="overflow-x-auto rounded-lg border border-border/60">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b bg-muted/40 text-muted-foreground">
            <th className="py-2.5 px-3 text-left font-medium w-[28%]">Equipo</th>
            <th className="py-2.5 px-3 text-left font-medium">Cuadrangulares</th>
            <th className="py-2.5 px-3 text-left font-medium">Final</th>
            <th className="py-2.5 px-3 text-left font-medium">Campeón</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr
              key={row.teamId}
              className="border-b border-border/40 last:border-0 align-middle"
            >
              <td className="py-2.5 px-3">
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
              <td className="py-2.5 px-3">
                <ProbBar
                  value={row.probCuadrangulares}
                  label="Quad"
                  maxPlayed={maxPlayed}
                  mathematicallyEliminated={row.mathematicallyEliminated}
                />
              </td>
              <td className="py-2.5 px-3">
                <ProbBar
                  value={row.probFinal}
                  label="Final"
                  maxPlayed={maxPlayed}
                  mathematicallyEliminated={row.mathematicallyEliminated}
                />
              </td>
              <td className="py-2.5 px-3">
                <ProbBar
                  value={row.probChampion}
                  label="Título"
                  maxPlayed={maxPlayed}
                  mathematicallyEliminated={row.mathematicallyEliminated}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function BetPlayPhaseProbsHeatmap() {
  const { enabled, probs, meta, isLoading, isFetching, phase } =
    useBetPlayPhaseProbs();

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
          Torneo actual ({phase === "apertura" ? "Apertura" : "Clausura"}):{" "}
          {meta.maxPlayed} partido{meta.maxPlayed === 1 ? "" : "s"} jugado
          {meta.maxPlayed === 1 ? "" : "s"} · {meta.pendingCount} por simular ·{" "}
          {meta.simulations} sims
          {meta.historyFixtureCount > meta.pendingCount
            ? " · H2H/forma con historial de temporada"
            : ""}
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
          <ProbsTable rows={probs} maxPlayed={meta.maxPlayed} />
        )}
      </CardContent>
    </Card>
  );
}
