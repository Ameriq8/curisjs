/**
 * @curisjs/db - Migration Runner
 * Executes migrations up and down
 */

import type { Knex } from 'knex';
import type { Migration, MigrationStatus, MigrationConfig } from './types';
import { MigrationTracker } from './tracker';
import { promises as fs } from 'node:fs';
import { join, resolve } from 'node:path';

export class MigrationRunner {
  private tracker: MigrationTracker;

  constructor(
    private db: Knex,
    private config: MigrationConfig
  ) {
    this.tracker = new MigrationTracker(db, config);
  }

  /**
   * Load all migration files
   */
  async loadMigrations(): Promise<Migration[]> {
    const directory = resolve(this.config.directory);

    try {
      const files = await fs.readdir(directory);
      const migrationFiles = files.filter((file) => file.endsWith(this.config.extension)).sort();

      const migrations: Migration[] = [];

      for (const file of migrationFiles) {
        const filePath = join(directory, file);
        const module = await import(filePath);

        // Extract timestamp and name from filename
        // Format: YYYYMMDDHHMMSS_migration_name.ts
        const match = file.match(/^(\d+)_(.+)\.(ts|js)$/);
        if (!match) {
          console.warn(`Skipping invalid migration file: ${file}`);
          continue;
        }

        const [, timestamp] = match;

        migrations.push({
          name: file.replace(/\.(ts|js)$/, ''),
          timestamp: parseInt(timestamp!, 10),
          up: module.up,
          down: module.down,
        });
      }

      return migrations;
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
        return [];
      }
      throw error;
    }
  }

  /**
   * Get migration status
   */
  async status(): Promise<MigrationStatus[]> {
    const [allMigrations, appliedRecords] = await Promise.all([
      this.loadMigrations(),
      this.tracker.getApplied(),
    ]);

    const appliedMap = new Map(
      appliedRecords.map((record) => [
        record.name,
        { batch: record.batch, appliedAt: record.migration_time },
      ])
    );

    return allMigrations.map((migration) => {
      const applied = appliedMap.get(migration.name);

      return {
        name: migration.name,
        batch: applied?.batch ?? null,
        status: applied ? 'applied' : 'pending',
        appliedAt: applied?.appliedAt,
      } as MigrationStatus;
    });
  }

  /**
   * Run pending migrations
   */
  async up(steps?: number): Promise<string[]> {
    const migrations = await this.loadMigrations();
    const applied = await this.tracker.getApplied();
    const appliedNames = new Set(applied.map((m) => m.name));

    // Filter pending migrations
    const pending = migrations.filter((m) => !appliedNames.has(m.name));

    if (pending.length === 0) {
      return [];
    }

    // Limit migrations if steps provided
    const toRun = steps ? pending.slice(0, steps) : pending;
    const batch = await this.tracker.getNextBatch();
    const ran: string[] = [];

    for (const migration of toRun) {
      console.log(`Migrating: ${migration.name}`);

      try {
        if (this.config.disableTransactions) {
          await migration.up(this.db);
          await this.tracker.log(migration.name, batch);
        } else {
          await this.db.transaction(async (trx) => {
            await migration.up(trx);
            await this.tracker.log(migration.name, batch);
          });
        }

        console.log(`Migrated: ${migration.name}`);
        ran.push(migration.name);
      } catch (error) {
        console.error(`Failed to migrate: ${migration.name}`);
        throw error;
      }
    }

    return ran;
  }

  /**
   * Rollback migrations
   */
  async down(steps: number = 1): Promise<string[]> {
    const lastBatch = await this.tracker.getLastBatch();

    if (lastBatch === 0) {
      return [];
    }

    const migrations = await this.loadMigrations();
    const migrationMap = new Map(migrations.map((m) => [m.name, m]));

    const rolledBack: string[] = [];

    for (let i = 0; i < steps; i++) {
      const currentBatch = lastBatch - i;
      const batchMigrations = await this.tracker.getBatch(currentBatch);

      if (batchMigrations.length === 0) {
        break;
      }

      for (const record of batchMigrations) {
        const migration = migrationMap.get(record.name);

        if (!migration) {
          console.warn(`Migration file not found: ${record.name}`);
          continue;
        }

        console.log(`Rolling back: ${migration.name}`);

        try {
          if (this.config.disableTransactions) {
            await migration.down(this.db);
            await this.tracker.unlog(migration.name);
          } else {
            await this.db.transaction(async (trx) => {
              await migration.down(trx);
              await this.tracker.unlog(migration.name);
            });
          }

          console.log(`Rolled back: ${migration.name}`);
          rolledBack.push(migration.name);
        } catch (error) {
          console.error(`Failed to rollback: ${migration.name}`);
          throw error;
        }
      }
    }

    return rolledBack;
  }

  /**
   * Reset all migrations (rollback all)
   */
  async reset(): Promise<string[]> {
    const lastBatch = await this.tracker.getLastBatch();

    if (lastBatch === 0) {
      return [];
    }

    return await this.down(lastBatch);
  }

  /**
   * Refresh migrations (reset and migrate)
   */
  async refresh(): Promise<{ rolledBack: string[]; migrated: string[] }> {
    const rolledBack = await this.reset();
    const migrated = await this.up();

    return { rolledBack, migrated };
  }

  /**
   * Run fresh migrations (drop all tables and migrate)
   */
  async fresh(): Promise<string[]> {
    // Drop all tables
    await this.db.raw('SET FOREIGN_KEY_CHECKS = 0');

    const tables = await this.db.raw(
      'SELECT table_name FROM information_schema.tables WHERE table_schema = DATABASE()'
    );

    for (const { table_name } of tables[0] || []) {
      await this.db.schema.dropTableIfExists(table_name);
    }

    await this.db.raw('SET FOREIGN_KEY_CHECKS = 1');

    // Run all migrations
    return await this.up();
  }
}
