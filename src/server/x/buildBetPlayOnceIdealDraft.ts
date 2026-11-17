import { DEFAULT_SEASON } from "@/lib/utils";
import { getLeaguePlayerPoolForOnceIdeal } from "@/server/footballClient";
import { getBogotaDayKey } from "@/server/x/buildBetPlayForecastDraft";
import { BETPLAY_LEAGUE_ID } from "@/server/x/buildBetPlayPhaseProbsDraft";
import { buildOnceIdealThread, formatTelegramOnceIdealPreview } from "@/server/x/formatOnceIdealTweets";
import {
  getOnceIdealDraftForDay,
  saveOnceIdealDraft,
  type OnceIdealDraft,
} from "@/server/x/onceIdealDraftStore";
import { buildOnceIdealFromCandidates } from "@/utils/calculations";
import {
  buildCandidatesFromPlayers,
  ONCE_IDEAL_MIN_MINUTES_TOURNAMENT,
} from "@/utils/onceIdealRatings";
import type { FormationType } from "@/types";

/** Minutos mínimos para el XI de fase (todos contra todos). Override: BETPLAY_ONCE_IDEAL_MIN_MINUTES */
export function onceIdealMinMinutes(): number {
  const raw = process.env.BETPLAY_ONCE_IDEAL_MIN_MINUTES;
  if (raw && Number.isFinite(Number(raw))) return Math.max(1, Number(raw));
  return 450;
}

export interface BuildOnceIdealResult {
  draft: OnceIdealDraft | null;
  skippedReason?: string;
}

/**
 * Borrador Once Ideal Liga BetPlay — fase todos contra todos (rating ponderado).
 */
export async function buildBetPlayOnceIdealDraft(options?: {
  force?: boolean;
  now?: Date;
  season?: number;
  formation?: FormationType;
  minMinutes?: number;
  maxPages?: number;
  phaseLabel?: string;
}): Promise<BuildOnceIdealResult> {
  const now = options?.now ?? new Date();
  const dayKey = getBogotaDayKey(now);
  const existing = getOnceIdealDraftForDay(dayKey);
  if (
    !options?.force &&
    existing &&
    (existing.status === "pending" || existing.status === "published")
  ) {
    return {
      draft: existing,
      skippedReason:
        existing.status === "published" ? "already_published" : "pending_exists",
    };
  }

  const season = options?.season ?? DEFAULT_SEASON;
  const formation = options?.formation ?? "4-3-3";
  const minMinutes = options?.minMinutes ?? onceIdealMinMinutes();
  const maxPages = options?.maxPages ?? Number(process.env.BETPLAY_ONCE_IDEAL_MAX_PAGES || 8);
  const phaseLabel = options?.phaseLabel ?? "Clausura 2026 · Todos contra todos";

  let pool;
  try {
    pool = await getLeaguePlayerPoolForOnceIdeal(BETPLAY_LEAGUE_ID, season, maxPages);
  } catch (e) {
    console.error("[x-once-ideal] pool fetch failed:", e);
    return { draft: null, skippedReason: "pool_failed" };
  }

  if (!pool.length) {
    return { draft: null, skippedReason: "empty_pool" };
  }

  const candidates = buildCandidatesFromPlayers(
    pool,
    Math.max(minMinutes, ONCE_IDEAL_MIN_MINUTES_TOURNAMENT),
    BETPLAY_LEAGUE_ID,
    season
  );

  if (candidates.length < 11) {
    console.warn(
      `[x-once-ideal] only ${candidates.length} candidates with ≥${minMinutes}' — retrying with 200'`
    );
    const fallback = buildCandidatesFromPlayers(pool, 200, BETPLAY_LEAGUE_ID, season);
    if (fallback.length < 11) {
      return { draft: null, skippedReason: "insufficient_candidates" };
    }
    return finalizeDraft({
      dayKey,
      season,
      formation,
      phaseLabel,
      candidates: fallback,
      minMinutesUsed: 200,
    });
  }

  return finalizeDraft({
    dayKey,
    season,
    formation,
    phaseLabel,
    candidates,
    minMinutesUsed: minMinutes,
  });
}

function finalizeDraft(input: {
  dayKey: string;
  season: number;
  formation: FormationType;
  phaseLabel: string;
  candidates: ReturnType<typeof buildCandidatesFromPlayers>;
  minMinutesUsed: number;
}): BuildOnceIdealResult {
  const players = buildOnceIdealFromCandidates(input.candidates, input.formation);
  if (players.length < 11) {
    return { draft: null, skippedReason: "incomplete_xi" };
  }

  const averageRating =
    Math.round((players.reduce((s, p) => s + p.rating, 0) / players.length) * 10) / 10;

  const tweets = buildOnceIdealThread({
    phaseLabel: input.phaseLabel,
    formation: input.formation,
    averageRating,
    players,
  });

  const draft: OnceIdealDraft = {
    dayKey: input.dayKey,
    status: "pending",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    leagueId: BETPLAY_LEAGUE_ID,
    season: input.season,
    phaseLabel: input.phaseLabel,
    formation: input.formation,
    averageRating,
    tweets,
    players,
  };

  saveOnceIdealDraft(draft);
  console.info(
    `[x-once-ideal] draft ${input.dayKey} · ${players.length} XI · media ${averageRating} · ≥${input.minMinutesUsed}' · ${input.candidates.length} candidatos`
  );
  return { draft };
}

export function getTelegramOnceIdealPreviewText(draft: OnceIdealDraft): string {
  return formatTelegramOnceIdealPreview({
    dayKey: draft.dayKey,
    phaseLabel: draft.phaseLabel,
    formation: draft.formation,
    averageRating: draft.averageRating,
    players: draft.players,
  });
}
