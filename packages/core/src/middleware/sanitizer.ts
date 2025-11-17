/**
 * Input Sanitizer Middleware
 * Sanitizes request data to prevent XSS and injection attacks
 */

import type { Context, Middleware, Next } from '../types/index';

export interface SanitizerOptions {
  /**
   * Sanitize request body
   * @default true
   */
  body?: boolean;

  /**
   * Sanitize query parameters
   * @default true
   */
  query?: boolean;

  /**
   * Sanitize URL parameters
   * @default true
   */
  params?: boolean;

  /**
   * Allow specific HTML tags
   * @default []
   */
  allowedTags?: string[];

  /**
   * Allow specific HTML attributes
   * @default []
   */
  allowedAttributes?: string[];

  /**
   * Strip HTML tags completely
   * @default true
   */
  stripTags?: boolean;

  /**
   * Escape HTML entities
   * @default true
   */
  escapeHtml?: boolean;

  /**
   * Trim whitespace
   * @default true
   */
  trim?: boolean;
}

/**
 * Escape HTML entities
 */
function escapeHtml(str: string): string {
  const htmlEntities: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '/': '&#x2F;',
  };

  return str.replace(/[&<>"'/]/g, (char) => htmlEntities[char] || char);
}

/**
 * Strip HTML tags
 */
function stripHtmlTags(str: string, allowedTags: string[] = []): string {
  if (allowedTags.length === 0) {
    return str.replace(/<[^>]*>/g, '');
  }

  const allowedPattern = allowedTags.map(tag => tag.toLowerCase()).join('|');
  const regex = new RegExp(`<(?!/?(${allowedPattern})\\b)[^>]*>`, 'gi');
  return str.replace(regex, '');
}

/**
 * Sanitize a value
 */
function sanitizeValue(
  value: any,
  options: Required<SanitizerOptions>
): any {
  if (typeof value === 'string') {
    let result = value;

    if (options.trim) {
      result = result.trim();
    }

    if (options.stripTags) {
      result = stripHtmlTags(result, options.allowedTags);
    }

    if (options.escapeHtml) {
      result = escapeHtml(result);
    }

    return result;
  }

  if (Array.isArray(value)) {
    return value.map(item => sanitizeValue(item, options));
  }

  if (value && typeof value === 'object') {
    const sanitized: Record<string, any> = {};
    for (const [key, val] of Object.entries(value)) {
      sanitized[key] = sanitizeValue(val, options);
    }
    return sanitized;
  }

  return value;
}

/**
 * Sanitizer middleware
 * 
 * @example
 * ```ts
 * import { sanitizer } from '@curisjs/core';
 * 
 * // Basic usage
 * app.use(sanitizer());
 * 
 * // With custom options
 * app.use(sanitizer({
 *   allowedTags: ['b', 'i', 'em', 'strong'],
 *   stripTags: true,
 *   escapeHtml: true,
 * }));
 * 
 * // Data is automatically sanitized
 * app.post('/api/posts', async (ctx) => {
 *   const body = ctx.state.body; // Already sanitized
 * });
 * ```
 */
export function sanitizer(options: SanitizerOptions = {}): Middleware {
  const config: Required<SanitizerOptions> = {
    body: options.body ?? true,
    query: options.query ?? true,
    params: options.params ?? true,
    allowedTags: options.allowedTags ?? [],
    allowedAttributes: options.allowedAttributes ?? [],
    stripTags: options.stripTags ?? true,
    escapeHtml: options.escapeHtml ?? true,
    trim: options.trim ?? true,
  };

  return async (ctx: Context, next: Next) => {
    // Sanitize body
    if (config.body && ctx.state.body !== undefined) {
      ctx.state.body = sanitizeValue(ctx.state.body, config);
    }

    // Sanitize query parameters
    if (config.query) {
      const queries = ctx.queries();
      const sanitized: Record<string, string | string[]> = {};
      
      for (const [key, value] of Object.entries(queries)) {
        sanitized[key] = sanitizeValue(value, config);
      }

      // Store sanitized queries in state
      ctx.state.query = sanitized;
    }

    // Sanitize URL parameters
    if (config.params && ctx.params) {
      const sanitized: Record<string, string> = {};
      
      for (const [key, value] of Object.entries(ctx.params)) {
        sanitized[key] = sanitizeValue(value, config);
      }

      ctx.params = sanitized;
    }

    await next();
  };
}
