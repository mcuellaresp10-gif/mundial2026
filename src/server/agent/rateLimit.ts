import { checkSlidingWindowLimit, resetAllRateLimits } from "@/server/rateLimit";

const WINDOW_MS = 10 * 60 * 1000;
const DEFAULT_LIMIT = Number(process.env.AGENT_RATE_LIMIT ?? 20);

export function checkRateLimit(ip: string, limit = DEFAULT_LIMIT): { ok: boolean; retryAfterSec?: number } {
  return checkSlidingWindowLimit(`agent:${ip}`, limit, WINDOW_MS);
}

/** Para tests. */
export function resetRateLimits(): void {
  resetAllRateLimits();
}
