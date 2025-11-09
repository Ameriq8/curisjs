/**
 * @curisjs/db - Migration Types
 */

import type { Knex } from 'knex';

/**
 * Migration file structure
 */
export interface Migration {
  /**
   * Migration name
   */
  name: string;

  /**
   * Migration timestamp
   */
  timestamp: number;

  /**
   * Up migration function
   */
  up: (db: Knex) => Promise<void>;

  /**
   * Down migration function
   */
  down: (db: Knex) => Promise<void>;
}

/**
 * Migration record in database
 */
export interface MigrationRecord {
  id: number;
  name: string;
  batch: number;
  migration_time: Date;
}

/**
 * Migration status
 */
export interface MigrationStatus {
  name: string;
  batch: number | null;
  status: 'pending' | 'applied';
  appliedAt?: Date;
}

/**
 * Migration configuration
 */
export interface MigrationConfig {
  /**
   * Directory containing migration files
   */
  directory: string;

  /**
   * Table name for tracking migrations
   */
  tableName: string;

  /**
   * File extension for migrations
   */
  extension: string;

  /**
   * Disable transaction wrapping
   */
  disableTransactions?: boolean;
}
