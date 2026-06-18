/**
 * Parse Annex C third-place combinations from Wikipedia export text.
 * Usage: node scripts/build-annex-c.mjs
 */
import { readFileSync, writeFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const SOURCE = join(
  __dirname,
  "../../.cursor/projects/c-Users-ASUS-Documents-Agente-Mundial-V2/agent-tools/c6b1d8a8-f769-480d-a4ba-32705b94ba29.txt"
);
const OUT = join(__dirname, "../src/data/annexCThirdPlace.json");

const WINNER_SLOTS = ["1A", "1B", "1D", "1E", "1G", "1I", "1K", "1L"];

function parseLine(line) {
  if (!line.startsWith("|")) return null;
  const parts = line
    .split("|")
    .map((p) => p.trim())
    .filter(Boolean);
  if (parts.length < 17) return null;
  const rowNum = parseInt(parts[0], 10);
  if (Number.isNaN(rowNum) || rowNum < 1 || rowNum > 495) return null;
  const qualifying = parts.slice(1, 9);
  const assignments = parts.slice(9, 17);
  if (qualifying.some((g) => !/^[A-L]$/.test(g))) return null;
  if (assignments.some((a) => !/^3[A-L]$/.test(a))) return null;

  const key = [...qualifying].sort().join("");
  const map = {};
  for (let i = 0; i < WINNER_SLOTS.length; i++) {
    map[WINNER_SLOTS[i]] = assignments[i];
  }
  return { key, map, rowNum };
}

function main() {
  let text;
  try {
    text = readFileSync(SOURCE, "utf8");
  } catch {
    console.error("Source file not found. Paste Wikipedia Annex C table into scripts/annex-c-source.txt");
    process.exit(1);
  }

  const entries = {};
  let count = 0;
  for (const line of text.split("\n")) {
    const parsed = parseLine(line);
    if (!parsed) continue;
    entries[parsed.key] = parsed.map;
    count++;
  }

  if (count < 400) {
    console.error(`Only parsed ${count} rows — expected ~495`);
    process.exit(1);
  }

  writeFileSync(OUT, JSON.stringify(entries));
  console.log(`Wrote ${count} Annex C combinations → ${OUT}`);
}

main();
