import { describe, it } from "node:test";
import assert from "node:assert/strict";
import type { Fixture } from "@/types";
import {
  shouldKeepLiveSession,
  shouldActivateLiveSession,
} from "./liveSession";

function fx(
  id: number,
  status: string,
  date = "2026-06-15T18:00:00+00:00"
): Fixture {
  return {
    fixture: { id, date, status: { short: status, long: status, elapsed: null } },
    league: {
      id: 1,
      name: "World Cup",
      country: "World",
      logo: "",
      flag: "",
      season: 2026,
      round: "Group A",
    },
    teams: {
      home: { id: 1, name: "A", logo: "", winner: null },
      away: { id: 2, name: "B", logo: "", winner: null },
    },
    goals: { home: null, away: null },
    score: {
      halftime: { home: null, away: null },
      fulltime: { home: null, away: null },
      extratime: { home: null, away: null },
      penalty: { home: null, away: null },
    },
  } as Fixture;
}

describe("shouldKeepLiveSession", () => {
  it("no activa sesión solo porque hay partidos FT en caché", () => {
    assert.equal(
      shouldKeepLiveSession({
        fixtures: [fx(1, "FT"), fx(2, "NS", "2026-07-01T18:00:00+00:00")],
        liveWorldCupCount: 0,
      }),
      false
    );
  });

  it("activa sesión con partido en vivo", () => {
    assert.equal(
      shouldKeepLiveSession({
        fixtures: [fx(1, "1H")],
        liveWorldCupCount: 1,
      }),
      true
    );
  });

  it("activa sesión en ventana de kickoff aunque status sea NS", () => {
    const kickoffSoon = new Date(Date.now() + 10 * 60 * 1000).toISOString();
    assert.equal(
      shouldKeepLiveSession({
        fixtures: [fx(1, "NS", kickoffSoon)],
        liveWorldCupCount: 0,
      }),
      true
    );
  });

  it("shouldActivateLiveSession es alias de shouldKeepLiveSession", () => {
    const signals = { fixtures: [fx(1, "2H")], liveWorldCupCount: 1 };
    assert.equal(
      shouldActivateLiveSession(signals),
      shouldKeepLiveSession(signals)
    );
  });
});
