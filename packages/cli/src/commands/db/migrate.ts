/**
 * Database migration commands
 */

import { loadDatabaseConfig, success, error as showError, info } from '../../utils.js';

export async function runMigrateCommand(subcommand: string | undefined, args: string[]) {
  switch (subcommand) {
    case undefined:
      await migrate(args);
      break;
    default:
      showError(`Unknown subcommand: ${subcommand}`);
      process.exit(1);
  }
}

export async function runRollbackCommand(args: string[]) {
  await rollback(args);
}

export async function runResetCommand() {
  await reset();
}

export async function runStatusCommand() {
  await status();
}

async function migrate(args: string[]) {
  try {
    // Dynamic import to avoid loading @curisjs/db unless needed
    const { createDatabase } = await import('@curisjs/db');
    const { createMigrationRunner } = await import('@curisjs/db');

    const { loadDatabaseConfig } = await import('../../utils.js');

    const stepIndex = args.indexOf('--step');
    const stepArg = stepIndex !== -1 ? args[stepIndex + 1] : undefined;
    const step = stepArg ? parseInt(stepArg) : undefined;

    const config = await loadDatabaseConfig();
    const db = createDatabase((config.connection || config) as never);
    const runner = createMigrationRunner(db, config.migrations as never);

    info('Running migrations...');
    const migrations = await runner.up(step);

    if (migrations.length === 0) {
      success('Nothing to migrate');
    } else {
      success(`Migrated ${migrations.length} migration(s)`);
    }

    await db.destroy();
    process.exit(0);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    showError(`Migration failed: ${message}`);
    process.exit(1);
  }
}

async function rollback(args: string[]) {
  try {
    const { createDatabase } = await import('@curisjs/db');
    const { createMigrationRunner } = await import('@curisjs/db');

    const stepIndex = args.indexOf('--step');
    const stepArg = stepIndex !== -1 ? args[stepIndex + 1] : undefined;
    const step = stepArg ? parseInt(stepArg) : 1;

    const config = await loadDatabaseConfig();
    const db = createDatabase((config.connection || config) as never);
    const runner = createMigrationRunner(db, config.migrations as never);

    info('Rolling back migrations...');
    const migrations = await runner.down(step);

    if (migrations.length === 0) {
      success('Nothing to rollback');
    } else {
      success(`Rolled back ${migrations.length} migration(s)`);
    }

    await db.destroy();
    process.exit(0);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    showError(`Rollback failed: ${message}`);
    process.exit(1);
  }
}

async function reset() {
  try {
    const { createDatabase } = await import('@curisjs/db');
    const { createMigrationRunner } = await import('@curisjs/db');

    const config = await loadDatabaseConfig();
    const db = createDatabase((config.connection || config) as never);
    const runner = createMigrationRunner(db, config.migrations as never);

    info('Resetting database...');
    const migrations = await runner.reset();

    success(`Reset complete. Rolled back ${migrations.length} migration(s)`);

    await db.destroy();
    process.exit(0);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    showError(`Reset failed: ${message}`);
    process.exit(1);
  }
}

async function status() {
  try {
    const { createDatabase } = await import('@curisjs/db');
    const { createMigrationRunner } = await import('@curisjs/db');

    const config = await loadDatabaseConfig();
    const db = createDatabase((config.connection || config) as never);
    const runner = createMigrationRunner(db, config.migrations as never);

    const statusList = await runner.status();

    if (statusList.length === 0) {
      info('No migrations found');
    } else {
      console.log('\nMigration Status:\n');
      console.log('Name'.padEnd(50), 'Status'.padEnd(10), 'Batch');
      console.log('-'.repeat(70));

      for (const migration of statusList) {
        const name = migration.name.padEnd(50);
        const statusText = migration.status === 'applied' ? '✓ Applied' : '✗ Pending';
        const batch = migration.batch !== null ? migration.batch.toString() : '-';
        console.log(name, statusText.padEnd(10), batch);
      }
    }

    await db.destroy();
    process.exit(0);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    showError(`Status check failed: ${message}`);
    process.exit(1);
  }
}
