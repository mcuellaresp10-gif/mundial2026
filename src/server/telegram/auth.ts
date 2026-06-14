import type { Context, NextFunction } from "grammy";

const UNAUTHORIZED_MSG = "⛔ No autorizado. Este bot es privado.";

export function getAuthorizedChatId(): number | null {
  const raw = process.env.TELEGRAM_CHAT_ID?.trim();
  if (!raw) return null;
  const id = Number(raw);
  return Number.isFinite(id) ? id : null;
}

export function isAuthorizedChat(chatId: number | undefined): boolean {
  const allowed = getAuthorizedChatId();
  if (!allowed) return true;
  return chatId === allowed;
}

export async function authMiddleware(ctx: Context, next: NextFunction): Promise<void> {
  const chatId = ctx.chat?.id;
  if (!isAuthorizedChat(chatId)) {
    if (chatId != null) {
      console.warn(`[telegram] Unauthorized chat_id: ${chatId}`);
    }
    await ctx.reply(UNAUTHORIZED_MSG);
    return;
  }
  await next();
}

export function requireBotToken(): string {
  const token = process.env.TELEGRAM_BOT_TOKEN?.trim();
  if (!token) {
    throw new Error("TELEGRAM_BOT_TOKEN not configured");
  }
  return token;
}
