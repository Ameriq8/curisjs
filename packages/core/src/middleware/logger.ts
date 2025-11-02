/**
 * Logger middleware
 * Simple request/response logging
 */

import type { Middleware } from '../types/index';

export interface LoggerOptions {
  /**
   * Custom log function
   */
  log?: (message: string) => void;

  /**
   * Include response time
   */
  timing?: boolean;
}

/**
 * Create logger middleware
 */
export function logger(options: LoggerOptions = {}): Middleware {
  const { log = console.log, timing = true } = options;

  return async (ctx, next) => {
    const start = timing ? Date.now() : 0;

    // Log request
    const { method, url } = ctx.request;

    await next();

    // Log response
    const status = ctx.response?.status || 0;
    const duration = timing ? Date.now() - start : 0;

    const logMessage = timing
      ? `${method} ${url} ${status} ${duration}ms`
      : `${method} ${url} ${status}`;

    log(logMessage);
  };
}
