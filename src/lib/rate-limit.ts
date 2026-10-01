import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

/**
 * Upstash is optional in local development. When the REST URL/token are not
 * configured we skip building the Redis client entirely — constructing it with
 * `undefined` credentials logs noisy "[Upstash Redis] ... Failed to execute
 * command" errors on every request. Rate limiting then degrades to a no-op,
 * matching the existing fail-open behaviour in `checkRateLimit`.
 */
const url = process.env.UPSTASH_REDIS_REST_URL;
const token = process.env.UPSTASH_REDIS_REST_TOKEN;

export const isRateLimitConfigured = Boolean(url && token);

const redis = isRateLimitConfigured ? new Redis({ url: url!, token: token! }) : null;

function createLimiter(
  limiter: ReturnType<typeof Ratelimit.slidingWindow>,
  prefix: string
): Ratelimit | null {
  if (!redis) return null;
  return new Ratelimit({ redis, limiter, prefix });
}

export const rateLimiters = {
  login: createLimiter(Ratelimit.slidingWindow(5, "15 m"), "rl:login"),
  register: createLimiter(Ratelimit.slidingWindow(3, "1 h"), "rl:register"),
  forgotPassword: createLimiter(Ratelimit.slidingWindow(3, "1 h"), "rl:forgot-password"),
  resetPassword: createLimiter(Ratelimit.slidingWindow(5, "15 m"), "rl:reset-password"),
  aiAutoTag: createLimiter(Ratelimit.slidingWindow(20, "1 h"), "rl:ai-auto-tag"),
};

if (!isRateLimitConfigured && process.env.NODE_ENV !== "production") {
  console.warn(
    "[rate-limit] Upstash is not configured — rate limiting is disabled for local development."
  );
}

export function getIP(req: Request): string {
  const forwarded = req.headers.get("x-forwarded-for");
  return forwarded?.split(",")[0].trim() ?? "127.0.0.1";
}

export async function checkRateLimit(
  limiter: Ratelimit | null,
  key: string
): Promise<{ limited: boolean; retryAfter: number }> {
  // Not configured — allow the request through.
  if (!limiter) {
    return { limited: false, retryAfter: 0 };
  }

  try {
    const { success, reset } = await limiter.limit(key);
    if (!success) {
      const retryAfter = Math.ceil((reset - Date.now()) / 1000);
      return { limited: true, retryAfter };
    }
    return { limited: false, retryAfter: 0 };
  } catch {
    // Fail open — allow request if Upstash is unreachable
    return { limited: false, retryAfter: 0 };
  }
}

export function rateLimitResponse(retryAfter: number) {
  const minutes = Math.max(1, Math.ceil(retryAfter / 60));
  return {
    body: { error: `Too many attempts. Please try again in ${minutes} minute${minutes === 1 ? "" : "s"}.` },
    headers: { "Retry-After": String(retryAfter) },
  };
}
