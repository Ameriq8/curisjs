/**
 * Core Kernel - Minimal Request/Response abstraction
 * Implements middleware chain with short-circuiting
 */

import { ContextImpl } from './context';
import { Router } from './router';
import type {
  App,
  AppOptions,
  Context,
  Environment,
  Handler,
  HTTPMethod,
  Middleware,
  Next,
  Plugin,
} from './types';

export class CurisApp implements App {
  private router = new Router();
  private globalMiddleware: Middleware[] = [];
  private config: Required<AppOptions>;

  constructor(options: AppOptions = {}) {
    this.config = {
      basePath: options.basePath || '',
      strict: options.strict || false,
      notFound: options.notFound || this.defaultNotFound,
      onError: options.onError || this.defaultErrorHandler,
    };
  }

  /**
   * Register global middleware
   */
  use(middleware: Middleware): App {
    this.globalMiddleware.push(middleware);
    return this;
  }

  /**
   * HTTP method helpers
   */
  get(path: string, handler: Handler): App {
    return this.addRoute('GET', path, handler);
  }

  post(path: string, handler: Handler): App {
    return this.addRoute('POST', path, handler);
  }

  put(path: string, handler: Handler): App {
    return this.addRoute('PUT', path, handler);
  }

  patch(path: string, handler: Handler): App {
    return this.addRoute('PATCH', path, handler);
  }

  delete(path: string, handler: Handler): App {
    return this.addRoute('DELETE', path, handler);
  }

  head(path: string, handler: Handler): App {
    return this.addRoute('HEAD', path, handler);
  }

  httpOptions(path: string, handler: Handler): App {
    return this.addRoute('OPTIONS', path, handler);
  }

  all(path: string, handler: Handler): App {
    const methods: HTTPMethod[] = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS'];
    for (const method of methods) {
      this.addRoute(method, path, handler);
    }
    return this;
  }

  /**
   * Mount sub-app at path prefix
   */
  route(_path: string, _subApp: App): App {
    // TODO: Implement sub-app mounting with path prefix
    // For now, throw to indicate future work
    throw new Error('Sub-app routing not yet implemented');
  }

  /**
   * Install plugin
   */
  plugin(plugin: Plugin, options?: unknown): App {
    plugin(this, options);
    return this;
  }

  /**
   * Main request handler (core entry point)
   */
  async fetch(request: Request, env: Environment = {}): Promise<Response> {
    try {
      // Create context
      const ctx = new ContextImpl(request, env);

      // Parse URL
      const url = new URL(request.url);
      let pathname = url.pathname;

      // Apply base path
      if (this.config.basePath) {
        if (!pathname.startsWith(this.config.basePath)) {
          const notFoundResult = await this.config.notFound(ctx);
          return notFoundResult || new Response('Not Found', { status: 404 });
        }
        pathname = pathname.slice(this.config.basePath.length) || '/';
      }

      // Find route
      const match = this.router.find(request.method as HTTPMethod, pathname);

      if (!match) {
        const notFoundResult = await this.config.notFound(ctx);
        return notFoundResult || new Response('Not Found', { status: 404 });
      }

      // Set route params
      ctx.params = match.params;

      // Build middleware chain
      const chain = [...this.globalMiddleware];

      // Add route handler as final middleware
      chain.push(async (ctx: Context) => {
        const result = await match.handler(ctx);
        if (result instanceof Response) {
          ctx.response = result;
        }
      });

      // Execute middleware chain
      await this.executeChain(ctx, chain, 0);

      // Return response
      return ctx.response || new Response('No response', { status: 500 });
    } catch (error) {
      // Error handling
      const ctx = new ContextImpl(request, env);
      return this.config.onError(error as Error, ctx);
    }
  }

