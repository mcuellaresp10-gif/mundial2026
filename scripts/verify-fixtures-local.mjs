/**
 * Verifica ensamblaje de fixtures contra API local + snapshot.
 * Uso: node scripts/verify-fixtures-local.mjs
 */
const BASE = process.env.BASE_URL ?? "http://localhost:3000";

async function fetchJson(path) {
  const res = await fetch(`${BASE}${path}`);
  if (!res.ok) throw new Error(`${path} → ${res.status}`);
  return res.json();
}

function pickBetter(a, b) {
  const rank = (f) => {
    const s = f.fixture.status.short;
    let r = s === "FT" || s === "AET" || s === "PEN" ? 300 : /^(LIVE|1H|2H|HT)/.test(s) ? 200 : 100;
    if (f.goals.home != null && f.goals.away != null) r += 10;
    return r;
  };
  return rank(a) >= rank(b) ? a : b;
}

function mergeLists(base, overlay) {
  const byId = new Map(base.map((f) => [f.fixture.id, f]));
  for (const f of overlay) {
    const ex = byId.get(f.fixture.id);
    byId.set(f.fixture.id, ex ? pickBetter(ex, f) : f);
  }
  return [...byId.values()];
}

function stats(fixtures) {
  const started = fixtures.filter((f) =>
    ["FT", "AET", "PEN", "LIVE", "1H", "2H", "HT"].includes(f.fixture.status.short)
  );
  const finished = fixtures.filter((f) => ["FT", "AET", "PEN"].includes(f.fixture.status.short));
  const pending = fixtures.filter((f) => f.fixture.status.short === "NS");
  const goals = started.reduce((s, f) => s + (f.goals.home ?? 0) + (f.goals.away ?? 0), 0);
  const byRound = {};
  for (const f of started) {
    const m = f.league.round.match(/Group Stage\s*-\s*(\d+)/i);
    const key = m ? `J${m[1]}` : f.league.round;
    byRound[key] = (byRound[key] ?? 0) + (f.goals.home ?? 0) + (f.goals.away ?? 0);
  }
  return { total: fixtures.length, started: started.length, finished: finished.length, pending: pending.length, goals, byRound };
}

async function main() {
  console.log(`→ Verificando en ${BASE}\n`);

  const snap = await fetchJson("/data/snapshot/worldcup-snapshot.json");
  const catalog = snap.fixtures ?? [];
  console.log(`Snapshot catálogo: ${catalog.length} partidos`);

  const all = (await fetchJson("/api/football/fixtures?league=1&season=2026")).response ?? [];
  console.log(`API league+season: ${all.length} partidos`);

  const ft = (await fetchJson("/api/football/fixtures?league=1&season=2026&status=FT")).response ?? [];
  console.log(`API status=FT: ${ft.length} partidos`);

  const liveRaw = (await fetchJson("/api/football/fixtures?live=all")).response ?? [];
  const live = liveRaw.filter((f) => f.league?.id === 1);
  console.log(`API live Mundial: ${live.length} partidos`);

  let assembled = mergeLists(catalog, all);
  assembled = mergeLists(assembled, ft);
  assembled = mergeLists(assembled, live);

  const s = stats(assembled);
  console.log("\n--- Ensamblaje (como loadWorldCupFixtures) ---");
  console.log(`Total en lista: ${s.total}`);
  console.log(`Iniciados: ${s.started} | Finalizados: ${s.finished} | Pendientes: ${s.pending}`);
  console.log(`Goles totales: ${s.goals}`);
  console.log("Goles por jornada:", s.byRound);

  const ok = s.total >= 48 && s.pending > 0 && Object.keys(s.byRound).length >= 1;
  if (!ok) {
    console.error("\n❌ Lista incompleta o stats incorrectas para estadísticas del torneo");
    process.exit(1);
  }
  console.log("\n✓ Ensamblaje OK para /estadisticas");
}

main().catch((e) => {
  console.error("❌", e.message);
  process.exit(1);
});
