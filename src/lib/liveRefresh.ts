import type { Fixture } from "@/types";
export const LIVE_FIXTURE_STATUSES = [
  "LIVE",
  "1H",
  "2H",
  "HT",
  "ET",
  "BT",
  "P",
  "INT",
] as const;

export function isFixtureLive(statusShort: string): boolean {
  return (LIVE_FIXTURE_STATUSES as readonly string[]).includes(statusShort);
}

export function isFixtureFinished(statusShort: string): boolean {
  return ["FT", "AET", "PEN"].includes(statusShort);
}

/** Partido ya comenzó (en vivo o finalizado). */
export function isFixtureStarted(statusShort: string): boolean {
  return isFixtureFinished(statusShort) || isFixtureLive(statusShort);
}

export function hasAnyLiveFixture(fixtures: Fixture[] | undefined): boolean {
  return fixtures?.some((f) => isFixtureLive(f.fixture.status.short)) ?? false;
}

export function hasAnyStartedFixture(fixtures: Fixture[] | undefined): boolean {
  return fixtures?.some((f) => isFixtureStarted(f.fixture.status.short)) ?? false;
}

export function isTournamentActive(
  fixtures: Fixture[] | undefined,
  standingsPlayed = false
): boolean {
  return standingsPlayed || hasAnyStartedFixture(fixtures);
}

/** Partido en ventana de kickoff — refrescar aunque el status en caché siga NS. */
export function isWithinKickoffWindow(dateStr: string, statusShort: string): boolean {
  if (isFixtureLive(statusShort)) return true;
  if (["FT", "AET", "PEN", "CANC", "ABD", "PST"].includes(statusShort)) return false;
  const kickoff = new Date(dateStr).getTime();
  if (Number.isNaN(kickoff)) return false;
  const now = Date.now();
  return now >= kickoff - 15 * 60 * 1000 && now <= kickoff + 2.5 * 60 * 60 * 1000;
}

export function shouldPollFixtures(fixtures: Fixture[] | undefined): boolean {
  if (hasAnyLiveFixture(fixtures)) return true;
  if (fixtures?.some((f) => isWithinKickoffWindow(f.fixture.date, f.fixture.status.short))) {
    return true;
  }
  return false;
}

/** Partido ya terminó (FT o live obsoleto tras el kickoff). */
export function isEffectivelyFinished(fixture: Fixture): boolean {
  if (isFixtureFinished(fixture.fixture.status.short)) return true;
  return isFixtureLive(fixture.fixture.status.short) && !isPlausibleLiveFixture(fixture);
}

/** Evita tratar como en vivo un partido cuyo kickoff fue hace mucho (caché obsoleto). */
export function isPlausibleLiveFixture(fixture: Fixture): boolean {
  const status = fixture.fixture.status.short;
  if (!isFixtureLive(status)) return false;
  const kickoff = new Date(fixture.fixture.date).getTime();
  if (Number.isNaN(kickoff)) return true;
  const maxMatchMs = 150 * 60 * 1000;
  return Date.now() <= kickoff + maxMatchMs;
}

