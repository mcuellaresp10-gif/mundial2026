"use client";

import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import type { ScoutingRoleId } from "@/config/scoutingRoleProfiles";
import { rolesForPosition } from "@/config/scoutingRoleProfiles";
import {
  scoutingPositionOptions,
  type ScoutingPosition,
} from "@/config/positionMetricProfiles";

export interface ScoutingThresholdFilters {
  minMinutes: number;
  minGoals: number;
  minAssists: number;
  minRating: number;
}

interface ScoutingFiltersBarProps {
  position: ScoutingPosition;
  onPositionChange: (pos: ScoutingPosition) => void;
  roleId: ScoutingRoleId;
  onRoleChange: (id: ScoutingRoleId) => void;
  teamFilter: string;
  onTeamFilterChange: (team: string) => void;
  teamOptions: string[];
  search: string;
  onSearchChange: (q: string) => void;
  thresholds: ScoutingThresholdFilters;
  onThresholdsChange: (next: ScoutingThresholdFilters) => void;
  benchmarkScope: "league" | "conmebol" | "position";
  onBenchmarkScopeChange: (scope: "league" | "conmebol" | "position") => void;
  statusText: string;
  roleHint: string;
}

export function ScoutingFiltersBar({
  position,
  onPositionChange,
  roleId,
  onRoleChange,
  teamFilter,
  onTeamFilterChange,
  teamOptions,
  search,
  onSearchChange,
  thresholds,
  onThresholdsChange,
  benchmarkScope,
  onBenchmarkScopeChange,
  statusText,
  roleHint,
}: ScoutingFiltersBarProps) {
  const roles = rolesForPosition(position);

  return (
    <div className="space-y-3 rounded-xl border bg-muted/20 p-3 sm:p-4">
      <div className="flex flex-wrap gap-3 items-end">
        <div>
          <label className="text-xs text-muted-foreground block mb-1">Posición</label>
          <Select
            value={position}
            onChange={(e) => onPositionChange(e.target.value as ScoutingPosition)}
          >
            {scoutingPositionOptions().map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </Select>
        </div>
        <div>
          <label className="text-xs text-muted-foreground block mb-1">Rol</label>
          <Select
            value={roleId}
            onChange={(e) => onRoleChange(e.target.value as ScoutingRoleId)}
          >
            {roles.map((r) => (
              <option key={`${r.position}-${r.id}`} value={r.id}>
                {r.label}
              </option>
            ))}
          </Select>
        </div>
        <div className="min-w-[160px]">
          <label className="text-xs text-muted-foreground block mb-1">Equipo</label>
          <Select value={teamFilter} onChange={(e) => onTeamFilterChange(e.target.value)}>
            <option value="">Todos</option>
            {teamOptions.map((team) => (
              <option key={team} value={team}>
                {team}
              </option>
            ))}
          </Select>
        </div>
        <div className="flex-1 min-w-[180px]">
          <label className="text-xs text-muted-foreground block mb-1">Buscar</label>
          <Input
            placeholder="Ej. Urena, Castro…"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
        <p className="text-sm text-muted-foreground pb-2 sm:ml-auto">{statusText}</p>
      </div>

      <div className="flex flex-wrap gap-3 items-end border-t border-border/60 pt-3">
        <div>
          <label className="text-xs text-muted-foreground block mb-1">Min. min</label>
          <Input
            type="number"
            min={0}
            className="w-20"
            value={thresholds.minMinutes}
            onChange={(e) =>
              onThresholdsChange({
                ...thresholds,
                minMinutes: Number(e.target.value) || 0,
              })
            }
          />
        </div>
        <div>
          <label className="text-xs text-muted-foreground block mb-1">Min. goles</label>
          <Input
            type="number"
            min={0}
            className="w-16"
            value={thresholds.minGoals}
            onChange={(e) =>
              onThresholdsChange({
                ...thresholds,
                minGoals: Number(e.target.value) || 0,
              })
            }
          />
        </div>
        <div>
          <label className="text-xs text-muted-foreground block mb-1">Min. asist.</label>
          <Input
            type="number"
            min={0}
            className="w-16"
            value={thresholds.minAssists}
            onChange={(e) =>
              onThresholdsChange({
                ...thresholds,
                minAssists: Number(e.target.value) || 0,
              })
            }
          />
        </div>
        <div>
          <label className="text-xs text-muted-foreground block mb-1">Min. rating</label>
          <Input
            type="number"
            min={0}
            step={0.1}
            className="w-16"
            value={thresholds.minRating}
            onChange={(e) =>
              onThresholdsChange({
                ...thresholds,
                minRating: Number(e.target.value) || 0,
              })
            }
          />
        </div>
        <div>
          <label className="text-xs text-muted-foreground block mb-1">Benchmark</label>
          <Select
            value={benchmarkScope}
            onChange={(e) =>
              onBenchmarkScopeChange(
                e.target.value as "league" | "conmebol" | "position"
              )
            }
          >
            <option value="position">Misma posición</option>
            <option value="league">Liga activa</option>
            <option value="conmebol">CONMEBOL (multi)</option>
          </Select>
        </div>
      </div>

      <p className="text-[11px] text-muted-foreground">{roleHint}</p>
    </div>
  );
}
