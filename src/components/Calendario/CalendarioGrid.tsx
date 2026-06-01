"use client";

import { PartidoCard } from "./PartidoCard";
import { GridSkeleton } from "@/components/shared/Loading";
import type { Fixture } from "@/types";

interface CalendarioGridProps {
  fixtures: Fixture[];
  isLoading: boolean;
}

export function CalendarioGrid({ fixtures, isLoading }: CalendarioGridProps) {
  if (isLoading) return <GridSkeleton count={6} />;

  if (fixtures.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        No hay partidos en esta fase
      </div>
    );
  }

  const sorted = [...fixtures].sort(
    (a, b) => new Date(a.fixture.date).getTime() - new Date(b.fixture.date).getTime()
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {sorted.map((f) => (
        <PartidoCard key={f.fixture.id} fixture={f} />
      ))}
    </div>
  );
}
