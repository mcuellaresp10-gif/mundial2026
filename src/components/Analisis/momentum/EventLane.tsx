"use client";

import type { ChartEventMarker } from "@/utils/matchEventMarkers";

interface EventLaneProps {
  markers: ChartEventMarker[];
  maxMinute: number;
}

export function EventLane({ markers, maxMinute }: EventLaneProps) {
  if (markers.length === 0 || maxMinute <= 0) return null;

  return (
    <div className="relative mb-2 h-10 border-y border-zinc-700/60">
      <div className="absolute inset-x-10 inset-y-0">
        {markers.map((m) => {
          const pct = clampPct((m.minute / maxMinute) * 100);
          const isHome = m.teamSide === "home";
          return (
            <div
              key={`${m.minute}-${m.kind}-${m.player}`}
              className="absolute -translate-x-1/2 cursor-default"
              style={{
                left: `${pct}%`,
                top: isHome ? "2px" : "auto",
                bottom: isHome ? "auto" : "2px",
              }}
              title={`${m.label} — ${m.detail}`}
            >
              <span className="text-sm leading-none drop-shadow-md">{m.icon}</span>
            </div>
          );
        })}
      </div>
      <div className="pointer-events-none absolute inset-x-10 top-1/2 h-px bg-zinc-600" />
    </div>
  );
}

function clampPct(pct: number): number {
  return Math.max(2, Math.min(98, pct));
}
