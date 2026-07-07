import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  getNextMatchProbShortLabel,
  isKnockoutFixtureRound,
  isTeamGroupStageComplete,
  knockoutAdvanceProbability,
  shouldHideGroupClassification,
} from "./matchPhase";
import type { StandingTeam, Team } from "@/types";

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

function makeStanding(rank: number, played: number): StandingTeam {
  return {
    rank,
    team: makeTeam(1, "Colombia"),
    points: 7,
    goalsDiff: 3,
    group: "Group L",
    form: "WDW",
    status: "same",
    description: null,
    all: { played, win: 2, draw: 1, lose: 0, goals: { for: 4, against: 1 } },
    home: { played: 0, win: 0, draw: 0, lose: 0, goals: { for: 0, against: 0 } },
    away: { played: 0, win: 0, draw: 0, lose: 0, goals: { for: 0, against: 0 } },
    update: "",
  };
}

describe("matchPhase", () => {
  it("detecta octavos como eliminatoria", () => {
    assert.equal(isKnockoutFixtureRound("Round of 16"), true);
    assert.equal(isKnockoutFixtureRound("Group Stage - 3"), false);
  });

  it("etiqueta corta para octavos", () => {
    assert.equal(getNextMatchProbShortLabel("Round of 16"), "Prob. octavos");
    assert.equal(getNextMatchProbShortLabel("Group Stage - 2"), "Prob. victoria");
  });

  it("avance en KO suma victoria y empate", () => {
    assert.equal(knockoutAdvanceProbability(0.45, 0.25), 0.7);
  });

  it("detecta equipo con fase de grupos completada en plaza directa", () => {
    assert.equal(isTeamGroupStageComplete(makeStanding(1, 3)), true);
    assert.equal(isTeamGroupStageComplete(makeStanding(2, 3)), true);
    assert.equal(isTeamGroupStageComplete(makeStanding(3, 3)), false);
    assert.equal(isTeamGroupStageComplete(makeStanding(1, 2)), false);
  });

  it("oculta clasificación grupal cuando ya clasificó", () => {
    assert.equal(shouldHideGroupClassification(makeStanding(1, 3), 0), true);
    assert.equal(shouldHideGroupClassification(makeStanding(2, 2), 0), true);
    assert.equal(shouldHideGroupClassification(makeStanding(3, 2), 1), false);
  });
});
