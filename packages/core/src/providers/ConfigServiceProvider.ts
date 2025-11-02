/**
 * Config Service Provider
 * Registers configuration services
 */

import { ServiceProvider } from '../foundation/ServiceProvider';
import { createConfig } from '../foundation/Config';

export class ConfigServiceProvider extends ServiceProvider {
  override register(): void {
    // Register config singleton
    this.container.singleton('config', () => {
      return createConfig({
        app: {
          name: 'CurisJS',
          env: this.app.env,
          debug: this.app.debug,
        },
      });
    });
  }

  override boot(): void {
    // Config is ready
  }
}
