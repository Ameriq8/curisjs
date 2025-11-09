/**
 * Database utility CLI commands
 */

import { createDatabaseInstance } from '../utils';

export async function runDbCommand(subcommand: string | undefined, _args: string[]) {
  switch (subcommand) {
    case 'wipe':
      await wipe();
      break;
    default:
      console.error(`Unknown db command: ${subcommand}`);
      process.exit(1);
  }
}

async function wipe() {
  try {
    const db = await createDatabaseInstance();

    console.log('⚠️  Warning: This will drop all tables!');
    console.log('Wiping database...');

    // Get all table names
    const tables = await db.raw(
      'SELECT table_name FROM information_schema.tables WHERE table_schema = DATABASE()'
    );

    if (tables[0] && tables[0].length > 0) {
      // Disable foreign key checks
      await db.raw('SET FOREIGN_KEY_CHECKS = 0');

      // Drop all tables
      for (const { table_name } of tables[0]) {
        await db.schema.dropTableIfExists(table_name);
        console.log(`  Dropped table: ${table_name}`);
      }

      // Re-enable foreign key checks
      await db.raw('SET FOREIGN_KEY_CHECKS = 1');

      console.log(`✓ Dropped ${tables[0].length} table(s)`);
    } else {
      console.log('✓ No tables to drop');
    }

    await db.destroy();
    process.exit(0);
  } catch (error: any) {
    console.error('Wipe failed:', error.message);
    process.exit(1);
  }
}
