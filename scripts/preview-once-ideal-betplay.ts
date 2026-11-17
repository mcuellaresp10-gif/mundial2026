import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { buildBetPlayOnceIdealDraft } from "../src/server/x/buildBetPlayOnceIdealDraft.ts";
import { renderOnceIdealPng } from "../src/server/x/renderOnceIdealPng.ts";

const ROOT = process.cwd();

function loadEnv(): void {
  for (const file of [".env.local", ".env"]) {
    try {
      const raw = readFileSync(join(ROOT, file), "utf8");
      for (const line of raw.split(/\r?\n/)) {
        const m = line.match(/^([^#=]+)=(.*)$/);
        if (m && !process.env[m[1].trim()]) {
          process.env[m[1].trim()] = m[2].trim().replace(/^["']|["']$/g, "");
        }
      }
    } catch {
      /* missing */
    }
  }
}

async function main() {
  loadEnv();
  const { draft, skippedReason } = await buildBetPlayOnceIdealDraft({
    force: true,
  });
  if (!draft) {
    console.error("no draft:", skippedReason);
    process.exit(1);
  }

  console.log(
    "XI",
    draft.formation,
    "media",
    draft.averageRating,
    draft.players.map((p) => `${p.position}:${p.name}(${p.rating})`).join(" | ")
  );
  console.log("--- tweets ---");
  for (const t of draft.tweets) console.log(t, "\n---");

  const png = await renderOnceIdealPng({
    players: draft.players,
    formation: draft.formation,
    phaseLabel: draft.phaseLabel,
    averageRating: draft.averageRating,
  });
  const out = join(ROOT, "data", "preview-once-ideal-betplay.png");
  writeFileSync(out, png);
  console.log("wrote", out, png.length);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
