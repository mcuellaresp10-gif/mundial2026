"use client";

import type { ScoutingMetricViewId } from "@/config/scoutingMetricViews";
import { metricViewOptions } from "@/config/scoutingMetricViews";
import type { ScoutingPosition } from "@/config/positionMetricProfiles";
import { cn } from "@/lib/utils";
import { Info } from "lucide-react";

interface ScoutingMetricViewPickerProps {
  position: ScoutingPosition;
  value: ScoutingMetricViewId;
  onChange: (viewId: ScoutingMetricViewId) => void;
  className?: string;
}

export function ScoutingMetricViewPicker({
  position,
  value,
  onChange,
  className,
}: ScoutingMetricViewPickerProps) {
  const options = metricViewOptions(position);

  return (
    <div className={cn("space-y-1.5", className)}>
      <p className="text-xs text-muted-foreground">Tipo de estadística</p>
      <div className="flex flex-wrap gap-1.5">
        {options.map((opt) => {
          const active = value === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              title={opt.description}
              aria-label={`${opt.label}: ${opt.description}`}
              onClick={() => onChange(opt.value)}
              className={cn(
                "group inline-flex items-center gap-1 rounded-md border px-2.5 py-1.5 text-xs font-medium transition-colors",
                active
                  ? "border-mundial-gold/50 bg-mundial-gold/15 text-mundial-gold"
                  : "border-border bg-muted/30 text-muted-foreground hover:border-mundial-gold/30 hover:text-foreground"
              )}
            >
              {opt.label}
              <Info
                className={cn(
                  "h-3 w-3 shrink-0 opacity-50 group-hover:opacity-100",
                  active && "opacity-80"
                )}
                aria-hidden
              />
            </button>
          );
        })}
      </div>
      <p className="text-[11px] text-muted-foreground leading-snug">
        {options.find((o) => o.value === value)?.description}
      </p>
    </div>
  );
}
