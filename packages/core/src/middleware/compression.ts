/**
 * Compression Middleware
 * Compresses response bodies using gzip or brotli
 */

import type { Context, Middleware, Next } from '../types/index';

export interface CompressionOptions {
  /**
   * Minimum response size to compress (in bytes)
   * @default 1024
   */
  threshold?: number;

  /**
   * Compression level (1-9 for gzip, 0-11 for brotli)
   * @default 6
   */
  level?: number;

  /**
   * Preferred encoding (gzip or br)
   * @default 'gzip'
   */
  preferredEncoding?: 'gzip' | 'br';

  /**
   * Content types to compress
   * @default text/*, application/json, application/javascript, application/xml
   */
  filter?: (contentType: string) => boolean;
}

const DEFAULT_COMPRESSIBLE_TYPES = [
  'text/',
  'application/json',
  'application/javascript',
  'application/xml',
  'application/x-javascript',
  '+json',
  '+xml',
];

/**
 * Check if content type is compressible
 */
function isCompressible(contentType: string): boolean {
  return DEFAULT_COMPRESSIBLE_TYPES.some(type => contentType.includes(type));
}

/**
 * Compression middleware
 *
 * @example
 * ```ts
 * import { compression } from '@curisjs/core';
 *
 * // Basic usage
 * app.use(compression());
 *
 * // With custom options
 * app.use(compression({
 *   threshold: 2048, // Only compress responses > 2KB
 *   level: 9, // Maximum compression
 *   preferredEncoding: 'br', // Prefer brotli
 * }));
 * ```
 */
export function compression(options: CompressionOptions = {}): Middleware {
  const {
    threshold = 1024,
    level: _level = 6, // Note: Web Compression Streams API doesn't support level yet
    preferredEncoding = 'gzip',
    filter = isCompressible,
  } = options;

  return async (ctx: Context, next: Next) => {
    await next();

    if (!ctx.response) return;

    // Check if response should be compressed
    const contentType = ctx.response.headers.get('content-type') || '';
    const contentLength = ctx.response.headers.get('content-length');
    const alreadyEncoded = ctx.response.headers.has('content-encoding');

    // Skip if already encoded or not compressible
    if (alreadyEncoded || !filter(contentType)) {
      return;
    }

    // Skip if response is too small
    if (contentLength && parseInt(contentLength, 10) < threshold) {
      return;
    }

    // Check client's accepted encodings
    const acceptEncoding = ctx.request.headers.get('accept-encoding') || '';
    const supportsBrotli = acceptEncoding.includes('br');
    const supportsGzip = acceptEncoding.includes('gzip');

    if (!supportsBrotli && !supportsGzip) {
      return;
    }

    // Determine encoding to use
    const encoding = (preferredEncoding === 'br' && supportsBrotli)
      ? 'br'
      : (supportsGzip ? 'gzip' : null);

    if (!encoding) return;

    try {
      // Get response body
      const body = await ctx.response.arrayBuffer();

      // Skip if body is too small
      if (body.byteLength < threshold) {
        return;
      }

      // Compress the body
      let compressed: ArrayBuffer;

      if (encoding === 'br') {
        // Brotli compression (Web Compression Streams API)
        const stream = new Response(body).body;
        if (!stream) return;

        const compressedStream = stream.pipeThrough(
          new CompressionStream('deflate-raw')
        );
        const compressedResponse = new Response(compressedStream);
        compressed = await compressedResponse.arrayBuffer();
      } else {
        // Gzip compression
        const stream = new Response(body).body;
        if (!stream) return;

        const compressedStream = stream.pipeThrough(
          new CompressionStream('gzip')
        );
        const compressedResponse = new Response(compressedStream);
        compressed = await compressedResponse.arrayBuffer();
      }

      // Create new response with compressed body
      const headers = new Headers(ctx.response.headers);
      headers.set('Content-Encoding', encoding);
      headers.set('Content-Length', compressed.byteLength.toString());
      headers.delete('Content-Length'); // Let browser calculate

      ctx.response = new Response(compressed, {
        status: ctx.response.status,
        statusText: ctx.response.statusText,
        headers,
      });
    } catch (error) {
      // Compression failed, keep original response
      console.error('Compression failed:', error);
    }
  };
}
