/**
 * Validator Middleware
 * Validates request data using schemas with error handling
 */

import type { Context, Middleware, Next } from '../types/index';
import type { Schema } from '../validation/schema';
import { SchemaValidationError } from '../validation/schema';
import { json } from '../utils/response';

export interface ValidatorOptions<T = any> {
  /**
   * Schema to validate against
   */
  schema: Schema<any, T>;

  /**
   * Data source to validate
   * @default 'body'
   */
  source?: 'body' | 'query' | 'params' | 'headers';

  /**
   * Custom error handler
   */
  onError?: (ctx: Context, error: SchemaValidationError) => void;

  /**
   * Whether to strip unknown fields
   * @default false
   */
  stripUnknown?: boolean;

  /**
   * Whether to abort on first error
   * @default false
   */
  abortEarly?: boolean;
}

/**
 * Extract data from context based on source
 */
async function extractData(ctx: Context, source: string): Promise<any> {
  switch (source) {
    case 'body':
      return ctx.state.body !== undefined ? ctx.state.body : await ctx.json();

    case 'query':
      return ctx.queries();

    case 'params':
      return ctx.params;

    case 'headers': {
      const headers: Record<string, string> = {};
      ctx.request.headers.forEach((value, key) => {
        headers[key] = value;
      });
      return headers;
    }

    default:
      return ctx.state.body;
  }
}

/**
 * Format validation errors for response
 */
function formatValidationError(error: SchemaValidationError) {
  return {
    error: 'Validation Error',
    message: 'Request validation failed',
    details: error.issues.map((err) => ({
      field: err.path.join('.'),
      message: err.message,
      code: err.code,
    })),
  };
}

/**
 * Validator middleware factory
 *
 * @example
 * ```ts
 * import { validator, v } from '@curisjs/core';
 *
 * // Define schema
 * const userSchema = v.object({
 *   name: v.string().min(2).max(50),
 *   email: v.string().email(),
 *   age: v.number().min(18).optional(),
 * });
 *
 * // Validate request body
 * app.post('/api/users',
 *   validator({ schema: userSchema }),
 *   async (ctx) => {
 *     const data = ctx.state.validated; // Type-safe validated data
 *     // Create user...
 *   }
 * );
 *
 * // Validate query parameters
 * app.get('/api/users',
 *   validator({
 *     schema: v.object({
 *       page: v.number().min(1).default(1),
 *       limit: v.number().min(1).max(100).default(20),
 *     }),
 *     source: 'query',
 *   }),
 *   async (ctx) => {
 *     const { page, limit } = ctx.state.validated;
 *     // Fetch users...
 *   }
 * );
 * ```
 */
export function validator<T = any>(options: ValidatorOptions<T>): Middleware {
  const {
    schema,
    source = 'body',
    onError,
    stripUnknown: _stripUnknown = false, // Reserved for future use
    abortEarly: _abortEarly = false, // Reserved for future use
  } = options;

  return async (ctx: Context, next: Next) => {
    try {
      // Extract data to validate
      const data = await extractData(ctx, source);

      // Validate data
      const result = schema.safeParse(data);

      if (!result.success) {
        // Validation failed
        const error = new SchemaValidationError(result.error.issues);

        if (onError) {
          return onError(ctx, error);
        }

        // Default error response
        ctx.response = json(formatValidationError(error), {
          status: 422, // Unprocessable Entity
        });
        return;
      }

      // Store validated data in context
      ctx.state.validated = result.data;

      // Update source with validated data
      if (source === 'body') {
        ctx.state.body = result.data;
      } else if (source === 'query') {
        ctx.state.query = result.data;
      } else if (source === 'params') {
        ctx.params = result.data as any; // Type assertion needed for generic T
      }

      await next();
    } catch (error) {
      if (error instanceof SchemaValidationError) {
        if (onError) {
          return onError(ctx, error);
        }

        ctx.response = json(formatValidationError(error), {
          status: 422,
        });
      } else {
        // Re-throw non-validation errors
        throw error;
      }
    }
  };
}

/**
 * Validate body helper
 */
export function validateBody<T = any>(schema: Schema<any, T>) {
  return validator({ schema, source: 'body' });
}

/**
 * Validate query helper
 */
export function validateQuery<T = any>(schema: Schema<any, T>) {
  return validator({ schema, source: 'query' });
}

/**
 * Validate params helper
 */
export function validateParams<T = any>(schema: Schema<any, T>) {
  return validator({ schema, source: 'params' });
}

/**
 * Validate headers helper
 */
export function validateHeaders<T = any>(schema: Schema<any, T>) {
  return validator({ schema, source: 'headers' });
}
