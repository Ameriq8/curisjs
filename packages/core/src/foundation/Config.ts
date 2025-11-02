/**
 * Configuration Repository - Laravel-like Config
 * Manages application configuration with dot notation access
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

export class Config {
  private items: Map<string, any> = new Map();

  /**
   * Set a configuration value
   */
  set(key: string, value: any): void {
    const keys = key.split('.');

    if (keys.length === 1) {
      this.items.set(key, value);
      return;
    }

    const [first, ...rest] = keys;
    if (!first) return;

    const config: any = this.items.get(first) || {};

    let current: any = config;
    for (let i = 0; i < rest.length - 1; i++) {
      const k = rest[i];
      if (!k) continue;
      if (!current[k]) {
        current[k] = {};
      }
      current = current[k];
    }

    const lastKey = rest[rest.length - 1];
    if (lastKey) {
      current[lastKey] = value;
    }
    this.items.set(first, config);
  }

  /**
   * Get a configuration value
   */
  get<T = any>(key: string, defaultValue?: T): T | undefined {
    const keys = key.split('.');
    const [first, ...rest] = keys;

    if (!first) return defaultValue;

    let value: any = this.items.get(first);

    if (value === undefined) {
      return defaultValue;
    }

    for (const k of rest) {
      if (!k || value === undefined || value === null) {
        return defaultValue;
      }
      value = value[k];
    }

    return (value === undefined ? defaultValue : value) as T | undefined;
  }

  /**
   * Check if a configuration key exists
   */
  has(key: string): boolean {
    return this.get(key) !== undefined;
  }

  /**
   * Get all configuration
   */
  all(): Record<string, any> {
    const result: Record<string, any> = {};
    for (const [key, value] of this.items) {
      result[key] = value;
    }
    return result;
  }

  /**
   * Load configuration from object
   */
  load(config: Record<string, any>): void {
    for (const [key, value] of Object.entries(config)) {
      this.items.set(key, value);
    }
  }

  /**
   * Clear all configuration
   */
  clear(): void {
    this.items.clear();
  }
}

/**
 * Helper function to create config instance
 */
export function createConfig(initial: Record<string, any> = {}): Config {
  const config = new Config();
  config.load(initial);
  return config;
}
