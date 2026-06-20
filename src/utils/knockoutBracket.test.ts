import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { ROUND_OF_32 } from "@/data/worldCup2026Bracket";
import {
  lookupAnnexC,
  resolveKnockoutBracket,
  getRoundOf32BySide,
} from "@/utils/knockoutBracket";
import type { StandingsGroup, StandingTeam, Team } from "@/types";

function makeTeam(id: number, name: string): Team {
  return {
    id,
    name,
    logo: `https://example.com/${id}.png`,
    code: "XX",
    country: name,
    founded: null,
    national: true,
  };
}

function makeRow(rank: number, team: Team, points: number, played = 3): StandingTeam {
  return {
    rank,
    team,
    points,
    goalsDiff: points,
    group: "Group A",
    form: "WWW",
    status: "same",
    description: null,
    all: {
      played,
      win: points / 3,
      draw: 0,
      lose: 0,
      goals: { for: points, against: 0 },
    },
    home: { played: 0, win: 0, draw: 0, lose: 0, goals: { for: 0, against: 0 } },
    away: { played: 0, win: 0, draw: 0, lose: 0, goals: { for: 0, against: 0 } },
    update: "",
  };
}

function makeGroup(letter: string, teams: StandingTeam[]): StandingsGroup {
  return {
    league: {
      id: 1,
      name: "World Cup",
      country: "World",
      logo: "",
      flag: "",
      season: 2026,
      standings: [teams.map((t) => ({ ...t, group: `Group ${letter}` }))],
    },
  };
}

describe("knockoutBracket", () => {
  it("lookupAnnexC resuelve combinación EFGHIJKL (fila #1)", () => {
    const map = lookupAnnexC(new Set(["E", "F", "G", "H", "I", "J", "K", "L"]));
    assert.ok(map);
    assert.equal(map!["1A"], "3E");
    assert.equal(map!["1B"], "3J");
    assert.equal(map!["1E"], "3F");
    assert.equal(map!["1L"], "3K");
  });

  it("lookupAnnexC resuelve combinación ABCDEFGH", () => {
    const map = lookupAnnexC(new Set(["A", "B", "C", "D", "E", "F", "G", "H"]));
    assert.ok(map);
    assert.equal(map!["1A"], "3H");
  });

  it("ROUND_OF_32 tiene 16 partidos con posiciones left/right estables", () => {
    assert.equal(ROUND_OF_32.length, 16);
    const left = ROUND_OF_32.filter((m) => m.side === "left").sort((a, b) => a.order - b.order);
    const right = ROUND_OF_32.filter((m) => m.side === "right").sort((a, b) => a.order - b.order);
    assert.equal(left.length, 8);
    assert.equal(right.length, 8);
    assert.equal(left[0].matchId, 74);
    assert.equal(left[2].matchId, 73);
    assert.equal(right[0].matchId, 76);
  });

  it("resolveKnockoutBracket asigna 1º/2º desde standings", () => {
    const standings: StandingsGroup[] = [
      makeGroup("A", [
        makeRow(1, makeTeam(1, "Team A1"), 9),
        makeRow(2, makeTeam(2, "Team A2"), 6),
        makeRow(3, makeTeam(3, "Team A3"), 3),
        makeRow(4, makeTeam(4, "Team A4"), 0),
      ]),
    ];

    for (const letter of "BCDEFGHIJKL") {
      const base = letter.charCodeAt(0) * 10;
      standings.push(
        makeGroup(letter, [
          makeRow(1, makeTeam(base + 1, `T${letter}1`), 9),
          makeRow(2, makeTeam(base + 2, `T${letter}2`), 6),
          makeRow(3, makeTeam(base + 3, `T${letter}3`), 3),
          makeRow(4, makeTeam(base + 4, `T${letter}4`), 0),
        ])
      );
    }

    const result = resolveKnockoutBracket(standings);
    const m73 = result.roundOf32.find((m) => m.matchId === 73);
    assert.ok(m73);
    assert.equal(m73!.home.label, "2A");
    assert.equal(m73!.home.team?.name, "Team A2");
    assert.equal(m73!.away.label, "2B");
    assert.equal(result.knockoutMatches.length, 16);
    assert.equal(result.qualifyingThirdGroups.length, 8);
  });

  it("coloca mejores terceros en slots de 16avos según Anexo C", () => {
    const standings = GROUP_MINIMAL_STANDINGS();
    const result = resolveKnockoutBracket(standings);

    assert.ok(result.annexKey);

    const thirdSlots = result.roundOf32.flatMap((m) => [m.home, m.away]).filter((s) => /^3[A-L]/.test(s.label));
    assert.equal(thirdSlots.length, 8, "hay 8 plazas de mejores terceros en 16avos");
    assert.ok(
      thirdSlots.every((s) => s.team != null),
      "cada slot de tercero tiene selección asignada"
    );
  });

  it("getRoundOf32BySide ordena por order", () => {
    const standings: StandingsGroup[] = GROUP_MINIMAL_STANDINGS();
    const result = resolveKnockoutBracket(standings);
    const left = getRoundOf32BySide(result.roundOf32, "left");
    assert.equal(left[0].matchId, 74);
    assert.equal(left[left.length - 1].matchId, 82);
  });
});

function GROUP_MINIMAL_STANDINGS(): StandingsGroup[] {
  const standings: StandingsGroup[] = [];
  for (const letter of "ABCDEFGHIJKL") {
    const base = letter.charCodeAt(0) * 10;
    standings.push(
      makeGroup(letter, [
        makeRow(1, makeTeam(base + 1, `T${letter}1`), 9),
        makeRow(2, makeTeam(base + 2, `T${letter}2`), 6),
        makeRow(3, makeTeam(base + 3, `T${letter}3`), 3),
        makeRow(4, makeTeam(base + 4, `T${letter}4`), 0),
      ])
    );
  }
  return standings;
}
