import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { validateFootballProxyRequest } from "./footballAllowlist";

function params(input: Record<string, string>): URLSearchParams {
  return new URLSearchParams(input);
}

describe("footballAllowlist", () => {
  it("permite fixtures del mundial con league y season", () => {
    const result = validateFootballProxyRequest(
      ["fixtures"],
      params({ league: "1", season: "2026", page: "1" })
    );
    assert.equal(result.ok, true);
  });

  it("permite live=all solo", () => {
    const result = validateFootballProxyRequest(["fixtures"], params({ live: "all" }));
    assert.equal(result.ok, true);
  });

  it("rechaza rutas arbitrarias", () => {
    const result = validateFootballProxyRequest(["countries"], params({ name: "Spain" }));
    assert.equal(result.ok, false);
    if (!result.ok) assert.equal(result.status, 403);
  });

  it("rechaza otras ligas", () => {
    const result = validateFootballProxyRequest(
      ["fixtures"],
      params({ league: "39", season: "2026" })
    );
    assert.equal(result.ok, false);
  });

  it("rechaza parámetros desconocidos", () => {
    const result = validateFootballProxyRequest(
      ["fixtures"],
      params({ league: "1", season: "2026", hack: "1" })
    );
    assert.equal(result.ok, false);
  });

  it("requiere fixture en events", () => {
    const bad = validateFootballProxyRequest(["fixtures/events"], params({ id: "1" }));
    assert.equal(bad.ok, false);
    const ok = validateFootballProxyRequest(["fixtures/events"], params({ fixture: "12345" }));
    assert.equal(ok.ok, true);
  });

  it("permite fixtures/players con fixture", () => {
    const ok = validateFootballProxyRequest(["fixtures/players"], params({ fixture: "12345" }));
    assert.equal(ok.ok, true);
  });
});
