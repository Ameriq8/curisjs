/**
 * Body Parser Middleware
 * Parses request body and attaches it to context
 */

import type { Context, Middleware, Next } from '../types/index';
import { json } from '../utils/response';

export interface BodyParserOptions {
  /**
   * Enable JSON body parsing
   * @default true
   */
  json?: boolean | {
    limit?: number;
    strict?: boolean;
  };

  /**
   * Enable form data parsing
   * @default true
   */
  form?: boolean | {
    limit?: number;
  };

  /**
   * Enable text body parsing
   * @default true
   */
  text?: boolean | {
    limit?: number;
  };

  /**
   * Enable raw body parsing
   * @default false
   */
  raw?: boolean | {
    limit?: number;
  };

  /**
   * Default body size limit in bytes
   * @default 1048576 (1MB)
   */
  limit?: number;

  /**
   * Custom error handler
   */
  onError?: (ctx: Context, error: Error) => void;
}

const DEFAULT_LIMIT = 1024 * 1024; // 1MB

/**
 * Check content length against limit
 */
function checkLimit(ctx: Context, limit: number): boolean {
  const contentLength = ctx.request.headers.get('content-length');
  if (contentLength) {
    const length = parseInt(contentLength, 10);
    return length <= limit;
  }
  return true;
}

/**
 * Body parser middleware
 * 
 * @example
 * ```ts
 * import { bodyParser } from '@curisjs/core';
 * 
 * // Basic usage
 * app.use(bodyParser());
 * 
 * // With custom options
 * app.use(bodyParser({
 *   json: { limit: 2 * 1024 * 1024 }, // 2MB
 *   form: true,
 *   text: false,
 * }));
 * 
 * // Access parsed body
 * app.post('/api/users', async (ctx) => {
 *   const body = ctx.state.body;
 *   // body is already parsed based on Content-Type
 * });
 * ```
 */
export function bodyParser(options: BodyParserOptions = {}): Middleware {
  const {
    json: jsonOpts = true,
    form: formOpts = true,
    text: textOpts = true,
    raw: rawOpts = false,
    limit = DEFAULT_LIMIT,
    onError,
  } = options;

  const jsonLimit = typeof jsonOpts === 'object' ? jsonOpts.limit ?? limit : limit;
  const formLimit = typeof formOpts === 'object' ? formOpts.limit ?? limit : limit;
  const textLimit = typeof textOpts === 'object' ? textOpts.limit ?? limit : limit;
  const rawLimit = typeof rawOpts === 'object' ? rawOpts.limit ?? limit : limit;
  const jsonStrict = typeof jsonOpts === 'object' ? jsonOpts.strict ?? true : true;

  return async (ctx: Context, next: Next) => {
    const method = ctx.request.method.toUpperCase();
    
    // Only parse body for methods that typically have a body
    if (!['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
      return next();
    }

    const contentType = ctx.request.headers.get('content-type') || '';

    try {
      // JSON
      if (jsonOpts && contentType.includes('application/json')) {
        if (!checkLimit(ctx, jsonLimit)) {
          ctx.response = json({
            error: 'Payload Too Large',
            message: `Request body exceeds ${jsonLimit} bytes`,
          }, { status: 413 });
          return;
        }

        const body = await ctx.request.json();

        // Strict mode: only allow objects and arrays
        if (jsonStrict && typeof body !== 'object') {
          throw new Error('JSON body must be an object or array');
        }

        ctx.state.body = body;
      }
      // Form data (application/x-www-form-urlencoded)
      else if (formOpts && contentType.includes('application/x-www-form-urlencoded')) {
        if (!checkLimit(ctx, formLimit)) {
          ctx.response = json({
            error: 'Payload Too Large',
            message: `Request body exceeds ${formLimit} bytes`,
          }, { status: 413 });
          return;
        }

        const text = await ctx.request.text();
        const params = new URLSearchParams(text);
        const body: Record<string, string | string[]> = {};

        for (const [key, value] of params.entries()) {
          const existing = body[key];
          if (existing === undefined) {
            body[key] = value;
          } else if (Array.isArray(existing)) {
            existing.push(value);
          } else {
            body[key] = [existing, value];
          }
        }

        ctx.state.body = body;
      }
      // Multipart form data
      else if (formOpts && contentType.includes('multipart/form-data')) {
        if (!checkLimit(ctx, formLimit)) {
          ctx.response = json({
            error: 'Payload Too Large',
            message: `Request body exceeds ${formLimit} bytes`,
          }, { status: 413 });
          return;
        }

        const formData = await ctx.request.formData();
        const body: Record<string, any> = {};

        formData.forEach((value, key) => {
          const existing = body[key];
          if (existing === undefined) {
            body[key] = value;
          } else if (Array.isArray(existing)) {
            existing.push(value);
          } else {
            body[key] = [existing, value];
          }
        });

        ctx.state.body = body;
      }
      // Text
      else if (textOpts && contentType.includes('text/')) {
        if (!checkLimit(ctx, textLimit)) {
          ctx.response = json({
            error: 'Payload Too Large',
            message: `Request body exceeds ${textLimit} bytes`,
          }, { status: 413 });
          return;
        }

        ctx.state.body = await ctx.request.text();
      }
      // Raw
      else if (rawOpts) {
        if (!checkLimit(ctx, rawLimit)) {
          ctx.response = json({
            error: 'Payload Too Large',
            message: `Request body exceeds ${rawLimit} bytes`,
          }, { status: 413 });
          return;
        }

        ctx.state.body = await ctx.request.arrayBuffer();
      }

      await next();
    } catch (error) {
      if (onError) {
        onError(ctx, error as Error);
      } else {
        ctx.response = json({
          error: 'Bad Request',
          message: error instanceof Error ? error.message : 'Failed to parse request body',
        }, { status: 400 });
      }
    }
  };
}
