import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { getFifaRank, getStrengthFromFifaRanking, strengthFromFifaRank } from "@/data/fifaRankings";
import { getHostNationStrengthBonus, isWorldCupHostNation } from "@/data/worldCupHosts";
import {
  buildOutcomeProbsFromH2H,
  type TeamGroupState,
} from "@/utils/groupClassification";

function state(id: number, name: string, prior: number): TeamGroupState {
  return {
    teamId: id,
    teamName: name,
    points: 0,
    goalsFor: 0,
    goalsAgainst: 0,
    priorStrength: prior,
  };
}

describe("fifaRankings", () => {
  it("equipos top tienen mejor fuerza que selecciones medias", () => {
    const arg = getStrengthFromFifaRanking("Argentina");
    const qatar = getStrengthFromFifaRanking("Qatar");
    assert.ok(arg > qatar);
    assert.equal(getFifaRank("Argentina"), 1);
  });

  it("strengthFromFifaRank decrece con la posición", () => {
    assert.ok(strengthFromFifaRank(1) > strengthFromFifaRank(30));
    assert.ok(strengthFromFifaRank(30) > strengthFromFifaRank(80));
  });
});

describe("worldCupHosts", () => {
  it("solo USA, Canadá y México son anfitriones", () => {
    assert.equal(isWorldCupHostNation("United States"), true);
    assert.equal(isWorldCupHostNation("Canada"), true);
    assert.equal(isWorldCupHostNation("Mexico"), true);
    assert.equal(isWorldCupHostNation("Brazil"), false);
    assert.equal(getHostNationStrengthBonus("Colombia"), 0);
    assert.ok(getHostNationStrengthBonus("Mexico") > 0);
  });
});

describe("Monte Carlo strength model", () => {
  it("no aplica ventaja genérica al equipo local del fixture", () => {
    const brazil = state(1, "Brazil", getStrengthFromFifaRanking("Brazil"));
    const japan = state(2, "Japan", getStrengthFromFifaRanking("Japan"));
    const states = [brazil, japan];

    const brazilHome = buildOutcomeProbsFromH2H([], 1, 2, states, true);
    const japanHome = buildOutcomeProbsFromH2H([], 2, 1, states, true);

    assert.ok(Math.abs(brazilHome.homeWin - japanHome.awayWin) < 0.02);
    assert.ok(Math.abs(brazilHome.awayWin - japanHome.homeWin) < 0.02);
  });

  it("anfitriones reciben bonus aunque no sean local en el fixture", () => {
    const mexico = state(1, "Mexico", getStrengthFromFifaRanking("Mexico"));
    const qatar = state(2, "Qatar", getStrengthFromFifaRanking("Qatar"));
    const mexicoAway = buildOutcomeProbsFromH2H([], 2, 1, [mexico, qatar], true);

    assert.ok(mexicoAway.awayWin > 0.35);
    assert.ok(mexicoAway.awayWin > qatar.homeWin || mexicoAway.awayWin > 0.4);
  });

  it("ranking FIFA superior aumenta probabilidad de victoria", () => {
    const arg = state(1, "Argentina", getStrengthFromFifaRanking("Argentina"));
    const qatar = state(2, "Qatar", getStrengthFromFifaRanking("Qatar"));
    const probs = buildOutcomeProbsFromH2H([], 1, 2, [arg, qatar], true);

    assert.ok(probs.homeWin > probs.awayWin);
    assert.ok(probs.homeWin > 0.75);
  });

  it("Portugal vs Uzbekistán tiene favorito claro en 1X2", () => {
    const por = state(1, "Portugal", getStrengthFromFifaRanking("Portugal"));
    const uzb = state(2, "Uzbekistan", getStrengthFromFifaRanking("Uzbekistan"));
    const probs = buildOutcomeProbsFromH2H([], 1, 2, [por, uzb], true);

    assert.ok(probs.homeWin > 0.78);
    assert.ok(probs.draw < 0.1);
    assert.ok(probs.awayWin < 0.15);
  });
});
