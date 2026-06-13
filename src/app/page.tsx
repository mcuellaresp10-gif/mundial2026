"use client";

import { PartidosDelDia } from "@/components/Dashboard/PartidosDelDia";
import { EstadisticasGlobales } from "@/components/Dashboard/EstadisticasGlobales";
import { ColombiaFocus } from "@/components/Dashboard/ColombiaFocus";
import { DashboardHero } from "@/components/Dashboard/DashboardHero";
import { DashboardSkeleton } from "@/components/shared/Loading";
import { useTeams } from "@/hooks/usePartidos";

export default function DashboardPage() {
  const { isLoading } = useTeams();

  if (isLoading) return <DashboardSkeleton />;

  return (
    <div className="@container/dashboard w-full animate-in fade-in">
      <DashboardHero />

      {/* Magazine layout: contenido principal + sidebar sticky (Colombia) */}
      <div
        className="
          grid min-w-0 gap-6 lg:gap-8
          grid-cols-1
          xl:grid-cols-[minmax(0,1fr)_minmax(280px,340px)]
          xl:grid-rows-[auto_1fr]
        "
      >
        <section id="partido" className="scroll-mt-24 min-w-0 xl:col-start-1 xl:row-start-1">
          <PartidosDelDia />
        </section>

        <aside
          className="
            min-w-0 order-first xl:order-none
            xl:col-start-2 xl:row-start-1 xl:row-span-2
            xl:sticky xl:top-24 xl:self-start
            xl:max-h-[calc(100vh-6.5rem)] xl:overflow-y-auto xl:scrollbar-thin
          "
        >
          <ColombiaFocus />
        </aside>

        <section id="estadisticas" className="scroll-mt-24 min-w-0 xl:col-start-1 xl:row-start-2">
          <EstadisticasGlobales />
        </section>
      </div>
    </div>
  );
}
