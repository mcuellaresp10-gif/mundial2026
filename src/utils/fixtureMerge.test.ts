import { describe, it } from "node:test";
import assert from "node:assert/strict";
import type { Fixture } from "@/types";
import {
  fixtureScoreRank,
  isFixtureListIncomplete,
  mergeFixtureLists,
  mergeLiveIntoFixtures,
  pickBetterFixture,
} from "./fixtureMerge";
import { MIN_WORLDCUP_FIXTURES } from "@/lib/utils";
import { aggregateGoalsByRound } from "./tournamentAnalytics";

function makeFixture(
  id: number,
  status: string,
  home: number | null,
  away: number | null,
  round = "Group Stage - 1"
): Fixture {
  return {
    fixture: {
      id,
      referee: null,
      timezone: "UTC",
      date: "2026-06-11T18:00:00+00:00",
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
    goals: { home, away },
    score: {
      halftime: { home: null, away: null },
      fulltime: { home, away },
      extratime: { home: null, away: null },
      penalty: { home: null, away: null },
    },
  };
}

describe("fixtureMerge", () => {
  it("prefiere FT con goles sobre NS sin goles", () => {
    const finished = makeFixture(1, "FT", 2, 1);
    const pending = makeFixture(1, "NS", null, null);
    assert.equal(pickBetterFixture(finished, pending).fixture.status.short, "FT");
    assert.equal(pickBetterFixture(pending, finished).fixture.status.short, "FT");
  });

  it("no degrada FT al fusionar overlay NS", () => {
    const base = [makeFixture(1, "FT", 3, 0), makeFixture(2, "FT", 1, 1)];
    const overlay = [makeFixture(1, "NS", null, null)];
    const merged = mergeFixtureLists(base, overlay);
    assert.equal(merged.find((f) => f.fixture.id === 1)?.goals.home, 3);
    assert.equal(merged.find((f) => f.fixture.id === 1)?.fixture.status.short, "FT");
  });

  it("restaura historial cuando overlay solo tiene live", () => {
    const history = [
      makeFixture(10, "FT", 2, 0),
      makeFixture(11, "FT", 1, 2),
    ];
    const liveOnly = [makeFixture(20, "1H", 1, 0, "Group Stage - 2")];
    const merged = mergeFixtureLists(liveOnly, history);
    assert.equal(merged.length, 3);
    assert.ok(fixtureScoreRank(merged.find((f) => f.fixture.id === 10)!) > 0);
  });

  it("mergeLiveIntoFixtures añade partido live ausente en base", () => {
    const base = [makeFixture(1, "FT", 1, 0)];
    const live = [makeFixture(2, "2H", 0, 1, "Group Stage - 2")];
    const merged = mergeLiveIntoFixtures(base, live);
    assert.equal(merged.length, 2);
    assert.equal(merged[1].fixture.id, 2);
  });

  it("ensambla catálogo snapshot + FT + live sin perder J1", () => {
    const catalog = Array.from({ length: 72 }, (_, i) =>
      makeFixture(i + 1, "NS", null, null, i < 24 ? "Group Stage - 1" : "Group Stage - 2")
    );
    const finished = catalog.slice(0, 24).map((f) =>
      makeFixture(f.fixture.id, "FT", 2, 1, "Group Stage - 1")
    );
    const live = [makeFixture(25, "1H", 1, 0, "Group Stage - 2")];

    let list = mergeFixtureLists(catalog, finished);
    list = mergeLiveIntoFixtures(list, live);

    assert.equal(list.length, 72);
    assert.equal(isFixtureListIncomplete(list), false);
    assert.equal(list.find((f) => f.fixture.id === 1)?.fixture.status.short, "FT");
    assert.equal(list.find((f) => f.fixture.id === 25)?.fixture.status.short, "1H");
    assert.equal(list.filter((f) => f.fixture.status.short === "NS").length, 47);
  });

  it("detecta catálogo snapshot sin FT como incompleto", () => {
    const catalogOnly = Array.from({ length: 72 }, (_, i) =>
      makeFixture(i + 1, i === 24 ? "1H" : "NS", i === 24 ? 1 : null, i === 24 ? 0 : null)
    );
    assert.equal(isFixtureListIncomplete(catalogOnly), true);
  });

  it("detecta lista incompleta", () => {
    assert.equal(isFixtureListIncomplete([]), true);
    assert.equal(isFixtureListIncomplete([makeFixture(1, "1H", 1, 0)]), true);
    assert.equal(
      isFixtureListIncomplete(Array.from({ length: MIN_WORLDCUP_FIXTURES }, (_, i) =>
        makeFixture(i + 1, "NS", null, null)
      )),
      false
    );
    const snapshotOnlyLive = [
      ...Array.from({ length: MIN_WORLDCUP_FIXTURES - 1 }, (_, i) =>
        makeFixture(i + 1, "NS", null, null)
      ),
      makeFixture(99, "1H", 1, 0, "Group Stage - 2"),
    ];
    assert.equal(isFixtureListIncomplete(snapshotOnlyLive), true);
  });
});

describe("aggregateGoalsByRound", () => {
  it("ordena jornadas y etiqueta J1/J2 correctamente", () => {
    const fixtures = [
      makeFixture(1, "FT", 2, 1, "Group Stage - 1"),
      makeFixture(2, "FT", 0, 0, "Group Stage - 1"),
      makeFixture(3, "1H", 1, 0, "Group Stage - 2"),
    ];
    const data = aggregateGoalsByRound(fixtures);
    assert.deepEqual(
      data.map((d) => d.label),
      ["J1", "J2"]
    );
    assert.equal(data[0].value, 3);
    assert.equal(data[1].value, 1);
  });
});
