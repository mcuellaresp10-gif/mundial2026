"use client";

import { PartidosDelDia } from "@/components/Dashboard/PartidosDelDia";
import { ColombiaFocus } from "@/components/Dashboard/ColombiaFocus";
import { EstadisticasGlobales } from "@/components/Dashboard/EstadisticasGlobales";

export default function MundialArchivePage() {
  return (
    <div className="space-y-6">
      <div className="grid min-w-0 gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(280px,340px)]">
        <section className="min-w-0 space-y-6">
          <PartidosDelDia />
          <EstadisticasGlobales />
        </section>
        <aside className="min-w-0 xl:sticky xl:top-24 xl:self-start">
          <ColombiaFocus />
        </aside>
      </div>
    </div>
  );
}
