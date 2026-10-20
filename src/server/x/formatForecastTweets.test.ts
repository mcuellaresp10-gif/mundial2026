import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  buildForecastThread,
  formatForecastMatchTweet,
  formatPct,
  formatTelegramForecastPreview,
} from "./formatForecastTweets.ts";
import { xHandleForTeam } from "./xTeamHandles.ts";
import { renderForecastMatchPng } from "./renderForecastMatchPng.ts";

describe("formatForecastTweets", () => {
  it("formatea porcentajes a 1 decimal", () => {
    assert.equal(formatPct(0.405), "40.5%");
    assert.equal(formatPct(0.281), "28.1%");
  });

  it("arma tuit corto de partido ≤280", () => {
    const text = formatForecastMatchTweet({
      homeName: "Millonarios",
      awayName: "Once Caldas",
      winHome: 0.56,
      draw: 0.29,
      winAway: 0.15,
    });
    assert.ok(text.includes("#LigaBetPlay"));
    assert.ok(text.includes("@MillosFCoficial"));
    assert.ok(text.includes("@oncecaldas"));
    assert.ok(text.includes("Las probs aquí"));
    assert.ok(!text.includes("40.5%"));
    assert.ok(text.length <= 280);
  });

  it("un partido o varios → un tuit por partido", () => {
    const one = buildForecastThread([
      {
        homeName: "A",
        awayName: "B",
        winHome: 0.4,
        draw: 0.3,
        winAway: 0.3,
      },
    ]);
    assert.equal(one.length, 1);
    assert.ok(one[0].includes("vs"));

    const thread = buildForecastThread([
      {
        homeName: "A",
        awayName: "B",
        winHome: 0.4,
        draw: 0.3,
        winAway: 0.3,
      },
      {
        homeName: "C",
        awayName: "D",
        winHome: 0.5,
        draw: 0.2,
        winAway: 0.3,
      },
    ]);
    assert.equal(thread.length, 2);
    assert.ok(!thread[0].includes("Partidos de hoy"));
    assert.ok(thread[1].includes("vs"));
  });

  it("usa hashtag Conmebol según competición", () => {
    const thread = buildForecastThread(
      [
        {
          homeName: "Flamengo",
          awayName: "Palmeiras",
          winHome: 0.4,
          draw: 0.3,
          winAway: 0.3,
          competition: "🏆 Libertadores",
        },
      ],
      { title: "Partidos de hoy · Libertadores y Sudamericana" }
    );
    assert.equal(thread.length, 1);
    assert.ok(thread[0].includes("#Libertadores"));
    assert.ok(thread[0].includes("@Flamengo"));
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
    assert.ok(preview.includes("Un post por partido"));
  });
});

describe("xTeamHandles", () => {
  it("resuelve handles conocidos", () => {
    assert.equal(xHandleForTeam("Millonarios"), "MillosFCoficial");
    assert.equal(xHandleForTeam("Once Caldas"), "oncecaldas");
    assert.equal(xHandleForTeam("Boca Juniors"), "BocaJrsOficial");
  });

  it("no inventa handle si no está mapeado", () => {
    assert.equal(xHandleForTeam("Club Inventado FC"), null);
  });
});

describe("renderForecastMatchPng", () => {
  it("genera PNG de la tarjeta 1X2", async () => {
    const png = await renderForecastMatchPng({
      homeName: "Millonarios",
      awayName: "Once Caldas",
      winHome: 0.56,
      draw: 0.29,
      winAway: 0.15,
      xgHome: 1.32,
      xgAway: 0.55,
      topScores: [
        { home: 1, away: 0, prob: 0.21 },
        { home: 0, away: 0, prob: 0.16 },
        { home: 2, away: 0, prob: 0.13 },
      ],
    });
    assert.ok(png.length > 1000);
    assert.equal(png[0], 0x89);
    assert.equal(png[1], 0x50);
  });
});
