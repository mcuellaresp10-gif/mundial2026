"use client";

import type { CalendarMatchEntry } from "@/types";
import type { CalendarDayCell } from "@/utils/calendarView";
import { PartidoCalendarioChip } from "./PartidoCalendarioChip";
import { cn } from "@/lib/utils";

interface CalendarioDiaCeldaProps {
  cell: CalendarDayCell;
  entries: CalendarMatchEntry[];
  isSelected: boolean;
  onSelect: (dayKey: string) => void;
}

export function CalendarioDiaCelda({
  cell,
  entries,
  isSelected,
  onSelect,
}: CalendarioDiaCeldaProps) {
  const dayNumber = cell.date.getDate();
  const hasMatches = entries.length > 0;

  return (
    <button
      type="button"
      onClick={() => onSelect(cell.dayKey)}
      className={cn(
        "min-h-[110px] rounded-lg border p-1.5 text-left transition-colors flex flex-col gap-1",
        cell.isCurrentMonth ? "bg-card" : "bg-muted/20 text-muted-foreground",
        isSelected && "ring-2 ring-mundial-gold border-mundial-gold/50",
        cell.isToday && !isSelected && "border-mundial-gold/40",
        hasMatches && "hover:bg-muted/40"
      )}
    >
      <div className="flex items-center justify-between gap-1">
        <span
          className={cn(
            "inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold",
            cell.isToday && "bg-mundial-gold text-black",
            !cell.isToday && "text-foreground"
          )}
        >
          {dayNumber}
        </span>
        {hasMatches && (
          <span className="text-[10px] font-mono text-muted-foreground tabular-nums">
            {entries.length}
          </span>
        )}
      </div>

      <div className="flex flex-col gap-1 overflow-hidden flex-1">
        {entries.slice(0, 3).map((entry) => (
          <PartidoCalendarioChip
            key={`${entry.fixtureId ?? entry.matchId ?? entry.date}-${entry.home.name}`}
            entry={entry}
          />
        ))}
        {entries.length > 3 && (
          <span className="text-[10px] text-muted-foreground px-1">
            +{entries.length - 3} más
          </span>
        )}
      </div>
    </button>
  );
}
