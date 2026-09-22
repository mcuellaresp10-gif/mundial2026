import type { Api } from "grammy";
import {
  buildConmebolForecastDraft,
  getTelegramConmebolPreviewText,
} from "@/server/x/buildConmebolForecastDraft";
import { saveConmebolForecastDraft } from "@/server/x/conmebolForecastDraftStore";
import { xConmebolForecastApprovalKeyboard } from "@/server/telegram/keyboards";

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

export async function sendConmebolForecastPreviewToTelegram(
  api: Api,
  chatId: number,
  options?: { force?: boolean; quiet?: boolean }
): Promise<{ sent: boolean; reason?: string }> {
  const quiet = options?.quiet === true;
  if (!quiet) {
    await api.sendMessage(
      chatId,
      "⏳ Generando sims Libertadores + Sudamericana de hoy…"
    );
  }

  const { draft, skippedReason } = await buildConmebolForecastDraft({
    force: options?.force,
  });

  if (!draft) {
    if (!quiet) {
      await api.sendMessage(
        chatId,
        skippedReason === "no_fixtures"
          ? "📋 No hay partidos pendientes de Libertadores ni Sudamericana para hoy."
          : "📋 No se pudo generar el borrador Conmebol."
      );
    }
    return { sent: false, reason: skippedReason ?? "no_draft" };
  }

  if (skippedReason === "already_published") {
    if (!quiet) {
      await api.sendMessage(
        chatId,
        `✅ El hilo Conmebol de *${draft.dayKey}* ya fue publicado.` +
          (draft.publishedTweetId && draft.publishedTweetId !== "dry-run"
            ? `\nhttps://x.com/i/web/status/${draft.publishedTweetId}`
            : ""),
        { parse_mode: "Markdown" }
      );
    }
    return { sent: false, reason: skippedReason };
  }

  const preview = getTelegramConmebolPreviewText(draft);
  const parts = splitMessage(preview);
  const messageIds: number[] = [];

  for (let i = 0; i < parts.length; i++) {
    const isLast = i === parts.length - 1;
    const msg = await api.sendMessage(chatId, parts[i], {
      parse_mode: "Markdown",
      reply_markup: isLast
        ? xConmebolForecastApprovalKeyboard(draft.dayKey)
        : undefined,
    });
    messageIds.push(msg.message_id);
  }

  saveConmebolForecastDraft({ ...draft, telegramMessageIds: messageIds });
  return { sent: true };
}
