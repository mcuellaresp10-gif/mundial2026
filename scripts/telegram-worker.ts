/**
 * Worker Telegram → generador de contenido X (@MundialAnalisis).
 * Uso: npm run telegram:worker
 * Requiere: TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID, API_FOOTBALL_KEY
 * Para publicar en X tras aprobar: TWITTER_API_KEY/SECRET + ACCESS_TOKEN/SECRET
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { getAuthorizedChatId, requireBotToken } from "../src/server/telegram/auth";
import { createTelegramBot, registerBotCommands } from "../src/server/telegram/bot";
import { mainReplyKeyboard } from "../src/server/telegram/keyboards";
import {
  getBogotaDayKey,
  getBogotaHour,
} from "../src/server/x/buildBetPlayForecastDraft";
import { getForecastDraftForDay } from "../src/server/x/forecastDraftStore";
import { sendBetPlayForecastPreviewToTelegram } from "../src/server/x/sendForecastPreview";

const ROOT = process.cwd();
/** Revisa la hora Bogotá cada 5 min para el borrador diario. */
const FORECAST_TICK_MS = 5 * 60 * 1000;
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
    "⚠ TELEGRAM_CHAT_ID not set — el borrador diario no se enviará solo. Envía /start; el chat_id aparece en el log."
  );
}

requireBotToken();

const bot = createTelegramBot();
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

let pollTimer: ReturnType<typeof setTimeout> | null = null;

function scheduleForecastTick(delayMs: number): void {
  if (pollTimer) clearTimeout(pollTimer);
  pollTimer = setTimeout(async () => {
    await maybeSendDailyXForecastDraft();
    scheduleForecastTick(FORECAST_TICK_MS);
  }, delayMs);
}

async function main(): Promise<void> {
  console.info("[telegram] X content worker starting...");
  console.info(`[telegram] Authorized chat_id=${chatId}`);
  console.info(
    `[x-forecast] Daily draft hour (Bogota)=${FORECAST_HOUR_BOGOTA}`
  );

  scheduleForecastTick(chatId ? 5000 : FORECAST_TICK_MS);

  await registerBotCommands(bot);

  if (chatId) {
    await bot.api
      .sendMessage(
        chatId,
        "🐦 *Generador X listo.*\n\n~13:00 Bogotá te mando el borrador BetPlay.\nO toca *Pronósticos X* / /pronosticos ahora.",
        { parse_mode: "Markdown", reply_markup: mainReplyKeyboard() }
      )
      .catch(() => undefined);
  }

  bot.start({
    onStart: () => console.info("[telegram] Long polling active (X content)"),
  });
}

main().catch((e) => {
  console.error("[telegram] Fatal:", e);
  process.exit(1);
});
