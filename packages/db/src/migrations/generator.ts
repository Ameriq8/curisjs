/**
 * @curisjs/db - Migration Generator
 * Creates migration files from templates
 */

import { promises as fs } from 'node:fs';
import { join, resolve } from 'node:path';
import type { MigrationConfig } from './types';

export class MigrationGenerator {
  constructor(private config: MigrationConfig) {}

  /**
   * Generate timestamp for migration
   */
  private generateTimestamp(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hour = String(now.getHours()).padStart(2, '0');
    const minute = String(now.getMinutes()).padStart(2, '0');
    const second = String(now.getSeconds()).padStart(2, '0');

    return `${year}${month}${day}${hour}${minute}${second}`;
  }

  /**
   * Convert migration name to snake_case
   */
  private toSnakeCase(str: string): string {
    return str
      .replace(/([A-Z])/g, '_$1')
      .toLowerCase()
      .replace(/^_/, '')
      .replace(/\s+/g, '_');
  }

  /**
   * Generate empty migration
   */
  async createMigration(name: string): Promise<string> {
    const timestamp = this.generateTimestamp();
    const snakeName = this.toSnakeCase(name);
    const fileName = `${timestamp}_${snakeName}${this.config.extension}`;
    const filePath = join(resolve(this.config.directory), fileName);

    const content = this.generateMigrationTemplate(snakeName);

    // Ensure directory exists
    await fs.mkdir(resolve(this.config.directory), { recursive: true });

    // Write file
    await fs.writeFile(filePath, content, 'utf-8');

    return filePath;
  }

  /**
   * Generate migration template
   */
  private generateMigrationTemplate(name: string): string {
    const isTypeScript = this.config.extension === '.ts';

    if (isTypeScript) {
      return `import type { Knex } from 'knex';

/**
 * Migration: ${name}
 */
export async function up(db: Knex): Promise<void> {
  // TODO: Implement migration
  await db.schema.createTable('example_table', (table) => {
    table.increments('id').primary();
    table.string('name').notNullable();
    table.timestamps(true, true);
  });
}

/**
 * Rollback migration
 */
export async function down(db: Knex): Promise<void> {
  // TODO: Implement rollback
  await db.schema.dropTableIfExists('example_table');
}
`;
    } else {
      return `/**
 * Migration: ${name}
 */
export async function up(db) {
  // TODO: Implement migration
  await db.schema.createTable('example_table', (table) => {
    table.increments('id').primary();
    table.string('name').notNullable();
    table.timestamps(true, true);
  });
}

/**
 * Rollback migration
 */
export async function down(db) {
  // TODO: Implement rollback
  await db.schema.dropTableIfExists('example_table');
}
`;
    }
  }

  /**
   * Generate migration from schema definition
   */
  async createFromSchema(name: string, tableName: string, schema: any): Promise<string> {
    const timestamp = this.generateTimestamp();
    const snakeName = this.toSnakeCase(name);
    const fileName = `${timestamp}_${snakeName}${this.config.extension}`;
    const filePath = join(resolve(this.config.directory), fileName);

    const content = this.generateSchemaTemplate(tableName, schema);

    // Ensure directory exists
    await fs.mkdir(resolve(this.config.directory), { recursive: true });

    // Write file
    await fs.writeFile(filePath, content, 'utf-8');

    return filePath;
  }

  /**
   * Generate schema-based migration template
   */
  private generateSchemaTemplate(tableName: string, schema: any): string {
    const isTypeScript = this.config.extension === '.ts';

    // Build column definitions from schema
    const columns = this.buildColumnDefinitions(schema);

    if (isTypeScript) {
      return `import type { Knex } from 'knex';

/**
 * Create ${tableName} table
 */
export async function up(db: Knex): Promise<void> {
  await db.schema.createTable('${tableName}', (table) => {
${columns.map((col) => `    ${col}`).join('\n')}
  });
}

/**
 * Drop ${tableName} table
 */
export async function down(db: Knex): Promise<void> {
  await db.schema.dropTableIfExists('${tableName}');
}
`;
    } else {
      return `/**
 * Create ${tableName} table
 */
export async function up(db) {
  await db.schema.createTable('${tableName}', (table) => {
${columns.map((col) => `    ${col}`).join('\n')}
  });
}

/**
 * Drop ${tableName} table
 */
export async function down(db) {
  await db.schema.dropTableIfExists('${tableName}');
}
`;
    }
  }

  /**
   * Build column definitions from schema
   */
  private buildColumnDefinitions(schema: any): string[] {
    const definitions: string[] = [];

    // This is a simplified version - you'd expand this based on your schema structure
    for (const [name, config] of Object.entries(schema.columns || {})) {
      let def = `table`;

      const col = config as any;

      // Type
      if (col.type === 'integer') {
        def += `.integer('${name}')`;
      } else if (col.type === 'string') {
        def += col.length ? `.string('${name}', ${col.length})` : `.string('${name}')`;
      } else if (col.type === 'text') {
        def += `.text('${name}')`;
      } else if (col.type === 'boolean') {
        def += `.boolean('${name}')`;
      } else if (col.type === 'datetime') {
        def += `.datetime('${name}')`;
      } else if (col.type === 'date') {
        def += `.date('${name}')`;
      } else if (col.type === 'json') {
        def += `.json('${name}')`;
      } else if (col.type === 'uuid') {
        def += `.uuid('${name}')`;
      } else if (col.type === 'decimal') {
        def += `.decimal('${name}', ${col.precision || 8}, ${col.scale || 2})`;
      }

      // Modifiers
      if (col.primary) def += '.primary()';
      if (col.autoIncrement) def += '.increments()';
      if (col.unique) def += '.unique()';
      if (col.notNullable) def += '.notNullable()';
      if (col.nullable) def += '.nullable()';
      if (col.defaultTo !== undefined) {
        if (typeof col.defaultTo === 'string') {
          def += `.defaultTo('${col.defaultTo}')`;
        } else {
          def += `.defaultTo(${col.defaultTo})`;
        }
      }
      if (col.references) {
        def += `.references('${col.references.column}').inTable('${col.references.table}')`;
        if (col.references.onDelete) {
          def += `.onDelete('${col.references.onDelete}')`;
        }
        if (col.references.onUpdate) {
          def += `.onUpdate('${col.references.onUpdate}')`;
        }
      }

      def += ';';
      definitions.push(def);
    }

    return definitions;
  }
}
