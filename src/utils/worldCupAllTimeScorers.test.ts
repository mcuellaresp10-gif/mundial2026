import { describe, it } from "node:test";
import assert from "node:assert/strict";
import type { TopScorerEntry } from "@/types";
import {
  answerCareerGoalGapQuestion,
  buildAllTimeScorerRankings,
  getLeadingAllTimeScorer,
} from "./worldCupAllTimeScorers";

function scorer(name: string, goals: number, team = "Argentina"): TopScorerEntry {
  return {
    name,
    team,
    goals,
    assists: 0,
    matches: 2,
    photo: "",
    playerId: name.length,
  };
}

describe("worldCupAllTimeScorers", () => {
  it("Messi lidera all-time al sumar goles del Mundial 2026", () => {
    const tournament = [scorer("L. Messi", 5), scorer("K. Mbappé", 4, "France")];
    const leader = getLeadingAllTimeScorer(tournament);
    assert.equal(leader.name, "Lionel Messi");
    assert.equal(leader.goals, 18);
  });

  it("calcula cuántos goles le faltan a Mbappé para alcanzar a Messi", () => {
    const tournament = [scorer("L. Messi", 5), scorer("K. Mbappé", 4, "France")];
    const answer = answerCareerGoalGapQuestion(
      "Cuantos goles le falta a Mbappe para alcanzar a Messi como goleador histórico en los mundiales?",
      tournament
    );
    assert.ok(answer);
    assert.match(answer!, /le faltan 2 goles/i);
    assert.match(answer!, /Lionel Messi: 18 goles/i);
    assert.match(answer!, /Kylian Mbappé: 16 goles/i);
  });

  it("sin datos 2026 mantiene a Klose como líder histórico", () => {
    const leader = getLeadingAllTimeScorer([]);
    assert.equal(leader.name, "Miroslav Klose");
    assert.equal(leader.goals, 16);
  });

  it("ordena por total de goles históricos", () => {
    const rows = buildAllTimeScorerRankings([scorer("L. Messi", 5)]);
    assert.equal(rows[0].name, "Lionel Messi");
    assert.equal(rows[0].totalGoals, 18);
  });
});
