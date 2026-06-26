import { APP_VERSION } from "@/lib/appVersion";
import {
  FEEDBACK_CATEGORY_LABELS,
  type FeedbackCategory,
} from "@/lib/feedback";
import { getAuthorizedChatId, requireBotToken } from "@/server/telegram/auth";

export interface FeedbackPayload {
  category: FeedbackCategory;
  description?: string;
  email?: string;
  includeContext: boolean;
  pageUrl?: string;
  userAgent?: string;
  ip: string;
  timestamp: string;
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function buildFeedbackMessage(payload: FeedbackPayload): string {
  const lines = [
    "📝 <b>Nuevo reporte</b>",
    `<b>Categoría:</b> ${escapeHtml(FEEDBACK_CATEGORY_LABELS[payload.category])}`,
  ];

  if (payload.description?.trim()) {
    lines.push(`<b>Descripción:</b> ${escapeHtml(payload.description.trim())}`);
  }

  if (payload.email?.trim()) {
    lines.push(`<b>Email:</b> ${escapeHtml(payload.email.trim())}`);
  }

  lines.push("", "—");

  if (payload.includeContext) {
    if (payload.pageUrl?.trim()) {
      lines.push(`<b>URL:</b> ${escapeHtml(payload.pageUrl.trim())}`);
    }
    if (payload.userAgent?.trim()) {
      lines.push(`<b>Navegador:</b> ${escapeHtml(payload.userAgent.trim())}`);
    }
  }

  lines.push(`<b>IP:</b> ${escapeHtml(payload.ip)}`);
  lines.push(`<b>Hora:</b> ${escapeHtml(payload.timestamp)}`);
  lines.push(`<b>App:</b> ${APP_VERSION}`);

  return lines.join("\n");
}

export async function notifyFeedback(payload: FeedbackPayload): Promise<void> {
  const chatId = getAuthorizedChatId();
  if (!chatId) {
    throw new Error("TELEGRAM_CHAT_ID not configured");
  }

  const token = requireBotToken();
  const text = buildFeedbackMessage(payload);

  const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: chatId,
      text,
      parse_mode: "HTML",
      disable_web_page_preview: true,
    }),
  });

  if (!response.ok) {
    const body = await response.text().catch(() => "");
    throw new Error(`Telegram sendMessage failed (${response.status}): ${body}`);
  }
}
