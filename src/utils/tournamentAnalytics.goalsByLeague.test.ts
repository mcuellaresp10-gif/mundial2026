import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { Fixture } from "@/types";
import { aggregateGoalsByLeague, aggregateLeagueEfficiency, aggregateMatchesByLeague } from "./tournamentAnalytics";

function fixture(partial: {
  leagueId: number;
  leagueName: string;
  homeId: number;
  awayId: number;
  homeGoals: number;
  awayGoals: number;
  status?: string;
}): Fixture {
  return {
    fixture: {
      id: partial.homeId * 1000 + partial.awayId,
      date: "2026-07-01T20:00:00Z",
      status: {
        short: partial.status ?? "FT",
        long: "Match Finished",
        elapsed: 90,
      },
    },
    league: {
      id: partial.leagueId,
      name: partial.leagueName,
      country: "World",
      logo: "",
      flag: null,
      season: 2026,
      round: "Group Stage - 1",
    },
    teams: {
      home: { id: partial.homeId, name: "Home", logo: "", winner: null },
      away: { id: partial.awayId, name: "Away", logo: "", winner: null },
    },
    goals: { home: partial.homeGoals, away: partial.awayGoals },
  } as Fixture;
}

describe("aggregateGoalsByLeague", () => {
  it("en copas continentales agrupa goles por país del club", () => {
    const fixtures = [
      fixture({
        leagueId: 11,
        leagueName: "Copa Sudamericana",
        homeId: 1,
        awayId: 2,
        homeGoals: 3,
        awayGoals: 1,
      }),
      fixture({
        leagueId: 11,
        leagueName: "Copa Sudamericana",
        homeId: 3,
        awayId: 1,
        homeGoals: 2,
        awayGoals: 0,
      }),
    ];
    const countries = new Map([
      [1, "Colombia"],
      [2, "Argentina"],
      [3, "Brazil"],
    ]);

    const rows = aggregateGoalsByLeague(fixtures, countries);
    const byLabel = Object.fromEntries(rows.map((r) => [r.label, r.value]));

    assert.equal(byLabel["Colombia"], 3);
    assert.equal(byLabel["Argentina"], 1);
    assert.equal(byLabel["Brasil"], 2);
    assert.equal(rows.some((r) => r.label === "Sudamericana"), false);
  });

  it("en ligas domésticas sigue agrupando por competición", () => {
    const fixtures = [
      fixture({
        leagueId: 239,
        leagueName: "Primera A",
        homeId: 10,
        awayId: 11,
        homeGoals: 2,
        awayGoals: 1,
      }),
    ];
    const rows = aggregateGoalsByLeague(fixtures, new Map());
    assert.equal(rows.length, 1);
    assert.equal(rows[0].label, "Colombia");
    assert.equal(rows[0].value, 3);
  });
});

describe("aggregateLeagueEfficiency / matches / reds por país en copas", () => {
  const countries = new Map([
    [1, "Colombia"],
    [2, "Argentina"],
  ]);

  it("ritmo goleador atribuye goles y partidos por país", () => {
    const fixtures = [
      fixture({
        leagueId: 11,
        leagueName: "Copa Sudamericana",
        homeId: 1,
        awayId: 2,
        homeGoals: 4,
        awayGoals: 0,
      }),
    ];
    const rows = aggregateLeagueEfficiency(fixtures, countries);
    const byLabel = Object.fromEntries(rows.map((r) => [r.label, r.value]));
    assert.equal(byLabel["Colombia"], 4);
    assert.equal(byLabel["Argentina"], 0);
  });

  it("partidos cuenta una participación por país por encuentro", () => {
    const fixtures = [
      fixture({
        leagueId: 11,
        leagueName: "Copa Sudamericana",
        homeId: 1,
        awayId: 2,
        homeGoals: 1,
        awayGoals: 1,
      }),
      fixture({
        leagueId: 11,
        leagueName: "Copa Sudamericana",
        homeId: 1,
        awayId: 2,
        homeGoals: 2,
        awayGoals: 0,
      }),
    ];
    const rows = aggregateMatchesByLeague(fixtures, countries);
    const byLabel = Object.fromEntries(rows.map((r) => [r.label, r.value]));
    assert.equal(byLabel["Colombia"], 2);
    assert.equal(byLabel["Argentina"], 2);
  });
});
