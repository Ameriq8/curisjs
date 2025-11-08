/**
 * Make model command
 */

import { join } from 'node:path';
import {
  success,
  error as showError,
  toPascalCase,
  toSnakeCase,
  pluralize,
  writeFile,
  getProjectRoot,
} from '../../utils.js';

export async function runMakeModel(args: string[]) {
  const name = args[0];

  if (!name) {
    showError('Model name is required');
    console.log('Usage: curis make:model <name>');
    process.exit(1);
  }

  try {
    const modelName = toPascalCase(name);
    const tableName = pluralize(toSnakeCase(name));
    const fileName = `${modelName}.ts`;
    const filePath = join(getProjectRoot(), 'src/models', fileName);

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

    await writeFile(filePath, content);
    success(`Created model: ${filePath}`);
    process.exit(0);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    showError(`Failed to create model: ${message}`);
    process.exit(1);
  }
}
