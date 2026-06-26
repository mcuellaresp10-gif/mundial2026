import type { Fixture, StandingsGroup } from "@/types";
import {
  isPlausibleLiveFixture,
  shouldPollFixtures,
} from "@/lib/liveRefresh";

const SESSION_KEY = "mundial2026_live_session";
const CACHE_CLEARED_KEY = "mundial2026_live_cache_cleared";
const LS_PREFIX = "mundial2026_";

let memoryActive = false;

function readSessionFlag(): boolean {
  if (typeof window === "undefined") return memoryActive;
  try {
    return sessionStorage.getItem(SESSION_KEY) === "true";
  } catch {
    return memoryActive;
  }
}

function writeSessionFlag(active: boolean): void {
  memoryActive = active;
  if (typeof window === "undefined") return;
  try {
    if (active) sessionStorage.setItem(SESSION_KEY, "true");
    else sessionStorage.removeItem(SESSION_KEY);
  } catch {
    /* ignore */
  }
}

/** Limpia caché local de fixtures/live una sola vez al activar sesión en vivo. */
export function clearLiveFixtureLocalCache(): void {
  if (typeof window === "undefined") return;
  try {
    if (sessionStorage.getItem(CACHE_CLEARED_KEY) === "true") return;
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (!key?.startsWith(LS_PREFIX)) continue;
      const suffix = key.slice(LS_PREFIX.length);
      // Historial FT en IndexedDB (fixtureHistory.ts) — no se toca aquí.
      if (
        suffix.startsWith("fixtures") ||
        suffix.startsWith("fixture-by-id") ||
        suffix.includes("worldcup-live") ||
        suffix.startsWith("standings-wc-live") ||
        suffix.startsWith("players/topscorers") ||
        suffix.startsWith("worldCupAssistLeaders") ||
        suffix.startsWith("worldCupPlayerStatsPool")
      ) {
        keysToRemove.push(key);
      }
    }
    for (const key of keysToRemove) localStorage.removeItem(key);
    sessionStorage.setItem(CACHE_CLEARED_KEY, "true");
  } catch {
    /* ignore */
  }
}

export function isLiveSessionActive(): boolean {
  if (process.env.NEXT_PUBLIC_FORCE_LIVE_API === "true") return true;
  return readSessionFlag();
}

export interface LiveSessionSignals {
  fixtures?: Fixture[];
  standings?: StandingsGroup[];
  liveWorldCupCount?: number;
}

/** Solo mantener sesión en vivo cuando hay partidos en curso o ventana de kickoff. */
export function shouldKeepLiveSession(signals: LiveSessionSignals): boolean {
  const { fixtures = [], liveWorldCupCount = 0 } = signals;
  if (liveWorldCupCount > 0) return true;
  if (shouldPollFixtures(fixtures)) return true;
  if (fixtures.some((f) => isPlausibleLiveFixture(f))) return true;
  return false;
}

/** @deprecated Usar shouldKeepLiveSession */
export function shouldActivateLiveSession(signals: LiveSessionSignals): boolean {
  return shouldKeepLiveSession(signals);
}

/** Activa modo Mundial en vivo (persiste en sessionStorage hasta desactivar o cerrar pestaña). */
export function activateLiveSession(signals?: LiveSessionSignals): void {
  if (signals && !shouldKeepLiveSession(signals)) return;
  if (isLiveSessionActive()) return;
  writeSessionFlag(true);
  clearLiveFixtureLocalCache();
}

export function deactivateLiveSession(): void {
  if (!isLiveSessionActive()) return;
  writeSessionFlag(false);
  if (typeof window === "undefined") return;
  try {
    sessionStorage.removeItem(CACHE_CLEARED_KEY);
  } catch {
    /* ignore */
  }
}

/** Sincroniza estado de sesión en vivo según datos actuales. */
export function syncLiveSession(signals: LiveSessionSignals): boolean {
  if (shouldKeepLiveSession(signals)) {
    activateLiveSession(signals);
    return true;
  }
  if (isLiveSessionActive()) {
    deactivateLiveSession();
  }
  return false;
}
