import { NextRequest, NextResponse } from "next/server";
import { validateFootballProxyRequest } from "@/server/footballAllowlist";

const CACHE_TTL = 4 * 60 * 60 * 1000;
const LIVE_CACHE_TTL = 60 * 1000;
const LIVE_DETAIL_CACHE_TTL = 25 * 1000;
const LIVE_STANDINGS_CACHE_TTL = 2 * 60 * 1000;

const LIVE_SESSION_LIVE_TTL = 40 * 1000;
const LIVE_SESSION_FIXTURE_TTL = 30 * 1000;
const LIVE_SESSION_LEAGUE_TTL = 5 * 60 * 1000;
const LIVE_SESSION_DETAIL_TTL = 25 * 1000;

function isLiveSessionRequest(request: NextRequest): boolean {
  return request.headers.get("X-Mundial-Live") === "1";
}

function isPlayerStatsPath(path: string, search: string): boolean {
  return (
    path.includes("players/topscorers") ||
    (path === "players" && search.includes("league="))
  );
}

function getCacheTtl(path: string, search: string, liveSession: boolean): number {
  if (liveSession) {
    if (path.includes("fixtures/events") || path.includes("fixtures/statistics")) {
      return LIVE_SESSION_DETAIL_TTL;
    }
    if (isPlayerStatsPath(path, search)) {
      return LIVE_SESSION_DETAIL_TTL;
    }
    if (search.includes("live=all")) return LIVE_SESSION_LIVE_TTL;
    if (search.includes("id=")) return LIVE_SESSION_FIXTURE_TTL;
    if (path === "fixtures" && search.includes("league=")) return LIVE_SESSION_LEAGUE_TTL;
    if (path === "fixtures" || path.startsWith("fixtures/")) return LIVE_SESSION_FIXTURE_TTL;
  }

  if (path.includes("fixtures/events") || path.includes("fixtures/statistics")) {
    return LIVE_DETAIL_CACHE_TTL;
  }
  if (path.includes("players/topscorers")) {
    return LIVE_CACHE_TTL;
  }
  if (search.includes("live=all")) {
    return 30 * 1000;
  }
  if (path === "fixtures" || path.startsWith("fixtures/")) {
    return LIVE_CACHE_TTL;
  }
  if (path === "standings") {
    return LIVE_STANDINGS_CACHE_TTL;
  }
  return CACHE_TTL;
}

const cache = new Map<string, { data: unknown; timestamp: number }>();
let dailyRequestCount = 0;
let dailyResetDate = new Date().toDateString();

interface RouteParams {
  params: Promise<{ path: string[] }>;
}

function getCacheKey(path: string, search: string): string {
  return `${path}?${search}`;
}

function getFromCache(key: string, ttl: number): { data: unknown; stale: boolean } | null {
  const entry = cache.get(key);
  if (!entry) return null;
  const stale = Date.now() - entry.timestamp > ttl;
  return { data: entry.data, stale };
}

function setCache(key: string, data: unknown): void {
  cache.set(key, { data, timestamp: Date.now() });
}

function trackRequest(): void {
  const today = new Date().toDateString();
  if (today !== dailyResetDate) {
    dailyRequestCount = 0;
    dailyResetDate = today;
  }
  dailyRequestCount++;
  if (dailyRequestCount > 80) {
    console.warn(`[API-Football] Daily request count: ${dailyRequestCount}/100`);
  }
}

function getApiBaseUrl(): string {
  const fallback = "https://v3.football.api-sports.io";
  const raw = process.env.API_FOOTBALL_BASE_URL?.trim();
  if (!raw || raw === "API_FOOTBALL_BASE_URL" || !raw.startsWith("http")) {
    return fallback;
  }
  try {
    return new URL(raw).origin + new URL(raw).pathname.replace(/\/$/, "");
  } catch {
    return fallback;
  }
}

async function proxyRequest(request: NextRequest, pathSegments: string[]) {
  const validation = validateFootballProxyRequest(pathSegments, request.nextUrl.searchParams);
  if (!validation.ok) {
    return NextResponse.json(
      { errors: { forbidden: validation.message }, response: [] },
      { status: validation.status }
    );
  }

  const apiKey = process.env.API_FOOTBALL_KEY?.trim();
  const baseUrl = getApiBaseUrl();

  if (!apiKey || apiKey === "your_api_football_key_here" || apiKey === "API_FOOTBALL_KEY") {
    return NextResponse.json(
      { errors: { config: "API_FOOTBALL_KEY not configured on server" }, response: [] },
      { status: 500 }
    );
  }

  const path = validation.path;
  const search = validation.search;
  const cacheKey = getCacheKey(path, search);
  const liveSession = isLiveSessionRequest(request);
  const cacheTtl = getCacheTtl(path, search, liveSession);
  const cached = getFromCache(cacheKey, cacheTtl);

  if (cached && !cached.stale) {
    return NextResponse.json(cached.data, {
      headers: { "X-Cache": "HIT" },
    });
  }

  const isLiveUpstream =
    search.includes("live=all") ||
    (liveSession &&
      (path === "fixtures" ||
        path.startsWith("fixtures/") ||
        isPlayerStatsPath(path, search)));

  try {
    trackRequest();
    const url = `${baseUrl}/${path}${search ? `?${search}` : ""}`;
    const res = await fetch(url, {
      headers: {
        "x-apisports-key": apiKey,
      },
      ...(isLiveUpstream
        ? { cache: "no-store" as RequestCache }
        : { next: { revalidate: 14400 } }),
    });

    if (res.status === 429) {
      if (cached) {
        return NextResponse.json(cached.data, {
          headers: { "X-Cache": "STALE", "X-Cache-Stale": "true" },
        });
      }
      return NextResponse.json(
        { errors: { rateLimit: "Rate limit exceeded" }, response: [] },
        { status: 429 }
      );
    }

    const data = await res.json();
    const isEmptyLive =
      search.includes("live=all") &&
      Array.isArray((data as { response?: unknown[] }).response) &&
      ((data as { response: unknown[] }).response?.length ?? 0) === 0;
    if (!isEmptyLive) {
      setCache(cacheKey, data);
    }

    return NextResponse.json(data, {
      headers: {
        "X-Cache": "MISS",
        "X-Daily-Requests": String(dailyRequestCount),
      },
    });
  } catch (error) {
    if (cached) {
      return NextResponse.json(cached.data, {
        headers: { "X-Cache": "STALE", "X-Cache-Stale": "true" },
      });
    }
    return NextResponse.json(
      { errors: { network: String(error) }, response: [] },
      { status: 502 }
    );
  }
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  const { path } = await params;
  return proxyRequest(request, path);
}
