/**
 * CORS middleware
 * Simple, standards-compliant CORS implementation
 */

import type { Middleware } from '../types/index';

export interface CORSOptions {
  origin?: string | string[] | ((origin: string) => boolean);
  methods?: string[];
  allowedHeaders?: string[];
  exposedHeaders?: string[];
  credentials?: boolean;
  maxAge?: number;
}

/**
 * Create CORS middleware
 */
export function cors(options: CORSOptions = {}): Middleware {
  const {
    origin = '*',
    methods = ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE'],
    allowedHeaders = [],
    exposedHeaders = [],
    credentials = false,
    maxAge = 86400, // 24 hours
  } = options;

  return async (ctx, next): Promise<Response | void> => {
    const requestOrigin = ctx.header('Origin');

    // Determine allowed origin
    let allowedOrigin = '*';

    if (typeof origin === 'string') {
      allowedOrigin = origin;
    } else if (Array.isArray(origin)) {
      if (requestOrigin && origin.includes(requestOrigin)) {
        allowedOrigin = requestOrigin;
      }
    } else if (typeof origin === 'function') {
      if (requestOrigin && origin(requestOrigin)) {
        allowedOrigin = requestOrigin;
      }
    }

    // Handle preflight requests
    if (ctx.request.method === 'OPTIONS') {
      const headers = new Headers({
        'Access-Control-Allow-Origin': allowedOrigin,
        'Access-Control-Allow-Methods': methods.join(', '),
        'Access-Control-Max-Age': maxAge.toString(),
      });

      if (allowedHeaders.length > 0) {
        headers.set('Access-Control-Allow-Headers', allowedHeaders.join(', '));
      }

      if (credentials) {
        headers.set('Access-Control-Allow-Credentials', 'true');
      }

      return new Response(null, { status: 204, headers });
    }

    // For actual requests, add CORS headers
    await next();

    // If no response from handler, return void
    if (!ctx.response) {
      return;
    }

    // Add CORS headers to existing response
    const headers = new Headers(ctx.response.headers);
    headers.set('Access-Control-Allow-Origin', allowedOrigin);

    if (exposedHeaders.length > 0) {
      headers.set('Access-Control-Expose-Headers', exposedHeaders.join(', '));
    }

    if (credentials) {
      headers.set('Access-Control-Allow-Credentials', 'true');
    }

    // Create new response with updated headers
    ctx.response = new Response(ctx.response.body, {
      status: ctx.response.status,
      statusText: ctx.response.statusText,
      headers,
    });
  };
}
