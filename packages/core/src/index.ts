/**
 * CurisJS Framework
 * High-performance, multi-runtime web framework built on Web Standards
 *
 * Inspired by Hono, optimized for speed and portability
 */

// Core exports
export { createApp, CurisApp } from './kernel';
export { Router } from './router';
export { ContextImpl, ValidationError } from './context';

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
export function createHandler(app: import('./types/index').App) {
  return {
    fetch: (request: Request, env?: import('./types/index').Environment) =>
      app.fetch(request, env),
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
} from './validation/index';

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
} from './foundation/index'; // Service Providers
export {
  RouteServiceProvider,
  MiddlewareServiceProvider,
  ConfigServiceProvider,
} from './providers/index';

// Facades
export { Route as RouteFacade, Config as ConfigFacade } from './facades/index';

// Response utilities
export { json, text, html, redirect, stream, sse } from './utils/response';

// Middleware
export { cors } from './middleware/cors';
export { logger } from './middleware/logger';
export { helmet } from './middleware/helmet';
export { rateLimiter } from './middleware/rate-limiter';
export { csrf } from './middleware/csrf';
export { sanitizer } from './middleware/sanitizer';
export { bodyParser } from './middleware/body-parser';
export { compression } from './middleware/compression';
export { session } from './middleware/session';
export { apiVersion } from './middleware/api-version';
export { 
  validator, 
  validateBody, 
  validateQuery, 
  validateParams, 
  validateHeaders 
} from './middleware/validator';

// Middleware Types
export type { HelmetOptions } from './middleware/helmet';
export type { RateLimiterOptions, RateLimitStore } from './middleware/rate-limiter';
export type { CSRFOptions } from './middleware/csrf';
export type { SanitizerOptions } from './middleware/sanitizer';
export type { BodyParserOptions } from './middleware/body-parser';
export type { CompressionOptions } from './middleware/compression';
export type { SessionOptions, SessionStore } from './middleware/session';
export type { APIVersionOptions } from './middleware/api-version';
export type { ValidatorOptions } from './middleware/validator';

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
} from './types/index';

export { MethodBitmask } from './types/index';
