import { NextRequest, NextResponse } from "next/server";
import { getIndexedCache, setIndexedCache } from "@/services/cache";

const analysisCache = new Map<string, { data: unknown; timestamp: number }>();
const CACHE_TTL = 24 * 60 * 60 * 1000;

interface RouteParams {
  params: Promise<{ type: string }>;
}

async function callAI(prompt: string): Promise<string> {
  if (process.env.OPENROUTER_API_KEY) {
    const model = process.env.OPENROUTER_MODEL ?? "anthropic/claude-3-haiku";
    const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "HTTP-Referer": process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
        "X-Title": "Mundial 2026",
      },
      body: JSON.stringify({
        model,
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7,
        max_tokens: 1500,
      }),
    });
    if (!res.ok) {
      const err = await res.text();
      throw new Error(`OpenRouter error: ${res.status} ${err}`);
    }
    const data = await res.json();
    return data.choices?.[0]?.message?.content ?? "";
  }

  const provider = process.env.AI_PROVIDER ?? "anthropic";

  if (provider === "openai" && process.env.OPENAI_API_KEY) {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7,
        max_tokens: 1500,
      }),
    });
    const data = await res.json();
    return data.choices?.[0]?.message?.content ?? "";
  }

  if (process.env.ANTHROPIC_API_KEY) {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-3-5-haiku-20241022",
        max_tokens: 1500,
        messages: [{ role: "user", content: prompt }],
      }),
    });
    const data = await res.json();
    return data.content?.[0]?.text ?? "";
  }

  return generateFallbackAnalysis(prompt);
}

function generateFallbackAnalysis(prompt: string): string {
  if (prompt.includes("POST-partido")) {
    return JSON.stringify({
      lecturaTactica: "Partido equilibrado donde las transiciones rápidas marcaron la diferencia.",
      momentosClave: [
        { minuto: 23, descripcion: "Gol tras contraataque bien ejecutado." },
        { minuto: 67, descripcion: "Cambio táctico que cambió el ritmo del partido." },
        { minuto: 89, descripcion: "Gol decisivo en jugada a balón parado." },
      ],
      jugadorDestacado: {
        nombre: "Jugador destacado",
        stats: "1 gol, 2 tiros a puerta, rating 8.2",
        razon: "Fue el motor ofensivo de su equipo.",
      },
      comparacionPrevia: "El resultado confirma las tendencias del análisis previo.",
      impactoGrupo: "Resultado clave para la clasificación en el grupo.",
      proyeccion: "El equipo llega con momentum al siguiente partido.",
    });
  }
  if (prompt.includes("jugador")) {
    return JSON.stringify({
      convocatoria: "Convocado por su regularidad y versatilidad táctica.",
      rolEsperado: "Pieza clave en transiciones y presión alta.",
      fortalezas: ["Velocidad", "Regate", "Visión de juego"],
      debilidades: ["Juego aéreo", "Consistencia defensiva"],
      posibleXI: "Titular en el flanco ofensivo en formación 4-3-3.",
      comparativaCompetidores: "Entre los top 5 de su posición en el torneo.",
      riesgoOportunidad: "Oportunidad de brillar si mantiene forma.",
      historialMundiales: null,
    });
  }
  return JSON.stringify({
    contexto: "Partido crucial en la fase de grupos con implicaciones directas en la clasificación.",
    rival: "Selección con buen balance entre experiencia y juventud.",
    clavesTacticas: [
      "Control del mediocampo en los primeros 20 minutos.",
      "Explotar los espacios por las bandas.",
      "Solidez defensiva en jugadas a balón parado.",
    ],
    alineacionProbable: "4-3-3 con énfasis en presión alta.",
    pronostico: "Partido parejo con ligera ventaja para el local.",
    colombiaFocus: null,
  });
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
