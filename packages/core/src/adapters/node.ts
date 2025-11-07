/**
 * Node.js Adapter
 * Maps Node's http.IncomingMessage → Web Standard Request
 * and Web Standard Response → http.ServerResponse
 *
 * This adapter is primarily for:
 * 1. Node.js versions < 18 (no native fetch/Request/Response)
 * 2. Advanced use cases requiring direct http module access
 * 3. Custom server configurations
 *
 * For Node.js 18+, you can use app.listen() directly without this adapter.
 *
 * @example
 * ```ts
 * // For Node.js < 18 or advanced use cases
 * import { createApp } from '@curisjs/core';
 * import { serve } from '@curisjs/core/adapters/node';
 *
 * const app = createApp();
 * app.get('/', () => new Response('Hello'));
 *
 * serve(app, { port: 3000 });
 * ```
 */

import type { Server, IncomingMessage, ServerResponse } from 'http';
import type { App, Environment } from '../types/index';

// Dynamic import for Node.js http module
const getHttp = async () => {
  return await import('http');
};

export interface NodeServerOptions {
  port?: number;
  hostname?: string;
  /**
   * Custom environment/context to pass to framework
   */
  env?: Environment;

  /**
   * Callback when server starts listening
   */
  onListen?: (port: number, hostname: string) => void;
}

/**
 * Create Node.js HTTP server from CurisJS app
 */
export async function serve(app: App, options: NodeServerOptions = {}): Promise<Server> {
  const { port = 3000, hostname = '0.0.0.0', env = {}, onListen } = options;

  const http = await getHttp();

  const server = http.createServer(async (req: IncomingMessage, res: ServerResponse) => {
    try {
      // Convert Node IncomingMessage → Web Standard Request
      const request = await nodeRequestToWebRequest(req);

      // Call framework
      const response = await app.fetch(request, env);

      // Convert Web Standard Response → Node ServerResponse
      await webResponseToNodeResponse(response, res);
    } catch (error) {
      console.error('Node adapter error:', error);
      if (!res.headersSent) {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('Internal Server Error');
      }
    }
  });

  server.listen(port, hostname, () => {
    if (onListen) {
      onListen(port, hostname);
    } else {
      console.log(`Server listening on http://${hostname}:${port}`);
    }
  });

  return server;
}

/**
 * Convert Node IncomingMessage to Web Standard Request
 * Minimizes copying and allocations
 */
async function nodeRequestToWebRequest(req: IncomingMessage): Promise<Request> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const protocol = (req.socket as any).encrypted ? 'https' : 'http';
  const host = req.headers.host || 'localhost';
  const url = `${protocol}://${host}${req.url}`;

  // Build headers
  const headers = new Headers();
  for (const [key, value] of Object.entries(req.headers)) {
    if (value !== undefined) {
      if (Array.isArray(value)) {
        for (const v of value) {
          headers.append(key, v);
        }
      } else if (typeof value === 'string') {
        headers.set(key, value);
      }
    }
  }

  // Handle body
  let body: ReadableStream<Uint8Array> | null = null;

  if (req.method !== 'GET' && req.method !== 'HEAD') {
    // Convert Node readable stream to Web ReadableStream
    body = nodeStreamToWebStream(req);
  }

  return new Request(url, {
    method: req.method,
    headers,
    body,
    // @ts-expect-error - duplex is needed for streaming
    duplex: 'half',
  });
}

/**
 * Convert Node readable stream to Web ReadableStream
 * Zero-copy where possible
 */
function nodeStreamToWebStream(nodeStream: IncomingMessage): ReadableStream<Uint8Array> {
  return new ReadableStream({
    start(controller) {
      nodeStream.on('data', (chunk: unknown) => {
        const buffer = chunk as { buffer: ArrayBuffer; byteOffset: number; byteLength: number };
        controller.enqueue(new Uint8Array(buffer.buffer, buffer.byteOffset, buffer.byteLength));
      });

      nodeStream.on('end', () => {
        controller.close();
      });

      nodeStream.on('error', (err: Error) => {
        controller.error(err);
      });
    },

    cancel() {
      nodeStream.destroy();
    },
  });
}

/**
 * Convert Web Standard Response to Node ServerResponse
 */
async function webResponseToNodeResponse(
  webResponse: Response,
  nodeResponse: ServerResponse
): Promise<void> {
  // Set status
  nodeResponse.statusCode = webResponse.status;

  // Set headers
  webResponse.headers.forEach((value, key) => {
    nodeResponse.setHeader(key, value);
  });

  // Handle body
  if (!webResponse.body) {
    nodeResponse.end();
    return;
  }

  // Stream response body
  const reader = webResponse.body.getReader();

  try {
    while (true) {
      const { done, value } = await reader.read();

      if (done) {
        nodeResponse.end();
        break;
      }

      // Write chunk
      if (!nodeResponse.write(value)) {
        // Backpressure: wait for drain
        await new Promise((resolve) => nodeResponse.once('drain', resolve));
      }
    }
  } catch (error) {
    reader.cancel();
    throw error;
  }
}

/**
 * Re-export createApp for convenience
 */
export { createApp } from '../index';
