import type { Confederation } from "./confederations";
import { CONFEDERATION_LABELS, getConfederation } from "./confederations";
import type { Fixture, FixtureEvent, Lineup, StandingsGroup, Team } from "@/types";
import { isFixtureFinished, isFixtureStarted, getLocalDayKey } from "@/lib/liveRefresh";
import { formatRoundLabel, formatShortDate } from "@/utils/formatters";
import { positionToCode } from "@/utils/squad";
import { translateTeamName } from "@/utils/teamNames";

const GOAL_TYPES = new Set(["Goal"]);
const EXCLUDED_DETAILS = new Set(["Missed Penalty"]);

export interface ChartDatum {
  label: string;
  value: number;
  [key: string]: string | number;
}

export interface ComebackMatch {
  fixture: Fixture;
  teamName: string;
  htScore: string;
  ftScore: string;
}

export interface TopMatch {
  fixture: Fixture;
  totalGoals: number;
  margin: number;
  label: string;
}

function finishedFixtures(fixtures: Fixture[]): Fixture[] {
  return fixtures.filter((f) => isFixtureFinished(f.fixture.status.short));
}

function startedFixtures(fixtures: Fixture[]): Fixture[] {
  return fixtures.filter((f) => isFixtureStarted(f.fixture.status.short));
}

export function aggregateGoalsByDay(fixtures: Fixture[]): ChartDatum[] {
  const byDay = new Map<string, number>();
  for (const f of startedFixtures(fixtures)) {
    const key = getLocalDayKey(f.fixture.date);
    const goals = (f.goals.home ?? 0) + (f.goals.away ?? 0);
    byDay.set(key, (byDay.get(key) ?? 0) + goals);
  }
  return [...byDay.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([day, value]) => ({
      label: formatShortDate(day),
      value,
      dayKey: day,
    }));
}

export function aggregateGoalsByDayLastN(fixtures: Fixture[], n = 7): ChartDatum[] {
  const all = aggregateGoalsByDay(fixtures);
  return all.slice(-n);
}

function roundSortKey(round: string): number {
  const groupStage = round.match(/Group Stage\s*-\s*(\d+)/i);
  if (groupStage) return parseInt(groupStage[1], 10);

  if (/Round of 16|8th Finals|Round of sixteen/i.test(round)) return 100;
  if (/Quarter[- ]finals?/i.test(round)) return 110;
  if (/Semi[- ]finals?/i.test(round)) return 120;
  if (/3rd Place|Third Place/i.test(round)) return 130;
  if (/Final/i.test(round)) return 140;

  return 50;
}

function roundChartLabel(round: string): string {
  const groupStage = round.match(/Group Stage\s*-\s*(\d+)/i);
  if (groupStage) return `J${groupStage[1]}`;
  return formatRoundLabel(round);
}

export function aggregateGoalsByRound(fixtures: Fixture[]): ChartDatum[] {
  const byRound = new Map<string, number>();
  for (const f of startedFixtures(fixtures)) {
    const round = f.league.round;
    const goals = (f.goals.home ?? 0) + (f.goals.away ?? 0);
    byRound.set(round, (byRound.get(round) ?? 0) + goals);
  }
  return [...byRound.entries()]
    .sort(([a], [b]) => roundSortKey(a) - roundSortKey(b))
    .map(([round, value]) => ({
      label: roundChartLabel(round),
      value,
      round,
      roundLabel: formatRoundLabel(round),
    }));
}

export function aggregateMatchResults(fixtures: Fixture[]): ChartDatum[] {
  let homeWin = 0;
  let awayWin = 0;
  let draw = 0;
  let nilNil = 0;

  for (const f of finishedFixtures(fixtures)) {
    const h = f.goals.home ?? 0;
    const a = f.goals.away ?? 0;
    if (h === 0 && a === 0) nilNil++;
    else if (h > a) homeWin++;
    else if (a > h) awayWin++;
    else draw++;
  }

  return [
    { label: "Victoria local", value: homeWin },
    { label: "Empate", value: draw },
    { label: "Victoria visitante", value: awayWin },
    { label: "0-0", value: nilNil },
  ].filter((d) => d.value > 0);
}

export function aggregateScoreDistribution(fixtures: Fixture[]): ChartDatum[] {
  const buckets = new Map<string, number>();
  for (const f of finishedFixtures(fixtures)) {
    const total = (f.goals.home ?? 0) + (f.goals.away ?? 0);
    const key = total >= 4 ? "4+" : String(total);
    buckets.set(key, (buckets.get(key) ?? 0) + 1);
  }
  return ["0", "1", "2", "3", "4+"].filter((k) => buckets.has(k)).map((k) => ({
    label: `${k} goles`,
    value: buckets.get(k) ?? 0,
  }));
}

