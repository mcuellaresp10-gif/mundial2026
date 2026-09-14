import type { Api } from "grammy";
import {
  buildBetPlayForecastDraft,
  getTelegramPreviewText,
} from "@/server/x/buildBetPlayForecastDraft";
import { saveForecastDraft } from "@/server/x/forecastDraftStore";
import { xForecastApprovalKeyboard } from "@/server/telegram/keyboards";

const TELEGRAM_MAX = 3900;

function splitMessage(text: string): string[] {
  if (text.length <= TELEGRAM_MAX) return [text];
  const parts: string[] = [];
  let rest = text;
  while (rest.length > 0) {
    if (rest.length <= TELEGRAM_MAX) {
      parts.push(rest);
      break;
    }
    let cut = rest.lastIndexOf("\n\n", TELEGRAM_MAX);
    if (cut < TELEGRAM_MAX * 0.5) cut = TELEGRAM_MAX;
    parts.push(rest.slice(0, cut));
    rest = rest.slice(cut).trimStart();
  }
  return parts;
}

export async function sendBetPlayForecastPreviewToTelegram(
  api: Api,
  chatId: number,
  options?: { force?: boolean }
): Promise<{ sent: boolean; reason?: string }> {
  const { draft, skippedReason } = await buildBetPlayForecastDraft({
    force: options?.force,
  });

  if (!draft) {
    await api.sendMessage(
      chatId,
      skippedReason === "no_fixtures"
        ? "📋 No hay partidos pendientes de Liga BetPlay para hoy. No hay borrador X."
        : "📋 No se pudo generar el borrador de pronósticos."
    );
    return { sent: false, reason: skippedReason ?? "no_draft" };
  }

  if (skippedReason === "already_published") {
    await api.sendMessage(
      chatId,
      `✅ El hilo de *${draft.dayKey}* ya fue publicado en X.` +
        (draft.publishedTweetId && draft.publishedTweetId !== "dry-run"
          ? `\nhttps://x.com/i/web/status/${draft.publishedTweetId}`
          : ""),
      { parse_mode: "Markdown" }
    );
    return { sent: false, reason: skippedReason };
  }

  if (skippedReason === "pending_exists" && !options?.force) {
    // Reenviar el pending existente con botones
  }

  const preview = getTelegramPreviewText(draft);
  const parts = splitMessage(preview);
  const messageIds: number[] = [];

  for (let i = 0; i < parts.length; i++) {
    const isLast = i === parts.length - 1;
    const msg = await api.sendMessage(chatId, parts[i], {
      parse_mode: "Markdown",
      reply_markup: isLast ? xForecastApprovalKeyboard(draft.dayKey) : undefined,
    });
    messageIds.push(msg.message_id);
  }

  saveForecastDraft({ ...draft, telegramMessageIds: messageIds });
  return { sent: true };
}
