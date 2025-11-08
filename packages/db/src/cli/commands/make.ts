/**
 * Make (generator) CLI commands
 */

import { promises as fs } from 'node:fs';
import { join, resolve } from 'node:path';
import {
  loadDatabaseConfig,
  getTimestamp,
  toSnakeCase,
  toPascalCase,
  ensureDirectory,
} from '../utils';
import { createMigrationGenerator } from '../../migrations/index';

export async function runMakeCommand(subcommand: string | undefined, args: string[]) {
  const name = args[0];

  if (!name) {
    console.error('Error: Name is required');
    console.log('Usage: curisdb make:<type> <name>');
    process.exit(1);
  }

  switch (subcommand) {
    case 'migration':
      await makeMigration(name);
      break;
    case 'model':
      await makeModel(name);
      break;
    case 'seeder':
      await makeSeeder(name);
      break;
    default:
      console.error(`Unknown make command: ${subcommand}`);
      process.exit(1);
  }
}

async function makeMigration(name: string) {
  try {
    const config = await loadDatabaseConfig();
    const generator = createMigrationGenerator(config.migrations);

    const filePath = await generator.createMigration(name);
    console.log(`✓ Created migration: ${filePath}`);
    process.exit(0);
  } catch (error: any) {
    console.error('Failed to create migration:', error.message);
    process.exit(1);
  }
}

async function makeModel(name: string) {
  try {
    const modelName = toPascalCase(name);
    const tableName = toSnakeCase(name) + 's'; // Pluralize
    const fileName = `${modelName}.ts`;
    const modelsDir = resolve(process.cwd(), 'src/models');
    const filePath = join(modelsDir, fileName);

    await ensureDirectory(modelsDir);

    const content = `import { Model, schema } from '@curisjs/db';

/**
 * ${modelName} schema definition
 */
export const ${modelName.toLowerCase()}Schema = schema.define('${tableName}', {
  id: schema.integer().primaryKey().autoIncrement(),
  // Add your columns here
  createdAt: schema.datetime().default('now'),
  updatedAt: schema.datetime().default('now'),
});

/**
 * ${modelName} model
 */
export class ${modelName} extends Model {
  static tableName = '${tableName}';
  static schema = ${modelName.toLowerCase()}Schema;
  static timestamps = true;

  // Define relations here
  // posts() {
  //   return this.hasMany(Post, 'userId');
  // }
}
`;

    await fs.writeFile(filePath, content, 'utf-8');
    console.log(`✓ Created model: ${filePath}`);
    process.exit(0);
  } catch (error: any) {
    console.error('Failed to create model:', error.message);
    process.exit(1);
  }
}

async function makeSeeder(name: string) {
  try {
    const seederName = toPascalCase(name);
    const timestamp = getTimestamp();
    const fileName = `${timestamp}_${seederName}.ts`;
    const seedersDir = resolve(process.cwd(), 'seeders');
    const filePath = join(seedersDir, fileName);

    await ensureDirectory(seedersDir);

    const content = `import { BaseSeeder } from '@curisjs/db';
import type { Knex } from 'knex';

/**
 * ${seederName} seeder
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

    await fs.writeFile(filePath, content, 'utf-8');
    console.log(`✓ Created seeder: ${filePath}`);
    process.exit(0);
  } catch (error: any) {
    console.error('Failed to create seeder:', error.message);
    process.exit(1);
  }
}
