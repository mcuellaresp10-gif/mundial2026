const hits = new Map<string, { count: number; resetAt: number }>();
const dailyHits = new Map<string, { count: number; dayKey: string }>();

export function checkSlidingWindowLimit(
  key: string,
  limit: number,
  windowMs: number
): { ok: boolean; retryAfterSec?: number } {
  const now = Date.now();
  const entry = hits.get(key);

  if (!entry || now > entry.resetAt) {
    hits.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true };
  }

  if (entry.count >= limit) {
    return { ok: false, retryAfterSec: Math.ceil((entry.resetAt - now) / 1000) };
  }

  entry.count += 1;
  return { ok: true };
}

export function checkDailyLimit(key: string, limit: number): { ok: boolean } {
  const dayKey = new Date().toDateString();
  const entry = dailyHits.get(key);

  if (!entry || entry.dayKey !== dayKey) {
    dailyHits.set(key, { count: 1, dayKey });
    return { ok: true };
  }

  if (entry.count >= limit) return { ok: false };
  entry.count += 1;
  return { ok: true };
}

/** Para tests. */
export function resetAllRateLimits(): void {
  hits.clear();
  dailyHits.clear();
}
