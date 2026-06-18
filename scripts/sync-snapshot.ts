/**
 * Genera public/data/snapshot/worldcup-snapshot.json desde API-Football.
 * Uso: npm run sync:snapshot  (requiere API_FOOTBALL_KEY en .env.local)
 */
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import type { Player, TeamSquad } from "../src/types";
import type { WorldCupSnapshot } from "../src/types/snapshot";
import { mapSquadPlayerToPlayer } from "../src/utils/squad";
import { buildRadarPoolEntries } from "../src/services/radarBenchmarkCache";

const LEAGUE_ID = 1;
const SEASONS = [2025, 2026];
const ROOT = process.cwd();
const OUT_DIR = join(ROOT, "public", "data", "snapshot");
const OUT_FILE = join(OUT_DIR, "worldcup-snapshot.json");

function loadEnv(): Record<string, string> {
  const env: Record<string, string> = { ...process.env } as Record<string, string>;
  for (const file of [".env.local", ".env"]) {
    try {
      const raw = readFileSync(join(ROOT, file), "utf8");
      for (const line of raw.split(/\r?\n/)) {
        const m = line.match(/^([^#=]+)=(.*)$/);
        if (m) env[m[1].trim()] = m[2].trim().replace(/^["']|["']$/g, "");
      }
    } catch {
      /* missing file */
    }
  }
  return env;
}

const env = loadEnv();
const API_KEY = env.API_FOOTBALL_KEY;
const BASE_URL = (env.API_FOOTBALL_BASE_URL ?? "https://v3.football.api-sports.io").replace(
  /\/$/,
  ""
);

if (!API_KEY || API_KEY === "your_api_football_key_here") {
  console.error("❌ Falta API_FOOTBALL_KEY en .env.local");
  process.exit(1);
}

async function apiGetPaged<T>(
  path: string,
  params: Record<string, string | number> = {}
): Promise<{ response: T; totalPages: number }> {
  const qs = new URLSearchParams(
    Object.entries(params).map(([k, v]) => [k, String(v)])
  ).toString();
  const url = `${BASE_URL}/${path}${qs ? `?${qs}` : ""}`;
  const res = await fetch(url, {
    headers: { "x-apisports-key": API_KEY! },
  });
  if (!res.ok) throw new Error(`API ${path} → ${res.status}`);
  const json = (await res.json()) as {
    response: T;
    errors?: unknown;
    paging?: { current: number; total: number };
  };
  if (json.errors && Object.keys(json.errors as object).length > 0) {
    console.warn(`⚠ ${path}`, json.errors);
  }
  return { response: json.response, totalPages: json.paging?.total ?? 1 };
}

async function fetchAllFixtures(): Promise<WorldCupSnapshot["fixtures"]> {
  let page = 1;
  let totalPages = 1;
  const fixtures: WorldCupSnapshot["fixtures"] = [];
  while (page <= totalPages) {
    const { response, totalPages: total } = await apiGetPaged<WorldCupSnapshot["fixtures"]>(
      "fixtures",
      { league: LEAGUE_ID, season: 2026, page }
    );
    fixtures.push(...response);
    totalPages = total;
    page++;
    await delay(100);
  }
  return fixtures;
}

function delay(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

async function apiGet<T>(path: string, params: Record<string, string | number> = {}): Promise<T> {
  const { response } = await apiGetPaged<T>(path, params);
  return response;
}

async function fetchPlayerStats(playerId: number) {
  const rows = [];
  for (const season of SEASONS) {
    const data = await apiGet<Player[]>("players", { id: playerId, season });
    if (data[0]?.statistics) rows.push(...data[0].statistics);
    await delay(80);
  }
  return rows;
}

async function fetchTeamPlayers(teamId: number, squad: TeamSquad): Promise<Player[]> {
  const players: Player[] = [];
  let i = 0;
  for (const sp of squad.players) {
    i++;
    process.stdout.write(`\r    jugadores ${i}/${squad.players.length}`);
    try {
      const stats = await fetchPlayerStats(sp.id);
      const enriched: Player | null = stats.length
        ? {
            player: {
              id: sp.id,
              name: sp.name,
              firstname: sp.name,
              lastname: "",
              age: sp.age,
              birth: { date: null, place: null, country: null },
              nationality: squad.team.country,
              height: null,
              weight: null,
              injured: false,
              photo: sp.photo,
            },
            statistics: stats,
          }
        : null;
      players.push(mapSquadPlayerToPlayer(sp, squad.team, enriched));
    } catch {
      players.push(mapSquadPlayerToPlayer(sp, squad.team, null));
    }
    await delay(40);
  }
  console.log("");
  return players;
}

async function main() {
  console.log("→ Equipos…");
  const teamsRaw = await apiGet<{ team: import("../src/types").Team }[]>("teams", {
    league: LEAGUE_ID,
    season: 2026,
  });
  const teams = teamsRaw.map((t) => t.team);
  console.log(`  ${teams.length} selecciones`);

  console.log("→ Fixtures…");
  const fixtures = await fetchAllFixtures();

  console.log("→ Standings…");
  const standings = await apiGet<WorldCupSnapshot["standings"]>("standings", {
    league: LEAGUE_ID,
    season: 2026,
  });

  const allPlayers: Player[] = [];
  let teamIndex = 0;
  for (const team of teams) {
    teamIndex++;
    console.log(`→ [${teamIndex}/${teams.length}] ${team.name}`);
    const squads = await apiGet<TeamSquad[]>("players/squads", { team: team.id });
    const squad = squads[0];
    if (!squad?.players.length) continue;
    const squadPlayers = await fetchTeamPlayers(team.id, squad);
    allPlayers.push(...squadPlayers);
    await delay(200);
  }

  const radarPool = buildRadarPoolEntries(allPlayers);

  const snapshot: WorldCupSnapshot = {
    version: 1,
    generatedAt: new Date().toISOString(),
    teams,
    players: allPlayers,
    fixtures,
    standings,
    radarPool,
    meta: {
      teamCount: teams.length,
      playerCount: allPlayers.length,
      fixtureCount: fixtures.length,
    },
  };

  mkdirSync(OUT_DIR, { recursive: true });
  writeFileSync(OUT_FILE, JSON.stringify(snapshot));
  const sizeMb = (Buffer.byteLength(JSON.stringify(snapshot)) / 1024 / 1024).toFixed(2);
  console.log(`\n✓ Snapshot guardado: ${OUT_FILE}`);
  console.log(`  ${allPlayers.length} jugadores · ${radarPool.length} entradas radar · ${sizeMb} MB`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
