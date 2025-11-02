/**
 * Service Provider - Laravel-like Service Provider
 * Base class for registering and bootstrapping services
 */

import type { Container } from './Container';
import type { Application } from './Application';

export abstract class ServiceProvider {
  constructor(protected app: Application) {}

  /**
   * Register any application services
   * This is called before boot()
   */
  register(): void | Promise<void> {
    // Override in subclasses
  }

  /**
   * Bootstrap any application services
   * This is called after all providers have been registered
   */
  boot(): void | Promise<void> {
    // Override in subclasses
  }

  /**
   * Get the container instance
   */
  protected get container(): Container {
    return this.app.container;
  }
}
