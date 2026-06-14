import { Bot } from "grammy";
import { requireBotToken, authMiddleware } from "./auth";
import { resolveIntent, callbackToIntent } from "./intents";
import { handleIntent, answerCallback } from "./handlers";
import { mainReplyKeyboard, BOT_COMMANDS } from "./keyboards";
import { WELCOME_MESSAGE } from "./formatters";

export function createTelegramBot(): Bot {
  const bot = new Bot(requireBotToken());

  bot.use(authMiddleware);

  bot.command("start", async (ctx) => {
    console.info(`[telegram] /start from chat_id=${ctx.chat?.id}`);
    await handleIntent(ctx, { type: "greet" });
  });

  bot.command("help", (ctx) => handleIntent(ctx, { type: "help" }));
  bot.command("ayuda", (ctx) => handleIntent(ctx, { type: "help" }));
  bot.command("hoy", (ctx) => handleIntent(ctx, { type: "today" }));
  bot.command("vivo", (ctx) => handleIntent(ctx, { type: "live" }));
  bot.command("proximo", (ctx) => handleIntent(ctx, { type: "next" }));
  bot.command("tabla", (ctx) => handleIntent(ctx, { type: "standings" }));
  bot.command("colombia", (ctx) => handleIntent(ctx, { type: "colombia" }));
  bot.command("lineups", (ctx) => handleIntent(ctx, { type: "lineups" }));
  bot.command("alineaciones", (ctx) => handleIntent(ctx, { type: "lineups" }));
  bot.command("resumen", (ctx) => handleIntent(ctx, { type: "digest" }));
  bot.command("silenciar", async (ctx) => {
    const idStr = (ctx.message?.text ?? "").split(/\s+/)[1];
    const id = Number(idStr);
    if (Number.isFinite(id) && id > 0) {
      await handleIntent(ctx, { type: "mute", id });
      return;
    }
    await handleIntent(ctx, { type: "mute_menu" });
  });
  bot.command("silenciados", (ctx) => handleIntent(ctx, { type: "muted_list" }));

  bot.command("partido", async (ctx) => {
    const idStr = (ctx.message?.text ?? "").split(/\s+/)[1];
    const id = Number(idStr);
    if (!Number.isFinite(id) || id <= 0) {
      await ctx.reply("Dime el ID así: /partido 1489370\n\nO toca un partido en los botones 🔴 En vivo / 📅 Hoy", {
        reply_markup: mainReplyKeyboard(),
      });
      return;
    }
    await handleIntent(ctx, { type: "fixture", id });
  });

  bot.on("callback_query:data", async (ctx) => {
    const data = ctx.callbackQuery.data;
    const intent = callbackToIntent(data);
    if (!intent) {
      await ctx.answerCallbackQuery({ text: "Acción no reconocida" });
      return;
    }
    await answerCallback(ctx, intent);
  });

  bot.on("message:text", async (ctx) => {
    const text = ctx.message.text.trim();
    if (text.startsWith("/")) return;
    const intent = resolveIntent(text);
    await handleIntent(ctx, intent);
  });

  bot.catch((err) => {
    console.error("[telegram] Bot error:", err);
  });

  return bot;
}

/** Registra comandos nativos en el menú ⋮ de Telegram. */
export async function registerBotCommands(bot: Bot): Promise<void> {
  await bot.api.setMyCommands([...BOT_COMMANDS]);
}

export async function sendWelcomeOnConnect(bot: Bot, chatId: number): Promise<void> {
  await bot.api.sendMessage(chatId, WELCOME_MESSAGE(), {
    parse_mode: "Markdown",
    reply_markup: mainReplyKeyboard(),
  });
}
