export type ChatMessage = { role: "system" | "user" | "assistant"; content: string };

export async function callAIChat(
  messages: ChatMessage[],
  options?: { maxTokens?: number }
): Promise<string> {
  const maxTokens = options?.maxTokens ?? Number(process.env.AGENT_MAX_TOKENS ?? 900);

  if (process.env.OPENROUTER_API_KEY) {
    const model = process.env.OPENROUTER_MODEL ?? "anthropic/claude-3-haiku";
    const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "HTTP-Referer": process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
        "X-Title": "Mundial Américas",
      },
      body: JSON.stringify({
        model,
        messages,
        temperature: 0.7,
        max_tokens: maxTokens,
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
  const chatMessages = messages.filter((m) => m.role !== "system");
  const system = messages.find((m) => m.role === "system")?.content ?? "";

  if (provider === "openai" && process.env.OPENAI_API_KEY) {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: system
          ? [{ role: "system", content: system }, ...chatMessages]
          : chatMessages,
        temperature: 0.7,
        max_tokens: maxTokens,
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
        max_tokens: maxTokens,
        system: system || undefined,
        messages: chatMessages.map((m) => ({
          role: m.role === "assistant" ? "assistant" : "user",
          content: m.content,
        })),
      }),
    });
    const data = await res.json();
    return data.content?.[0]?.text ?? "";
  }

  const lastUser = [...messages].reverse().find((m) => m.role === "user")?.content ?? "";
  return generateFallbackAnalysis(lastUser);
}

export async function callAI(prompt: string, options?: { maxTokens?: number }): Promise<string> {
  return callAIChat([{ role: "user", content: prompt }], options);
}

export function generateFallbackAnalysis(prompt: string): string {
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
  if (prompt.includes("asistente del Mundial") || prompt.includes("experto en datos del fútbol")) {
    return "No tengo acceso a IA en este momento. Consulta las secciones Grupos, Calendario e Histórico para datos actualizados.";
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

/** Respuesta conversacional para el bot de Telegram. */
export async function answerTelegramQuestion(
  question: string,
  context: string
): Promise<string> {
  const prompt = `Eres el asistente del Mundial FIFA 2026. Responde en español, de forma clara y breve (máximo 400 palabras).
Usa SOLO los datos del contexto (marcadores, tablas, alineaciones, clubes de jugadores).
Si el contexto incluye ALINEACIONES o JUGADOR, prioriza esos datos en tu respuesta.
Si no hay información suficiente, dilo honestamente. No inventes nombres, clubes ni titulares.

CONTEXTO:
${context}

PREGUNTA:
${question}`;

  const raw = await callAI(prompt, { maxTokens: 800 });
  return raw.trim() || "No pude generar una respuesta. Prueba /hoy, /vivo o /tabla.";
}
