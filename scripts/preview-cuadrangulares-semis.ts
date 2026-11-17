import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { DEFAULT_SEASON } from "../src/lib/utils.ts";
import {
  getLeagueById,
  matchesLeaguePhase,
} from "../src/data/americasLeagues.ts";
import {
  getLeagueSeasonFixtures,
  getLeagueStandings,
} from "../src/server/footballClient.ts";
import {
  CLAUSURA_2026_CUADRANGULARES,
  simulateBetPlayCuadrangularesSemis,
} from "../src/utils/betPlaySeasonSimulation.ts";
import { renderCuadrangularesSemisPng } from "../src/server/x/renderCuadrangularesSemisPng.ts";
import type { StandingTeam, StandingsGroup } from "../src/types.ts";

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

function pickTable(standingsRaw: StandingsGroup[]): StandingTeam[] {
  const league = getLeagueById(239)!;
  const tables: StandingTeam[][] = [];
  for (const sg of standingsRaw) {
    for (const group of sg.league.standings) {
      if (!group.length) continue;
      const groupLabel = group[0]?.group ?? "";
      if (
        matchesLeaguePhase(groupLabel, league, "clausura") ||
        group.some((r) => matchesLeaguePhase(r.group, league, "clausura"))
      ) {
        tables.push(group);
      }
    }
  }
  tables.sort((a, b) => b.length - a.length);
  return tables[0] ?? [];
}

async function main() {
  loadEnv();
  const sims = Number(process.env.PREVIEW_SIMS ?? "1200");
  const [standingsRaw, fixtures] = await Promise.all([
    getLeagueStandings(239, DEFAULT_SEASON),
    getLeagueSeasonFixtures(239, DEFAULT_SEASON),
  ]);
  const standings = pickTable(standingsRaw);
  const groups = CLAUSURA_2026_CUADRANGULARES;
  const semis = simulateBetPlayCuadrangularesSemis({
    standings,
    fixtures,
    historyFixtures: fixtures,
    groupANames: groups.groupA.names,
    groupBNames: groups.groupB.names,
    seedAName: groups.groupA.seedName,
    seedBName: groups.groupB.seedName,
    simulations: Number.isFinite(sims) ? sims : 1200,
  });
  const png = await renderCuadrangularesSemisPng({
    groupA: semis.groupA,
    groupB: semis.groupB,
    simulations: semis.meta.simulations,
    phaseLabel: "Clausura 2026",
  });
  const out = join(ROOT, "data", "preview-cuadrangulares-v2.png");
  writeFileSync(out, png);
  console.log("wrote", out, png.length);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
