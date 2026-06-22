import { describe, it } from "node:test";
import assert from "node:assert/strict";
import type { Fixture } from "@/types";
import {
  buildCalendarEntries,
  filterCalendarEntriesByPhase,
} from "./calendarKnockout";
import {
  getKnockoutWinnerFromFixture,
  mapFixturesToBracketMatchIds,
  resolveKnockoutWinnersFromFixtures,
  type ResolvedBracketMatch,
  type ResolvedR32Match,
} from "./knockoutBracket";

function makeFixture(
  id: number,
  round: string,
  home: { id: number; name: string },
  away: { id: number; name: string },
  date: string,
  status = "NS",
  goals: { home: number | null; away: number | null } = { home: null, away: null }
): Fixture {
  return {
    fixture: {
      id,
      referee: null,
      timezone: "UTC",
      date,
      timestamp: 0,
      periods: { first: null, second: null },
      venue: { id: 1, name: "Stadium", city: "City" },
      status: { long: status, short: status, elapsed: null },
    },
    league: {
      id: 1,
      name: "World Cup",
      country: "World",
      logo: "",
      flag: null,
      season: 2026,
      round,
    },
    teams: {
      home: { ...home, logo: "", winner: null },
      away: { ...away, logo: "", winner: null },
    },
    goals,
    score: {
      halftime: { home: null, away: null },
      fulltime: goals,
      extratime: { home: null, away: null },
      penalty: { home: null, away: null },
    },
  };
}

describe("calendarKnockout", () => {
  it("filtra por fase de eliminatorias", () => {
    const entries = [
      {
        date: "2026-07-01T18:00:00+00:00",
        roundLabel: "16avos de final",
        home: { name: "A" },
        away: { name: "B" },
        isProjected: true,
      },
      {
        date: "2026-06-11T18:00:00+00:00",
        roundLabel: "Grupo A",
        home: { name: "C" },
        away: { name: "D" },
        isProjected: false,
      },
    ];
    const filtered = filterCalendarEntriesByPhase(entries, "16avos");
    assert.equal(filtered.length, 1);
    assert.equal(filtered[0].roundLabel, "16avos de final");
  });

  it("enriquece eliminatorias con proyección del cuadro", () => {
    const fixture = makeFixture(
      900,
      "Round of 32",
      { id: 10, name: "Winner Group A" },
      { id: 20, name: "Winner Group B" },
      "2026-07-01T18:00:00+00:00"
    );

    const roundOf32: ResolvedR32Match[] = [
      {
        matchId: 73,
        side: "left",
        order: 2,
        home: {
          label: "2A",
          team: { teamId: 1, name: "México", logo: "/mx.png" },
          provisional: false,
        },
        away: {
          label: "2B",
          team: { teamId: 2, name: "Brasil", logo: "/br.png" },
          provisional: false,
        },
      },
    ];

    const bracket = {
      roundOf32,
      knockoutMatches: [] as ResolvedBracketMatch[],
      fixtureByMatchId: new Map([[73, fixture]]),
      groupStrips: {} as never,
      qualifyingThirdGroups: [],
      annexKey: null,
      isProvisional: true,
      rankedBestThirds: [],
    };

    const entries = buildCalendarEntries([fixture], bracket);
    assert.equal(entries.length, 1);
    assert.equal(entries[0].matchId, 73);
    assert.equal(entries[0].home.name, "México");
    assert.equal(entries[0].away.name, "Brasil");
    assert.equal(entries[0].isProjected, true);
  });
});

describe("knockout winner propagation", () => {
  it("propaga ganador M74 a octavos M89", () => {
    const r32: ResolvedR32Match[] = [
      {
        matchId: 74,
        side: "left",
        order: 0,
        home: {
          label: "2A",
          team: { teamId: 1, name: "México", logo: "" },
          provisional: false,
        },
        away: {
          label: "2B",
          team: { teamId: 2, name: "Brasil", logo: "" },
          provisional: false,
        },
      },
    ];

    const knockout: ResolvedBracketMatch[] = [
      {
        matchId: 89,
        round: "round_of_16",
        side: "left",
        order: 0,
        feedsFrom: [74, 77],
        home: { label: "Ganador M74", team: null, provisional: true },
        away: { label: "Ganador M77", team: null, provisional: true },
      },
    ];

    const m74 = makeFixture(
      100,
      "Round of 32",
      { id: 1, name: "México" },
      { id: 2, name: "Brasil" },
      "2026-07-01T18:00:00+00:00",
      "FT",
      { home: 2, away: 1 }
    );

    const fixtureByMatchId = mapFixturesToBracketMatchIds(
      [m74],
      r32,
      knockout
    );
    assert.equal(fixtureByMatchId.get(74)?.fixture.id, 100);

    const winner = getKnockoutWinnerFromFixture(m74);
    assert.equal(winner?.name, "México");

    const updated = resolveKnockoutWinnersFromFixtures(r32, knockout, fixtureByMatchId);
    assert.equal(updated[0].home.team?.name, "México");
    assert.equal(updated[0].home.provisional, false);
  });
});
