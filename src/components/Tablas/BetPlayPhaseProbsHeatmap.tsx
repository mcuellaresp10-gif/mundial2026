"use client";

import { useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { DomImageExportButtons } from "@/components/shared/DomImageExportButtons";
import { useBetPlayPhaseProbs } from "@/hooks/useBetPlayPhaseProbs";
import { translateTeamName } from "@/utils/teamNames";
import { cn } from "@/lib/utils";
import {
  formatBetPlayPct,
  type BetPlayPhaseProbs,
} from "@/utils/betPlaySeasonSimulation";

type SortKey = "rank" | "probCuadrangulares" | "probFinal" | "probChampion";
type SortDir = "asc" | "desc";

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

function SortIcon({ active, dir }: { active: boolean; dir: SortDir }) {
  if (!active) {
    return <ArrowUpDown className="h-3.5 w-3.5 opacity-50" aria-hidden />;
  }
  return dir === "asc" ? (
    <ArrowUp className="h-3.5 w-3.5 text-mundial-gold" aria-hidden />
  ) : (
    <ArrowDown className="h-3.5 w-3.5 text-mundial-gold" aria-hidden />
  );
}

function SortableHeader({
  label,
  sortKey,
  activeKey,
  dir,
  onSort,
  className,
}: {
  label: string;
  sortKey: SortKey;
  activeKey: SortKey;
  dir: SortDir;
  onSort: (key: SortKey) => void;
  className?: string;
}) {
  const active = activeKey === sortKey;
  return (
    <th className={cn("py-2.5 px-3 text-left font-medium", className)} aria-sort={active ? (dir === "asc" ? "ascending" : "descending") : "none"}>
      <button
        type="button"
        onClick={() => onSort(sortKey)}
        className={cn(
          "inline-flex items-center gap-1.5 rounded-md transition-colors hover:text-foreground",
          active ? "text-foreground" : "text-muted-foreground"
        )}
      >
        <span>{label}</span>
        <span data-export-hide>
          <SortIcon active={active} dir={dir} />
        </span>
      </button>
    </th>
  );
}

function compareRows(
  a: BetPlayPhaseProbs,
  b: BetPlayPhaseProbs,
  key: SortKey,
  dir: SortDir
): number {
  const mul = dir === "asc" ? 1 : -1;
  if (key === "rank") {
    return (a.rank - b.rank || a.teamName.localeCompare(b.teamName, "es")) * (dir === "asc" ? 1 : -1);
  }
  const diff = (a[key] - b[key]) * mul;
  if (Math.abs(diff) > 1e-12) return diff;
  return a.rank - b.rank;
}

function ProbsTable({
  rows,
  maxPlayed,
}: {
  rows: BetPlayPhaseProbs[];
  maxPlayed: number;
}) {
  const [sortKey, setSortKey] = useState<SortKey>("rank");
  const [sortDir, setSortDir] = useState<SortDir>("asc");

  const handleSort = (key: SortKey) => {
    if (key === sortKey) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
      return;
    }
    setSortKey(key);
    // Probabilidades: mayor primero; posición: 1º arriba.
    setSortDir(key === "rank" ? "asc" : "desc");
  };

  const sortedRows = useMemo(
    () => [...rows].sort((a, b) => compareRows(a, b, sortKey, sortDir)),
    [rows, sortKey, sortDir]
  );

  return (
    <div className="overflow-x-auto rounded-lg border border-border/60">
      <table className="w-full min-w-[640px] text-sm border-collapse">
        <thead>
          <tr className="border-b bg-muted/40 text-muted-foreground">
            <SortableHeader
              label="#"
              sortKey="rank"
              activeKey={sortKey}
              dir={sortDir}
              onSort={handleSort}
              className="w-10 px-2"
            />
            <th className="py-2.5 px-3 text-left font-medium w-[28%]">Equipo</th>
            <SortableHeader
              label="Cuadrangulares"
              sortKey="probCuadrangulares"
              activeKey={sortKey}
              dir={sortDir}
              onSort={handleSort}
            />
            <SortableHeader
              label="Final"
              sortKey="probFinal"
              activeKey={sortKey}
              dir={sortDir}
              onSort={handleSort}
            />
            <SortableHeader
              label="Campeón"
              sortKey="probChampion"
              activeKey={sortKey}
              dir={sortDir}
              onSort={handleSort}
            />
          </tr>
        </thead>
          <tbody>
            {sortedRows.map((row, index) => (
              <tr
                key={row.teamId}
                className="border-b border-border/40 last:border-0 align-middle"
              >
                <td className="py-2.5 px-2 font-mono text-muted-foreground tabular-nums">
                  {index + 1}
                </td>
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
                      unoptimized
                    />
                  ) : (
                    <span className="h-[22px] w-[22px] rounded-full bg-muted shrink-0" />
                  )}
                  <span className="font-medium whitespace-normal">
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
  const exportRef = useRef<HTMLDivElement>(null);

  if (!enabled) return null;

  const phaseName = phase === "apertura" ? "Apertura" : "Clausura";
  const phaseLabel = phase === "apertura" || phase === "clausura" ? ` · ${phaseName}` : "";
  const canExport = !isLoading && probs.length > 0;

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <CardTitle className="text-lg">
              Liga BetPlay — Probabilidades de éxito por fase{phaseLabel}
            </CardTitle>
            <p className="text-sm text-muted-foreground font-normal mt-1">
              Torneo actual ({phaseName}):{" "}
              {meta.maxPlayed} partido{meta.maxPlayed === 1 ? "" : "s"} jugado
              {meta.maxPlayed === 1 ? "" : "s"} · {meta.pendingCount} por simular ·{" "}
              {meta.simulations} sims
              {meta.historyFixtureCount > meta.pendingCount
                ? " · H2H/forma con historial de temporada"
                : ""}
              {isFetching && !isLoading ? " · recalculando…" : ""}
            </p>
          </div>
          {canExport && (
            <DomImageExportButtons
              targetRef={exportRef}
              filename={`betplay-probs-${phaseName.toLowerCase()}.png`}
              className="shrink-0"
            />
          )}
        </div>
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
          <div
            ref={exportRef}
            className="rounded-xl border border-border/60 bg-card p-3 sm:p-4"
          >
            <div className="mb-3 border-b border-border/60 pb-2">
              <p className="text-sm font-semibold text-foreground">
                Liga BetPlay — Probabilidades por fase · {phaseName}
              </p>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                Fútbol Américas · {meta.maxPlayed} PJ · {meta.pendingCount} pendientes ·{" "}
                {meta.simulations} sims
              </p>
            </div>
            <ProbsTable rows={probs} maxPlayed={meta.maxPlayed} />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
