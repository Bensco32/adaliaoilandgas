/**
 * Simple in-memory sliding/fixed-window rate limiter.
 * Limits keyed by a string (usually a client IP or a form token).
 */
const buckets = new Map<string, { count: number; resetAt: number }>();
const SWEEP_LIMIT = 10_000;

export interface RateLimitCheck {
  allowed: boolean;
  retryAfterMs: number;
}

export function isRateLimited(key: string, limit: number, windowMs: number): RateLimitCheck {
  if (buckets.size > SWEEP_LIMIT) {
    const now = Date.now();
    for (const [k, b] of buckets) {
      if (b.resetAt <= now) buckets.delete(k);
    }
  }
  const now = Date.now();
  const bucket = buckets.get(key);
  if (!bucket || now >= bucket.resetAt) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, retryAfterMs: 0 };
  }
  bucket.count += 1;
  const remaining = limit - bucket.count;
  return { allowed: bucket.count <= limit, retryAfterMs: Math.max(0, bucket.resetAt - now) };
}

export function resetRateLimit(key: string): void {
  buckets.delete(key);
}

export function clientIp(req: Request): string {
  const forwarded = req.headers.get("x-forwarded-for");
  const real = req.headers.get("x-real-ip");
  return (forwarded?.split(",")[0]?.trim() || real?.trim() || req.headers.get("cf-connecting-ip")?.trim() || "unknown").slice(0, 100);
}
