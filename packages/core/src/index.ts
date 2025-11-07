/**
 * CurisJS Framework
 * High-performance, multi-runtime web framework built on Web Standards
 *
 * Inspired by Hono, optimized for speed and portability
 */

// Core exports
export { createApp, CurisApp } from './kernel.js';
export { Router } from './router.js';
export { ContextImpl, ValidationError } from './context.js';

/**
 * Create handler for edge runtimes (Cloudflare Workers, Vercel Edge, etc.)
 * @example
 * ```ts
 * // worker.ts
 * import { createApp, createHandler } from '@curisjs/core';
 *
 * const app = createApp();
 * app.get('/', (ctx) => new Response('Hello World'));
 *
 * export default createHandler(app);
 * ```
 */
export function createHandler(app: import('./types/index.js').App) {
  return {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    fetch: (request: Request, env?: any) => app.fetch(request, env),
  };
}

// Validation exports (Zod-like schema validation)
export {
  z,
  Schema,
  StringSchema,
  NumberSchema,
  BooleanSchema,
  DateSchema,
  ArraySchema,
  ObjectSchema,
  EnumSchema,
  CoerceSchema,
  SchemaValidationError,
  type ValidationIssue,
  type ValidationSuccess,
  type ValidationResult,
} from './validation/index.js';

// Foundation exports (Laravel-like architecture)
export {
  Container,
  ServiceProvider,
  Application,
  Config,
  createConfig,
  Facade,
  createFacade,
  Env,
  loadEnv,
  env,
  type Constructor,
  type Factory,
  type Binding,
  type ApplicationConfig,
  type EnvOptions,
  container,
} from './foundation/index.js'; // Service Providers
export {
  RouteServiceProvider,
  MiddlewareServiceProvider,
  ConfigServiceProvider,
} from './providers/index.js';

// Facades
export { Route as RouteFacade, Config as ConfigFacade } from './facades/index.js';

// Response utilities
export { json, text, html, redirect, stream, sse } from './utils/response.js';

// Middleware
export { cors } from './middleware/cors.js';
export { logger } from './middleware/logger.js';

// Types
export type {
  App,
  AppOptions,
  Context,
  ContextState,
  Environment,
  Handler,
  HTTPMethod,
  Middleware,
  Next,
  Plugin,
  Route,
  RouteMatch,
  RouteParams,
} from './types/index.js';

export { MethodBitmask } from './types/index.js';
