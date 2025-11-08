/**
 * @curisjs/db - Seeder Types
 */

import type { Knex } from 'knex';

/**
 * Seeder base configuration
 */
export interface SeederConfig {
  /**
   * Directory containing seeder files
   */
  directory: string;

  /**
   * File extension for seeders
   */
  extension: string;

  /**
   * Specific seeders to run (if not specified, run all)
   */
  specific?: string[];
}

/**
 * Factory configuration
 */
export interface FactoryConfig<T = any> {
  /**
   * Number of records to create
   */
  count: number;

  /**
   * Attributes generator function
   */
  definition: (index: number) => Partial<T>;

  /**
   * Model class (optional, for model-based factories)
   */
  model?: any;
}

/**
 * Seeder class interface
 */
export interface Seeder {
  /**
   * Run the seeder
   */
  run(db: Knex): Promise<void>;
}
