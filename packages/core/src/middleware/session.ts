/**
 * Session Middleware
 * Simple session management using cookies
 */

import type { Context, Middleware, Next } from '../types/index';

export interface SessionOptions {
  /**
   * Session cookie name
   * @default 'sid'
   */
  name?: string;

  /**
   * Secret key for signing session IDs
   * @default random string
   */
  secret?: string;

  /**
   * Cookie options
   */
  cookie?: {
    httpOnly?: boolean;
    secure?: boolean;
    sameSite?: 'strict' | 'lax' | 'none';
    path?: string;
    maxAge?: number;
    domain?: string;
  };

  /**
   * Session store
   * @default MemoryStore
   */
  store?: SessionStore;

  /**
   * Generate session ID
   */
  genid?: () => string;
}

export interface SessionStore {
  get(sid: string): Promise<any | null>;
  set(sid: string, data: any): Promise<void>;
  destroy(sid: string): Promise<void>;
}

/**
 * In-memory session store
 */
class MemoryStore implements SessionStore {
  private sessions = new Map<string, { data: any; expires: number }>();

  async get(sid: string): Promise<any | null> {
    const session = this.sessions.get(sid);
    if (!session) return null;

    if (session.expires < Date.now()) {
      this.sessions.delete(sid);
      return null;
    }

    return session.data;
  }

  async set(sid: string, data: any): Promise<void> {
    this.sessions.set(sid, {
      data,
      expires: Date.now() + 86400000, // 24 hours
    });
  }

  async destroy(sid: string): Promise<void> {
    this.sessions.delete(sid);
  }
}

/**
 * Generate random session ID
 */
function generateSid(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

/**
 * Parse cookies from header
 */
function parseCookies(cookieHeader: string): Record<string, string> {
  return cookieHeader.split(';').reduce((acc, cookie) => {
    const [key, value] = cookie.trim().split('=');
    if (key && value) {
      acc[key] = decodeURIComponent(value);
    }
    return acc;
  }, {} as Record<string, string>);
}

/**
 * Session middleware
 *
 * @example
 * ```ts
 * import { session } from '@curisjs/core';
 *
 * // Basic usage
 * app.use(session({ secret: 'your-secret-key' }));
 *
 * // Use session data
 * app.get('/api/profile', async (ctx) => {
 *   ctx.state.session.userId = 123;
 *   // Session is automatically saved
 * });
 *
 * app.get('/api/user', async (ctx) => {
 *   const userId = ctx.state.session.userId;
 *   // Access session data
 * });
 * ```
 */
export function session(options: SessionOptions = {}): Middleware {
  const {
    name = 'sid',
    secret: _secret = generateSid(), // Reserved for future HMAC signing
    cookie = {},
    store = new MemoryStore(),
    genid = generateSid,
  } = options;

  const {
    httpOnly = true,
    secure = true,
    sameSite = 'lax',
    path = '/',
    maxAge = 86400, // 24 hours in seconds
    domain,
  } = cookie;

  return async (ctx: Context, next: Next) => {
    // Parse cookies
    const cookieHeader = ctx.request.headers.get('cookie');
    const cookies = cookieHeader ? parseCookies(cookieHeader) : {};

    let sid = cookies[name];
    let sessionData: any = {};
    let isNew = false;

    // Try to load existing session
    if (sid) {
      const data = await store.get(sid);
      if (data) {
        sessionData = data;
      } else {
        // Session expired or invalid
        sid = genid();
        isNew = true;
      }
    } else {
      // New session
      sid = genid();
      isNew = true;
    }

    // Create session object with getters/setters
    const sessionProxy = new Proxy(sessionData, {
      set(target, prop, value) {
        target[prop] = value;
        return true;
      },
    });

    // Attach session to context
    ctx.state.session = sessionProxy;
    ctx.state.sessionId = sid;
    ctx.state.isNewSession = isNew;

    // Process request
    await next();

    // Save session
    await store.set(sid, sessionData);

    // Set cookie
    if (ctx.response) {
      const cookieValue = [
        `${name}=${encodeURIComponent(sid)}`,
        `Path=${path}`,
        `Max-Age=${maxAge}`,
        `SameSite=${sameSite.charAt(0).toUpperCase() + sameSite.slice(1)}`,
      ];

      if (httpOnly) cookieValue.push('HttpOnly');
      if (secure) cookieValue.push('Secure');
      if (domain) cookieValue.push(`Domain=${domain}`);

      ctx.response.headers.append('Set-Cookie', cookieValue.join('; '));
    }
  };
}
