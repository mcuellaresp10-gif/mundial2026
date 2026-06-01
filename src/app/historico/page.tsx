"use client";

import { HistoricoMundialView } from "@/components/Historico/HistoricoMundial";

export default function HistoricoPage() {
  return (
    <div className="space-y-6 animate-in fade-in">
      <div>
        <h1 className="text-3xl font-bold">Histórico de Mundiales</h1>
        <p className="text-muted-foreground mt-1">2010 · 2014 · 2018 · 2022 — Comparativas con 2026</p>
      </div>
      <HistoricoMundialView />
    </div>
  );
}
