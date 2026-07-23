"use client";

import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GridSkeleton } from "@/components/shared/Loading";
import { CalendarioDiaCelda } from "./CalendarioDiaCelda";
import { CalendarioDiaDetalle } from "./CalendarioDiaDetalle";
import type { CalendarMatchEntry, Fixture, PhaseFilter } from "@/types";
import {
  buildMonthGrid,
  countEntriesInMonth,
  groupCalendarEntriesByDay,
  pickDefaultDayKey,
  WEEKDAY_LABELS,
} from "@/utils/calendarView";
import { getLocalDayKey } from "@/lib/liveRefresh";
import { addMonths, format } from "date-fns";
import { es } from "date-fns/locale";

interface CalendarioMensualProps {
  entries: CalendarMatchEntry[];
  fixtureById: Map<number, Fixture>;
  isLoading: boolean;
  phase: PhaseFilter;
  visibleMonth: Date;
  onVisibleMonthChange: (month: Date) => void;
}

export function CalendarioMensual({
  entries,
  fixtureById,
  isLoading,
  visibleMonth,
  onVisibleMonthChange,
}: CalendarioMensualProps) {
  const [selectedDayKey, setSelectedDayKey] = useState<string | null>(null);

  const grid = useMemo(() => buildMonthGrid(visibleMonth), [visibleMonth]);
  const byDay = useMemo(() => groupCalendarEntriesByDay(entries), [entries]);
  const monthCount = useMemo(
    () => countEntriesInMonth(entries, visibleMonth),
    [entries, visibleMonth]
  );

  useEffect(() => {
    const todayKey = getLocalDayKey(new Date());
    setSelectedDayKey(pickDefaultDayKey(grid, byDay, todayKey));
  }, [grid, byDay, visibleMonth]);

  const selectedEntries = selectedDayKey ? byDay.get(selectedDayKey) ?? [] : [];

  if (isLoading) {
    return <GridSkeleton count={6} />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={() => onVisibleMonthChange(addMonths(visibleMonth, -1))}
            aria-label="Mes anterior"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <h2 className="text-xl font-semibold capitalize min-w-[180px] text-center">
            {format(visibleMonth, "MMMM yyyy", { locale: es })}
          </h2>
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={() => onVisibleMonthChange(addMonths(visibleMonth, 1))}
            aria-label="Mes siguiente"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">
            {monthCount} partido{monthCount === 1 ? "" : "s"} en el mes
          </span>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => {
              const today = new Date();
              onVisibleMonthChange(today);
              setSelectedDayKey(getLocalDayKey(today));
            }}
          >
            Hoy
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1 sm:gap-2">
        {WEEKDAY_LABELS.map((label) => (
          <div
            key={label}
            className="text-center text-xs font-semibold text-muted-foreground py-1"
          >
            {label}
          </div>
        ))}
        {grid.map((cell) => (
          <CalendarioDiaCelda
            key={cell.dayKey}
            cell={cell}
            entries={byDay.get(cell.dayKey) ?? []}
            isSelected={cell.dayKey === selectedDayKey}
            onSelect={setSelectedDayKey}
          />
        ))}
      </div>

      <CalendarioDiaDetalle
        dayKey={selectedDayKey}
        entries={selectedEntries}
        fixtureById={fixtureById}
      />
    </div>
  );
}
