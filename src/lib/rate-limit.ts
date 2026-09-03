import { RateLimitError } from "@/lib/errors";

const WINDOW_MS = 60_000;
const MAX_REQUESTS = 10;

type RateLimitBucket = {
  count: number;
  resetAt: number;
};

const globalForRateLimit = globalThis as typeof globalThis & {
  __obsidianAiRateLimit?: Map<string, RateLimitBucket>;
};

const buckets =
  globalForRateLimit.__obsidianAiRateLimit ??
  new Map<string, RateLimitBucket>();

if (!globalForRateLimit.__obsidianAiRateLimit) {
  globalForRateLimit.__obsidianAiRateLimit = buckets;
}

export interface AiRateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: Date;
}

export function checkAiRateLimit(userId: string): AiRateLimitResult {
  if (!userId) {
    throw new RateLimitError(
      "A user identifier is required for rate limiting.",
    );
  }

  const now = Date.now();
  const bucket = buckets.get(userId);

  if (!bucket || bucket.resetAt <= now) {
    const resetAt = now + WINDOW_MS;
    buckets.set(userId, { count: 1, resetAt });

    return {
      allowed: true,
      remaining: MAX_REQUESTS - 1,
      resetAt: new Date(resetAt),
    };
  }

  if (bucket.count >= MAX_REQUESTS) {
    return {
      allowed: false,
      remaining: 0,
      resetAt: new Date(bucket.resetAt),
    };
  }

  bucket.count += 1;
  buckets.set(userId, bucket);

  return {
    allowed: true,
    remaining: MAX_REQUESTS - bucket.count,
    resetAt: new Date(bucket.resetAt),
  };
}
/**
 * RATE LIMITING
 *
 * Implement or complete the shared rate limiting utility.
 *
 * The AI chat endpoint should use a per-user rate limit.
 *
 * MVP policy:
 *
 * 10 AI requests
 * per minute
 * per user
 *
 * The implementation should expose a simple reusable interface,
 * for example:
 *
 * checkAiRateLimit(userId)
 *
 * Return enough information to determine:
 * - whether the request is allowed
 * - remaining requests when available
 * - reset information when available
 *
 * Prefer the project's configured Redis-backed or selected
 * rate-limiting implementation.
 *
 * Do not create multiple rate limiter instances for every request.
 */
