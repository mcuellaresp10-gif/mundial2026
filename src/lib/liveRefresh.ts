import type { Fixture } from "@/types";

/** Estados API-Football que indican partido en curso. */
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

export function hasAnyLiveFixture(fixtures: Fixture[] | undefined): boolean {
  return fixtures?.some((f) => isFixtureLive(f.fixture.status.short)) ?? false;
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
