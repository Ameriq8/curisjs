/**
 * Schema Builder - Fluent API for defining database schemas
 */

import type { ColumnDefinition, ColumnType, SchemaDefinition } from '../types.js';

/**
 * Column builder for fluent schema definition
 */
export class ColumnBuilder {
  private definition: ColumnDefinition;

  constructor(type: ColumnType, name?: string) {
    this.definition = {
      type,
      name,
      nullable: false,
    };
  }

  /**
   * Set column length
   */
  length(value: number): this {
    this.definition.length = value;
    return this;
  }

  /**
   * Set precision and scale for decimal types
   */
  precision(precision: number, scale?: number): this {
    this.definition.precision = precision;
    this.definition.scale = scale;
    return this;
  }

  /**
   * Make column unsigned (for numeric types)
   */
  unsigned(): this {
    this.definition.unsigned = true;
    return this;
  }

  /**
   * Make column nullable
   */
  nullable(): this {
    this.definition.nullable = true;
    return this;
  }

  /**
   * Make column not nullable
   */
  notNullable(): this {
    this.definition.nullable = false;
    return this;
  }

  /**
   * Set default value
   */
  default(value: any): this {
    this.definition.defaultValue = value;
    return this;
  }

  /**
   * Mark as primary key
   */
  primaryKey(): this {
    this.definition.primary = true;
    this.definition.nullable = false;
    return this;
  }

  /**
   * Add unique constraint
   */
  unique(): this {
    this.definition.unique = true;
    return this;
  }

  /**
   * Add index
   */
  index(): this {
    this.definition.index = true;
    return this;
  }

  /**
   * Auto increment (for integer primary keys)
   */
  autoIncrement(): this {
    this.definition.autoIncrement = true;
    return this;
  }

  /**
   * Set enum values
   */
  enum(values: string[]): this {
    this.definition.enumValues = values;
    return this;
  }

  /**
   * Add foreign key reference
   */
  references(table: string, column: string = 'id'): this {
    this.definition.references = {
      table,
      column,
    };
    return this;
  }

  /**
   * Set on delete action for foreign key
   */
  onDelete(action: 'CASCADE' | 'SET NULL' | 'RESTRICT' | 'NO ACTION'): this {
    if (this.definition.references) {
      this.definition.references.onDelete = action;
    }
    return this;
  }

  /**
   * Set on update action for foreign key
   */
  onUpdate(action: 'CASCADE' | 'SET NULL' | 'RESTRICT' | 'NO ACTION'): this {
    if (this.definition.references) {
      this.definition.references.onUpdate = action;
    }
    return this;
  }

  /**
   * Build the column definition
   */
  build(): ColumnDefinition {
    return this.definition;
  }
}

/**
 * Schema builder for defining table schemas
 */
export class SchemaBuilder {
  /**
   * String column
   */
  string(name?: string, length?: number): ColumnBuilder {
    const builder = new ColumnBuilder('string', name);
    if (length) {
      builder.length(length);
    }
    return builder;
  }

  /**
   * Text column (unlimited length)
   */
  text(name?: string): ColumnBuilder {
    return new ColumnBuilder('text', name);
  }

  /**
   * Integer column
   */
  integer(name?: string): ColumnBuilder {
    return new ColumnBuilder('integer', name);
  }

  /**
   * Big integer column
   */
  bigInteger(name?: string): ColumnBuilder {
    return new ColumnBuilder('bigInteger', name);
  }

  /**
   * Float column
   */
  float(name?: string): ColumnBuilder {
    return new ColumnBuilder('float', name);
  }

  /**
   * Decimal column
   */
  decimal(name?: string, precision?: number, scale?: number): ColumnBuilder {
    const builder = new ColumnBuilder('decimal', name);
    if (precision) {
      builder.precision(precision, scale);
    }
    return builder;
  }

  /**
   * Boolean column
   */
  boolean(name?: string): ColumnBuilder {
    return new ColumnBuilder('boolean', name);
  }

  /**
   * Date column
   */
  date(name?: string): ColumnBuilder {
    return new ColumnBuilder('date', name);
  }

  /**
   * Datetime column
   */
  datetime(name?: string): ColumnBuilder {
    return new ColumnBuilder('datetime', name);
  }

  /**
   * Timestamp column
   */
  timestamp(name?: string): ColumnBuilder {
    return new ColumnBuilder('timestamp', name);
  }

  /**
   * Time column
   */
  time(name?: string): ColumnBuilder {
    return new ColumnBuilder('time', name);
  }

  /**
   * JSON column
   */
  json(name?: string): ColumnBuilder {
    return new ColumnBuilder('json', name);
  }

  /**
   * JSONB column (PostgreSQL)
   */
  jsonb(name?: string): ColumnBuilder {
    return new ColumnBuilder('jsonb', name);
  }

  /**
   * UUID column
   */
  uuid(name?: string): ColumnBuilder {
    return new ColumnBuilder('uuid', name);
  }

  /**
   * Binary column
   */
  binary(name?: string): ColumnBuilder {
    return new ColumnBuilder('binary', name);
  }

  /**
   * Enum column
   */
  enum(name: string, values: string[]): ColumnBuilder {
    return new ColumnBuilder('enum', name).enum(values);
  }

  /**
   * Define a schema for a table
   */
  define(
    tableName: string,
    columns: Record<string, ColumnBuilder>,
    options: {
      timestamps?: boolean;
      softDeletes?: boolean;
      indexes?: Array<{ columns: string[]; unique?: boolean; name?: string }>;
    } = {}
  ): SchemaDefinition {
    const columnDefinitions: Record<string, ColumnDefinition> = {};

    // Build column definitions
    for (const [name, builder] of Object.entries(columns)) {
      const def = builder.build();
      def.name = name;
      columnDefinitions[name] = def;
    }

    // Add timestamps if enabled
    if (options.timestamps) {
      columnDefinitions.createdAt = new ColumnBuilder('timestamp')
        .default('CURRENT_TIMESTAMP')
        .notNullable()
        .build();
      columnDefinitions.createdAt.name = 'createdAt';

      columnDefinitions.updatedAt = new ColumnBuilder('timestamp')
        .default('CURRENT_TIMESTAMP')
        .notNullable()
        .build();
      columnDefinitions.updatedAt.name = 'updatedAt';
    }

    // Add soft deletes if enabled
    if (options.softDeletes) {
      columnDefinitions.deletedAt = new ColumnBuilder('timestamp').nullable().build();
      columnDefinitions.deletedAt.name = 'deletedAt';
    }

    return {
      tableName,
      columns: columnDefinitions,
      indexes: options.indexes,
      timestamps: options.timestamps,
      softDeletes: options.softDeletes,
    };
  }
}

/**
 * Global schema builder instance
 */
export const schema = new SchemaBuilder();
