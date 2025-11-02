/**
 * Response utilities - convenience helpers for common response patterns
 * Zero-allocation where possible
 */

/**
 * JSON response helper
 */
export function json<T = unknown>(data: T, init?: ResponseInit): Response {
  const body = JSON.stringify(data);

  return new Response(body, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...init?.headers,
    },
  });
}

/**
 * Text response helper
 */
export function text(data: string, init?: ResponseInit): Response {
  return new Response(data, {
    ...init,
    headers: {
      'Content-Type': 'text/plain',
      ...init?.headers,
    },
  });
}

/**
 * HTML response helper
 */
export function html(data: string, init?: ResponseInit): Response {
  return new Response(data, {
    ...init,
    headers: {
      'Content-Type': 'text/html',
      ...init?.headers,
    },
  });
}

/**
 * Redirect response helper
 */
export function redirect(url: string, status: 301 | 302 | 303 | 307 | 308 = 302): Response {
  return new Response(null, {
    status,
    headers: {
      Location: url,
    },
  });
}

/**
 * Stream response helper
 */
export function stream(generator: () => ReadableStream<Uint8Array>, init?: ResponseInit): Response {
  return new Response(generator(), init);
}

/**
 * SSE (Server-Sent Events) helper
 */
export function sse(generator: () => ReadableStream<Uint8Array>): Response {
  return new Response(generator(), {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  });
}
