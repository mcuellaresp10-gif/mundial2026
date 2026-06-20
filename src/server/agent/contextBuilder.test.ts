import { describe, it } from "node:test";
import assert from "node:assert/strict";
import type { StandingsGroup, StandingTeam, Team } from "@/types";
import { buildAgentContext, clearAgentProbCache } from "@/server/agent/contextBuilder";

function makeTeam(id: number, name: string): Team {
  return {
    id,
    name,
    logo: "",
    code: "XX",
    country: name,
    founded: null,
    national: true,
  };
}

function makeRow(rank: number, team: Team, group: string, points: number): StandingTeam {
  return {
    rank,
    team,
    points,
    goalsDiff: points - 2,
    group,
    form: null,
    status: null,
    description: null,
    all: {
      played: 2,
      win: 1,
      draw: 0,
      lose: 1,
      goals: { for: 3, against: 2 },
    },
    home: {
      played: 0,
      win: 0,
      draw: 0,
      lose: 0,
      goals: { for: 0, against: 0 },
    },
    away: {
      played: 0,
      win: 0,
      draw: 0,
      lose: 0,
      goals: { for: 0, against: 0 },
    },
    update: "",
  };
}

function makeStandings(): StandingsGroup[] {
  const table = [
    makeRow(1, makeTeam(1, "Brazil"), "Group A", 6),
    makeRow(2, makeTeam(2, "Serbia"), "Group A", 3),
    makeRow(3, makeTeam(3, "Switzerland"), "Group A", 3),
    makeRow(4, makeTeam(4, "Cameroon"), "Group A", 0),
  ];
  return [
    {
      league: {
        id: 1,
        name: "Group A",
        country: "World",
        logo: "",
        flag: null,
        season: 2026,
        standings: [table],
      },
    },
  ];
}

describe("buildAgentContext", () => {
  it("incluye bloque histórico cuando la pregunta lo pide", async () => {
    clearAgentProbCache();
    const { context, sources } = await buildAgentContext(
      "Curiosidades del Mundial de 1986",
      [],
      []
    );
    assert.match(context, /1986/);
    assert.match(context, /Maradona/i);
    assert.ok(sources.includes("historico"));
  });

  it("incluye probabilidades cuando se solicitan", async () => {
    clearAgentProbCache();
    const { context, sources } = await buildAgentContext(
      "Probabilidad de clasificar de Brasil",
      [],
      makeStandings()
    );
    assert.match(context, /MONTE CARLO/i);
    assert.ok(sources.includes("monte-carlo"));
  });

  it("incluye mejores terceros bajo demanda", async () => {
    const { context, sources } = await buildAgentContext(
      "Ranking de mejores terceros",
      [],
      makeStandings()
    );
    assert.match(context, /MEJORES TERCEROS/i);
    assert.ok(sources.includes("mejores-terceros"));
  });
});
