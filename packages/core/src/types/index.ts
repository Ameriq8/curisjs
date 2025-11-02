/**
 * Core types for CurisJS Framework
 * Minimal, standards-first type definitions
 */

/** HTTP methods supported by the router */
export type HTTPMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'HEAD' | 'OPTIONS';

/** Numeric representation for fast method matching */
export const enum MethodBitmask {
  GET = 1 << 0, // 1
  POST = 1 << 1, // 2
  PUT = 1 << 2, // 4
  PATCH = 1 << 3, // 8
  DELETE = 1 << 4, // 16
  HEAD = 1 << 5, // 32
  OPTIONS = 1 << 6, // 64
  ALL = (1 << 7) - 1, // 127
}

/** Route parameters extracted from path */
export type RouteParams = Record<string, string>;

/** Context state - user-defined data passed through middleware chain */
export type ContextState = Record<string, unknown>;

/** Environment variables (for edge runtimes) */
export type Environment = Record<string, unknown>;

/** Handler function - processes request and returns response */
export type Handler<State extends ContextState = ContextState> = (
  ctx: Context<State>
) => Response | Promise<Response> | void | Promise<void>;

/** Middleware function - can modify context or return early response */
export type Middleware<State extends ContextState = ContextState> = (
  ctx: Context<State>,
  next: Next
) => Response | Promise<Response> | void | Promise<void> | Promise<Response | void>;

/** Next function in middleware chain */
export type Next = () => Promise<void>;

/** Context object - single source of request/response state */
export interface Context<State extends ContextState = ContextState> {
  /** Standard Request object */
  readonly request: Request;

  /** Route parameters (e.g., /users/:id → { id: "123" }) */
  params: RouteParams;

  /** Environment variables (Cloudflare Workers, etc.) */
  env: Environment;

  /** User state passed through middleware */
  state: State;

  /** Finalized response (set by handler) */
  response?: Response;

  // Convenience methods

  /** Get request body as JSON */
  json<T = unknown>(): Promise<T>;

  /** Get request body as text */
  text(): Promise<string>;

  /** Get request body as FormData */
  formData(): Promise<FormData>;

  /** Get header value */
  header(name: string): string | null;

  /** Get query parameter */
  query(name: string): string | null;

  /** Get all query parameters */
  queries(): Record<string, string | string[]>;

  /** Validate request body using schema */
  validate<_T = unknown>(schema: unknown): Promise<unknown>;

  /** Validate and throw on error */
  validateOrFail<T>(schema: unknown): Promise<T>;
}

/** Route definition stored in router */
export interface Route {
  method: HTTPMethod;
  path: string;
  handler: Handler;
  params: string[]; // param names in order
}

/** Router match result */
export interface RouteMatch {
  handler: Handler;
  params: RouteParams;
}

/** App configuration options */
export interface AppOptions {
  /** Base path for all routes */
  basePath?: string;

  /** Enable strict routing (trailing slashes matter) */
  strict?: boolean;

  /** Custom 404 handler */
  notFound?: Handler;

  /** Custom error handler */
  onError?: (error: Error, ctx: Context) => Response | Promise<Response>;
}

/** Plugin function for extending framework */
export type Plugin = (app: App, options?: unknown) => void | Promise<void>;

/** Main application interface */
export interface App {
  /** Register global middleware */
  use(middleware: Middleware): App;

  /** Register route handler */
  get(path: string, handler: Handler): App;
  post(path: string, handler: Handler): App;
  put(path: string, handler: Handler): App;
  patch(path: string, handler: Handler): App;
  delete(path: string, handler: Handler): App;
  head(path: string, handler: Handler): App;
  httpOptions(path: string, handler: Handler): App;

  /** Register handler for all methods */
  all(path: string, handler: Handler): App;

  /** Mount sub-app at path */
  route(path: string, subApp: App): App;

  /** Install plugin */
  plugin(plugin: Plugin, options?: unknown): App;

  /** Handle incoming request (main entry point) */
  fetch(request: Request, env?: Environment): Promise<Response>;
}
