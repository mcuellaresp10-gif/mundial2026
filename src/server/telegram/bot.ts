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
  bot.command("pronosticos", (ctx) =>
    handleIntent(ctx, { type: "x_forecasts", force: true })
  );
  bot.command("cuadrangulares", (ctx) =>
    handleIntent(ctx, { type: "x_phase_probs", force: true })
  );
  bot.command("conmebol", (ctx) =>
    handleIntent(ctx, { type: "x_conmebol", force: true })
  );
  bot.command("argentina", (ctx) =>
    handleIntent(ctx, { type: "x_argentina", force: true })
  );
  bot.command("playoffsar", (ctx) =>
    handleIntent(ctx, { type: "x_argentina_phase", force: true })
  );

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
