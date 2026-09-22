import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  buildArgentinaPhaseProbsThread,
  formatArgentinaPlayoffsPctTweet,
  formatArgentinaZoneATweet,
  formatArgentinaZoneBTweet,
} from "./formatArgentinaPhaseProbsTweets.ts";

describe("formatArgentinaPhaseProbsTweets", () => {
  const rows = [
    { teamName: "Instituto", zone: "A" as const, probPlayoffs: 0.998 },
    { teamName: "Velez Sarsfield", zone: "A" as const, probPlayoffs: 0.996 },
    { teamName: "Boca Juniors", zone: "A" as const, probPlayoffs: 0.937 },
    { teamName: "Defensa y Justicia", zone: "A" as const, probPlayoffs: 0.931 },
    { teamName: "Gimnasia La Plata", zone: "A" as const, probPlayoffs: 0.898 },
    { teamName: "Lanus", zone: "A" as const, probPlayoffs: 0.893 },
    { teamName: "Independiente", zone: "A" as const, probPlayoffs: 0.847 },
    { teamName: "Newells Old Boys", zone: "A" as const, probPlayoffs: 0.822 },
    { teamName: "Argentinos Juniors", zone: "B" as const, probPlayoffs: 0.973 },
    { teamName: "Rosario Central", zone: "B" as const, probPlayoffs: 0.972 },
    { teamName: "Independiente Rivadavia", zone: "B" as const, probPlayoffs: 0.932 },
    { teamName: "Huracan", zone: "B" as const, probPlayoffs: 0.895 },
    { teamName: "Gimnasia Mendoza", zone: "B" as const, probPlayoffs: 0.876 },
    { teamName: "Belgrano Cordoba", zone: "B" as const, probPlayoffs: 0.876 },
    { teamName: "Sarmiento", zone: "B" as const, probPlayoffs: 0.807 },
    { teamName: "River Plate", zone: "B" as const, probPlayoffs: 0.619 },
  ];

  it("Zona A y Zona B caben en ≤280 cada una", () => {
    const a = formatArgentinaZoneATweet(rows, 10, "clausura");
    const b = formatArgentinaZoneBTweet(rows);
    assert.ok(a.includes("Zona A"));
    assert.ok(a.includes("8. Newell's") || a.includes("8. Newells"));
    assert.ok(!a.includes("…"), `A truncado: ${a}`);
    assert.ok(a.length <= 280, `A len=${a.length}`);
    assert.ok(b.includes("Zona B"));
    assert.ok(b.includes("8. River"));
    assert.ok(!b.includes("…"), `B truncado: ${b}`);
    assert.ok(b.length <= 280, `B len=${b.length}`);
  });

  it("hilo = Zona A + Zona B + %", () => {
    const thread = buildArgentinaPhaseProbsThread(rows, 10, "clausura");
    assert.equal(thread.length, 3);
    for (const t of thread) assert.ok(t.length <= 280);
    assert.ok(formatArgentinaPlayoffsPctTweet(rows).includes("%"));
  });
});
