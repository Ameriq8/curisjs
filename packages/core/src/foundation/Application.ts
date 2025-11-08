/**
 * Application - Laravel-like Application Container
 * Central hub for the framework with service provider support
 */

import { Container } from './Container';
import { ServiceProvider } from './ServiceProvider';
import { Env, loadEnv } from './Env';
import type { Constructor } from './Container';

export interface ApplicationConfig {
  basePath?: string;
  env?: string;
  debug?: boolean;
  loadEnv?: boolean;
  envPath?: string;
}

export class Application {
  public readonly container: Container;
  public readonly basePath: string;
  public readonly env: string;
  public readonly debug: boolean;

  private providers: ServiceProvider[] = [];
  private booted = false;
  private registered = false;

  constructor(config: ApplicationConfig = {}) {
    this.container = new Container();
    this.basePath = config.basePath || process.cwd();

    // Load .env file if requested
    if (config.loadEnv !== false) {
      loadEnv({
        path: config.envPath,
        defaults: {
          NODE_ENV: 'development',
          APP_DEBUG: 'true',
        },
      });
    }

    this.env = config.env || Env.get('NODE_ENV') || 'development';
    this.debug = config.debug ?? Env.getBool('APP_DEBUG', this.env === 'development');

    // Register self in container
    this.container.instance('app', this);
    this.container.instance('Application', this);
  }

  /**
   * Register a service provider
   */
  register(provider: Constructor<ServiceProvider> | ServiceProvider): this {
    const instance = provider instanceof ServiceProvider ? provider : new provider(this);

    this.providers.push(instance);

    if (this.registered) {
      // If already registered, register this provider immediately
      instance.register();
    }

    return this;
  }

  /**
   * Register all service providers
   */
  async registerProviders(): Promise<void> {
    if (this.registered) return;

    for (const provider of this.providers) {
      await provider.register();
    }

    this.registered = true;
  }

  /**
   * Boot all service providers
   */
  async boot(): Promise<void> {
    if (this.booted) return;

    // Ensure providers are registered first
    await this.registerProviders();

    // Boot all providers
    for (const provider of this.providers) {
      await provider.boot();
    }

    this.booted = true;
  }

  /**
   * Make an instance from the container
   */
  make<T>(abstract: string | symbol): T {
    return this.container.make<T>(abstract);
  }

  /**
   * Bind a service to the container
   */
  bind(abstract: string | symbol, concrete?: unknown, singleton = false): this {
    this.container.bind(abstract, concrete as never, singleton);
    return this;
  }

  /**
   * Bind a singleton service
   */
  singleton(abstract: string | symbol, concrete?: unknown): this {
    this.container.singleton(abstract, concrete as never);
    return this;
  }

  /**
   * Get environment
   */
  isProduction(): boolean {
    return this.env === 'production';
  }

  isDevelopment(): boolean {
    return this.env === 'development';
  }

  isTesting(): boolean {
    return this.env === 'test';
  }

  /**
   * Get path relative to base path
   */
  path(path: string = ''): string {
    return `${this.basePath}/${path}`.replace(/\/+/g, '/');
  }

  /**
   * Terminate the application
   */
  async terminate(): Promise<void> {
    // Cleanup logic here
    this.container.flush();
  }
}
