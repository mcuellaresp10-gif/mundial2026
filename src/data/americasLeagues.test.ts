import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  AMERICAS_LEAGUES,
  ALLOWED_LEAGUE_IDS,
  continentalCupLeagues,
  domesticCupLeagues,
  getDefaultAmericasLeague,
  getLeagueById,
  isAllowedLeagueId,
  matchesLeaguePhase,
  WORLD_CUP_LEAGUE,
} from "./americasLeagues";

describe("americasLeagues", () => {
  it("incluye domésticas CONMEBOL + MX + MLS + copas continentales y nacionales", () => {
    assert.ok(AMERICAS_LEAGUES.length >= 25);
    assert.ok(isAllowedLeagueId(239)); // BetPlay
    assert.ok(isAllowedLeagueId(262)); // Liga MX
    assert.ok(isAllowedLeagueId(253)); // MLS
    assert.ok(isAllowedLeagueId(13)); // Libertadores
    assert.ok(isAllowedLeagueId(130)); // Copa Argentina
    assert.ok(isAllowedLeagueId(73)); // Copa do Brasil
    assert.ok(isAllowedLeagueId(241)); // Copa Colombia
    assert.ok(isAllowedLeagueId(257)); // US Open Cup
    assert.ok(isAllowedLeagueId(WORLD_CUP_LEAGUE.id));
    assert.equal(ALLOWED_LEAGUE_IDS.has(39), false); // Premier League
    assert.equal(ALLOWED_LEAGUE_IDS.has(264), false); // Copa MX cancelada
  });

  it("separa copas continentales y domésticas", () => {
    const continental = continentalCupLeagues();
    const domesticCups = domesticCupLeagues();
    assert.equal(continental.length, 3);
    assert.ok(continental.every((l) => l.cupScope === "continental"));
    assert.ok(domesticCups.length >= 10);
    assert.ok(domesticCups.every((l) => l.cupScope === "domestic"));
    assert.ok(!domesticCups.some((l) => l.countryCode === "MX"));
  });

  it("default hub es Liga BetPlay", () => {
    const def = getDefaultAmericasLeague();
    assert.equal(def.slug, "liga-betplay");
    assert.equal(def.id, 239);
  });

  it("filtra rounds Apertura/Clausura", () => {
    const col = getLeagueById(239)!;
    assert.equal(matchesLeaguePhase("Apertura - 5", col, "apertura"), true);
    assert.equal(matchesLeaguePhase("Clausura - 2", col, "apertura"), false);
    assert.equal(matchesLeaguePhase("Clausura - 2", col, "clausura"), true);
    assert.equal(matchesLeaguePhase("Apertura - 5", col, "all"), true);
  });
});
