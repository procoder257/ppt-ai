
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// Ensure Redis is properly initialized only if env vars are present
const redis = process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
    ? new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL,
        token: process.env.UPSTASH_REDIS_REST_TOKEN,
    })
    : null;

export async function checkRateLimit(identifier: string) {
    // If Redis is not configured, we fail open (allow request) but log a warning
    // This prevents the app from breaking if someone forgets to set keys in dev
    if (!redis) {
        console.warn("⚠️ Rate limiting is DISABLED. Missing UPSTASH_REDIS_REST_URL or UPSTASH_REDIS_REST_TOKEN.");
        return { success: true, limit: 0, remaining: 0, reset: 0 };
    }

    const ratelimit = new Ratelimit({
        redis: redis,
        // Limit: 10 requests per 1 hour window
        // Adjust this based on your business model (e.g. Free vs Pro)
        limiter: Ratelimit.slidingWindow(10, "1 h"),
        analytics: true,
        prefix: "@pptai/ratelimit",
    });

    return await ratelimit.limit(identifier);
}
