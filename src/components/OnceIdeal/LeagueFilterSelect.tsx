"use client";

import { Select } from "@/components/ui/select";
import {
  AMERICAS_LEAGUES,
  getLeagueById,
  type AmericasLeague,
} from "@/data/americasLeagues";
import type { LeagueFilter } from "@/utils/onceIdealLeague";

export type LeagueFilterValue = LeagueFilter;

interface LeagueFilterSelectProps {
  value: LeagueFilterValue;
  onChange: (value: LeagueFilterValue) => void;
  className?: string;
  /** Si se pasa, solo muestra estas ligas (p. ej. las seleccionadas en el hub). */
  leagues?: AmericasLeague[];
}

export function LeagueFilterSelect({
  value,
  onChange,
  className,
  leagues = AMERICAS_LEAGUES,
}: LeagueFilterSelectProps) {
  return (
    <Select
      value={value === "all" ? "all" : String(value)}
      onChange={(event) => {
        const v = event.target.value;
        onChange(v === "all" ? "all" : Number(v));
      }}
      className={className}
      aria-label="Filtrar por liga"
    >
      <option value="all">Todas las ligas</option>
      {leagues.map((l) => (
        <option key={l.slug} value={l.id}>
          {l.shortName} — {l.name}
        </option>
      ))}
    </Select>
  );
}

export function leagueFilterLabel(value: LeagueFilterValue): string | null {
  if (value === "all") return null;
  const league = getLeagueById(value);
  return league?.shortName ?? null;
}
