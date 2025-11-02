/**
 * Environment Configuration Loader
 * Loads and parses .env files with Laravel-like API
 */

import { readFileSync, existsSync } from 'fs';
import { resolve } from 'path';

export interface EnvOptions {
  path?: string;
  override?: boolean;
  defaults?: Record<string, string>;
}

export class Env {
  private static loaded = false;
  private static values: Record<string, string> = {};

  /**
   * Load environment variables from .env file
   */
  static load(options: EnvOptions = {}): void {
    if (this.loaded && !options.override) {
      return;
    }

    const envPath = options.path || resolve(process.cwd(), '.env');

    // Load defaults first
    if (options.defaults) {
      this.values = { ...options.defaults };
    }

    // Load from process.env
    Object.entries(process.env).forEach(([key, value]) => {
      if (value !== undefined) {
        this.values[key] = value;
      }
    });

    // Load from .env file if it exists
    if (existsSync(envPath)) {
      try {
        const envContent = readFileSync(envPath, 'utf-8');
        const parsed = this.parse(envContent);

        // Merge with existing values
        this.values = { ...this.values, ...parsed };

        // Update process.env if override is true
        if (options.override) {
          Object.assign(process.env, parsed);
        }
      } catch (error) {
        console.error(`Failed to load .env file from ${envPath}:`, error);
      }
    }

    this.loaded = true;
  }

  /**
   * Parse .env file content
   */
  private static parse(content: string): Record<string, string> {
    const result: Record<string, string> = {};
    const lines = content.split('\n');

    for (const line of lines) {
      // Skip empty lines and comments
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) {
        continue;
      }

      // Parse key=value
      const match = trimmed.match(/^([^=]+)=(.*)$/);
      if (match) {
        const key = match[1]?.trim();
        let value = match[2]?.trim() || '';

        if (!key) continue;

        // Remove quotes if present
        if (
          (value.startsWith('"') && value.endsWith('"')) ||
          (value.startsWith("'") && value.endsWith("'"))
        ) {
          value = value.slice(1, -1);
        }

        // Handle escaped characters
        value = value
          .replace(/\\n/g, '\n')
          .replace(/\\r/g, '\r')
          .replace(/\\t/g, '\t')
          .replace(/\\\\/g, '\\');

        result[key] = value;
      }
    }

    return result;
  }

  /**
   * Get an environment variable
   */
  static get(key: string, defaultValue?: string): string | undefined {
    return this.values[key] ?? defaultValue;
  }

  /**
   * Get an environment variable as a required value
   */
  static getOrFail(key: string): string {
    const value = this.get(key);
    if (value === undefined) {
      throw new Error(`Environment variable ${key} is required but not set`);
    }
    return value;
  }

  /**
   * Get an environment variable as a boolean
   */
  static getBool(key: string, defaultValue = false): boolean {
    const value = this.get(key);
    if (value === undefined) return defaultValue;

    return ['true', '1', 'yes', 'on'].includes(value.toLowerCase());
  }

  /**
   * Get an environment variable as a number
   */
  static getNumber(key: string, defaultValue?: number): number | undefined {
    const value = this.get(key);
    if (value === undefined) return defaultValue;

    const num = Number(value);
    return isNaN(num) ? defaultValue : num;
  }

  /**
   * Get an environment variable as an array (comma-separated)
   */
  static getArray(key: string, defaultValue: string[] = []): string[] {
    const value = this.get(key);
    if (!value) return defaultValue;

    return value
      .split(',')
      .map((v) => v.trim())
      .filter(Boolean);
  }

  /**
   * Check if an environment variable is set
   */
  static has(key: string): boolean {
    return key in this.values;
  }

  /**
   * Set an environment variable
   */
  static set(key: string, value: string): void {
    this.values[key] = value;
    process.env[key] = value;
  }

  /**
   * Get all environment variables
   */
  static all(): Record<string, string> {
    return { ...this.values };
  }

  /**
   * Clear all loaded environment variables
   */
  static clear(): void {
    this.values = {};
    this.loaded = false;
  }
}

/**
 * Helper function to load .env file
 */
export function loadEnv(options?: EnvOptions): void {
  Env.load(options);
}

/**
 * Helper function to get environment variable
 */
export function env(key: string, defaultValue?: string): string | undefined {
  return Env.get(key, defaultValue);
}
