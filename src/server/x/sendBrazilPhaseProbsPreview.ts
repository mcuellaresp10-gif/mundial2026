import type { Api } from "grammy";
import {
  buildBrazilPhaseProbsDraft,
  getTelegramBrazilPhasePreviewText,
} from "@/server/x/buildBrazilPhaseProbsDraft";
import { saveBrazilPhaseDraft } from "@/server/x/brazilPhaseDraftStore";
import { xBrazilPhaseApprovalKeyboard } from "@/server/telegram/keyboards";

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

export async function sendBrazilPhaseProbsPreviewToTelegram(
  api: Api,
  chatId: number,
  options?: { force?: boolean }
): Promise<{ sent: boolean; reason?: string }> {
  await api.sendMessage(
    chatId,
    "⏳ Calculando probs Brasileirão (tabla anual, 1000 sims)…"
  );

  const { draft, skippedReason } = await buildBrazilPhaseProbsDraft({
    force: options?.force,
  });

  if (!draft) {
    await api.sendMessage(
      chatId,
      skippedReason === "no_standings"
        ? "📋 No hay tabla suficiente del Brasileirão para simular."
        : "📋 No se pudo generar el borrador de clasificación BR."
    );
    return { sent: false, reason: skippedReason ?? "no_draft" };
  }

  if (skippedReason === "already_published") {
    await api.sendMessage(
      chatId,
      `✅ El post de clasificación BR de *${draft.dayKey}* ya fue publicado.` +
        (draft.publishedTweetId && draft.publishedTweetId !== "dry-run"
          ? `\nhttps://x.com/i/web/status/${draft.publishedTweetId}`
          : ""),
      { parse_mode: "Markdown" }
    );
    return { sent: false, reason: skippedReason };
  }

  const text = getTelegramBrazilPhasePreviewText(draft);
  const parts = splitMessage(text);
  const ids: number[] = [];
  for (let i = 0; i < parts.length; i++) {
    const msg = await api.sendMessage(chatId, parts[i], {
      parse_mode: "Markdown",
      reply_markup:
        i === parts.length - 1
          ? xBrazilPhaseApprovalKeyboard(draft.dayKey)
          : undefined,
    });
    ids.push(msg.message_id);
  }
  saveBrazilPhaseDraft({ ...draft, telegramMessageIds: ids, status: "pending" });
  return { sent: true };
}
