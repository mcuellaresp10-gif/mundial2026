import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  buildForecastThread,
  formatForecastMatchTweet,
  formatPct,
  formatTelegramForecastPreview,
} from "./formatForecastTweets.ts";

describe("formatForecastTweets", () => {
  it("formatea porcentajes a 1 decimal", () => {
    assert.equal(formatPct(0.405), "40.5%");
    assert.equal(formatPct(0.281), "28.1%");
  });

  it("arma tuit de partido ≤280", () => {
    const text = formatForecastMatchTweet({
      homeName: "Boyaca Chico",
      awayName: "Fortaleza FC",
      winHome: 0.405,
      draw: 0.281,
      winAway: 0.314,
    });
    assert.ok(text.includes("🆚"));
    assert.ok(text.includes("40.5%"));
    assert.ok(text.includes("28.1%"));
    assert.ok(text.includes("31.4%"));
    assert.ok(text.length <= 280);
  });

  it("buildForecastThread pone cabecera primero", () => {
    const thread = buildForecastThread([
      {
        homeName: "A",
        awayName: "B",
        winHome: 0.4,
        draw: 0.3,
        winAway: 0.3,
      },
    ]);
    assert.equal(thread[0], "Partidos de hoy de Liga BetPlay");
    assert.equal(thread.length, 2);
  });

  it("preview Telegram incluye aviso de validación", () => {
    const preview = formatTelegramForecastPreview(
      [
        {
          homeName: "A",
          awayName: "B",
          winHome: 0.5,
          draw: 0.25,
          winAway: 0.25,
        },
      ],
      "2026-09-14"
    );
    assert.ok(preview.includes("Borrador X"));
    assert.ok(preview.includes("2026-09-14"));
    assert.ok(preview.includes("apruebes"));
  });
});
