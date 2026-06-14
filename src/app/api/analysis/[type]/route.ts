import { NextRequest, NextResponse } from "next/server";
import { getIndexedCache, setIndexedCache } from "@/services/cache";
import { callAI, generateFallbackAnalysis } from "@/server/aiClient";

const analysisCache = new Map<string, { data: unknown; timestamp: number }>();
const CACHE_TTL = 24 * 60 * 60 * 1000;

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

export async function POST(request: NextRequest, { params }: RouteParams) {
  const { type } = await params;
  const body = await request.json();
  const { prompt, cacheId } = body as { prompt: string; cacheId?: string };

  if (!prompt) {
    return NextResponse.json({ error: "Prompt required" }, { status: 400 });
  }

  const cacheKey = `analysis_${type}_${cacheId ?? hashPrompt(prompt)}`;
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
  } catch (error) {
    const fallback = parseAnalysis(generateFallbackAnalysis(prompt));
    return NextResponse.json({ analysis: fallback, fallback: true, error: String(error) });
  }
}

function hashPrompt(prompt: string): string {
  let hash = 0;
  for (let i = 0; i < prompt.length; i++) {
    hash = (hash << 5) - hash + prompt.charCodeAt(i);
    hash |= 0;
  }
  return String(hash);
}