export function getLocalDayKey(input: string | Date): string {
  const d = typeof input === "string" ? new Date(input) : input;
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function sortFixturesByKickoff(fixtures: Fixture[]): Fixture[] {
  return [...fixtures].sort(
    (a, b) => new Date(a.fixture.date).getTime() - new Date(b.fixture.date).getTime()
  );
}

export function getFixturesOnLocalDay(all: Fixture[], day: Date): Fixture[] {
  const key = getLocalDayKey(day);
  return sortFixturesByKickoff(all.filter((f) => getLocalDayKey(f.fixture.date) === key));
}

export interface DashboardFixturesGroup {
  title: string;
  dayKey: string;
  fixtures: Fixture[];
}

/** Partidos relevantes para el dashboard: jornada del día local (+ en vivo fuera de fecha). */
export function getDashboardFixtures(all: Fixture[], now = new Date()): DashboardFixturesGroup {
  const todayKey = getLocalDayKey(now);
  let dayFixtures = getFixturesOnLocalDay(all, now);

  const extraActive = all.filter(
    (f) =>
      (isPlausibleLiveFixture(f) ||
        isWithinKickoffWindow(f.fixture.date, f.fixture.status.short)) &&
      !dayFixtures.some((x) => x.fixture.id === f.fixture.id)
  );
  dayFixtures = sortFixturesByKickoff([...dayFixtures, ...extraActive]);

  if (dayFixtures.length > 0) {
    const liveCount = dayFixtures.filter((f) => isPlausibleLiveFixture(f)).length;
    return {
      title: liveCount > 0 ? "Partidos de hoy" : "Partidos de hoy",
      dayKey: todayKey,
      fixtures: dayFixtures,
    };
  }

  const live = all.filter((f) => isPlausibleLiveFixture(f));
  if (live.length > 0) {
    const day = new Date(live[0].fixture.date);
    const onDay = getFixturesOnLocalDay(all, day);
    return {
      title: "En vivo",
      dayKey: getLocalDayKey(day),
      fixtures: onDay.length > 0 ? onDay : sortFixturesByKickoff(live),
    };
  }

  const upcoming = sortFixturesByKickoff(all.filter((f) => f.fixture.status.short === "NS"));
  if (upcoming[0]) {
    const day = new Date(upcoming[0].fixture.date);
    return {
      title: "Próxima jornada",
      dayKey: getLocalDayKey(day),
      fixtures: getFixturesOnLocalDay(all, day),
    };
  }

  const finished = all
    .filter((f) => isEffectivelyFinished(f))
    .sort((a, b) => new Date(b.fixture.date).getTime() - new Date(a.fixture.date).getTime());
  if (finished[0]) {
    const day = new Date(finished[0].fixture.date);
    return {
      title: "Última jornada",
      dayKey: getLocalDayKey(day),
      fixtures: getFixturesOnLocalDay(all, day),
    };
  }

  return { title: "Partidos", dayKey: todayKey, fixtures: [] };
}

/** Partido destacado en dashboard: en vivo → último FT → próximo NS. */
export function pickFeaturedFixture(all: Fixture[]): Fixture | null {
  const live = all.filter((f) => isPlausibleLiveFixture(f));
  if (live.length > 0) {
    return [...live].sort(
      (a, b) => new Date(a.fixture.date).getTime() - new Date(b.fixture.date).getTime()
    )[0];
  }

  const finished = all
    .filter((f) => isEffectivelyFinished(f))
    .sort((a, b) => new Date(b.fixture.date).getTime() - new Date(a.fixture.date).getTime());
  if (finished[0]) return finished[0];

  const upcoming = all
    .filter((f) => f.fixture.status.short === "NS")
    .sort((a, b) => new Date(a.fixture.date).getTime() - new Date(b.fixture.date).getTime());
  return upcoming[0] ?? null;
}

/** Partidos cuyos eventos alimentan goleadores/asistidores (FT con goles + en vivo). */
export function getFixturesForScorerEvents(fixtures: Fixture[]): number[] {
  const ids = new Set<number>();

  for (const f of fixtures) {
    const status = f.fixture.status.short;
    if (isFixtureFinished(status)) {
      const totalGoals = (f.goals.home ?? 0) + (f.goals.away ?? 0);
      if (totalGoals > 0) ids.add(f.fixture.id);
      continue;
    }
    if (
      isPlausibleLiveFixture(f) ||
      isWithinKickoffWindow(f.fixture.date, status)
    ) {
      ids.add(f.fixture.id);
    }
  }

  return [...ids];
}

export function isFixtureLiveForScorerEvents(fixture: Fixture): boolean {
  const status = fixture.fixture.status.short;
  if (isFixtureFinished(status)) return false;
  return (
    isPlausibleLiveFixture(fixture) ||
    isWithinKickoffWindow(fixture.fixture.date, status)
  );
}

/** Firma estable de resultados FT — detecta cambios que deben refrescar standings. */
export function finishedFixturesSignature(fixtures: Fixture[]): string {
  return fixtures
    .filter((f) => isFixtureFinished(f.fixture.status.short))
    .map(
      (f) =>
        `${f.fixture.id}:${f.goals.home ?? "-"}-${f.goals.away ?? "-"}:${f.fixture.status.short}`
    )
    .sort((a, b) => a.localeCompare(b))
    .join("|");
}

/** Intervalos de refresco (ms). */
export const LIVE_REFRESH_MS = {
  /** Marcador, calendario, detalle de partido. */
  fixtures: 20 * 1000,
  /** Eventos y stats dentro de un partido en vivo. */
  fixtureDetail: 30 * 1000,
  /** Tabla de posiciones durante el torneo. */
  standings: 2 * 60 * 1000,
  /** Tabla de posiciones con sesión en vivo activa (post-partido). */
  standingsLive: 45 * 1000,
  /** Próximo partido cuando hay juego en curso. */
  nextFixture: 20 * 1000,
  /** Poll dedicado live=all (partido en curso o ventana de kickoff). */
  livePoll: 30 * 1000,
  /** Poll live=all sin partidos en curso — detecta kickoff y evita spam. */
  livePollIdle: 90 * 1000,
  /** Goleadores API y eventos en dashboard. */
  topScorers: 5 * 60 * 1000,
  /** Goleadores/asistidores con partido en curso. */
  topScorersLive: 60 * 1000,
  /** Stats agregadas de jugadores (pool scouting) entre jornadas. */
  playerStats: 3 * 60 * 1000,
  /** Stats de jugadores con partido en curso o ventana de kickoff. */
  playerStatsLive: 60 * 1000,
} as const;

/** Intervalo de refresco del pool de stats según estado del calendario. */
export function getPlayerStatsRefreshMs(
  fixtures: Fixture[] | undefined
): number | false {
  if (!fixtures?.length) return false;
  const started = fixtures.some((f) => isFixtureStarted(f.fixture.status.short));
  if (!started) return false;
  if (hasAnyLiveFixture(fixtures) || shouldPollFixtures(fixtures)) {
    return LIVE_REFRESH_MS.playerStatsLive;
  }
  return LIVE_REFRESH_MS.playerStats;
}

export function getLivePollInterval(aggressive: boolean): number {
  return aggressive ? LIVE_REFRESH_MS.livePoll : LIVE_REFRESH_MS.livePollIdle;
}

/** @param aggressive true = partido en vivo o ventana de kickoff */
export function getLiveRefreshInterval(aggressive = true): number {
  return getLivePollInterval(aggressive);
}

export const NORMAL_STALE_MS = 4 * 60 * 60 * 1000;
