import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { PlayerStatistics, Team } from "@/types";
import {
  isWorldCupStatRow,
  pickWorldCupStat,
  splitPlayerStatistics,
} from "./playerStats";

const netherlands: Team = {
  id: 111,
  name: "Netherlands",
  logo: "",
  code: "NED",
  country: "Netherlands",
  founded: null,
  national: true,
};

const inter = { id: 505, name: "Inter", logo: "", country: "Italy" };

function stat(
  league: { id: number; name: string; season: number },
  team: { id: number; name: string },
  games: { appearences?: number; minutes?: number; rating?: string | null } = {}
): PlayerStatistics {
  return {
    team: { id: team.id, name: team.name, logo: "" },
    league: {
      id: league.id,
      name: league.name,
      country: league.id === 1 ? "World" : "Italy",
      logo: "",
      flag: null,
      season: league.season,
    },
    games: {
      appearences: games.appearences ?? 0,
      minutes: games.minutes ?? 0,
      rating: games.rating ?? "7.0",
      position: "D",
      number: 22,
    },
    goals: { total: 0, assists: 0, conceded: 0, saves: 0 },
    cards: { yellow: 0, red: 0 },
    shots: { total: 0, on: 0 },
    passes: { total: 0, key: 0, accuracy: null },
    duels: { total: 0, won: 0 },
    dribbles: { attempts: 0, success: 0 },
    tackles: { total: 0, blocks: 0, interceptions: 0 },
    fouls: { drawn: 0, committed: 0 },
  };
}

describe("playerStats world cup split", () => {
  it("detecta filas del mundial por league id o nombre", () => {
    assert.equal(
      isWorldCupStatRow(stat({ id: 1, name: "World Cup", season: 2026 }, netherlands), 111),
      true
    );
    assert.equal(
      isWorldCupStatRow(stat({ id: 39, name: "Premier League", season: 2026 }, inter), 111),
      false
    );
  });

  it("separa stats de selección y mundial", () => {
    const stats = [
      stat({ id: 10, name: "Friendlies", season: 2026 }, netherlands, { appearences: 3, minutes: 270 }),
      stat({ id: 1, name: "World Cup", season: 2026 }, netherlands, { appearences: 2, minutes: 180 }),
      stat({ id: 135, name: "Serie A", season: 2026 }, inter, { appearences: 30, minutes: 2500 }),
    ];
    const bundle = splitPlayerStatistics(stats, netherlands);
    assert.equal(bundle.worldCup?.games.appearences, 2);
    assert.equal(bundle.national?.games.appearences, 3);
    assert.equal(bundle.club?.games.appearences, 30);
  });

  it("pickWorldCupStat no exige season estricto distinto de PLAYER_STAT_SEASONS", () => {
    const wc = pickWorldCupStat(
      [stat({ id: 1, name: "World Cup", season: 2026 }, netherlands, { appearences: 1, minutes: 90 })],
      netherlands
    );
    assert.ok(wc);
    assert.equal(wc?.games.minutes, 90);
  });
});
