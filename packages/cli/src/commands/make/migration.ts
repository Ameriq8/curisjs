/**
 * Make migration command
 */

import { success, error as showError } from '../../utils.js';

export async function runMakeMigration(args: string[]) {
  const name = args[0];

  if (!name) {
    showError('Migration name is required');
    console.log('Usage: curis make:migration <name>');
    process.exit(1);
  }

  try {
    const { createMigrationGenerator } = await import('@curisjs/db');
    const { loadDatabaseConfig } = await import('../../utils.js');

    const config = await loadDatabaseConfig();
    const generator = createMigrationGenerator(config.migrations as never);

    const filePath = await generator.createMigration(name);
    success(`Created migration: ${filePath}`);
    process.exit(0);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    showError(`Failed to create migration: ${message}`);
    process.exit(1);
  }
}
