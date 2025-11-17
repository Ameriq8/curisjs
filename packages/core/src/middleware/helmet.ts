/**
 * Helmet Middleware
 * Sets security-related HTTP headers to protect against common vulnerabilities
 */

import type { Context, Middleware, Next } from '../types/index';

export interface HelmetOptions {
  /**
   * Controls the Content-Security-Policy header
   * @default true
   */
  contentSecurityPolicy?: boolean | {
    directives?: Record<string, string[]>;
    reportOnly?: boolean;
  };

  /**
   * Controls the X-DNS-Prefetch-Control header
   * @default true
   */
  dnsPrefetchControl?: boolean | { allow?: boolean };

  /**
   * Controls the Expect-CT header
   * @default false
   */
  expectCt?: boolean | {
    maxAge?: number;
    enforce?: boolean;
    reportUri?: string;
  };

  /**
   * Controls the X-Frame-Options header
   * @default true
   */
  frameguard?: boolean | { action?: 'deny' | 'sameorigin' };

  /**
   * Controls the X-Powered-By header removal
   * @default true
   */
  hidePoweredBy?: boolean;

  /**
   * Controls the Strict-Transport-Security header
   * @default true
   */
  hsts?: boolean | {
    maxAge?: number;
    includeSubDomains?: boolean;
    preload?: boolean;
  };

  /**
   * Controls the X-Download-Options header
   * @default true
   */
  ieNoOpen?: boolean;

  /**
   * Controls the X-Content-Type-Options header
   * @default true
   */
  noSniff?: boolean;

  /**
   * Controls the Origin-Agent-Cluster header
   * @default true
   */
  originAgentCluster?: boolean;

  /**
   * Controls the X-Permitted-Cross-Domain-Policies header
   * @default true
   */
  permittedCrossDomainPolicies?: boolean | { permittedPolicies?: string };

  /**
   * Controls the Referrer-Policy header
   * @default true
   */
  referrerPolicy?: boolean | { policy?: string | string[] };

  /**
   * Controls the X-XSS-Protection header
   * @default true
   */
  xssFilter?: boolean;
}

const DEFAULT_OPTIONS: Required<HelmetOptions> = {
  contentSecurityPolicy: true,
  dnsPrefetchControl: true,
  expectCt: false,
  frameguard: true,
  hidePoweredBy: true,
  hsts: true,
  ieNoOpen: true,
  noSniff: true,
  originAgentCluster: true,
  permittedCrossDomainPolicies: true,
  referrerPolicy: true,
  xssFilter: true,
};

/**
 * Helmet middleware for setting security headers
 *
 * @example
 * ```ts
 * import { helmet } from '@curisjs/core';
 *
 * app.use(helmet());
 *
 * // With custom options
 * app.use(helmet({
 *   contentSecurityPolicy: {
 *     directives: {
 *       defaultSrc: ["'self'"],
 *       styleSrc: ["'self'", "'unsafe-inline'"],
 *     }
 *   }
 * }));
 * ```
 */
export function helmet(options: HelmetOptions = {}): Middleware {
  const config = { ...DEFAULT_OPTIONS, ...options };

  return async (ctx: Context, next: Next) => {
    const headers = new Headers();

    // Content Security Policy
    if (config.contentSecurityPolicy) {
      if (typeof config.contentSecurityPolicy === 'boolean') {
        headers.set(
          'Content-Security-Policy',
          "default-src 'self';base-uri 'self';font-src 'self' https: data:;form-action 'self';frame-ancestors 'self';img-src 'self' data:;object-src 'none';script-src 'self';script-src-attr 'none';style-src 'self' https: 'unsafe-inline';upgrade-insecure-requests"
        );
      } else {
        const directives = config.contentSecurityPolicy.directives || {};
        const policy = Object.entries(directives)
          .map(([key, values]) => `${key} ${values.join(' ')}`)
          .join(';');

        const headerName = config.contentSecurityPolicy.reportOnly
          ? 'Content-Security-Policy-Report-Only'
          : 'Content-Security-Policy';

        headers.set(headerName, policy);
      }
    }

    // DNS Prefetch Control
    if (config.dnsPrefetchControl) {
      const allow = typeof config.dnsPrefetchControl === 'boolean'
        ? false
        : config.dnsPrefetchControl.allow ?? false;
      headers.set('X-DNS-Prefetch-Control', allow ? 'on' : 'off');
    }

    // Expect-CT
    if (config.expectCt && typeof config.expectCt === 'object') {
      const parts: string[] = [];
      if (config.expectCt.maxAge !== undefined) {
        parts.push(`max-age=${config.expectCt.maxAge}`);
      }
      if (config.expectCt.enforce) {
        parts.push('enforce');
      }
      if (config.expectCt.reportUri) {
        parts.push(`report-uri="${config.expectCt.reportUri}"`);
      }
      if (parts.length > 0) {
        headers.set('Expect-CT', parts.join(', '));
      }
    }

    // X-Frame-Options
    if (config.frameguard) {
      const action = typeof config.frameguard === 'boolean'
        ? 'SAMEORIGIN'
        : (config.frameguard.action === 'deny' ? 'DENY' : 'SAMEORIGIN');
      headers.set('X-Frame-Options', action);
    }

    // Remove X-Powered-By
    if (config.hidePoweredBy) {
      headers.delete('X-Powered-By');
    }

    // Strict-Transport-Security
    if (config.hsts) {
      const maxAge = typeof config.hsts === 'boolean'
        ? 15552000
        : config.hsts.maxAge ?? 15552000;

      const includeSubDomains = typeof config.hsts === 'boolean'
        ? true
        : config.hsts.includeSubDomains ?? true;

      const preload = typeof config.hsts === 'boolean'
        ? false
        : config.hsts.preload ?? false;

      let value = `max-age=${maxAge}`;
      if (includeSubDomains) value += '; includeSubDomains';
      if (preload) value += '; preload';

      headers.set('Strict-Transport-Security', value);
    }

    // X-Download-Options
    if (config.ieNoOpen) {
      headers.set('X-Download-Options', 'noopen');
    }

    // X-Content-Type-Options
    if (config.noSniff) {
      headers.set('X-Content-Type-Options', 'nosniff');
    }

    // Origin-Agent-Cluster
    if (config.originAgentCluster) {
      headers.set('Origin-Agent-Cluster', '?1');
    }

    // X-Permitted-Cross-Domain-Policies
    if (config.permittedCrossDomainPolicies) {
      const policy = typeof config.permittedCrossDomainPolicies === 'boolean'
        ? 'none'
        : config.permittedCrossDomainPolicies.permittedPolicies ?? 'none';
      headers.set('X-Permitted-Cross-Domain-Policies', policy);
    }

    // Referrer-Policy
    if (config.referrerPolicy) {
      const policy = typeof config.referrerPolicy === 'boolean'
        ? 'no-referrer'
        : Array.isArray(config.referrerPolicy.policy)
          ? config.referrerPolicy.policy.join(',')
          : config.referrerPolicy.policy ?? 'no-referrer';
      headers.set('Referrer-Policy', policy);
    }

    // X-XSS-Protection
    if (config.xssFilter) {
      headers.set('X-XSS-Protection', '0');
    }

    // Apply headers to response
    await next();

    // Merge headers with response
    if (ctx.response) {
      headers.forEach((value, key) => {
        if (!ctx.response!.headers.has(key)) {
          ctx.response!.headers.set(key, value);
        }
      });
    }
  };
}
