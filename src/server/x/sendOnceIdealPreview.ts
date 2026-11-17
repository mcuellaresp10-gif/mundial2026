import type { Api } from "grammy";
import { InputFile } from "grammy";
import {
  buildBetPlayOnceIdealDraft,
  getTelegramOnceIdealPreviewText,
} from "@/server/x/buildBetPlayOnceIdealDraft";
import { saveOnceIdealDraft } from "@/server/x/onceIdealDraftStore";
import { renderOnceIdealPng } from "@/server/x/renderOnceIdealPng";
import { xOnceIdealApprovalKeyboard } from "@/server/telegram/keyboards";

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

export async function sendBetPlayOnceIdealPreviewToTelegram(
  api: Api,
  chatId: number,
  options?: { force?: boolean }
): Promise<{ sent: boolean; reason?: string }> {
  await api.sendMessage(
    chatId,
    "⏳ Armando Once Ideal BetPlay (todos contra todos)… puede tardar unos segundos."
  );

  const { draft, skippedReason } = await buildBetPlayOnceIdealDraft({
    force: options?.force,
  });

  if (!draft) {
    const msg =
      skippedReason === "empty_pool" || skippedReason === "pool_failed"
        ? "📋 No se pudo cargar el pool de jugadores de Liga BetPlay."
        : skippedReason === "insufficient_candidates" ||
            skippedReason === "incomplete_xi"
          ? "📋 No hay suficientes jugadores con minutos/rating para armar el XI."
          : "📋 No se pudo generar el borrador de Once Ideal.";
    await api.sendMessage(chatId, msg);
    return { sent: false, reason: skippedReason ?? "no_draft" };
  }

  if (skippedReason === "already_published") {
    await api.sendMessage(
      chatId,
      `✅ El Once Ideal de *${draft.dayKey}* ya fue publicado.` +
        (draft.publishedTweetId && draft.publishedTweetId !== "dry-run"
          ? `\nhttps://x.com/i/web/status/${draft.publishedTweetId}`
          : ""),
      { parse_mode: "Markdown" }
    );
    return { sent: false, reason: skippedReason };
  }

  try {
    const png = await renderOnceIdealPng({
      players: draft.players,
      formation: draft.formation,
      phaseLabel: draft.phaseLabel,
      averageRating: draft.averageRating,
    });
    await api.sendPhoto(chatId, new InputFile(png, "once-ideal-betplay.png"), {
      caption: `Once Ideal · ${draft.formation} · media ${draft.averageRating.toFixed(1)}`,
    });
  } catch (e) {
    console.error("[x-once-ideal] preview PNG failed:", e);
    await api.sendMessage(
      chatId,
      "⚠️ No se pudo generar la imagen del XI; el texto del borrador sigue abajo."
    );
  }

  const text = getTelegramOnceIdealPreviewText(draft);
  const parts = splitMessage(text);
  const ids: number[] = [];
  for (let i = 0; i < parts.length; i++) {
    const msg = await api.sendMessage(chatId, parts[i], {
      parse_mode: "Markdown",
      reply_markup:
        i === parts.length - 1
          ? xOnceIdealApprovalKeyboard(draft.dayKey)
          : undefined,
    });
    ids.push(msg.message_id);
  }

  saveOnceIdealDraft({ ...draft, telegramMessageIds: ids, status: "pending" });
  return { sent: true };
}
