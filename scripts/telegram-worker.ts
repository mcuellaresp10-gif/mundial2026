/**
 * Worker de Telegram: long polling + alertas en vivo + borrador diario X (BetPlay).
 * Uso: npm run telegram:worker
 * Requiere: TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID, API_FOOTBALL_KEY
 * Para publicar en X tras aprobar: TWITTER_API_KEY/SECRET + ACCESS_TOKEN/SECRET
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
import {
  getBogotaDayKey,
  getBogotaHour,
} from "../src/server/x/buildBetPlayForecastDraft";
import { getForecastDraftForDay } from "../src/server/x/forecastDraftStore";
import { sendBetPlayForecastPreviewToTelegram } from "../src/server/x/sendForecastPreview";

const ROOT = process.cwd();
const FAST_POLL_MS = 30 * 1000;
const SLOW_POLL_MS = 5 * 60 * 1000;
/** Hora local Bogotá para enviar el borrador a Telegram. */
const FORECAST_HOUR_BOGOTA = Number(process.env.X_FORECASTS_HOUR ?? "13");

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
/** Evita reenviar el borrador el mismo día en este proceso. */
let lastForecastTickDay: string | null = null;

async function maybeSendDailyXForecastDraft(): Promise<void> {
  if (!chatId) return;
  const hour = getBogotaHour();
  const dayKey = getBogotaDayKey();
  if (hour < FORECAST_HOUR_BOGOTA) return;
  if (lastForecastTickDay === dayKey) return;

  const existing = getForecastDraftForDay(dayKey);
  if (existing?.status === "published" || existing?.status === "rejected") {
    lastForecastTickDay = dayKey;
    return;
  }
  if (existing?.status === "pending" && (existing.telegramMessageIds?.length ?? 0) > 0) {
    lastForecastTickDay = dayKey;
    return;
  }

  try {
    console.info(`[x-forecast] Daily tick ${dayKey} hour=${hour}`);
    const result = await sendBetPlayForecastPreviewToTelegram(bot.api, chatId);
    console.info(`[x-forecast] Preview result:`, result);
    lastForecastTickDay = dayKey;
  } catch (e) {
    console.error("[x-forecast] Daily tick failed:", e);
  }
}

async function pollNotifications(): Promise<number> {
  await maybeSendDailyXForecastDraft();

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
  console.info(
    `[x-forecast] Daily draft hour (Bogota)=${FORECAST_HOUR_BOGOTA}`
  );

  schedulePoll(chatId ? 5000 : SLOW_POLL_MS);

  await registerBotCommands(bot);

  if (chatId) {
    await bot.api
      .sendMessage(
        chatId,
        "🤖 *¡Listo!* Toca los botones de abajo o pregúntame lo que quieras.\n\n_Pronósticos X BetPlay: /pronosticos_",
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
