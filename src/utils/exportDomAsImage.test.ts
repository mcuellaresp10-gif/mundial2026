import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { resolveDirectImageUrl } from "./exportDomAsImage.ts";

describe("resolveDirectImageUrl", () => {
  it("decodes Next.js image optimizer URLs", () => {
    const src =
      "http://localhost:3000/_next/image?url=https%3A%2F%2Fmedia.api-sports.io%2Fflags%2Fbr.svg&w=32&q=75";
    assert.equal(resolveDirectImageUrl(src), "https://media.api-sports.io/flags/br.svg");
  });

  it("returns direct URLs unchanged", () => {
    const src = "https://media.api-sports.io/flags/ar.svg";
    assert.equal(resolveDirectImageUrl(src), src);
  });
});
