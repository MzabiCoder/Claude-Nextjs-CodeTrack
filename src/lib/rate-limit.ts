import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

export const rateLimiters = {
  login: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(5, "15 m"),
    prefix: "rl:login",
  }),
  register: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(3, "1 h"),
    prefix: "rl:register",
  }),
  forgotPassword: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(3, "1 h"),
    prefix: "rl:forgot-password",
  }),
  resetPassword: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(5, "15 m"),
    prefix: "rl:reset-password",
  }),
  resendVerification: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(3, "15 m"),
    prefix: "rl:resend-verification",
  }),
};

export function getIP(req: Request): string {
  const forwarded = req.headers.get("x-forwarded-for");
  return forwarded?.split(",")[0].trim() ?? "127.0.0.1";
}

export async function checkRateLimit(
  limiter: Ratelimit,
  key: string
): Promise<{ limited: boolean; retryAfter: number }> {
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
