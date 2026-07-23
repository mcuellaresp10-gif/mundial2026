import { describe, it } from "node:test";
import assert from "node:assert/strict";
import type { Fixture } from "@/types";
import {
  buildCupBracketFromFixtures,
  classifyCupKnockoutRound,
  isKnockoutPhaseActive,
  isRegularSeasonMatchday,
  shouldHideGroupTablesForKnockout,
} from "./cupBracket";

function makeFixture(
  id: number,
  round: string,
  homeId: number,
  awayId: number,
  homeGoals: number | null,
  awayGoals: number | null,
  status = "FT",
  date = "2026-07-10T20:00:00+00:00"
): Fixture {
  return {
    fixture: {
      id,
      referee: null,
      timezone: "UTC",
      date,
      timestamp: 0,
      periods: { first: null, second: null },
      venue: { id: 1, name: "S", city: "C" },
      status: { long: status, short: status, elapsed: null },
    },
    league: {
      id: 241,
      name: "Copa Colombia",
      country: "Colombia",
      logo: "",
      flag: null,
      season: 2026,
      round,
    },
    teams: {
      home: {
        id: homeId,
        name: `Home${homeId}`,
        logo: "",
        winner: homeGoals != null && awayGoals != null ? homeGoals > awayGoals : null,
      },
      away: {
        id: awayId,
        name: `Away${awayId}`,
        logo: "",
        winner: homeGoals != null && awayGoals != null ? awayGoals > homeGoals : null,
      },
    },
    goals: { home: homeGoals, away: awayGoals },
    score: {
      halftime: { home: null, away: null },
      fulltime: { home: homeGoals, away: awayGoals },
      extratime: { home: null, away: null },
      penalty: { home: null, away: null },
    },
  };
}

describe("cupBracket", () => {
  it("no trata jornadas regulares como KO", () => {
    assert.equal(isRegularSeasonMatchday("Apertura - 16"), true);
    assert.equal(classifyCupKnockoutRound("Apertura - 16"), null);
    assert.equal(classifyCupKnockoutRound("Group Stage - 3"), null);
    assert.equal(classifyCupKnockoutRound("Apertura - Quarter-finals"), "quarter");
    assert.equal(classifyCupKnockoutRound("Apertura - Final"), "final");
    assert.equal(classifyCupKnockoutRound("Round of 16"), "round_16");
    assert.equal(classifyCupKnockoutRound("Play-offs"), "playoffs");
    assert.equal(classifyCupKnockoutRound("1st Round - 1"), "qualifying");
  });

  it("arma columnas KO y empareja ida/vuelta", () => {
    const fixtures = [
      makeFixture(1, "Round of 16", 10, 20, 1, 0, "FT", "2026-08-01T20:00:00+00:00"),
      makeFixture(2, "Round of 16", 20, 10, 0, 0, "FT", "2026-08-08T20:00:00+00:00"),
      makeFixture(3, "Quarter-finals", 10, 30, 2, 1),
      makeFixture(4, "Group Stage - 1", 10, 40, 1, 1),
    ];
    const bracket = buildCupBracketFromFixtures(fixtures);
    assert.equal(bracket.rounds.length, 2);
    assert.equal(bracket.rounds[0].key, "round_16");
    assert.equal(bracket.rounds[0].ties.length, 1);
    assert.equal(bracket.rounds[0].ties[0].legs.length, 2);
    assert.equal(bracket.rounds[0].ties[0].winnerId, 10);
    assert.equal(bracket.rounds[1].key, "quarter");
    assert.equal(bracket.totalTies, 2);
  });

  it("detecta Copa Colombia en Play-offs tras grupos terminados", () => {
    const fixtures = [
      makeFixture(1, "Group Stage - 1", 1, 2, 1, 0, "FT"),
      makeFixture(2, "Group Stage - 2", 1, 3, 0, 0, "FT"),
      makeFixture(3, "Play-offs", 10, 20, 1, 0, "1H", "2026-07-21T22:00:00+00:00"),
      makeFixture(4, "Play-offs", 20, 10, null, null, "NS", "2026-07-28T22:00:00+00:00"),
    ];
    assert.equal(isKnockoutPhaseActive(fixtures), true);
    assert.equal(shouldHideGroupTablesForKnockout(fixtures), true);
    const bracket = buildCupBracketFromFixtures(fixtures);
    assert.equal(bracket.rounds[0].key, "playoffs");
    assert.equal(bracket.rounds[0].label, "Eliminatorias");
    assert.equal(bracket.totalTies, 1);
  });
});
