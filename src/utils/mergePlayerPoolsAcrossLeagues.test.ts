import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { Player, PlayerStatistics } from "@/types";
import { mergePlayerPoolsAcrossLeagues } from "@/utils/mergePlayerPoolsAcrossLeagues";
import type { AmericasLeague } from "@/data/americasLeagues";

function leagueMeta(
  id: number,
  slug: string,
  shortName: string
): AmericasLeague {
  return {
    id,
    slug,
    name: shortName,
    shortName,
    country: "Test",
    countryCode: "XX",
    type: "domestic",
    seasonMode: "annual",
    defaultSeason: 2026,
  };
}

function statRow(
  leagueId: number,
  teamId: number,
  teamName: string,
  minutes: number,
  goals: number,
  assists: number
): PlayerStatistics {
  return {
    team: { id: teamId, name: teamName, logo: "" },
    league: {
      id: leagueId,
      name: `L${leagueId}`,
      country: "Test",
      logo: "",
      flag: null,
      season: 2026,
    },
    games: {
      appearences: 5,
      lineups: 5,
      minutes,
      number: 9,
      position: "Attacker",
      rating: "7.00",
      captain: false,
    },
    goals: { total: goals, assists, conceded: 0, saves: 0 },
    cards: { yellow: 0, red: 0, yellowred: 0 },
    shots: { total: 10, on: 4 },
    passes: { total: 100, key: 5, accuracy: 80 },
    duels: { total: 20, won: 10 },
    dribbles: { attempts: 8, success: 4, past: null },
    tackles: { total: 2, blocks: 0, interceptions: 1 },
    fouls: { drawn: 3, committed: 2 },
  };
}

function playerWith(id: number, name: string, row: PlayerStatistics): Player {
  return {
    player: {
      id,
      name,
      firstname: name,
      lastname: "",
      age: 25,
      birth: { date: null, place: null, country: null },
      nationality: "Test",
      height: null,
      weight: null,
      injured: false,
      photo: "",
    },
    statistics: [row],
  };
}

describe("mergePlayerPoolsAcrossLeagues", () => {
  it("suma stats del mismo jugador en varias ligas", () => {
    const mls = leagueMeta(253, "mls", "MLS");
    const leaguesCup = leagueMeta(772, "leagues-cup", "Leagues Cup");

    const a = playerWith(1, "Star", statRow(253, 10, "Inter Miami", 900, 8, 3));
    const b = playerWith(1, "Star", statRow(772, 10, "Inter Miami", 270, 2, 1));
    const other = playerWith(2, "Other", statRow(253, 11, "LAFC", 800, 4, 0));

    const merged = mergePlayerPoolsAcrossLeagues([
      { league: mls, players: [a, other] },
      { league: leaguesCup, players: [b] },
    ]);

    const star = merged.find((p) => p.player.id === 1);
    assert.ok(star);
    assert.equal(star!.statistics[0].games.minutes, 1170);
    assert.equal(star!.statistics[0].goals.total, 10);
    assert.equal(star!.statistics[0].goals.assists, 4);
    assert.equal(merged.length, 2);
  });
});
