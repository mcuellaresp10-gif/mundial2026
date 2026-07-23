"use client";

import { HistoricoMundialView } from "@/components/Historico/HistoricoMundial";

export default function MundialHistoricoPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Histórico de Mundiales</h2>
        <p className="text-muted-foreground mt-1">
          2010 · 2014 · 2018 · 2022 — Comparativas con 2026
        </p>
      </div>
      <HistoricoMundialView />
    </div>
  );
}
