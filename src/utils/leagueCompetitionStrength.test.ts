import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  applyCompetitionCoeff,
  getDomesticEcosystemPrior,
  getLeagueStrengthCoeff,
} from "@/utils/leagueCompetitionStrength";
import { getClubEffectiveStrength } from "@/utils/clubMatchCalibration";
import type { StandingTeam, Team } from "@/types";
import {
  calibrateLambdasTo1X2,
  expectedGoalsFromStrength,
  outcomeProbsFromStrength,
  poissonOutcomeProbs,
} from "@/utils/matchStrengthModel";

const team = (id: number, name: string, country: string): Team => ({
  id,
  name,
  code: null,
  country,
  founded: null,
  national: false,
  logo: "",
});

function midStanding(id: number, name: string, country: string, ppgBoost = 0): StandingTeam {
  const played = 10;
  const win = Math.min(9, 3 + ppgBoost);
  const draw = 3;
  const lose = played - win - draw;
  return {
    rank: 8,
    team: team(id, name, country),
    points: win * 3 + draw,
    goalsDiff: ppgBoost,
    group: "A",
    form: null,
    status: null,
    description: null,
    all: {
      played,
      win,
      draw,
      lose,
      goals: { for: 12 + ppgBoost * 2, against: 12 - ppgBoost },
    },
    home: {
      played: 5,
      win: Math.ceil(win / 2),
      draw: 1,
      lose: 0,
      goals: { for: 7, against: 5 },
    },
    away: {
      played: 5,
      win: Math.floor(win / 2),
      draw: 2,
      lose: 1,
      goals: { for: 5, against: 7 },
    },
    update: "",
  };
}

describe("leagueCompetitionStrength", () => {
  it("descuenta Sudamericana vs Brasileirão", () => {
    assert.ok(getLeagueStrengthCoeff(11) < getLeagueStrengthCoeff(71));
    assert.ok(getLeagueStrengthCoeff(11) < getLeagueStrengthCoeff(13));
  });

  it("Brasil tiene prior de ecosistema más alto que Argentina", () => {
    assert.ok(getDomesticEcosystemPrior("Brazil") > getDomesticEcosystemPrior("Argentina"));
  });

  it("applyCompetitionCoeff comprime extremos", () => {
    const high = applyCompetitionCoeff(80, 0.68);
    assert.ok(high < 75, `high=${high}`);
  });
});

describe("Brazil club sim bias", () => {
  it("Fluminense (Lib) local no queda por debajo de Rivadavia (Sud) en fuerza", () => {
    const flu = midStanding(1, "Fluminense", "Brazil", 0);
    const riv = midStanding(2, "Independ. Rivadavia", "Argentina", 4); // mejor PPG en copa

    const strengthFlu = getClubEffectiveStrength({
      standing: flu,
      attackMod: 1.05,
      defenseMod: 0.95,
      venue: "home",
      leagueId: 13,
      teamCountry: "Brazil",
    });
    const strengthRiv = getClubEffectiveStrength({
      standing: riv,
      attackMod: 1.0,
      defenseMod: 1.0,
      venue: "away",
      leagueId: 11,
      teamCountry: "Argentina",
    });

    // Con HA típica el local BR no debería quedar claramente más débil.
    const withHome = strengthFlu + 4;
    assert.ok(
      withHome >= strengthRiv - 2,
      `Flu=${withHome} Riv=${strengthRiv}`
    );
  });

  it("calibración mismatch con favorito visitante no deja rejilla vacía", () => {
    const gap = -22;
    const target = outcomeProbsFromStrength(48, 70);
    const base = expectedGoalsFromStrength({
      strengthA: 48,
      strengthB: 70,
      baseTotal: 2.6,
      fifaGap: gap,
    });
    const calibrated = calibrateLambdasTo1X2(
      base.home,
      base.away,
      target,
      gap,
      gap
    );
    const probs = poissonOutcomeProbs(calibrated.home, calibrated.away);
    assert.ok(calibrated.away > calibrated.home);
    assert.ok(probs.awayWin > probs.homeWin);
    assert.ok(Number.isFinite(calibrated.home) && Number.isFinite(calibrated.away));
  });
});
