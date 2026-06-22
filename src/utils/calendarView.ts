import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isToday,
  parseISO,
} from "date-fns";
import { getLocalDayKey } from "@/lib/liveRefresh";
import type { CalendarMatchEntry } from "@/types";

export interface CalendarDayCell {
  date: Date;
  dayKey: string;
  isCurrentMonth: boolean;
  isToday: boolean;
}

export const WEEKDAY_LABELS = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"] as const;

/** Rejilla mensual completa; semana empieza en domingo. */
export function buildMonthGrid(visibleMonth: Date): CalendarDayCell[] {
  const monthStart = startOfMonth(visibleMonth);
  const monthEnd = endOfMonth(visibleMonth);
  const gridStart = startOfWeek(monthStart, { weekStartsOn: 0 });
  const gridEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });

  return eachDayOfInterval({ start: gridStart, end: gridEnd }).map((date) => ({
    date,
    dayKey: getLocalDayKey(date),
    isCurrentMonth: isSameMonth(date, visibleMonth),
    isToday: isToday(date),
  }));
}

export function groupCalendarEntriesByDay(
  entries: CalendarMatchEntry[]
): Map<string, CalendarMatchEntry[]> {
  const byDay = new Map<string, CalendarMatchEntry[]>();

  for (const entry of entries) {
    const key = getLocalDayKey(entry.date);
    const list = byDay.get(key) ?? [];
    list.push(entry);
    byDay.set(key, list);
  }

  for (const list of byDay.values()) {
    list.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }

  return byDay;
}

export function countEntriesInMonth(entries: CalendarMatchEntry[], month: Date): number {
  return entries.filter((entry) => isSameMonth(parseISO(entry.date), month)).length;
}

export function pickDefaultDayKey(
  grid: CalendarDayCell[],
  byDay: Map<string, CalendarMatchEntry[]>,
  todayKey: string
): string {
  const todayInMonth = grid.some((cell) => cell.dayKey === todayKey && cell.isCurrentMonth);
  if (todayInMonth && (byDay.get(todayKey)?.length ?? 0) > 0) {
    return todayKey;
  }

  const inMonth = grid.filter((cell) => cell.isCurrentMonth);
  const withMatches = inMonth.filter((cell) => (byDay.get(cell.dayKey)?.length ?? 0) > 0);
  if (withMatches.length > 0) return withMatches[0].dayKey;

  const todayCell = grid.find((cell) => cell.isToday && cell.isCurrentMonth);
  if (todayCell) return todayCell.dayKey;

  return inMonth[0]?.dayKey ?? grid[0]?.dayKey ?? todayKey;
}
