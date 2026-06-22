import { NextRequest, NextResponse } from "next/server";
import { getIndexedCache, setIndexedCache } from "@/services/cache";
import { callAI, generateFallbackAnalysis } from "@/server/aiClient";
import {
  buildAnalysisPrompt,
  parseAnalysisBody,
  type AnalysisType,
} from "@/server/analysis/buildAnalysisRequest";
import { getClientIp } from "@/server/http/clientIp";
import { checkDailyLimit, checkSlidingWindowLimit } from "@/server/rateLimit";

const analysisCache = new Map<string, { data: unknown; timestamp: number }>();
const CACHE_TTL = 24 * 60 * 60 * 1000;
const WINDOW_MS = 10 * 60 * 1000;
const RATE_LIMIT = Number(process.env.ANALYSIS_RATE_LIMIT ?? 10);
const DAILY_IP_LIMIT = Number(process.env.ANALYSIS_DAILY_LIMIT ?? 30);
const DAILY_GLOBAL_LIMIT = Number(process.env.ANALYSIS_DAILY_GLOBAL_LIMIT ?? 500);

const VALID_TYPES = new Set<AnalysisType>(["pre-match", "post-match", "player"]);

interface RouteParams {
  params: Promise<{ type: string }>;
}

function parseAnalysis(text: string): unknown {
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    try {
      return JSON.parse(jsonMatch[0]);
    } catch {
      return { raw: text };
    }
  }
  return { raw: text };
}

function rateLimitResponse(retryAfterSec?: number) {
  return NextResponse.json(
    { error: "Demasiadas solicitudes de análisis. Intenta más tarde." },
    {
      status: 429,
      headers: retryAfterSec ? { "Retry-After": String(retryAfterSec) } : {},
    }
  );
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  const { type: rawType } = await params;
  if (!VALID_TYPES.has(rawType as AnalysisType)) {
    return NextResponse.json({ error: "Tipo de análisis no válido" }, { status: 400 });
  }
  const type = rawType as AnalysisType;

  const ip = getClientIp(request);
  const windowRate = checkSlidingWindowLimit(`analysis:${ip}`, RATE_LIMIT, WINDOW_MS);
  if (!windowRate.ok) return rateLimitResponse(windowRate.retryAfterSec);

  const dailyIp = checkDailyLimit(`analysis:ip:${ip}`, DAILY_IP_LIMIT);
  if (!dailyIp.ok) return rateLimitResponse();

  const dailyGlobal = checkDailyLimit("analysis:global", DAILY_GLOBAL_LIMIT);
  if (!dailyGlobal.ok) return rateLimitResponse();

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  const parsed = parseAnalysisBody(type, body);
  if (!parsed) {
    return NextResponse.json({ error: "Parámetros inválidos" }, { status: 400 });
  }

  const built = await buildAnalysisPrompt(type, parsed);
  if ("error" in built) {
    return NextResponse.json({ error: built.error }, { status: built.status });
  }

  const { prompt, cacheId } = built;
  const cacheKey = `analysis_${type}_${cacheId}`;
  const memCached = analysisCache.get(cacheKey);
  if (memCached && Date.now() - memCached.timestamp < CACHE_TTL) {
    return NextResponse.json({ analysis: memCached.data, cached: true });
  }

  const indexedCached = await getIndexedCache<unknown>(cacheKey);
  if (indexedCached) {
    analysisCache.set(cacheKey, { data: indexedCached, timestamp: Date.now() });
    return NextResponse.json({ analysis: indexedCached, cached: true });
  }

  try {
    const raw = await callAI(prompt);
    const analysis = parseAnalysis(raw);
    analysisCache.set(cacheKey, { data: analysis, timestamp: Date.now() });
    await setIndexedCache(cacheKey, analysis, CACHE_TTL * 7);
    return NextResponse.json({ analysis, cached: false });
  } catch {
    const fallback = parseAnalysis(generateFallbackAnalysis(prompt));
    return NextResponse.json({ analysis: fallback, fallback: true });
  }
}
