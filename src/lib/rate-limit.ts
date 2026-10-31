/**
 * Rate Limiting utility
 * 
 * Developed by Cradex Agency
 * https://cradexagency.com
 * 
 * Upstash Redis ilə rate limiting
 */

import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// Upstash konfiqurasiyası (opsional - yoxdursa in-memory istifadə olunur)
const redis = process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
  ? new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    })
  : undefined;

// Əgər Redis yoxdursa, sadə in-memory cache istifadə et
class InMemoryCache {
  private cache = new Map<string, { count: number; resetAt: number }>();

  async limit(key: string, max: number, window: number): Promise<{ success: boolean; remaining: number }> {
    const now = Date.now();
    const entry = this.cache.get(key);

    // Vaxt bitibsə, sıfırla
    if (!entry || entry.resetAt < now) {
      this.cache.set(key, { count: 1, resetAt: now + window });
      return { success: true, remaining: max - 1 };
    }

    // Limit aşılıbsa
    if (entry.count >= max) {
      return { success: false, remaining: 0 };
    }

    // Count artır
    entry.count++;
    return { success: true, remaining: max - entry.count };
  }
}

const inMemoryCache = new InMemoryCache();

/**
 * Public endpoint-lar üçün rate limiter (daha sərt)
 * 10 request / 10 saniyə
 */
export const publicRateLimiter = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(10, "10 s"),
      analytics: true,
      prefix: "nesreen:public",
    })
  : {
      limit: async (identifier: string) => 
        inMemoryCache.limit(identifier, 10, 10000)
    };

/**
 * API endpoint-lar üçün rate limiter (orta səviyyə)
 * 30 request / 60 saniyə
 */
export const apiRateLimiter = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(30, "60 s"),
      analytics: true,
      prefix: "nesreen:api",
    })
  : {
      limit: async (identifier: string) => 
        inMemoryCache.limit(identifier, 30, 60000)
    };

/**
 * Staff üçün rate limiter (yumşaq)
 * 100 request / 60 saniyə
 */
export const staffRateLimiter = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(100, "60 s"),
      analytics: true,
      prefix: "nesreen:staff",
    })
  : {
      limit: async (identifier: string) => 
        inMemoryCache.limit(identifier, 100, 60000)
    };

/**
 * Tracking üçün rate limiter (çox yumşaq)
 * 200 request / 60 saniyə
 */
export const trackingRateLimiter = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(200, "60 s"),
      analytics: true,
      prefix: "nesreen:tracking",
    })
  : {
      limit: async (identifier: string) => 
        inMemoryCache.limit(identifier, 200, 60000)
    };

/**
 * IP ünvanını request-dən çıxarır
 */
export function getClientIp(request: Request): string {
  // Vercel, Cloudflare və s. reverse proxy-lərdən IP-ni al
  const forwardedFor = request.headers.get('x-forwarded-for');
  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim();
  }

  const realIp = request.headers.get('x-real-ip');
  if (realIp) {
    return realIp;
  }

  // Fallback (development)
  return '127.0.0.1';
}
