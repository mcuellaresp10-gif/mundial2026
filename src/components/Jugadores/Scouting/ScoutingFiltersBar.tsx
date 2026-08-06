"use client";

import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import type { ScoutingRoleId } from "@/config/scoutingRoleProfiles";
import { rolesForPosition } from "@/config/scoutingRoleProfiles";
import type { ScoutingPosition } from "@/config/positionMetricProfiles";

export interface ScoutingThresholdFilters {
  minMinutes: number;
  minGoals: number;
  minAssists: number;
  minRating: number;
}

interface ScoutingFiltersBarProps {
  position: ScoutingPosition;
  roleId: ScoutingRoleId;
  onRoleChange: (id: ScoutingRoleId) => void;
  thresholds: ScoutingThresholdFilters;
  onThresholdsChange: (next: ScoutingThresholdFilters) => void;
  benchmarkScope: "league" | "conmebol" | "position";
  onBenchmarkScopeChange: (scope: "league" | "conmebol" | "position") => void;
  showBenchmark?: boolean;
}

export function ScoutingFiltersBar({
  position,
  roleId,
  onRoleChange,
  thresholds,
  onThresholdsChange,
  benchmarkScope,
  onBenchmarkScopeChange,
  showBenchmark = true,
}: ScoutingFiltersBarProps) {
  const roles = rolesForPosition(position);

  return (
    <div className="flex flex-wrap gap-3 items-end rounded-xl border bg-muted/20 p-3">
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
      <div>
        <label className="text-xs text-muted-foreground block mb-1">Min. minutos</label>
        <Input
          type="number"
          min={0}
          className="w-24"
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
          className="w-20"
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
        <label className="text-xs text-muted-foreground block mb-1">Min. asistencias</label>
        <Input
          type="number"
          min={0}
          className="w-20"
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
          className="w-20"
          value={thresholds.minRating}
          onChange={(e) =>
            onThresholdsChange({
              ...thresholds,
              minRating: Number(e.target.value) || 0,
            })
          }
        />
      </div>
      {showBenchmark && (
        <div>
          <label className="text-xs text-muted-foreground block mb-1">
            Benchmark percentiles
          </label>
          <Select
            value={benchmarkScope}
            onChange={(e) =>
              onBenchmarkScopeChange(
                e.target.value as "league" | "conmebol" | "position"
              )
            }
          >
            <option value="position">Misma posición (pool activo)</option>
            <option value="league">Liga activa</option>
            <option value="conmebol">Ámbito CONMEBOL (si multi)</option>
          </Select>
        </div>
      )}
    </div>
  );
}
