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
