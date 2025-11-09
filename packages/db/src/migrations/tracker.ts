/**
 * @curisjs/db - Migration Tracker
 * Manages migration history in the database
 */

import type { Knex } from 'knex';
import type { MigrationRecord, MigrationConfig } from './types';

export class MigrationTracker {
  constructor(
    private db: Knex,
    private config: MigrationConfig
  ) {}

  /**
   * Ensure migrations table exists
   */
  async ensureTable(): Promise<void> {
    const hasTable = await this.db.schema.hasTable(this.config.tableName);

    if (!hasTable) {
      await this.db.schema.createTable(this.config.tableName, (table) => {
        table.increments('id').primary();
        table.string('name').notNullable().unique();
        table.integer('batch').notNullable();
        table.timestamp('migration_time').defaultTo(this.db.fn.now());
      });
    }
  }

  /**
   * Get all applied migrations
   */
  async getApplied(): Promise<MigrationRecord[]> {
    await this.ensureTable();

    return await this.db(this.config.tableName).select('*').orderBy('id', 'asc');
  }

  /**
   * Get last batch number
   */
  async getLastBatch(): Promise<number> {
    await this.ensureTable();

    const result = await this.db(this.config.tableName).max('batch as batch').first();

    return result?.batch ?? 0;
  }

  /**
   * Get migrations from a specific batch
   */
  async getBatch(batch: number): Promise<MigrationRecord[]> {
    await this.ensureTable();

    return await this.db(this.config.tableName)
      .select('*')
      .where('batch', batch)
      .orderBy('id', 'desc');
  }

  /**
   * Record a migration as applied
   */
  async log(name: string, batch: number): Promise<void> {
    await this.ensureTable();

    await this.db(this.config.tableName).insert({
      name,
      batch,
      migration_time: new Date(),
    });
  }

  /**
   * Remove a migration record
   */
  async unlog(name: string): Promise<void> {
    await this.ensureTable();

    await this.db(this.config.tableName).where('name', name).delete();
  }

  /**
   * Get next batch number
   */
  async getNextBatch(): Promise<number> {
    const lastBatch = await this.getLastBatch();
    return lastBatch + 1;
  }

  /**
   * Check if a migration has been applied
   */
  async hasRun(name: string): Promise<boolean> {
    await this.ensureTable();

    const result = await this.db(this.config.tableName).where('name', name).first();

    return !!result;
  }
}
