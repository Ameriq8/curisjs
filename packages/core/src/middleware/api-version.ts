/**
 * API Versioning Middleware
 * Handles API versioning through headers, URL path, or query parameters
 */

import type { Context, Middleware, Next } from '../types/index';
import { json } from '../utils/response';

export interface APIVersionOptions {
  /**
   * Versioning strategy
   * @default 'header'
   */
  strategy?: 'header' | 'path' | 'query' | 'accept';

  /**
   * Header name for version (when strategy is 'header')
   * @default 'api-version'
   */
  header?: string;

  /**
   * Query parameter name (when strategy is 'query')
   * @default 'version'
   */
  query?: string;

  /**
   * URL path prefix (when strategy is 'path')
   * @default '/v'
   */
  prefix?: string;

  /**
   * Default version if not specified
   * @default '1'
   */
  default?: string;

  /**
   * Supported versions
   * @default ['1']
   */
  versions?: string[];

  /**
   * Whether to require version to be specified
   * @default false
   */
  required?: boolean;

  /**
   * Custom error message for unsupported version
   */
  errorMessage?: string;
}

/**
 * API Version middleware
 *
 * @example
 * ```ts
 * import { apiVersion } from '@curisjs/core';
 *
 * // Header-based versioning
 * app.use(apiVersion({
 *   strategy: 'header',
 *   versions: ['1', '2', '3'],
 *   default: '1',
 * }));
 *
 * // Path-based versioning (/v1/users, /v2/users)
 * app.use(apiVersion({
 *   strategy: 'path',
 *   prefix: '/v',
 *   versions: ['1', '2'],
 * }));
 *
 * // Access version in route
 * app.get('/api/users', async (ctx) => {
 *   const version = ctx.state.apiVersion;
 *   if (version === '2') {
 *     // Return v2 response
 *   } else {
 *     // Return v1 response
 *   }
 * });
 * ```
 */
export function apiVersion(options: APIVersionOptions = {}): Middleware {
  const {
    strategy = 'header',
    header = 'api-version',
    query = 'version',
    prefix = '/v',
    default: defaultVersion = '1',
    versions = ['1'],
    required = false,
    errorMessage = 'Unsupported API version',
  } = options;

  return async (ctx: Context, next: Next) => {
    let version: string | null = null;

    // Extract version based on strategy
    switch (strategy) {
      case 'header':
        version = ctx.request.headers.get(header);
        break;

      case 'query':
        version = ctx.query(query);
        break;

      case 'path': {
        const url = new URL(ctx.request.url);
        const pathMatch = url.pathname.match(new RegExp(`^${prefix}(\\d+)`));
        if (pathMatch) {
          version = pathMatch[1] || null;
          // Remove version from path for downstream routing
          const newPath = url.pathname.replace(new RegExp(`^${prefix}\\d+`), '');
          ctx.state.originalPath = url.pathname;
          ctx.state.versionlessPath = newPath || '/';
        }
        break;
      }

      case 'accept': {
        const accept = ctx.request.headers.get('accept');
        if (accept) {
          const match = accept.match(/application\/vnd\..*\.v(\d+)\+json/);
          if (match) {
            version = match[1] || null;
          }
        }
        break;
      }
    }

    // Use default version if not specified
    if (!version) {
      if (required) {
        ctx.response = json({
          error: 'Bad Request',
          message: 'API version is required',
        }, { status: 400 });
        return;
      }
      version = defaultVersion;
    }

    // Validate version
    if (!versions.includes(version)) {
      ctx.response = json({
        error: 'Not Acceptable',
        message: errorMessage,
        supportedVersions: versions,
        requestedVersion: version,
      }, { status: 406 });
      return;
    }

    // Store version in context
    ctx.state.apiVersion = version;

    await next();

    // Add version to response headers
    if (ctx.response) {
      ctx.response.headers.set('API-Version', version);
    }
  };
}
