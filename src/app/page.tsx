"use client";

import { PartidosDelDia } from "@/components/Dashboard/PartidosDelDia";
import { EstadisticasGlobales } from "@/components/Dashboard/EstadisticasGlobales";
import { DashboardHero } from "@/components/Dashboard/DashboardHero";
import { AgenteCallToAction } from "@/components/Dashboard/AgenteCallToAction";
import { DashboardSkeleton } from "@/components/shared/Loading";
import { useTeams } from "@/hooks/usePartidos";
import { useActiveLeague } from "@/hooks/useActiveLeague";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";

export default function DashboardPage() {
  const { isLoading } = useTeams();
  const { league, leagues, isMulti } = useActiveLeague();

  if (isLoading) return <DashboardSkeleton />;

  const selectionLabel = isMulti
    ? leagues.map((l) => l.shortName).join(" · ")
    : league.shortName;

  return (
    <div className="@container/dashboard w-full animate-in fade-in space-y-6">
      <DashboardHero />
      <AgenteCallToAction />

      <Card className="border-mundial-gold/20 bg-mundial-gold/5">
        <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <p className="text-sm font-semibold">
              {isMulti ? "Competiciones activas" : "Liga activa"}: {selectionLabel}
            </p>
            <p className="text-xs text-muted-foreground">
              {isMulti
                ? `${leagues.length} seleccionadas · temporadas ${[...new Set(leagues.map((l) => l.defaultSeason))].join(", ")}`
                : `${league.name} · temporada ${league.defaultSeason}${
                    league.seasonMode === "apertura_clausura"
                      ? " · soporta Apertura/Clausura"
                      : ""
                  }`}
            </p>
          </div>
          <Link
            href="/mundial"
            className="text-xs font-medium text-mundial-gold hover:underline shrink-0"
          >
            Ver archivo Mundial 2026 →
          </Link>
        </CardContent>
      </Card>

      <div className="grid min-w-0 gap-6">
        <section id="partido" className="scroll-mt-24 min-w-0">
          <PartidosDelDia />
        </section>
        <section id="estadisticas" className="scroll-mt-24 min-w-0">
          <EstadisticasGlobales />
        </section>
      </div>
    </div>
  );
}
