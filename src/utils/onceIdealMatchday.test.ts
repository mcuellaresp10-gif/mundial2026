import { describe, it } from "node:test";
import assert from "node:assert/strict";
import type { Fixture, FixturePlayersTeam } from "@/types";
import {
  flattenFixturePlayersTeams,
  listJornadasFromFixtures,
  pickLatestFinishedJornada,
  pickLatestPlayedJornada,
} from "./onceIdealMatchday";
import { buildOnceIdealFromCandidates } from "./calculations";

function fixture(id: number, round: string, status: string): Fixture {
  return {
    fixture: {
      id,
      referee: null,
      timezone: "UTC",
      date: "2026-06-15T18:00:00+00:00",
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
      home: { id: 1, name: "Home", logo: "", winner: null },
      away: { id: 2, name: "Away", logo: "", winner: null },
    },
    goals: { home: 1, away: 0 },
    score: {
      halftime: { home: 0, away: 0 },
      fulltime: { home: 1, away: 0 },
      extratime: { home: null, away: null },
      penalty: { home: null, away: null },
    },
  };
}

describe("onceIdealMatchday", () => {
  it("agrupa fixtures por jornada y ordena fase de grupos", () => {
    const fixtures = [
      fixture(3, "Group Stage - 2", "FT"),
      fixture(1, "Group Stage - 1", "FT"),
      fixture(2, "Group Stage - 1", "NS"),
    ];
    const jornadas = listJornadasFromFixtures(fixtures);
    assert.equal(jornadas.length, 2);
    assert.equal(jornadas[0].round, "Group Stage - 1");
    assert.deepEqual(jornadas[0].finishedFixtureIds, [1]);
    assert.deepEqual(jornadas[0].playedFixtureIds, [1]);
    assert.equal(jornadas[1].round, "Group Stage - 2");
  });

  it("elige la última jornada con partidos jugados", () => {
    const jornadas = listJornadasFromFixtures([
      fixture(1, "Group Stage - 1", "FT"),
      fixture(2, "Group Stage - 2", "1H"),
      fixture(3, "Group Stage - 3", "NS"),
    ]);
    const latest = pickLatestPlayedJornada(jornadas);
    assert.equal(latest?.round, "Group Stage - 2");
  });

  it("construye once ideal por jornada desde ratings de partido", () => {
    const teams: FixturePlayersTeam[] = [
      {
        team: { id: 10, name: "Argentina", code: "ARG", country: "Argentina", founded: null, national: true, logo: "a.png" },
        players: [
          {
            player: { id: 1, name: "GK", photo: "" },
            statistics: [{ games: { minutes: 90, rating: "8.5", position: "G", appearences: 1, lineups: 1, number: 1, captain: false }, team: { id: 10, name: "Argentina", code: "ARG", country: "Argentina", founded: null, national: true, logo: "a.png" }, league: { id: 1, name: "WC", country: "World", logo: "", flag: null, season: 2026 }, substitutes: { in: 0, out: 0, bench: 0 }, shots: { total: 0, on: 0 }, goals: { total: 0, conceded: 0, assists: 0, saves: 0 }, passes: { total: 0, key: 0, accuracy: null }, tackles: { total: 0, blocks: 0, interceptions: 0 }, duels: { total: 0, won: 0 }, dribbles: { attempts: 0, success: 0, past: 0 }, fouls: { drawn: 0, committed: 0 }, cards: { yellow: 0, yellowred: 0, red: 0 }, penalty: { won: 0, commited: 0, scored: 0, missed: 0, saved: 0 } }],
          },
          {
            player: { id: 2, name: "Def", photo: "" },
            statistics: [{ games: { minutes: 90, rating: "7.8", position: "D", appearences: 1, lineups: 1, number: 4, captain: false }, team: { id: 10, name: "Argentina", code: "ARG", country: "Argentina", founded: null, national: true, logo: "a.png" }, league: { id: 1, name: "WC", country: "World", logo: "", flag: null, season: 2026 }, substitutes: { in: 0, out: 0, bench: 0 }, shots: { total: 0, on: 0 }, goals: { total: 0, conceded: 0, assists: 0, saves: 0 }, passes: { total: 0, key: 0, accuracy: null }, tackles: { total: 0, blocks: 0, interceptions: 0 }, duels: { total: 0, won: 0 }, dribbles: { attempts: 0, success: 0, past: 0 }, fouls: { drawn: 0, committed: 0 }, cards: { yellow: 0, yellowred: 0, red: 0 }, penalty: { won: 0, commited: 0, scored: 0, missed: 0, saved: 0 } }],
          },
        ],
      },
    ];

    const candidates = flattenFixturePlayersTeams(teams);
    assert.equal(candidates.length, 2);
    assert.equal(candidates[0].position, "G");

    const xi = buildOnceIdealFromCandidates(candidates, "4-3-3");
    assert.ok(xi.some((p) => p.id === 1));
    assert.ok(xi.some((p) => p.id === 2));
  });
});
