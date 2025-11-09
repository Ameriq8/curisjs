/**
 * @curisjs/db - Seeders
 * Export all seeder utilities
 */

export * from './types';
export * from './factory';
export * from './runner';

import type { Knex } from 'knex';
import { SeederRunner } from './runner';
import type { SeederConfig, Seeder } from './types';

/**
 * Default seeder configuration
 */
export const defaultSeederConfig: SeederConfig = {
  directory: './seeders',
  extension: '.ts',
};

/**
 * Base seeder class
 */
export abstract class BaseSeeder implements Seeder {
  /**
   * Run the seeder
   */
  abstract run(db: Knex): Promise<void>;
}

/**
 * Create seeder runner
 */
export function createSeederRunner(db: Knex, config: Partial<SeederConfig> = {}): SeederRunner {
  return new SeederRunner(db, { ...defaultSeederConfig, ...config });
}

/**
 * Helper to run seeders
 */
export async function seed(db: Knex, config: Partial<SeederConfig> = {}): Promise<string[]> {
  const runner = createSeederRunner(db, config);
  return await runner.run();
}

/**
 * Helper to run a specific seeder
 */
export async function runSeeder(
  db: Knex,
  name: string,
  config: Partial<SeederConfig> = {}
): Promise<void> {
  const runner = createSeederRunner(db, config);
  return await runner.runOne(name);
}