export function aggregateGoalsByConfederation(
  fixtures: Fixture[],
  teamConfed: Map<number, Confederation>
): ChartDatum[] {
  const counts = new Map<Confederation, number>();
  for (const f of startedFixtures(fixtures)) {
    const h = f.goals.home ?? 0;
    const a = f.goals.away ?? 0;
    if (h > 0) {
      const c = teamConfed.get(f.teams.home.id) ?? "UEFA";
      counts.set(c, (counts.get(c) ?? 0) + h);
    }
    if (a > 0) {
      const c = teamConfed.get(f.teams.away.id) ?? "UEFA";
      counts.set(c, (counts.get(c) ?? 0) + a);
    }
  }
  return [...counts.entries()]
    .sort(([, a], [, b]) => b - a)
    .map(([confed, value]) => ({
      label: CONFEDERATION_LABELS[confed],
      value,
      confed,
    }));
}

export function aggregateConfederationEfficiency(
  fixtures: Fixture[],
  teamConfed: Map<number, Confederation>
): ChartDatum[] {
  const goals = new Map<Confederation, number>();
  const matches = new Map<Confederation, number>();

  for (const f of startedFixtures(fixtures)) {
    for (const side of [f.teams.home, f.teams.away]) {
      const c = teamConfed.get(side.id) ?? "UEFA";
      matches.set(c, (matches.get(c) ?? 0) + 1);
    }
    const h = f.goals.home ?? 0;
    const a = f.goals.away ?? 0;
    if (h > 0) {
      const c = teamConfed.get(f.teams.home.id) ?? "UEFA";
      goals.set(c, (goals.get(c) ?? 0) + h);
    }
    if (a > 0) {
      const c = teamConfed.get(f.teams.away.id) ?? "UEFA";
      goals.set(c, (goals.get(c) ?? 0) + a);
    }
  }

  return [...goals.entries()]
    .map(([confed, g]) => {
      const m = matches.get(confed) ?? 1;
      return {
        label: CONFEDERATION_LABELS[confed],
        value: Math.round((g / m) * 100) / 100,
        confed,
        goals: g,
        matches: m,
      };
    })
    .sort((a, b) => b.value - a.value);
}

/** Puntos acumulados en fase de grupos por confederación (desde standings). */
export function aggregatePointsByConfederation(
  standings: StandingsGroup[],
  teamConfed: Map<number, Confederation>
): ChartDatum[] {
  const points = new Map<Confederation, number>();

  for (const sg of standings) {
    for (const group of sg.league.standings) {
      for (const row of group) {
        const c = teamConfed.get(row.team.id) ?? getConfederationFromTeam(row.team);
        points.set(c, (points.get(c) ?? 0) + row.points);
      }
    }
  }

  return [...points.entries()]
    .sort(([, a], [, b]) => b - a)
    .map(([confed, value]) => ({
      label: CONFEDERATION_LABELS[confed],
      value,
      confed,
    }));
}

/** % eficiencia de puntos: puntos obtenidos / máximo posible (3 por partido). */
export function aggregatePointsEfficiencyByConfederation(
  standings: StandingsGroup[],
  teamConfed: Map<number, Confederation>
): ChartDatum[] {
  const points = new Map<Confederation, number>();
  const maxPoints = new Map<Confederation, number>();

  for (const sg of standings) {
    for (const group of sg.league.standings) {
      for (const row of group) {
        const c = teamConfed.get(row.team.id) ?? getConfederationFromTeam(row.team);
        const played = row.all.played ?? 0;
        points.set(c, (points.get(c) ?? 0) + row.points);
        maxPoints.set(c, (maxPoints.get(c) ?? 0) + played * 3);
      }
    }
  }

  return [...points.entries()]
    .map(([confed, pts]) => {
      const max = maxPoints.get(confed) ?? 0;
      const pct = max > 0 ? Math.round((pts / max) * 1000) / 10 : 0;
      return {
        label: CONFEDERATION_LABELS[confed],
        value: pct,
        confed,
        points: pts,
        maxPoints: max,
      };
    })
    .filter((d) => d.maxPoints > 0)
    .sort((a, b) => b.value - a.value);
}

function getConfederationFromTeam(team: Team): Confederation {
  return getConfederation(team.country || team.name);
}

export function aggregateHomeAwayGoals(fixtures: Fixture[]): ChartDatum[] {
  let home = 0;
  let away = 0;
  for (const f of startedFixtures(fixtures)) {
    home += f.goals.home ?? 0;
    away += f.goals.away ?? 0;
  }
  return [
    { label: "Local", value: home },
    { label: "Visitante", value: away },
  ];
}

