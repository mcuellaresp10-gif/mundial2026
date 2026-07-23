import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { Fixture, StandingTeam, Team } from "@/types";
import {
  computeDynamicHomeAdvantage,
  getClubEffectiveStrength,
  recentFormFromFixtures,
  strengthFromRecord,
} from "@/utils/clubMatchCalibration";

const baseTeam = (id: number, name: string): Team => ({
  id,
  name,
  code: null,
  country: "Test",
  founded: null,
  national: false,
  logo: "",
});

function standing(partial: {
  id: number;
  name: string;
  homePlayed: number;
  homeW: number;
  homeD: number;
  homeGF: number;
  homeGA: number;
  awayPlayed?: number;
  awayW?: number;
  awayD?: number;
  awayGF?: number;
  awayGA?: number;
}): StandingTeam {
  const awayPlayed = partial.awayPlayed ?? 5;
  const awayW = partial.awayW ?? 1;
  const awayD = partial.awayD ?? 1;
  const awayGF = partial.awayGF ?? 4;
  const awayGA = partial.awayGA ?? 8;
  const homeL = partial.homePlayed - partial.homeW - partial.homeD;
  const awayL = awayPlayed - awayW - awayD;
  return {
    rank: 1,
    team: baseTeam(partial.id, partial.name),
    points: partial.homeW * 3 + partial.homeD + awayW * 3 + awayD,
    goalsDiff: 0,
    group: "A",
    form: null,
    status: null,
    description: null,
    all: {
      played: partial.homePlayed + awayPlayed,
      win: partial.homeW + awayW,
      draw: partial.homeD + awayD,
      lose: homeL + awayL,
      goals: {
        for: partial.homeGF + awayGF,
        against: partial.homeGA + awayGA,
      },
    },
    home: {
      played: partial.homePlayed,
      win: partial.homeW,
      draw: partial.homeD,
      lose: homeL,
      goals: { for: partial.homeGF, against: partial.homeGA },
    },
    away: {
      played: awayPlayed,
      win: awayW,
      draw: awayD,
      lose: awayL,
      goals: { for: awayGF, against: awayGA },
    },
    update: "",
  };
}

function finishedFixture(
  id: number,
  homeId: number,
  awayId: number,
  hg: number,
  ag: number,
  ts: number
): Fixture {
  return {
    fixture: {
      id,
      referee: null,
      timezone: "UTC",
      date: new Date(ts * 1000).toISOString(),
      timestamp: ts,
      periods: { first: null, second: null },
      venue: { id: 1, name: "X", city: "Y" },
      status: { long: "Match Finished", short: "FT", elapsed: 90 },
    },
    league: {
      id: 239,
      name: "Liga",
      country: "Colombia",
      logo: "",
      flag: null,
      season: 2026,
      round: "Regular Season - 1",
    },
    teams: {
      home: { id: homeId, name: "H", logo: "", winner: hg > ag },
      away: { id: awayId, name: "A", logo: "", winner: ag > hg },
    },
    goals: { home: hg, away: ag },
    score: {
      halftime: { home: null, away: null },
      fulltime: { home: hg, away: ag },
      extratime: { home: null, away: null },
      penalty: { home: null, away: null },
    },
  };
}

describe("clubMatchCalibration", () => {
  it("da más boost a un local muy fuerte en casa", () => {
    const strongHome = standing({
      id: 1,
      name: "Fortaleza",
      homePlayed: 8,
      homeW: 7,
      homeD: 1,
      homeGF: 18,
      homeGA: 4,
    });
    const weakAway = standing({
      id: 2,
      name: "Visitante",
      homePlayed: 5,
      homeW: 1,
      homeD: 1,
      homeGF: 4,
      homeGA: 8,
      awayPlayed: 8,
      awayW: 0,
      awayD: 2,
      awayGF: 3,
      awayGA: 16,
    });
    const mildHome = standing({
      id: 3,
      name: "Medio",
      homePlayed: 8,
      homeW: 3,
      homeD: 3,
      homeGF: 8,
      homeGA: 8,
    });

    const strong = computeDynamicHomeAdvantage(strongHome, weakAway, 2.5);
    const mild = computeDynamicHomeAdvantage(mildHome, weakAway, 2.5);

    assert.ok(strong.homeLambdaMul > mild.homeLambdaMul);
    assert.ok(strong.strengthBonusHome > mild.strengthBonusHome);
    assert.ok(strong.homeLambdaMul > 1.05);
  });

  it("calcula forma reciente desde fixtures", () => {
    const fixtures = [
      finishedFixture(1, 10, 20, 2, 0, 1000),
      finishedFixture(2, 30, 10, 1, 1, 2000),
      finishedFixture(3, 10, 40, 3, 1, 3000),
    ];
    const form = recentFormFromFixtures(fixtures, 10, 5);
    assert.equal(form.played, 3);
    assert.ok(form.pointsPerGame > 2);
    assert.ok(form.strength > 55);
  });

  it("mezcla tabla y plantilla en fuerza club", () => {
    const s = standing({
      id: 1,
      name: "Top",
      homePlayed: 6,
      homeW: 5,
      homeD: 1,
      homeGF: 12,
      homeGA: 3,
    });
    const strong = getClubEffectiveStrength({
      standing: s,
      attackMod: 1.2,
      defenseMod: 0.9,
      venue: "home",
      recent: { played: 5, pointsPerGame: 2.4, goalsForPerGame: 2, goalsAgainstPerGame: 0.6, strength: 78 },
    });
    const weak = getClubEffectiveStrength({
      standing: s,
      attackMod: 0.85,
      defenseMod: 1.2,
      venue: "home",
      recent: { played: 5, pointsPerGame: 0.6, goalsForPerGame: 0.5, goalsAgainstPerGame: 2, strength: 40 },
    });
    assert.ok(strong > weak);
    assert.ok(strengthFromRecord(s.home) > 60);
  });
});
