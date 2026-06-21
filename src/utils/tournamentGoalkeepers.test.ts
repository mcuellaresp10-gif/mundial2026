import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { Fixture, Lineup } from "@/types";
import {
  aggregateCleanSheetsFromLineups,
  goalkeeperMetricsFromStat,
  isGoalkeeperStat,
} from "./tournamentGoalkeepers";

describe("goalkeeperMetricsFromStat", () => {
  it("calcula GA/90 y porcentaje de paradas", () => {
    const metrics = goalkeeperMetricsFromStat({
      team: { id: 1, name: "A", logo: "", country: "", winner: false },
      league: { id: 1, name: "WC", country: "World", logo: "", flag: null, season: 2026 },
      games: { appearences: 2, lineups: 2, minutes: 180, number: 1, position: "G", rating: "7.0", captain: false },
      substitutes: { in: 0, out: 0, bench: 0 },
      shots: { total: 0, on: 0 },
      goals: { total: 0, conceded: 2, assists: 0, saves: 8 },
      passes: { total: 20, key: 0, accuracy: 80 },
      tackles: { total: 0, blocks: 0, interceptions: 0 },
      duels: { total: 0, won: 0 },
      dribbles: { attempts: 0, success: 0, past: 0 },
      fouls: { drawn: 0, committed: 0 },
      cards: { yellow: 0, yellowred: 0, red: 0 },
      penalty: { won: 0, commited: 0, scored: 0, missed: 0, saved: 0 },
    });

    assert.equal(metrics.goalsConceded, 2);
    assert.equal(metrics.concededPer90, 1);
    assert.equal(metrics.savePercentage, 80);
  });
});

describe("isGoalkeeperStat", () => {
  it("detecta posición de portero", () => {
    assert.equal(isGoalkeeperStat({ games: { position: "G" } as never }), true);
    assert.equal(isGoalkeeperStat({ games: { position: "Goalkeeper" } as never }), true);
    assert.equal(isGoalkeeperStat({ games: { position: "D" } as never }), false);
  });
});

describe("aggregateCleanSheetsFromLineups", () => {
  it("suma vallas invictas al portero titular", () => {
    const fixture = {
      fixture: { id: 1, date: "2026-06-01", status: { short: "FT", long: "FT" } },
      goals: { home: 2, away: 0 },
      teams: {
        home: { id: 10, name: "Home", logo: "" },
        away: { id: 20, name: "Away", logo: "" },
      },
    } as Fixture;

    const lineups: Lineup[] = [
      {
        team: { id: 10, name: "Home", logo: "", colors: null },
        coach: { id: 1, name: "Coach", photo: "" },
        formation: "4-3-3",
        startXI: [{ player: { id: 99, name: "GK", number: 1, pos: "G", grid: null } }],
        substitutes: [],
      },
    ];

    const map = aggregateCleanSheetsFromLineups([{ fixture, lineups }]);
    assert.equal(map.get(99), 1);
  });
});
