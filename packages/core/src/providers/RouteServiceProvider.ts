/**
 * Route Service Provider
 * Registers routes and routing services
 */

import { ServiceProvider } from '../foundation/ServiceProvider';
import type { App } from '../types/index';

export class RouteServiceProvider extends ServiceProvider {
  protected routes?: App;

  override register(): void {
    // Register router if not already registered
    if (!this.container.bound('router')) {
      this.container.singleton('router', () => {
        return this.routes || null;
      });
    }
  }

  override boot(): void {
    // Boot routing - load route files here
  }

  /**
   * Set the routes
   */
  setRoutes(routes: App): void {
    this.routes = routes;
  }
}