function isKnockoutRound(round: string): boolean {
  return /Round of 16|Quarter|Semi|Final|8th Finals/i.test(round) &&
    !/Group/i.test(round);
}

export function aggregateGoalsByPhase(fixtures: Fixture[]): ChartDatum[] {
  let groups = 0;
  let knockout = 0;
  for (const f of startedFixtures(fixtures)) {
    const goals = (f.goals.home ?? 0) + (f.goals.away ?? 0);
    if (isKnockoutRound(f.league.round)) knockout += goals;
    else groups += goals;
  }
  return [
    { label: "Fase de grupos", value: groups },
    { label: "Eliminatorias", value: knockout },
  ].filter((d) => d.value > 0);
}

export function buildPlayerPositionMap(lineups: Lineup[]): Map<number, string> {
  const map = new Map<number, string>();
  for (const lu of lineups) {
    for (const entry of [...lu.startXI, ...lu.substitutes]) {
      map.set(entry.player.id, positionToCode(entry.player.pos));
    }
  }
  return map;
}

function isValidGoal(event: FixtureEvent): boolean {
  return GOAL_TYPES.has(event.type) && !EXCLUDED_DETAILS.has(event.detail);
}

function goalTypeLabel(detail: string): string {
  if (/Own Goal/i.test(detail)) return "Autogol";
  if (/Penalty/i.test(detail)) return "Penalti";
  return "Juego normal";
}

const MINUTE_BUCKETS = [
  { label: "0-15'", min: 0, max: 15 },
  { label: "16-30'", min: 16, max: 30 },
  { label: "31-45'", min: 31, max: 45 },
  { label: "46-60'", min: 46, max: 60 },
  { label: "61-75'", min: 61, max: 75 },
  { label: "76-90+'", min: 76, max: 999 },
];

export function aggregateGoalsByMinute(events: FixtureEvent[]): ChartDatum[] {
  const counts = MINUTE_BUCKETS.map((b) => ({ ...b, value: 0 }));
  for (const e of events) {
    if (!isValidGoal(e)) continue;
    const min = e.time.elapsed + (e.time.extra ?? 0);
    const bucket = counts.find((b) => min >= b.min && min <= b.max);
    if (bucket) bucket.value++;
  }
  return counts.map(({ label, value }) => ({ label, value }));
}

export function aggregateGoalsByPosition(
  events: FixtureEvent[],
  positionMap: Map<number, string>
): ChartDatum[] {
  const counts = new Map<string, number>();
  const labels: Record<string, string> = {
    G: "Portero",
    D: "Defensa",
    M: "Mediocampo",
    F: "Delantero",
  };
  for (const e of events) {
    if (!isValidGoal(e)) continue;
    const pos = positionMap.get(e.player.id) ?? "M";
    counts.set(pos, (counts.get(pos) ?? 0) + 1);
  }
  return ["G", "D", "M", "F"]
    .filter((p) => (counts.get(p) ?? 0) > 0)
    .map((p) => ({ label: labels[p], value: counts.get(p) ?? 0, pos: p }));
}

export function aggregateGoalTypes(events: FixtureEvent[]): ChartDatum[] {
  const counts = new Map<string, number>();
  for (const e of events) {
    if (!isValidGoal(e)) continue;
    const label = goalTypeLabel(e.detail);
    counts.set(label, (counts.get(label) ?? 0) + 1);
  }
  return [...counts.entries()].map(([label, value]) => ({ label, value }));
}

export function countLateGoals(events: FixtureEvent[], afterMin = 85): number {
  return events.filter((e) => {
    if (!isValidGoal(e)) return false;
    const min = e.time.elapsed + (e.time.extra ?? 0);
    return min >= afterMin;
  }).length;
}

export function findComebacks(fixtures: Fixture[]): ComebackMatch[] {
  const results: ComebackMatch[] = [];
  for (const f of finishedFixtures(fixtures)) {
    const htH = f.score.halftime.home;
    const htA = f.score.halftime.away;
    const ftH = f.goals.home ?? 0;
    const ftA = f.goals.away ?? 0;
    if (htH == null || htA == null) continue;

    if (htH < htA && ftH >= ftA) {
      results.push({
        fixture: f,
        teamName: translateTeamName(f.teams.home.name),
        htScore: `${htH}-${htA}`,
        ftScore: `${ftH}-${ftA}`,
      });
    } else if (htA < htH && ftA >= ftH) {
      results.push({
        fixture: f,
        teamName: translateTeamName(f.teams.away.name),
        htScore: `${htH}-${htA}`,
        ftScore: `${ftH}-${ftA}`,
      });
    }
  }
  return results;
}

