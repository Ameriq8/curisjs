/**
 * Request timing middleware
 */

import type { Context, Next } from '@curisjs/core';

export async function requestTimer(ctx: Context, next: Next): Promise<void> {
  const start = Date.now();

  await next();

  const duration = Date.now() - start;

  // Add timing header to response
  if (ctx.response) {
    const headers = new Headers(ctx.response.headers);
    headers.set('X-Response-Time', `${duration}ms`);

    ctx.response = new Response(ctx.response.body, {
      status: ctx.response.status,
      statusText: ctx.response.statusText,
      headers,
    });
  }
}
