import { NextRequest, NextResponse } from "next/server";

const CACHE_TTL = 4 * 60 * 60 * 1000;
const cache = new Map<string, { data: unknown; timestamp: number }>();
let dailyRequestCount = 0;
let dailyResetDate = new Date().toDateString();

interface RouteParams {
  params: Promise<{ path: string[] }>;
}

function getCacheKey(path: string, search: string): string {
  return `${path}?${search}`;
}

function getFromCache(key: string): { data: unknown; stale: boolean } | null {
  const entry = cache.get(key);
  if (!entry) return null;
  const stale = Date.now() - entry.timestamp > CACHE_TTL;
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

async function proxyRequest(request: NextRequest, pathSegments: string[]) {
  const apiKey = process.env.API_FOOTBALL_KEY;
  const baseUrl = process.env.API_FOOTBALL_BASE_URL ?? "https://v3.football.api-sports.io";

  if (!apiKey) {
    return NextResponse.json(
      { errors: { config: "API_FOOTBALL_KEY not configured" }, response: [] },
      { status: 500 }
    );
  }

  const path = pathSegments.join("/");
  const search = request.nextUrl.searchParams.toString();
  const cacheKey = getCacheKey(path, search);
  const cached = getFromCache(cacheKey);

  if (cached && !cached.stale) {
    return NextResponse.json(cached.data, {
      headers: { "X-Cache": "HIT" },
    });
  }

  try {
    trackRequest();
    const url = `${baseUrl}/${path}${search ? `?${search}` : ""}`;
    const res = await fetch(url, {
      headers: {
        "x-apisports-key": apiKey,
      },
      next: { revalidate: 14400 },
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
    setCache(cacheKey, data);

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
