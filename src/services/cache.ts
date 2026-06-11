import { get, set, del, keys } from "idb-keyval";
import { CACHE_TTL_MS } from "@/lib/utils";

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

const LS_PREFIX = "mundial2026_";

export function getLocalCache<T>(key: string): T | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(LS_PREFIX + key);
    if (!raw) return null;
    const entry: CacheEntry<T> = JSON.parse(raw);
    if (Date.now() - entry.timestamp > entry.ttl) return null;
    return entry.data;
  } catch {
    return null;
  }
}

export function getStaleLocalCache<T>(key: string): T | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(LS_PREFIX + key);
    if (!raw) return null;
    const entry: CacheEntry<T> = JSON.parse(raw);
    return entry.data;
  } catch {
    return null;
  }
}

export function setLocalCache<T>(key: string, data: T, ttl: number = CACHE_TTL_MS): void {
  if (typeof window === "undefined") return;
  try {
    const entry: CacheEntry<T> = { data, timestamp: Date.now(), ttl };
    localStorage.setItem(LS_PREFIX + key, JSON.stringify(entry));
  } catch {
    // quota exceeded - ignore
  }
}

export function removeLocalCache(key: string): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(LS_PREFIX + key);
  } catch {
    /* ignore */
  }
}

export async function getIndexedCache<T>(key: string): Promise<T | null> {
  try {
    const entry = await get<CacheEntry<T>>(LS_PREFIX + key);
    if (!entry) return null;
    if (Date.now() - entry.timestamp > entry.ttl) return null;
    return entry.data;
  } catch {
    return null;
  }
}

export async function getStaleIndexedCache<T>(key: string): Promise<T | null> {
  try {
    const entry = await get<CacheEntry<T>>(LS_PREFIX + key);
    return entry?.data ?? null;
  } catch {
    return null;
  }
}

export async function setIndexedCache<T>(
  key: string,
  data: T,
  ttl: number = CACHE_TTL_MS * 2
): Promise<void> {
  try {
    await set(LS_PREFIX + key, { data, timestamp: Date.now(), ttl });
  } catch {
    // ignore
  }
}

export async function clearAnalysisCache(): Promise<void> {
  const allKeys = await keys();
  for (const k of allKeys) {
    if (String(k).startsWith(LS_PREFIX + "analysis_")) {
      await del(k);
    }
  }
}

export function cacheKey(path: string, params?: Record<string, unknown>): string {
  const sorted = params
    ? Object.keys(params)
        .sort()
        .map((k) => `${k}=${params[k]}`)
        .join("&")
    : "";
  return `${path}?${sorted}`;
}
