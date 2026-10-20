/** Sliding-window limiter kept in process memory, so it applies per server instance; the daily DB check in the action is the shared limit. */
const hits = new Map<string, number[]>()

export function checkRateLimit(key: string, limit: number, windowMs: number, now = Date.now()): { ok: boolean; retryAfterSec: number } {
  const recent = (hits.get(key) ?? []).filter((t) => now - t < windowMs)
  if (recent.length >= limit) {
    hits.set(key, recent)
    return { ok: false, retryAfterSec: Math.ceil((recent[0] + windowMs - now) / 1000) }
  }
  recent.push(now)
  hits.set(key, recent)
  return { ok: true, retryAfterSec: 0 }
}

export function resetRateLimits() {
  hits.clear()
}
