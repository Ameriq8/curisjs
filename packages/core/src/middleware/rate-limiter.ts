/**
 * Rate Limiter Middleware
 * Limits the number of requests from a client within a time window
 */

import type { Context, Middleware, Next } from '../types/index';
import { json } from '../utils/response';

export interface RateLimiterOptions {
  /**
   * Maximum number of requests allowed in the time window
   * @default 100
   */
  max?: number;

  /**
   * Time window in milliseconds
   * @default 60000 (1 minute)
   */
  windowMs?: number;

  /**
   * Custom message when rate limit is exceeded
   * @default 'Too many requests, please try again later.'
   */
  message?: string;

  /**
   * HTTP status code when rate limit is exceeded
   * @default 429
   */
  statusCode?: number;

  /**
   * Function to extract the key for rate limiting (e.g., IP address)
   * @default (ctx) => ctx.request.headers.get('x-forwarded-for') || 'unknown'
   */
  keyGenerator?: (ctx: Context) => string;

  /**
   * Whether to skip rate limiting for successful requests
   * @default false
   */
  skipSuccessfulRequests?: boolean;

  /**
   * Whether to skip rate limiting for failed requests
   * @default false
   */
  skipFailedRequests?: boolean;

  /**
   * Custom handler when rate limit is exceeded
   */
  handler?: (ctx: Context, next: Next) => Promise<void> | void;

  /**
   * Store for rate limit data (default: in-memory Map)
   */
  store?: RateLimitStore;

  /**
   * Headers to include in the response
   * @default true
   */
  standardHeaders?: boolean;

  /**
   * Include legacy X-RateLimit headers
   * @default true
   */
  legacyHeaders?: boolean;
}

export interface RateLimitStore {
  increment(key: string): Promise<{ totalHits: number; resetTime: Date }>;
  decrement(key: string): Promise<void>;
  resetKey(key: string): Promise<void>;
}

class MemoryStore implements RateLimitStore {
  private hits = new Map<string, { count: number; resetTime: number }>();
  private windowMs: number;

  constructor(windowMs: number) {
    this.windowMs = windowMs;
  }

  async increment(key: string): Promise<{ totalHits: number; resetTime: Date }> {
    const now = Date.now();
    const record = this.hits.get(key);

    if (!record || now > record.resetTime) {
      const resetTime = now + this.windowMs;
      this.hits.set(key, { count: 1, resetTime });
      return { totalHits: 1, resetTime: new Date(resetTime) };
    }

    record.count++;
    return { totalHits: record.count, resetTime: new Date(record.resetTime) };
  }

  async decrement(key: string): Promise<void> {
    const record = this.hits.get(key);
    if (record && record.count > 0) {
      record.count--;
    }
  }

  async resetKey(key: string): Promise<void> {
    this.hits.delete(key);
  }
}

/**
 * Rate limiter middleware
 * 
 * @example
 * ```ts
 * import { rateLimiter } from '@curisjs/core';
 * 
 * // Basic usage
 * app.use(rateLimiter());
 * 
 * // Custom configuration
 * app.use(rateLimiter({
 *   max: 100,
 *   windowMs: 15 * 60 * 1000, // 15 minutes
 *   message: 'Too many requests from this IP',
 * }));
 * 
 * // Custom key generator (e.g., by user ID)
 * app.use(rateLimiter({
 *   keyGenerator: (ctx) => ctx.state.userId || 'anonymous',
 * }));
 * ```
 */
export function rateLimiter(options: RateLimiterOptions = {}): Middleware {
  const {
    max = 100,
    windowMs = 60000, // 1 minute
    message = 'Too many requests, please try again later.',
    statusCode = 429,
    keyGenerator = (ctx: Context) => {
      const forwarded = ctx.request.headers.get('x-forwarded-for');
      const ip = (forwarded ? forwarded.split(',')[0]?.trim() : null) || 
                ctx.request.headers.get('x-real-ip') || 
                'unknown';
      return ip;
    },
    skipSuccessfulRequests = false,
    skipFailedRequests = false,
    handler,
    store = new MemoryStore(windowMs),
    standardHeaders = true,
    legacyHeaders = true,
  } = options;

  return async (ctx: Context, next: Next) => {
    const key = keyGenerator(ctx);
    const { totalHits, resetTime } = await store.increment(key);

    const remaining = Math.max(0, max - totalHits);
    const resetTimeSeconds = Math.ceil(resetTime.getTime() / 1000);

    // Prepare response headers
    const headers: Record<string, string> = {};

    // Set rate limit headers
    if (standardHeaders) {
      headers['RateLimit-Limit'] = max.toString();
      headers['RateLimit-Remaining'] = remaining.toString();
      headers['RateLimit-Reset'] = resetTimeSeconds.toString();
    }

    if (legacyHeaders) {
      headers['X-RateLimit-Limit'] = max.toString();
      headers['X-RateLimit-Remaining'] = remaining.toString();
      headers['X-RateLimit-Reset'] = resetTimeSeconds.toString();
    }

    // Check if rate limit exceeded
    if (totalHits > max) {
      headers['Retry-After'] = Math.ceil((resetTime.getTime() - Date.now()) / 1000).toString();

      if (handler) {
        return handler(ctx, next);
      }

      ctx.response = json({
        error: 'Too Many Requests',
        message,
        retryAfter: resetTime.toISOString(),
      }, {
        status: statusCode,
        headers,
      });
      return;
    }

    // Process request
    await next();

    // Add headers to response
    if (ctx.response) {
      Object.entries(headers).forEach(([key, value]) => {
        ctx.response!.headers.set(key, value);
      });
    }

    // Decrement if needed
    const shouldSkip =
      (skipSuccessfulRequests && ctx.response && ctx.response.status < 400) ||
      (skipFailedRequests && ctx.response && ctx.response.status >= 400);

    if (shouldSkip) {
      await store.decrement(key);
    }
  };
}
