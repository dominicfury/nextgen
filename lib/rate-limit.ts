// Simple in-memory token-bucket rate limiter, keyed by an arbitrary string
// (typically IP, or IP+route). Good enough for a single-instance Vercel
// function; if we scale to multiple instances we'd swap in Upstash Redis.
//
// Each call returns { ok, retryAfterMs }. Callers should 429 on !ok.

type Bucket = { tokens: number; refillAt: number };

const BUCKETS = new Map<string, Bucket>();

export type RateLimitOpts = {
  /** How many requests are allowed per window. */
  limit: number;
  /** Window length in ms. */
  windowMs: number;
};

export function rateLimit(
  key: string,
  opts: RateLimitOpts,
): { ok: boolean; retryAfterMs: number } {
  const now = Date.now();
  const existing = BUCKETS.get(key);

  if (!existing || existing.refillAt <= now) {
    BUCKETS.set(key, { tokens: opts.limit - 1, refillAt: now + opts.windowMs });
    return { ok: true, retryAfterMs: 0 };
  }

  if (existing.tokens > 0) {
    existing.tokens -= 1;
    return { ok: true, retryAfterMs: 0 };
  }

  return { ok: false, retryAfterMs: existing.refillAt - now };
}

/**
 * Best-effort client IP. Cloudflare/Vercel set x-forwarded-for; falls back
 * to a generic bucket if absent (so we still rate-limit anonymously).
 */
export function clientKey(req: Request, suffix: string): string {
  const fwd = req.headers.get("x-forwarded-for") ?? "";
  const ip = fwd.split(",")[0]?.trim() || "unknown";
  return `${ip}:${suffix}`;
}
