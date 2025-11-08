/**
 * Migration CLI commands
 */

import { createDatabaseInstance, loadDatabaseConfig } from '../utils';
import { createMigrationRunner } from '../../migrations/index';

export async function runMigrateCommand(subcommand: string | undefined, args: string[]) {
  switch (subcommand) {
    case 'rollback':
      await rollback(args);
      break;
    case 'reset':
      await reset();
      break;
    case 'refresh':
      await refresh();
      break;
    case 'status':
      await status();
      break;
    case undefined:
    default:
      await migrate(args);
  }
}

async function migrate(args: string[]) {
  try {
    const stepIndex = args.indexOf('--step');
    const stepArg = stepIndex !== -1 ? args[stepIndex + 1] : undefined;
    const step = stepArg ? parseInt(stepArg) : undefined;

    const db = await createDatabaseInstance();
    const config = await loadDatabaseConfig();
    const runner = createMigrationRunner(db, config.migrations);

    console.log('Running migrations...');
    const migrations = await runner.up(step);

    if (migrations.length === 0) {
      console.log('✓ Nothing to migrate');
    } else {
      console.log(`✓ Migrated ${migrations.length} migration(s)`);
    }

    await db.destroy();
    process.exit(0);
  } catch (error: any) {
    console.error('Migration failed:', error.message);
    process.exit(1);
  }
}

async function rollback(args: string[]) {
  try {
    const stepIndex = args.indexOf('--step');
    const stepArg = stepIndex !== -1 ? args[stepIndex + 1] : undefined;
    const step = stepArg ? parseInt(stepArg) : 1;

    const db = await createDatabaseInstance();
    const config = await loadDatabaseConfig();
    const runner = createMigrationRunner(db, config.migrations);

    console.log('Rolling back migrations...');
    const migrations = await runner.down(step);

    if (migrations.length === 0) {
      console.log('✓ Nothing to rollback');
    } else {
      console.log(`✓ Rolled back ${migrations.length} migration(s)`);
    }

    await db.destroy();
    process.exit(0);
  } catch (error: any) {
    console.error('Rollback failed:', error.message);
    process.exit(1);
  }
}

async function reset() {
  try {
    const db = await createDatabaseInstance();
    const config = await loadDatabaseConfig();
    const runner = createMigrationRunner(db, config.migrations);

    console.log('Resetting database...');
    const migrations = await runner.reset();

    console.log(`✓ Reset complete. Rolled back ${migrations.length} migration(s)`);

    await db.destroy();
    process.exit(0);
  } catch (error: any) {
    console.error('Reset failed:', error.message);
    process.exit(1);
  }
}

async function refresh() {
  try {
    const db = await createDatabaseInstance();
    const config = await loadDatabaseConfig();
    const runner = createMigrationRunner(db, config.migrations);

    console.log('Refreshing database...');
    const result = await runner.refresh();

    console.log(`✓ Refresh complete`);
    console.log(`  Rolled back: ${result.rolledBack.length} migration(s)`);
    console.log(`  Migrated: ${result.migrated.length} migration(s)`);

    await db.destroy();
    process.exit(0);
  } catch (error: any) {
    console.error('Refresh failed:', error.message);
    process.exit(1);
  }
}

async function status() {
  try {
    const db = await createDatabaseInstance();
    const config = await loadDatabaseConfig();
    const runner = createMigrationRunner(db, config.migrations);

    const statusList = await runner.status();

    if (statusList.length === 0) {
      console.log('No migrations found');
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
  } catch (error: any) {
    console.error('Status check failed:', error.message);
    process.exit(1);
  }
}
