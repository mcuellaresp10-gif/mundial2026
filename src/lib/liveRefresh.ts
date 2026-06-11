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

/** Intervalos de refresco (ms). */
export const LIVE_REFRESH_MS = {
  /** Marcador, calendario, detalle de partido. */
  fixtures: 60 * 1000,
  /** Eventos y stats dentro de un partido en vivo. */
  fixtureDetail: 30 * 1000,
  /** Tabla de posiciones durante el torneo. */
  standings: 2 * 60 * 1000,
  /** Próximo partido cuando hay juego en curso. */
  nextFixture: 60 * 1000,
} as const;

export const NORMAL_STALE_MS = 4 * 60 * 60 * 1000;
