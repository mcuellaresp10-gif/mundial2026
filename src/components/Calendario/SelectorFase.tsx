"use client";

import type { PhaseFilter } from "@/types";

const PHASES: PhaseFilter[] = [
  "Todos",
  "Grupo A", "Grupo B", "Grupo C", "Grupo D",
  "Grupo E", "Grupo F", "Grupo G", "Grupo H",
  "Grupo I", "Grupo J", "Grupo K", "Grupo L",
  "16avos", "Octavos", "Cuartos", "Semis", "Final",
];

interface SelectorFaseProps {
  value: PhaseFilter;
  onChange: (phase: PhaseFilter) => void;
}

export function SelectorFase({ value, onChange }: SelectorFaseProps) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value as PhaseFilter)}
      className="h-10 rounded-md border border-input bg-background px-3 text-sm font-medium min-w-[180px]"
    >
      {PHASES.map((p) => (
        <option key={p} value={p}>{p}</option>
      ))}
    </select>
  );
}
