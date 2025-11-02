/**
 * Config Facade
 * Provides static-like access to configuration
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

import { Facade } from '../foundation/Facade';
import type { Config as ConfigClass } from '../foundation/Config';

class ConfigFacade extends Facade {
  protected static override getFacadeAccessor(): string {
    return 'config';
  }

  static get<T = any>(key: string, defaultValue?: T): T | undefined {
    const config = this.resolveFacadeInstance() as ConfigClass;
    return config.get(key, defaultValue);
  }

  static set(key: string, value: unknown): void {
    const config = this.resolveFacadeInstance() as ConfigClass;
    config.set(key, value);
  }

  static has(key: string): boolean {
    const config = this.resolveFacadeInstance() as ConfigClass;
    return config.has(key);
  }

  static all(): Record<string, any> {
    const config = this.resolveFacadeInstance() as ConfigClass;
    return config.all();
  }
}

export const Config = ConfigFacade as any;
