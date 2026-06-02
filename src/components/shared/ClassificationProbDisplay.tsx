"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface ClassificationProbDisplayProps {
  probability: number | null;
  isLoading: boolean;
  pendingMatchesPerTeam?: number;
  isPreTournament?: boolean;
  hasCalendar?: boolean;
  compact?: boolean;
}

export function ClassificationProbDisplay({
  probability,
  isLoading,
  pendingMatchesPerTeam = 0,
  isPreTournament = false,
  hasCalendar = true,
  compact = false,
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
      {!compact && (
        <p className="text-[10px] text-muted-foreground mt-1 leading-tight">
          Monte Carlo · H2H · {matchesLabel}
        </p>
      )}
    </div>
  );
}
