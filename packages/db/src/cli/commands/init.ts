/**
 * Initialize database configuration
 */

import { promises as fs } from 'node:fs';
import { resolve } from 'node:path';

export async function runInitCommand() {
  try {
    const configPath = resolve(process.cwd(), 'curisdb.config.ts');

    // Check if config already exists
    try {
      await fs.access(configPath);
      console.log('⚠️  Configuration file already exists');
      process.exit(0);
    } catch {
      // File doesn't exist, create it
    }

    const content = `import { defineConfig } from '@curisjs/db';

export default defineConfig({
  // Database connection
  connection: {
    client: 'better-sqlite3', // or 'pg', 'mysql2'
    connection: {
      filename: './database.sqlite',
    },
    useNullAsDefault: true,
  },

  // Migrations configuration
  migrations: {
    directory: './migrations',
    tableName: 'migrations',
    extension: '.ts',
  },

  // Seeds configuration
  seeds: {
    directory: './seeders',
    extension: '.ts',
  },
});
`;

    await fs.writeFile(configPath, content, 'utf-8');

    // Create migrations and seeders directories
    await fs.mkdir(resolve(process.cwd(), 'migrations'), { recursive: true });
    await fs.mkdir(resolve(process.cwd(), 'seeders'), { recursive: true });

    console.log('✓ Created curisdb.config.ts');
    console.log('✓ Created migrations directory');
    console.log('✓ Created seeders directory');
    console.log('\\nNext steps:');
    console.log('  1. Update curisdb.config.ts with your database settings');
    console.log('  2. Create your first migration: curisdb make:migration create_users_table');
    console.log('  3. Run migrations: curisdb migrate');

    process.exit(0);
  } catch (error: any) {
    console.error('Initialization failed:', error.message);
    process.exit(1);
  }
}
