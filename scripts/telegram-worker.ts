/**
 * Worker de Telegram: long polling + alertas en vivo.
 * Uso: npm run telegram:worker  (requiere TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID, API_FOOTBALL_KEY)
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { shouldPollFixtures, isFixtureFinished } from "../src/lib/liveRefresh";
import { isFixtureMuted, unmuteFinishedFixtures } from "../src/server/telegram/mutedFixtures";
import { getFixturesForNotifications } from "../src/server/footballClient";
import { getAuthorizedChatId, requireBotToken } from "../src/server/telegram/auth";
import { createTelegramBot, registerBotCommands } from "../src/server/telegram/bot";
import { mainReplyKeyboard } from "../src/server/telegram/keyboards";
import { NotifierState } from "../src/server/telegram/notifier";

const ROOT = process.cwd();
const FAST_POLL_MS = 30 * 1000;
const SLOW_POLL_MS = 5 * 60 * 1000;

function loadEnv(): void {
  for (const file of [".env.local", ".env"]) {
    try {
      const raw = readFileSync(join(ROOT, file), "utf8");
      for (const line of raw.split(/\r?\n/)) {
        const m = line.match(/^([^#=]+)=(.*)$/);
        if (m && !process.env[m[1].trim()]) {
          process.env[m[1].trim()] = m[2].trim().replace(/^["']|["']$/g, "");
        }
      }
    } catch {
      /* missing file */
    }
  }
}

loadEnv();

const chatId = getAuthorizedChatId();
if (!chatId) {
  console.warn(
    "⚠ TELEGRAM_CHAT_ID not set — alertas desactivadas. Envía /start al bot; el chat_id aparecerá en el log."
  );
}

requireBotToken();

const bot = createTelegramBot();
const notifier = new NotifierState();

async function pollNotifications(): Promise<number> {
  if (!chatId) return SLOW_POLL_MS;
  try {
    const fixtures = await getFixturesForNotifications();

    const finishedIds = fixtures
      .filter((f) => isFixtureFinished(f.fixture.status.short))
      .map((f) => f.fixture.id);
    unmuteFinishedFixtures(finishedIds);

    const events = notifier.process(fixtures);

    for (const event of events) {
      if (isFixtureMuted(event.fixtureId)) continue;
      console.info(`[telegram] Notify: fixture ${event.fixtureId}`);
      await bot.api.sendMessage(chatId, event.message, {
        parse_mode: "Markdown",
        reply_markup: event.replyMarkup,
      });
    }

    return shouldPollFixtures(fixtures) ? FAST_POLL_MS : SLOW_POLL_MS;
  } catch (e) {
    console.error("[telegram] Poll error:", e);
    return SLOW_POLL_MS;
  }
}

let pollTimer: ReturnType<typeof setTimeout> | null = null;

function schedulePoll(delayMs: number): void {
  if (pollTimer) clearTimeout(pollTimer);
  pollTimer = setTimeout(async () => {
    const next = await pollNotifications();
    schedulePoll(next);
  }, delayMs);
}

async function main(): Promise<void> {
  console.info("[telegram] Worker starting...");
  console.info(`[telegram] Authorized chat_id=${chatId}`);

  schedulePoll(chatId ? 5000 : SLOW_POLL_MS);

  await registerBotCommands(bot);

  if (chatId) {
    await bot.api
      .sendMessage(
        chatId,
        "🤖 *¡Listo!* Toca los botones de abajo o pregúntame lo que quieras.\n\n_Ejemplo: \"¿cómo va Colombia?\"_",
        { parse_mode: "Markdown", reply_markup: mainReplyKeyboard() }
      )
      .catch(() => undefined);
  }

  bot.start({
    onStart: () => console.info("[telegram] Long polling active"),
  });
}

main().catch((e) => {
  console.error("[telegram] Fatal:", e);
  process.exit(1);
});
