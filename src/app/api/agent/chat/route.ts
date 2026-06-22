import { NextRequest, NextResponse } from "next/server";
import { getStandings, getWorldCupFixtures } from "@/server/footballClient";
import { runAgentTurn, type AgentChatMessage } from "@/server/agent/worldCupAgent";
import { checkRateLimit } from "@/server/agent/rateLimit";
import { getClientIp } from "@/server/http/clientIp";

const MAX_MESSAGES = 20;
const MAX_CONTENT_LENGTH = 2000;

function validateMessages(messages: unknown): AgentChatMessage[] | null {
  if (!Array.isArray(messages)) return [];
  const valid: AgentChatMessage[] = [];
  for (const m of messages.slice(-MAX_MESSAGES)) {
    if (
      m &&
      typeof m === "object" &&
      (m.role === "user" || m.role === "assistant") &&
      typeof m.content === "string" &&
      m.content.length <= MAX_CONTENT_LENGTH
    ) {
      valid.push({ role: m.role, content: m.content.trim() });
    }
  }
  return valid;
}

export async function POST(request: NextRequest) {
  const ip = getClientIp(request);
  const rate = checkRateLimit(ip);
  if (!rate.ok) {
    return NextResponse.json(
      { error: "Demasiadas solicitudes. Intenta de nuevo más tarde." },
      { status: 429, headers: rate.retryAfterSec ? { "Retry-After": String(rate.retryAfterSec) } : {} }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  const { messages, question } = body as { messages?: unknown; question?: string };
  const history = validateMessages(messages);
  if (history === null) {
    return NextResponse.json({ error: "messages inválido" }, { status: 400 });
  }

  const lastUser = [...history].reverse().find((m) => m.role === "user");
  const q = (typeof question === "string" ? question : lastUser?.content)?.trim();
  if (!q || q.length > MAX_CONTENT_LENGTH) {
    return NextResponse.json({ error: "Pregunta requerida (máx. 2000 caracteres)" }, { status: 400 });
  }

  try {
    const [fixtures, standings] = await Promise.all([
      getWorldCupFixtures(),
      getStandings(),
    ]);

    const priorHistory = history.filter((m) => m.content !== q || m.role !== "user");
    const result = await runAgentTurn({
      question: q,
      messages: priorHistory,
      fixtures,
      standings,
    });

    return NextResponse.json({
      answer: result.answer,
      sources: result.sources,
      direct: result.direct,
    });
  } catch (error) {
    console.error("[agent/chat]", error);
    return NextResponse.json(
      { error: "Error al procesar la pregunta. Verifica la configuración de IA." },
      { status: 500 }
    );
  }
}
