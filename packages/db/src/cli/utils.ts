/**
 * CLI utilities and helpers
 */

import { promises as fs } from 'node:fs';
import { resolve } from 'node:path';
import type { Knex } from 'knex';

/**
 * Load database configuration
 */
export async function loadDatabaseConfig(): Promise<any> {
  const configPaths = [
    'curisdb.config.ts',
    'curisdb.config.js',
    'database.config.ts',
    'database.config.js',
  ];

  for (const configPath of configPaths) {
    const fullPath = resolve(process.cwd(), configPath);
    try {
      await fs.access(fullPath);
      const config = await import(fullPath);
      return config.default || config;
    } catch {
      continue;
    }
  }

  throw new Error('Database configuration file not found. Please create curisdb.config.ts');
}

/**
 * Create database instance from configuration
 */
export async function createDatabaseInstance(): Promise<Knex> {
  const config = await loadDatabaseConfig();
  const { createDatabase } = await import('../connection');
  return createDatabase(config.connection || config);
}

/**
 * Get current timestamp for migrations/seeders
 */
export function getTimestamp(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hour = String(now.getHours()).padStart(2, '0');
  const minute = String(now.getMinutes()).padStart(2, '0');
  const second = String(now.getSeconds()).padStart(2, '0');

  return `${year}${month}${day}${hour}${minute}${second}`;
}

/**
 * Convert string to snake_case
 */
export function toSnakeCase(str: string): string {
  return str
    .replace(/([A-Z])/g, '_$1')
    .toLowerCase()
    .replace(/^_/, '')
    .replace(/\s+/g, '_');
}

/**
 * Convert string to PascalCase
 */
export function toPascalCase(str: string): string {
  return str
    .split(/[-_\s]+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join('');
}

/**
 * Ensure directory exists
 */
export async function ensureDirectory(path: string): Promise<void> {
  await fs.mkdir(path, { recursive: true });
}