export function topScoringMatches(fixtures: Fixture[], limit = 5): TopMatch[] {
  return finishedFixtures(fixtures)
    .map((f) => {
      const h = f.goals.home ?? 0;
      const a = f.goals.away ?? 0;
      return {
        fixture: f,
        totalGoals: h + a,
        margin: Math.abs(h - a),
        label: `${translateTeamName(f.teams.home.name)} ${h}-${a} ${translateTeamName(f.teams.away.name)}`,
      };
    })
    .sort((a, b) => b.totalGoals - a.totalGoals || b.margin - a.margin)
    .slice(0, limit);
}

export function topScoringCities(fixtures: Fixture[], limit = 5): ChartDatum[] {
  const byCity = new Map<string, number>();
  for (const f of startedFixtures(fixtures)) {
    const city = f.fixture.venue.city || f.fixture.venue.name || "Desconocida";
    const goals = (f.goals.home ?? 0) + (f.goals.away ?? 0);
    byCity.set(city, (byCity.get(city) ?? 0) + goals);
  }
  return [...byCity.entries()]
    .sort(([, a], [, b]) => b - a)
    .slice(0, limit)
    .map(([label, value]) => ({ label, value }));
}

export function aggregateRedCardsByConfederation(
  events: FixtureEvent[],
  teamConfed: Map<number, Confederation>
): ChartDatum[] {
  const counts = new Map<Confederation, number>();
  for (const e of events) {
    if (e.type !== "Card" || !/Red/i.test(e.detail)) continue;
    const c = teamConfed.get(e.team.id) ?? "UEFA";
    counts.set(c, (counts.get(c) ?? 0) + 1);
  }
  return [...counts.entries()]
    .sort(([, a], [, b]) => b - a)
    .map(([confed, value]) => ({
      label: CONFEDERATION_LABELS[confed],
      value,
      confed,
    }));
}

export function aggregateEarlyVsLateFirstGoal(eventsByFixture: FixtureEvent[][]): {
  early: number;
  late: number;
  total: number;
} {
  let early = 0;
  let late = 0;
  for (const events of eventsByFixture) {
    const goals = events
      .filter(isValidGoal)
      .sort((a, b) => a.time.elapsed - b.time.elapsed);
    if (goals.length === 0) continue;
    const firstMin = goals[0].time.elapsed + (goals[0].time.extra ?? 0);
    if (firstMin <= 30) early++;
    else late++;
  }
  return { early, late, total: early + late };
}

export function generateDynamicInsight(
  fixtures: Fixture[],
  teamConfed: Map<number, Confederation>,
  events: FixtureEvent[]
): string {
  const started = startedFixtures(fixtures);
  if (started.length === 0) return "El torneo está por comenzar.";

  const byConfed = aggregateGoalsByConfederation(fixtures, teamConfed);
  if (byConfed.length > 0) {
    const top = byConfed[0];
    const total = byConfed.reduce((s, d) => s + d.value, 0);
    const pct = total > 0 ? Math.round((top.value / total) * 100) : 0;
    if (pct >= 25) return `${top.label} concentra el ${pct}% de los goles del torneo (${top.value} goles).`;
  }

  const late = countLateGoals(events);
  if (late >= 3) return `Índice de drama: ${late} goles marcados en el minuto 85 o posterior.`;

  const comebacks = findComebacks(fixtures);
  if (comebacks.length > 0) {
    const c = comebacks[0];
    return `Remontada destacada: ${c.teamName} (${c.htScore} al descanso → ${c.ftScore} final).`;
  }

  const homeAway = aggregateHomeAwayGoals(fixtures);
  const home = homeAway.find((d) => d.label === "Local")?.value ?? 0;
  const away = homeAway.find((d) => d.label === "Visitante")?.value ?? 0;
  if (home + away > 0) {
    const homePct = Math.round((home / (home + away)) * 100);
    if (homePct >= 58) return `Ventaja local: el ${homePct}% de los goles los anotó el equipo de casa.`;
    if (homePct <= 42) return `Dominio visitante: el ${100 - homePct}% de los goles los anotó el equipo de fuera.`;
  }

  return `Promedio de ${(started.reduce((s, f) => s + (f.goals.home ?? 0) + (f.goals.away ?? 0), 0) / started.length).toFixed(1)} goles por partido.`;
}

export function flattenEvents(eventsByFixture: FixtureEvent[][]): FixtureEvent[] {
  return eventsByFixture.flat();
}

export function flattenLineups(lineupsByFixture: Lineup[][]): Lineup[] {
  return lineupsByFixture.flat();
}
