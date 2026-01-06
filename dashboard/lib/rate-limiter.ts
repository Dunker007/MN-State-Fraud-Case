/**
 * In-Memory Rate Limiter for API endpoints
 * Tracks requests per IP/endpoint and enforces limits
 */

interface RateLimitEntry {
    count: number;
    resetAt: number;
}

interface RateLimitConfig {
    windowMs: number;      // Time window in milliseconds
    maxRequests: number;   // Max requests per window
}

// In-memory store (will reset on server restart - consider Redis for production)
const rateLimitStore = new Map<string, RateLimitEntry>();

// Default configs per endpoint type
const RATE_LIMITS: Record<string, RateLimitConfig> = {
    scraper: { windowMs: 60000, maxRequests: 10 },     // 10 req/min for scrapers
    public: { windowMs: 3600000, maxRequests: 100 },   // 100 req/hour for public API
    internal: { windowMs: 60000, maxRequests: 60 },    // 60 req/min for internal
    external: { windowMs: 60000, maxRequests: 30 },    // 30 req/min for external API calls
};

export interface RateLimitResult {
    allowed: boolean;
    remaining: number;
    resetAt: Date;
    retryAfter?: number;
}

/**
 * Check if a request should be rate limited
 * @param key Unique identifier (e.g., IP + endpoint)
 * @param type Type of rate limit to apply
 */
export function checkRateLimit(key: string, type: keyof typeof RATE_LIMITS = 'internal'): RateLimitResult {
    const config = RATE_LIMITS[type];
    const now = Date.now();

    // Clean up expired entries periodically
    if (Math.random() < 0.1) {
        cleanupExpiredEntries();
    }

    const entry = rateLimitStore.get(key);

    if (!entry || now >= entry.resetAt) {
        // First request or window expired
        rateLimitStore.set(key, {
            count: 1,
            resetAt: now + config.windowMs
        });
        return {
            allowed: true,
            remaining: config.maxRequests - 1,
            resetAt: new Date(now + config.windowMs)
        };
    }

    if (entry.count >= config.maxRequests) {
        // Rate limited
        return {
            allowed: false,
            remaining: 0,
            resetAt: new Date(entry.resetAt),
            retryAfter: Math.ceil((entry.resetAt - now) / 1000)
        };
    }

    // Increment count
    entry.count++;
    rateLimitStore.set(key, entry);

    return {
        allowed: true,
        remaining: config.maxRequests - entry.count,
        resetAt: new Date(entry.resetAt)
    };
}

/**
 * Clean up expired rate limit entries
 */
function cleanupExpiredEntries(): void {
    const now = Date.now();
    for (const [key, entry] of rateLimitStore.entries()) {
        if (now >= entry.resetAt) {
            rateLimitStore.delete(key);
        }
    }
}

/**
 * Generate rate limit headers for HTTP response
 */
export function getRateLimitHeaders(result: RateLimitResult): Record<string, string> {
    return {
        'X-RateLimit-Remaining': String(result.remaining),
        'X-RateLimit-Reset': result.resetAt.toISOString(),
        ...(result.retryAfter ? { 'Retry-After': String(result.retryAfter) } : {})
    };
}

/**
 * Backoff calculator for failed external API requests
 */
export class ExponentialBackoff {
    private failures = new Map<string, { count: number; nextRetry: number }>();

    shouldRetry(key: string): boolean {
        const entry = this.failures.get(key);
        if (!entry) return true;
        return Date.now() >= entry.nextRetry;
    }

    recordFailure(key: string): number {
        const entry = this.failures.get(key) || { count: 0, nextRetry: 0 };
        entry.count++;
        // Exponential backoff: 1s, 2s, 4s, 8s, 16s, max 60s
        const waitMs = Math.min(1000 * Math.pow(2, entry.count - 1), 60000);
        entry.nextRetry = Date.now() + waitMs;
        this.failures.set(key, entry);
        return waitMs;
    }

    recordSuccess(key: string): void {
        this.failures.delete(key);
    }
}

// Singleton backoff instance for external APIs
export const externalApiBackoff = new ExponentialBackoff();
