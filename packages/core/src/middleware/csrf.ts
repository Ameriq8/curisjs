/**
 * CSRF Protection Middleware
 * Protects against Cross-Site Request Forgery attacks
 */

import type { Context, Middleware, Next } from '../types/index';
import { json } from '../utils/response';

export interface CSRFOptions {
  /**
   * Cookie name for CSRF token
   * @default '_csrf'
   */
  cookieName?: string;

  /**
   * Header name for CSRF token
   * @default 'x-csrf-token'
   */
  headerName?: string;

  /**
   * Form field name for CSRF token
   * @default '_csrf'
   */
  fieldName?: string;

  /**
   * Token length
   * @default 32
   */
  tokenLength?: number;

  /**
   * Safe HTTP methods that don't require CSRF protection
   * @default ['GET', 'HEAD', 'OPTIONS']
   */
  safeMethods?: string[];

  /**
   * Cookie options
   */
  cookie?: {
    httpOnly?: boolean;
    secure?: boolean;
    sameSite?: 'strict' | 'lax' | 'none';
    path?: string;
    maxAge?: number;
  };

  /**
   * Custom error message
   */
  errorMessage?: string;

  /**
   * Custom error status code
   * @default 403
   */
  errorStatus?: number;

  /**
   * Function to check if request should be protected
   */
  shouldProtect?: (ctx: Context) => boolean;
}

const DEFAULT_SAFE_METHODS = ['GET', 'HEAD', 'OPTIONS'];

/**
 * Generate a random token
 */
function generateToken(length: number): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';
  let token = '';
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);

  for (let i = 0; i < length; i++) {
    const char = chars[array[i]! % chars.length];
    if (char) token += char;
  }

  return token;
}

/**
 * Extract token from request
 */
function extractToken(ctx: Context, headerName: string, _fieldName: string): string | null {
  // Try header first
  const headerToken = ctx.request.headers.get(headerName);
  if (headerToken) return headerToken;

  // Try body field (for form submissions)
  // Note: This would require parsing the body, which should be done carefully
  // For now, we'll just check the header

  return null;
}

/**
 * CSRF protection middleware
 *
 * @example
 * ```ts
 * import { csrf } from '@curisjs/core';
 *
 * // Basic usage
 * app.use(csrf());
 *
 * // With custom options
 * app.use(csrf({
 *   cookieName: 'xsrf-token',
 *   headerName: 'x-xsrf-token',
 *   cookie: {
 *     secure: true,
 *     sameSite: 'strict',
 *   }
 * }));
 *
 * // In your forms:
 * // <input type="hidden" name="_csrf" value="${csrfToken}">
 * ```
 */
export function csrf(options: CSRFOptions = {}): Middleware {
  const {
    cookieName = '_csrf',
    headerName = 'x-csrf-token',
    fieldName = '_csrf',
    tokenLength = 32,
    safeMethods = DEFAULT_SAFE_METHODS,
    cookie = {},
    errorMessage = 'Invalid CSRF token',
    errorStatus = 403,
    shouldProtect,
  } = options;

  const {
    httpOnly = true,
    secure = true,
    sameSite = 'strict',
    path = '/',
    maxAge = 3600,
  } = cookie;

  // Store tokens (in production, use Redis or similar)
  const tokens = new Map<string, number>();

  return async (ctx: Context, next: Next) => {
    const method = ctx.request.method.toUpperCase();

    // Check if this request should be protected
    const protect = shouldProtect ? shouldProtect(ctx) : !safeMethods.includes(method);

    // Generate or retrieve token
    const cookieHeader = ctx.request.headers.get('cookie');
    let existingToken: string | null = null;

    if (cookieHeader) {
      const cookies = cookieHeader.split(';').reduce((acc, cookie) => {
        const [key, value] = cookie.trim().split('=');
        if (key && value) acc[key] = value;
        return acc;
      }, {} as Record<string, string>);
      existingToken = cookies[cookieName] || null;
    }

    let token = existingToken;

    // Generate new token if needed
    if (!token || !tokens.has(token)) {
      token = generateToken(tokenLength);
      tokens.set(token, Date.now() + maxAge * 1000);
    }

    // Store token in context state for use in templates
    ctx.state.csrfToken = token;

    // For protected requests, verify token
    if (protect) {
      const providedToken = extractToken(ctx, headerName, fieldName);

      if (!providedToken || providedToken !== token || !tokens.has(token)) {
        ctx.response = json({
          error: 'Forbidden',
          message: errorMessage,
        }, {
          status: errorStatus,
        });
        return;
      }

      // Check if token is expired
      const expiresAt = tokens.get(token);
      if (expiresAt && expiresAt < Date.now()) {
        tokens.delete(token);
        ctx.response = json({
          error: 'Forbidden',
          message: 'CSRF token expired',
        }, {
          status: errorStatus,
        });
        return;
      }
    }

    // Process request
    await next();

    // Set cookie with token
    if (ctx.response) {
      const cookieValue = [
        `${cookieName}=${token}`,
        `Path=${path}`,
        `Max-Age=${maxAge}`,
        `SameSite=${sameSite.charAt(0).toUpperCase() + sameSite.slice(1)}`,
      ];

      if (httpOnly) cookieValue.push('HttpOnly');
      if (secure) cookieValue.push('Secure');

      ctx.response.headers.append('Set-Cookie', cookieValue.join('; '));
    }

    // Clean up expired tokens periodically
    if (Math.random() < 0.01) { // 1% chance
      const now = Date.now();
      for (const [key, expires] of tokens.entries()) {
        if (expires < now) {
          tokens.delete(key);
        }
      }
    }
  };
}
