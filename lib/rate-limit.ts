/**
 * Lightweight in-memory sliding-window rate limiter.
 *
 * NOTE: state lives in the process memory, so on serverless (Vercel) it only
 * throttles within a single warm instance — it mitigates casual abuse/scripts
 * but is not a hard guarantee across instances. For strict global limits, back
 * this with a shared store (e.g. Upstash Redis) later.
 */
type Bucket = { count: number; resetAt: number }

const buckets = new Map<string, Bucket>()
const MAX_BUCKETS = 10_000

/**
 * Returns true if the request under `key` is allowed, false if it exceeded
 * `limit` requests within `windowMs`.
 */
export function rateLimit(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now()
  const bucket = buckets.get(key)

  if (!bucket || bucket.resetAt <= now) {
    // Opportunistic prune so the map can't grow unbounded.
    if (buckets.size > MAX_BUCKETS) {
      for (const [k, b] of buckets) {
        if (b.resetAt <= now) buckets.delete(k)
      }
    }
    buckets.set(key, { count: 1, resetAt: now + windowMs })
    return true
  }

  if (bucket.count >= limit) return false

  bucket.count++
  return true
}

/**
 * Best-effort client IP extraction from proxy headers (Vercel sets these).
 */
export function clientIp(headers: Headers): string {
  return (
    headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    headers.get("x-real-ip")?.trim() ||
    "unknown"
  )
}
