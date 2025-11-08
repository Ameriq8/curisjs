/**
 * Make seeder command
 */

import { join } from 'node:path';
import {
  success,
  error as showError,
  toPascalCase,
  getTimestamp,
  writeFile,
  getProjectRoot,
} from '../../utils';

export async function runMakeSeeder(args: string[]) {
  const name = args[0];

  if (!name) {
    showError('Seeder name is required');
    console.log('Usage: curis make:seeder <name>');
    process.exit(1);
  }

  try {
    const seederName = toPascalCase(name.replace(/Seeder$/i, '')) + 'Seeder';
    const timestamp = getTimestamp();
    const fileName = `${timestamp}_${seederName}.ts`;
    const filePath = join(getProjectRoot(), 'seeders', fileName);

    const content = `import { BaseSeeder } from '@curisjs/db';
import type { Knex } from 'knex';

/**
 * ${seederName}
 */
export default class ${seederName} extends BaseSeeder {
  async run(db: Knex): Promise<void> {
    // Delete existing entries (optional)
    // await db('table_name').del();

    // Insert seed data
    await db('table_name').insert([
      {
        // Add your seed data here
      },
    ]);
  }
}
`;

    await writeFile(filePath, content);
    success(`Created seeder: ${filePath}`);
    process.exit(0);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    showError(`Failed to create seeder: ${message}`);
    process.exit(1);
  }
}
