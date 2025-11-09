/**
 * @curisjs/db - Migrations
 * Export all migration utilities
 */

export * from './types';
export * from './tracker';
export * from './runner';
export * from './generator';

import type { Knex } from 'knex';
import { MigrationRunner } from './runner';
import { MigrationGenerator } from './generator';
import type { MigrationConfig } from './types';

/**
 * Default migration configuration
 */
export const defaultMigrationConfig: MigrationConfig = {
  directory: './migrations',
  tableName: 'migrations',
  extension: '.ts',
  disableTransactions: false,
};

/**
 * Create migration runner
 */
export function createMigrationRunner(
  db: Knex,
  config: Partial<MigrationConfig> = {}
): MigrationRunner {
  return new MigrationRunner(db, { ...defaultMigrationConfig, ...config });
}

/**
 * Create migration generator
 */
export function createMigrationGenerator(
  config: Partial<MigrationConfig> = {}
): MigrationGenerator {
  return new MigrationGenerator({ ...defaultMigrationConfig, ...config });
}

/**
 * Helper to run migrations
 */
export async function migrate(db: Knex, config: Partial<MigrationConfig> = {}): Promise<string[]> {
  const runner = createMigrationRunner(db, config);
  return await runner.up();
}

/**
 * Helper to rollback migrations
 */
export async function rollback(
  db: Knex,
  steps: number = 1,
  config: Partial<MigrationConfig> = {}
): Promise<string[]> {
  const runner = createMigrationRunner(db, config);
  return await runner.down(steps);
}

/**
 * Helper to get migration status
 */
export async function getMigrationStatus(db: Knex, config: Partial<MigrationConfig> = {}) {
  const runner = createMigrationRunner(db, config);
  return await runner.status();
}
