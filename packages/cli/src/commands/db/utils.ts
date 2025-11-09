/**
 * Database utility commands
 */

import { success, error as showError, warn, info } from '../../utils.js';

export async function runWipeCommand() {
  try {
    const { createDatabase } = await import('@curisjs/db');
    const { loadDatabaseConfig } = await import('../../utils.js');

    warn('This will drop all tables!');
    info('Wiping database...');

    const config = await loadDatabaseConfig();
    const db = createDatabase((config.connection || config) as never);

    // Get all table names (this is database-specific, adjust as needed)
    const tables = await db.raw(
      'SELECT table_name FROM information_schema.tables WHERE table_schema = DATABASE()'
    );

    if (tables[0] && tables[0].length > 0) {
      // Disable foreign key checks
      await db.raw('SET FOREIGN_KEY_CHECKS = 0');

      // Drop all tables
      for (const { table_name } of tables[0]) {
        await db.schema.dropTableIfExists(table_name);
        info(`Dropped table: ${table_name}`);
      }

      // Re-enable foreign key checks
      await db.raw('SET FOREIGN_KEY_CHECKS = 1');

      success(`Dropped ${tables[0].length} table(s)`);
    } else {
      success('No tables to drop');
    }

    await db.destroy();
    process.exit(0);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    showError(`Wipe failed: ${message}`);
    process.exit(1);
  }
}
