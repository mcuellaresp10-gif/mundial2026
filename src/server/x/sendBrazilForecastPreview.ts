import type { Api } from "grammy";
import {
  buildBrazilForecastDraft,
  getTelegramBrazilForecastPreview,
} from "@/server/x/buildBrazilForecastDraft";
import { saveBrazilForecastDraft } from "@/server/x/brazilForecastDraftStore";
import { xBrazilForecastApprovalKeyboard } from "@/server/telegram/keyboards";

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

export async function sendBrazilForecastPreviewToTelegram(
  api: Api,
  chatId: number,
  options?: { force?: boolean; quiet?: boolean }
): Promise<{ sent: boolean; reason?: string }> {
  const quiet = options?.quiet === true;
  if (!quiet) {
    await api.sendMessage(chatId, "⏳ Generando sims Brasileirão de hoy…");
  }

  const { draft, skippedReason } = await buildBrazilForecastDraft({
    force: options?.force,
  });

  if (!draft) {
    if (!quiet) {
      await api.sendMessage(
        chatId,
        skippedReason === "no_fixtures"
          ? "📋 No hay partidos pendientes de Brasileirão para hoy (hora BR)."
          : "📋 No se pudo generar el borrador Brasileirão."
      );
    }
    return { sent: false, reason: skippedReason ?? "no_draft" };
  }

  if (skippedReason === "already_published") {
    if (!quiet) {
      await api.sendMessage(
        chatId,
        `✅ El hilo Brasileirão de *${draft.dayKey}* ya fue publicado.` +
          (draft.publishedTweetId && draft.publishedTweetId !== "dry-run"
            ? `\nhttps://x.com/i/web/status/${draft.publishedTweetId}`
            : ""),
        { parse_mode: "Markdown" }
      );
    }
    return { sent: false, reason: skippedReason };
  }

  const preview = getTelegramBrazilForecastPreview(draft);
  const parts = splitMessage(preview);
  const messageIds: number[] = [];
  for (let i = 0; i < parts.length; i++) {
    const msg = await api.sendMessage(chatId, parts[i], {
      parse_mode: "Markdown",
      reply_markup:
        i === parts.length - 1
          ? xBrazilForecastApprovalKeyboard(draft.dayKey)
          : undefined,
    });
    messageIds.push(msg.message_id);
  }
  saveBrazilForecastDraft({ ...draft, telegramMessageIds: messageIds });
  return { sent: true };
}
