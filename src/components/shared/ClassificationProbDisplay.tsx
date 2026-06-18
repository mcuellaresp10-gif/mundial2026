"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import type { TeamOutcomeProbs } from "@/utils/groupClassification";

interface ClassificationProbDisplayProps {
  probability: number | null;
  isLoading: boolean;
  pendingMatchesPerTeam?: number;
  isPreTournament?: boolean;
  hasCalendar?: boolean;
  compact?: boolean;
  outcomes?: Pick<TeamOutcomeProbs, "probFirst" | "probSecond" | "probBestThird"> | null;
  showBreakdown?: boolean;
}

export function ClassificationProbDisplay({
  probability,
  isLoading,
  pendingMatchesPerTeam = 0,
  isPreTournament = false,
  hasCalendar = true,
  compact = false,
  outcomes,
  showBreakdown = true,
}: ClassificationProbDisplayProps) {
  if (isLoading) {
    return compact ? (
      <span className="text-muted-foreground">…</span>
    ) : (
      <Skeleton className="h-8 w-16 mx-auto" />
    );
  }

  if (
    isPreTournament &&
    !hasCalendar &&
    pendingMatchesPerTeam === 0 &&
    probability == null
  ) {
    return (
      <div className={compact ? undefined : "text-center"}>
        <p className="text-sm text-muted-foreground">N/D</p>
        {!compact && (
          <p className="text-[10px] text-muted-foreground mt-1">
            Sin calendario de grupo cargado
          </p>
        )}
      </div>
    );
  }

  const matchesLabel =
    pendingMatchesPerTeam > 0
      ? `${pendingMatchesPerTeam} partido${pendingMatchesPerTeam !== 1 ? "s" : ""} restante${pendingMatchesPerTeam !== 1 ? "s" : ""}`
      : isPreTournament
        ? "3 partidos restantes (fase de grupos)"
        : "0 partidos restantes";

  const hasOutcomes =
    outcomes &&
    (outcomes.probFirst > 0 || outcomes.probSecond > 0 || outcomes.probBestThird > 0);

  return (
    <div className={compact ? undefined : "text-center"}>
      <p
        className={cn(
          compact ? "text-2xl font-bold font-mono" : "text-xl font-bold font-mono",
          !compact && "text-colombia-blue dark:text-colombia-yellow"
        )}
      >
        {probability != null ? `${probability}%` : "N/D"}
      </p>
      {!compact && showBreakdown && hasOutcomes && (
        <div className="mt-2 grid grid-cols-3 gap-1 text-[10px] leading-tight">
          <div className="rounded bg-muted/50 px-1 py-1">
            <p className="text-muted-foreground">1º</p>
            <p className="font-mono font-semibold">{outcomes.probFirst}%</p>
          </div>
          <div className="rounded bg-muted/50 px-1 py-1">
            <p className="text-muted-foreground">2º</p>
            <p className="font-mono font-semibold">{outcomes.probSecond}%</p>
          </div>
          <div className="rounded bg-muted/50 px-1 py-1">
            <p className="text-muted-foreground">Mej. 3º</p>
            <p className="font-mono font-semibold">{outcomes.probBestThird}%</p>
          </div>
        </div>
      )}
      {!compact && (
        <p className="text-[10px] text-muted-foreground mt-1 leading-tight">
          Monte Carlo · H2H · {matchesLabel}
        </p>
      )}
    </div>
  );
}

export function ClassificationProbCells({
  outcomes,
  isLoading,
}: {
  outcomes?: Pick<TeamOutcomeProbs, "probFirst" | "probSecond" | "probBestThird"> | null;
  isLoading: boolean;
}) {
  if (isLoading) {
    return (
      <>
        <td className="py-2.5 px-1 text-center text-muted-foreground">…</td>
        <td className="py-2.5 px-1 text-center text-muted-foreground">…</td>
        <td className="py-2.5 px-1 text-center text-muted-foreground">…</td>
      </>
    );
  }

  if (!outcomes) {
    return (
      <>
        <td className="py-2.5 px-1 text-center text-muted-foreground">—</td>
        <td className="py-2.5 px-1 text-center text-muted-foreground">—</td>
        <td className="py-2.5 px-1 text-center text-muted-foreground">—</td>
      </>
    );
  }

  return (
    <>
      <td className="py-2.5 px-1 text-center tabular-nums font-mono text-xs">
        {outcomes.probFirst}%
      </td>
      <td className="py-2.5 px-1 text-center tabular-nums font-mono text-xs">
        {outcomes.probSecond}%
      </td>
      <td className="py-2.5 px-1 text-center tabular-nums font-mono text-xs">
        {outcomes.probBestThird}%
      </td>
    </>
  );
}
