import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { Fixture, FixtureEvent } from "@/types";
import {
  aggregateScorersFromEvents,
  mergeTopScorerLists,
} from "./tournamentScorers";
import {
  getFixturesForScorerEvents,
  isFixtureLiveForScorerEvents,
} from "@/lib/liveRefresh";

function fixture(
  id: number,
  status: string,
  homeGoals: number,
  awayGoals: number,
  date = "2026-06-15T18:00:00Z"
): Fixture {
  return {
    fixture: { id, date, status: { short: status, long: status } },
    goals: { home: homeGoals, away: awayGoals },
    teams: {
      home: { id: 1, name: "Netherlands", logo: "" },
      away: { id: 2, name: "Sweden", logo: "" },
    },
  } as Fixture;
}

function goalEvent(playerId: number, name: string, team = "Netherlands"): FixtureEvent {
  return {
    type: "Goal",
    detail: "Normal Goal",
    player: { id: playerId, name },
    assist: { id: null, name: null },
    team: { id: 1, name: team, logo: "" },
    time: { elapsed: 10, extra: null },
    comments: null,
  };
}

describe("getFixturesForScorerEvents", () => {
  it("incluye partidos finalizados con goles", () => {
    const ids = getFixturesForScorerEvents([
      fixture(101, "FT", 2, 1),
      fixture(102, "FT", 0, 0),
      fixture(103, "NS", 0, 0),
    ]);
    assert.deepEqual(ids, [101]);
  });

  it("incluye partidos en vivo", () => {
    const live = fixture(201, "1H", 1, 0);
    const ids = getFixturesForScorerEvents([live]);
    assert.deepEqual(ids, [201]);
    assert.equal(isFixtureLiveForScorerEvents(live), true);
  });
});

describe("aggregateScorersFromEvents", () => {
  it("suma goles de varios partidos y excluye autogoles", () => {
    const gakpo = goalEvent(928, "C. Gakpo");
    const ownGoal: FixtureEvent = {
      ...goalEvent(99, "Defender"),
      detail: "Own Goal",
    };
    const list = aggregateScorersFromEvents([
      [gakpo],
      [gakpo, ownGoal],
    ]);
    assert.equal(list.find((p) => p.playerId === 928)?.goals, 2);
    assert.equal(list.find((p) => p.playerId === 99), undefined);
  });

  it("no duplica el mismo gol repetido en un partido", () => {
    const gakpo = goalEvent(928, "C. Gakpo");
    const list = aggregateScorersFromEvents([[gakpo, gakpo, gakpo]]);
    assert.equal(list.find((p) => p.playerId === 928)?.goals, 1);
  });
});

describe("mergeTopScorerLists", () => {
  it("toma el máximo de goles y conserva foto de la API", () => {
    const merged = mergeTopScorerLists(
      [
        {
          playerId: 928,
          name: "C. Gakpo",
          photo: "https://photo.test/gakpo.jpg",
          team: "Países Bajos",
          teamLogo: "",
          goals: 0,
          assists: 0,
          matches: 1,
          rating: 7.2,
        },
      ],
      [
        {
          playerId: 928,
          name: "C. Gakpo",
          photo: "",
          team: "Países Bajos",
          teamLogo: "",
          goals: 1,
          assists: 0,
          matches: 0,
          rating: 0,
        },
      ]
    );
    assert.equal(merged[0].goals, 1);
    assert.equal(merged[0].photo, "https://photo.test/gakpo.jpg");
    assert.equal(merged[0].rating, 7.2);
    assert.equal(merged[0].matches, 1);
  });
});
