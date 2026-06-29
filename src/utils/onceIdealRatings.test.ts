import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { FixturePlayersTeam } from "@/types";
import { filterCandidatesByConfederation } from "./onceIdealConfederation";
import {
  aggregateCandidatesFromFixturePlayerTeams,
  mergeWorldCupPoolIntoSquads,
  playerToOnceIdealCandidate,
} from "./onceIdealRatings";
import { aggregateStatistics } from "./playerStats";

const team = {
  id: 10,
  name: "Argentina",
  code: "ARG",
  country: "Argentina",
  founded: null,
  national: true,
  logo: "a.png",
};

function matchStat(minutes: number, rating: string, position: string) {
  return {
    games: {
      minutes,
      rating,
      position,
      appearences: 1,
      lineups: 1,
      number: 10,
      captain: false,
    },
    team,
    league: { id: 1, name: "World Cup", country: "World", logo: "", flag: null, season: 2026 },
    substitutes: { in: 0, out: 0, bench: 0 },
    shots: { total: 0, on: 0 },
    goals: { total: 0, conceded: 0, assists: 0, saves: 0 },
    passes: { total: 0, key: 0, accuracy: null },
    tackles: { total: 0, blocks: 0, interceptions: 0 },
    duels: { total: 0, won: 0 },
    dribbles: { attempts: 0, success: 0, past: 0 },
    fouls: { drawn: 0, committed: 0 },
    cards: { yellow: 0, yellowred: 0, red: 0 },
    penalty: { won: 0, commited: 0, scored: 0, missed: 0, saved: 0 },
  };
}

describe("onceIdealRatings", () => {
  it("pondera el rating por minutos en varios partidos", () => {
    const groups: FixturePlayersTeam[][] = [
      [
        {
          team,
          players: [
            {
              player: { id: 1, name: "Star", photo: "" },
              statistics: [matchStat(90, "8.0", "M")],
            },
          ],
        },
      ],
      [
        {
          team,
          players: [
            {
              player: { id: 1, name: "Star", photo: "" },
              statistics: [matchStat(45, "7.0", "M")],
            },
          ],
        },
      ],
    ];

    const [candidate] = aggregateCandidatesFromFixturePlayerTeams(groups);
    assert.equal(candidate.rating, 7.67);
    assert.equal(candidate.position, "M");
  });

  it("elige la posición donde más minutos jugó", () => {
    const groups: FixturePlayersTeam[][] = [
      [
        {
          team,
          players: [
            {
              player: { id: 2, name: "Hybrid", photo: "" },
              statistics: [matchStat(60, "7.5", "D")],
            },
          ],
        },
      ],
      [
        {
          team,
          players: [
            {
              player: { id: 2, name: "Hybrid", photo: "" },
              statistics: [matchStat(30, "7.8", "M")],
            },
          ],
        },
      ],
    ];

    const [candidate] = aggregateCandidatesFromFixturePlayerTeams(groups);
    assert.equal(candidate.position, "D");
  });

  it("prioriza stats del mundial del pool sobre el fetch rápido", () => {
    const squadPlayer = {
      player: { id: 99, name: "Test", photo: "", firstname: "Test", lastname: "", age: 25, birth: { date: null, place: null, country: null }, nationality: "X", height: null, weight: null, injured: false },
      nationalTeam: team,
      statistics: [],
      statBundle: {
        club: null,
        national: null,
        worldCup: {
          ...matchStat(90, "6.0", "Midfielder"),
          team,
          league: { id: 10, name: "Friendlies", country: "World", logo: "", flag: null, season: 2026 },
        },
      },
    };

    const poolPlayer = {
      player: squadPlayer.player,
      statistics: [{ ...matchStat(180, "8.2", "Midfielder"), goals: { total: 5, conceded: 0, assists: 2, saves: 0 } }],
    };

    const [merged] = mergeWorldCupPoolIntoSquads([squadPlayer], [poolPlayer]);
    const candidate = playerToOnceIdealCandidate(merged);
    assert.ok(candidate);
    assert.equal(candidate!.rating, 8.2);
    assert.equal(candidate!.goals, 5);
  });

  it("resuelve stats del mundial en el pool aunque no tenga statBundle", () => {
    const squadPlayer = {
      player: { id: 154, name: "L. Messi", photo: "", firstname: "Lionel", lastname: "Messi", age: 38, birth: { date: null, place: null, country: null }, nationality: "Argentina", height: null, weight: null, injured: false },
      nationalTeam: team,
      statistics: [],
      statBundle: { club: null, national: null, worldCup: null },
    };

    const poolPlayer = {
      player: squadPlayer.player,
      statistics: [{ ...matchStat(270, "7.9", "Attacker"), goals: { total: 5, conceded: 0, assists: 3, saves: 0 } }],
    };

    const [merged] = mergeWorldCupPoolIntoSquads([squadPlayer], [poolPlayer]);
    const candidate = playerToOnceIdealCandidate(merged);
    assert.ok(candidate);
    assert.equal(candidate!.goals, 5);
    assert.equal(candidate!.position, "F");
  });

  it("filterCandidatesByConfederation deja solo la confederación elegida", () => {
    const candidates = [
      {
        id: 1,
        name: "A",
        photo: "",
        team: "Colombia",
        teamLogo: "",
        position: "F",
        rating: 7.5,
        goals: 1,
        assists: 0,
        minutes: 90,
      },
      {
        id: 2,
        name: "B",
        photo: "",
        team: "France",
        teamLogo: "",
        position: "M",
        rating: 7.8,
        goals: 0,
        assists: 1,
        minutes: 90,
      },
    ];

    const conmebol = filterCandidatesByConfederation(candidates, "CONMEBOL");
    assert.equal(conmebol.length, 1);
    assert.equal(conmebol[0]!.team, "Colombia");
    assert.equal(filterCandidatesByConfederation(candidates, "all").length, 2);
  });

  it("aggregateStatistics pondera rating por minutos", () => {
    const base = matchStat(90, "7.0", "M");
    const aggregated = aggregateStatistics(
      [
        { ...base, games: { ...base.games, minutes: 90, rating: "8.0" } },
        { ...base, games: { ...base.games, minutes: 45, rating: "7.0" } },
      ],
      team,
      "Mundial"
    );
    assert.equal(aggregated?.games.rating, "7.67");
  });
});
