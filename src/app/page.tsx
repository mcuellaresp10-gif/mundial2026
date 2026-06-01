"use client";

import { ProxPartido } from "@/components/Dashboard/ProxPartido";
import { EstadisticasGlobales } from "@/components/Dashboard/EstadisticasGlobales";
import { ColombiaFocus } from "@/components/Dashboard/ColombiaFocus";
import { DashboardSkeleton } from "@/components/shared/Loading";
import { useTeams } from "@/hooks/usePartidos";

export default function DashboardPage() {
  const { isLoading } = useTeams();

  if (isLoading) return <DashboardSkeleton />;

  return (
    <div className="space-y-8 animate-in fade-in">
      <div>
        <h1 className="text-4xl font-bold tracking-tight">Mundial 2026</h1>
        <p className="text-muted-foreground mt-2">Análisis táctico y estadísticas en vivo</p>
      </div>

      <ProxPartido />

      <ColombiaFocus />

      <EstadisticasGlobales />
    </div>
  );
}
