const WINDOW_MS = 10 * 60 * 1000;
const DEFAULT_LIMIT = Number(process.env.AGENT_RATE_LIMIT ?? 20);

const hits = new Map<string, { count: number; resetAt: number }>();

export function checkRateLimit(ip: string, limit = DEFAULT_LIMIT): { ok: boolean; retryAfterSec?: number } {
  const now = Date.now();
  const entry = hits.get(ip);

  if (!entry || now > entry.resetAt) {
    hits.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return { ok: true };
  }

  if (entry.count >= limit) {
    return { ok: false, retryAfterSec: Math.ceil((entry.resetAt - now) / 1000) };
  }

  entry.count += 1;
  return { ok: true };
}

/** Para tests. */
export function resetRateLimits(): void {
  hits.clear();
}
