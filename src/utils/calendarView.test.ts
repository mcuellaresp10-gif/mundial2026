import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  buildMonthGrid,
  groupCalendarEntriesByDay,
  pickDefaultDayKey,
  WEEKDAY_LABELS,
} from "./calendarView";
import type { CalendarMatchEntry } from "@/types";

describe("calendarView", () => {
  it("la rejilla mensual empieza en domingo", () => {
    assert.equal(WEEKDAY_LABELS[0], "Dom");
    const grid = buildMonthGrid(new Date(2026, 5, 1));
    assert.ok(grid.length >= 28);
    assert.equal(grid[0].date.getDay(), 0);
  });

  it("agrupa entradas por día local", () => {
    const entries: CalendarMatchEntry[] = [
      {
        date: "2026-06-11T18:00:00+00:00",
        roundLabel: "Grupo A",
        home: { name: "A" },
        away: { name: "B" },
        isProjected: false,
      },
      {
        date: "2026-06-11T22:00:00+00:00",
        roundLabel: "Grupo B",
        home: { name: "C" },
        away: { name: "D" },
        isProjected: false,
      },
      {
        date: "2026-06-12T18:00:00+00:00",
        roundLabel: "Grupo C",
        home: { name: "E" },
        away: { name: "F" },
        isProjected: false,
      },
    ];

    const byDay = groupCalendarEntriesByDay(entries);
    const keys = [...byDay.keys()];
    assert.equal(keys.length, 2);
    assert.equal(byDay.get(keys[0])?.length, 2);
  });

  it("elige el primer día con partidos al abrir el mes", () => {
    const month = new Date(2026, 5, 1);
    const grid = buildMonthGrid(month);
    const byDay = new Map<string, CalendarMatchEntry[]>([
      [
        "2026-06-15",
        [
          {
            date: "2026-06-15T18:00:00+00:00",
            roundLabel: "Grupo A",
            home: { name: "A" },
            away: { name: "B" },
            isProjected: false,
          },
        ],
      ],
    ]);
    const picked = pickDefaultDayKey(grid, byDay, "2026-06-01");
    assert.equal(picked, "2026-06-15");
  });
});
