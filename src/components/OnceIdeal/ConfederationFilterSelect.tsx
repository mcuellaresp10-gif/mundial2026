"use client";

import { Select } from "@/components/ui/select";
import { CONFEDERATION_LABELS, type Confederation } from "@/utils/confederations";

export type ConfederationFilterValue = Confederation | "all";

interface ConfederationFilterSelectProps {
  value: ConfederationFilterValue;
  onChange: (value: ConfederationFilterValue) => void;
  className?: string;
}

export function ConfederationFilterSelect({
  value,
  onChange,
  className,
}: ConfederationFilterSelectProps) {
  return (
    <Select
      value={value}
      onChange={(event) => onChange(event.target.value as ConfederationFilterValue)}
      className={className}
      aria-label="Filtrar por confederación"
    >
      <option value="all">Todas las confederaciones</option>
      {(Object.entries(CONFEDERATION_LABELS) as [Confederation, string][]).map(([key, label]) => (
        <option key={key} value={key}>
          {label}
        </option>
      ))}
    </Select>
  );
}

export function confederationFilterLabel(value: ConfederationFilterValue): string | null {
  if (value === "all") return null;
  return CONFEDERATION_LABELS[value];
}
