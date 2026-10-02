/**
 * Worker Telegram → generador de contenido X (@MundialAnalisis).
 * Uso: npm run telegram:worker
 * Requiere: TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID, API_FOOTBALL_KEY
 * Para publicar en X tras aprobar: TWITTER_API_KEY/SECRET + ACCESS_TOKEN/SECRET
 *
 * Ticks diarios de partidos del día (tablas/probs siguen manuales):
 * - BetPlay + Conmebol: ~13:00 Bogotá
 * - Argentina: ~10:00 Buenos Aires
 * - Brasileirão: ~10:00 São Paulo
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
import {
  getArgentinaDayKey,
  getArgentinaHour,
} from "../src/server/x/buildArgentinaForecastDraft";
import {
  getBrazilDayKey,
  getBrazilHour,
} from "../src/server/x/buildBrazilForecastDraft";
import { getForecastDraftForDay } from "../src/server/x/forecastDraftStore";
import { getConmebolForecastDraftForDay } from "../src/server/x/conmebolForecastDraftStore";
import { getArgentinaForecastDraftForDay } from "../src/server/x/argentinaForecastDraftStore";
import { getBrazilForecastDraftForDay } from "../src/server/x/brazilForecastDraftStore";
import { sendBetPlayForecastPreviewToTelegram } from "../src/server/x/sendForecastPreview";
import { sendConmebolForecastPreviewToTelegram } from "../src/server/x/sendConmebolForecastPreview";
import { sendArgentinaForecastPreviewToTelegram } from "../src/server/x/sendArgentinaForecastPreview";
import { sendBrazilForecastPreviewToTelegram } from "../src/server/x/sendBrazilForecastPreview";

const ROOT = process.cwd();
/** Revisa cada 5 min si toca enviar algún borrador diario. */
const FORECAST_TICK_MS = 5 * 60 * 1000;
/** Hora Bogotá para BetPlay + Conmebol. */
const FORECAST_HOUR_BOGOTA = Number(process.env.X_FORECASTS_HOUR ?? "13");
/** Hora local AR/BR para borradores de partidos del día. */
const FORECAST_HOUR_AR_BR = Number(process.env.X_FORECASTS_HOUR_AR_BR ?? "10");

type DailyLeague = "betplay" | "conmebol" | "argentina" | "brazil";

type DraftLike = {
  status: string;
  telegramMessageIds?: number[];
} | null;

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

/** Evita reintentar el mismo día (clave = liga:dayKey). */
const lastForecastTick = new Map<string, true>();

function tickKey(league: DailyLeague, dayKey: string): string {
  return `${league}:${dayKey}`;
}

function alreadyHandledToday(draft: DraftLike): boolean {
  if (!draft) return false;
  if (draft.status === "published" || draft.status === "rejected") return true;
  if (draft.status === "pending" && (draft.telegramMessageIds?.length ?? 0) > 0) {
    return true;
  }
  return false;
}

async function runLeagueTick(
  league: DailyLeague,
  dayKey: string,
  send: () => Promise<{ sent: boolean; reason?: string }>
): Promise<void> {
  const key = tickKey(league, dayKey);
  if (lastForecastTick.has(key)) return;

  const draftGetter: Record<DailyLeague, (d: string) => DraftLike> = {
    betplay: getForecastDraftForDay,
    conmebol: getConmebolForecastDraftForDay,
    argentina: getArgentinaForecastDraftForDay,
    brazil: getBrazilForecastDraftForDay,
  };

  if (alreadyHandledToday(draftGetter[league](dayKey))) {
    lastForecastTick.set(key, true);
    return;
  }

  try {
    console.info(`[x-forecast] Daily tick ${league} ${dayKey}`);
    const result = await send();
    console.info(`[x-forecast] ${league} result:`, result);
    // Marcar el día aunque no haya partidos (quiet) para no spamear la API.
    lastForecastTick.set(key, true);
  } catch (e) {
    console.error(`[x-forecast] Daily tick ${league} failed:`, e);
  }
}

async function maybeSendDailyXForecastDrafts(): Promise<void> {
  if (!chatId) return;

  const quiet = { quiet: true as const };
  const bogotaHour = getBogotaHour();
  const argentinaHour = getArgentinaHour();
  const brazilHour = getBrazilHour();

  if (bogotaHour >= FORECAST_HOUR_BOGOTA) {
    const bogotaDay = getBogotaDayKey();
    await runLeagueTick("betplay", bogotaDay, () =>
      sendBetPlayForecastPreviewToTelegram(bot.api, chatId, quiet)
    );
    await runLeagueTick("conmebol", bogotaDay, () =>
      sendConmebolForecastPreviewToTelegram(bot.api, chatId, quiet)
    );
  }

  if (argentinaHour >= FORECAST_HOUR_AR_BR) {
    const argentinaDay = getArgentinaDayKey();
    await runLeagueTick("argentina", argentinaDay, () =>
      sendArgentinaForecastPreviewToTelegram(bot.api, chatId, quiet)
    );
  }

  if (brazilHour >= FORECAST_HOUR_AR_BR) {
    const brazilDay = getBrazilDayKey();
    await runLeagueTick("brazil", brazilDay, () =>
      sendBrazilForecastPreviewToTelegram(bot.api, chatId, quiet)
    );
  }
}

let pollTimer: ReturnType<typeof setTimeout> | null = null;

function scheduleForecastTick(delayMs: number): void {
  if (pollTimer) clearTimeout(pollTimer);
  pollTimer = setTimeout(async () => {
    await maybeSendDailyXForecastDrafts();
    scheduleForecastTick(FORECAST_TICK_MS);
  }, delayMs);
}

async function main(): Promise<void> {
  console.info("[telegram] X content worker starting...");
  console.info(`[telegram] Authorized chat_id=${chatId}`);
  console.info(
    `[x-forecast] Hours · Bogotá ${FORECAST_HOUR_BOGOTA} (BetPlay/Conmebol) · AR/BR ${FORECAST_HOUR_AR_BR}`
  );

  scheduleForecastTick(chatId ? 5000 : FORECAST_TICK_MS);

  await registerBotCommands(bot);

  if (chatId) {
    await bot.api
      .sendMessage(
        chatId,
        "🐦 *Generador X listo.*\n\nBorradores de *partidos del día*:\n• BetPlay / Conmebol ~13:00 Bogotá\n• Argentina / Brasil ~10:00 hora local\n\nTablas/probs siguen con los botones.",
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
