/**
 * Middleware Service Provider
 * Registers middleware services
 */

import { ServiceProvider } from '../foundation/ServiceProvider';
import { cors } from '../middleware/cors';
import { logger } from '../middleware/logger';

export class MiddlewareServiceProvider extends ServiceProvider {
  override register(): void {
    // Register built-in middleware
    this.container.singleton('middleware.cors', () => cors);
    this.container.singleton('middleware.logger', () => logger);
  }

  override boot(): void {
    // Boot middleware services
  }
}
