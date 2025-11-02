/**
 * Context implementation - minimal per-request state container
 * Zero-allocation getters where possible
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

import type { Context, ContextState, Environment, RouteParams } from './types/index';
import type { Schema, ValidationResult } from './validation/schema';
import { SchemaValidationError } from './validation/schema';

export class ContextImpl<State extends ContextState = ContextState> implements Context<State> {
  params: RouteParams = {};
  env: Environment;
  state: State;
  response?: Response;

  // Cache parsed URL for query parameter access
  private _url?: URL;

  constructor(
    public readonly request: Request,
    env: Environment = {},
    state?: State
  ) {
    this.env = env;
    this.state = (state || {}) as State;
  }

  // Lazy URL parsing
  private get url(): URL {
    if (!this._url) {
      this._url = new URL(this.request.url);
    }
    return this._url;
  }

  async json<T = unknown>(): Promise<T> {
    return this.request.json() as Promise<T>;
  }

  async text(): Promise<string> {
    return this.request.text();
  }

  async formData(): Promise<FormData> {
    return this.request.formData();
  }

  header(name: string): string | null {
    return this.request.headers.get(name);
  }

  query(name: string): string | null {
    return this.url.searchParams.get(name);
  }

  queries(): Record<string, string | string[]> {
    const result: Record<string, string | string[]> = {};

    this.url.searchParams.forEach((value, key) => {
      const existing = result[key];
      if (existing === undefined) {
        result[key] = value;
      } else if (Array.isArray(existing)) {
        existing.push(value);
      } else {
        result[key] = [existing, value];
      }
    });

    return result;
  }

  /**
   * Validate request body data using schema
   */
  async validate<T>(schema: Schema<any, T>): Promise<ValidationResult<T>> {
    const data = await this.json();
    return schema.safeParse(data);
  }

  /**
   * Validate and throw on error
   */
  async validateOrFail<T>(schema: Schema<any, T>): Promise<T> {
    const data = await this.json();
    return schema.parse(data);
  }
}

/**
 * Re-export SchemaValidationError as ValidationError for backwards compatibility
 */
export { SchemaValidationError as ValidationError };
