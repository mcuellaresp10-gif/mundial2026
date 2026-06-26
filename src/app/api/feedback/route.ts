import { NextRequest, NextResponse } from "next/server";
import { FEEDBACK_MAX_DESCRIPTION, isFeedbackCategory } from "@/lib/feedback";
import { getClientIp } from "@/server/http/clientIp";
import { checkSlidingWindowLimit } from "@/server/rateLimit";
import { notifyFeedback } from "@/server/telegram/notifyFeedback";

const WINDOW_MS = 60 * 60 * 1000;
const RATE_LIMIT = Number(process.env.FEEDBACK_RATE_LIMIT ?? 3);
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface FeedbackRequestBody {
  category?: unknown;
  description?: unknown;
  email?: unknown;
  includeContext?: unknown;
  pageUrl?: unknown;
  userAgent?: unknown;
  honeypot?: unknown;
}

export async function POST(request: NextRequest) {
  let body: FeedbackRequestBody;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  if (typeof body.honeypot === "string" && body.honeypot.trim()) {
    return NextResponse.json({ ok: true });
  }

  if (!isFeedbackCategory(body.category)) {
    return NextResponse.json({ error: "Categoría no válida" }, { status: 400 });
  }

  const description =
    typeof body.description === "string" ? body.description.trim() : undefined;
  if (description && description.length > FEEDBACK_MAX_DESCRIPTION) {
    return NextResponse.json(
      { error: `La descripción no puede superar ${FEEDBACK_MAX_DESCRIPTION} caracteres` },
      { status: 400 }
    );
  }

  const email = typeof body.email === "string" ? body.email.trim() : undefined;
  if (email && !EMAIL_RE.test(email)) {
    return NextResponse.json({ error: "Email no válido" }, { status: 400 });
  }

  const includeContext = body.includeContext !== false;
  const pageUrl =
    includeContext && typeof body.pageUrl === "string" ? body.pageUrl.trim() : undefined;
  const userAgent =
    includeContext && typeof body.userAgent === "string" ? body.userAgent.trim() : undefined;

  const ip = getClientIp(request);
  const rate = checkSlidingWindowLimit(`feedback:${ip}`, RATE_LIMIT, WINDOW_MS);
  if (!rate.ok) {
    return NextResponse.json(
      { error: "Demasiados reportes enviados. Intenta más tarde." },
      {
        status: 429,
        headers: rate.retryAfterSec ? { "Retry-After": String(rate.retryAfterSec) } : {},
      }
    );
  }

  try {
    await notifyFeedback({
      category: body.category,
      description,
      email,
      includeContext,
      pageUrl,
      userAgent,
      ip,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("[feedback] Telegram notify failed:", error);
    return NextResponse.json(
      { error: "El canal de reportes no está disponible en este momento." },
      { status: 503 }
    );
  }

  return NextResponse.json({ ok: true });
}