  /**
   * Execute middleware chain with short-circuit support
   */
  private async executeChain(ctx: Context, chain: Middleware[], index: number): Promise<void> {
    // Base case: end of chain
    if (index >= chain.length) {
      return;
    }

    // Short-circuit if response already set
    if (ctx.response) {
      return;
    }

    const middleware = chain[index];
    if (!middleware) return;

    // Create next function
    const next: Next = async () => {
      await this.executeChain(ctx, chain, index + 1);
    };

    // Execute middleware
    const result = await middleware(ctx, next);

    // If middleware returned Response, set it (short-circuit)
    if (result instanceof Response) {
      ctx.response = result;
    }
  }

  /**
   * Add route to router
   */
  private addRoute(method: HTTPMethod, path: string, handler: Handler): App {
    // Don't prepend basePath - it's stripped during matching
    this.router.add(method, path, handler);
    return this;
  }

  /**
   * Default 404 handler
   */
  private defaultNotFound(_ctx: Context): Response {
    return new Response('Not Found', {
      status: 404,
      headers: { 'Content-Type': 'text/plain' },
    });
  }

  /**
   * Default error handler
   */
  private defaultErrorHandler(error: Error, _ctx: Context): Response {
    console.error('Unhandled error:', error);
    return new Response('Internal Server Error', {
      status: 500,
      headers: { 'Content-Type': 'text/plain' },
    });
  }

  /**
   * Detect the current runtime environment
   */
  private detectRuntime(): 'bun' | 'deno' | 'node' | 'worker' {
    // @ts-expect-error - Bun global
    if (typeof Bun !== 'undefined') return 'bun';
    // @ts-expect-error - Deno global
    if (typeof Deno !== 'undefined') return 'deno';
    if (typeof process !== 'undefined' && process.versions?.node) return 'node';
    return 'worker';
  }

  /**
   * Start server - Runtime agnostic
   * Automatically detects runtime and uses appropriate server
   */
  async listen(port: number = 3000, callback?: (port: number) => void): Promise<void> {
    const runtime = this.detectRuntime();

    switch (runtime) {
      case 'bun':
        return this.listenBun(port, callback);
      case 'deno':
        return this.listenDeno(port, callback);
      case 'node':
        return this.listenNode(port, callback);
      default:
        throw new Error(
          `Cannot start server in '${runtime}' runtime. Use the fetch() method directly or deploy to an edge platform.`
        );
    }
  }

  /**
   * Start Bun server
   */
  private async listenBun(port: number, callback?: (port: number) => void): Promise<void> {
    // @ts-expect-error - Bun global
    Bun.serve({
      port,
      fetch: (req: Request) => this.fetch(req),
    });

    if (callback) {
      callback(port);
    } else {
      console.log(`🚀 Server running on http://localhost:${port} (Bun)`);
    }

    // Keep process alive
    await new Promise(() => {
      // Bun handles this automatically
    });
  }

  /**
   * Start Deno server
   */
  private async listenDeno(port: number, callback?: (port: number) => void): Promise<void> {
    // @ts-expect-error - Deno global
    Deno.serve(
      {
        port,
        onListen: () => {
          if (callback) {
            callback(port);
          } else {
            console.log(`🚀 Server running on http://localhost:${port} (Deno)`);
          }
        },
      },
      (req: Request) => this.fetch(req)
    );
  }

  /**
   * Start Node.js server (requires Node 18+)
   */
  private async listenNode(port: number, callback?: (port: number) => void): Promise<void> {
    // Check for native fetch support (Node 18+)
    if (typeof globalThis.fetch === 'undefined') {
      throw new Error(
        'Node.js 18+ is required. For older versions, use the node adapter: import { serve } from "@curisjs/core/adapters/node"'
      );
    }

    // Use the adapter for Node.js
    const { serve } = await import('./adapters/node');
    await serve(this, {
      port,
      onListen: callback
        ? (p: number) => callback(p)
        : (p: number, h: string) => console.log(`🚀 Server running on http://${h}:${p} (Node.js)`),
    });
  }
}

/**
 * Factory function - main export
 */
export function createApp(options?: AppOptions): App {
  return new CurisApp(options);
}
