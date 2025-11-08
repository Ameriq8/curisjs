/**
 * @curisjs/db - Type-safe ORM for CurisJS
 * Built on Knex.js with runtime-agnostic support
 */

// Core exports
export { Model } from './model';
export { QueryBuilder } from './query-builder';
export { schema, SchemaBuilder, ColumnBuilder } from './schema/builder';

// Connection management
export { ConnectionManager, createDatabase, getDatabase, closeDatabase } from './connection';

// Transactions
export { transaction, beginTransaction, Transaction } from './transaction';

// Migrations
export {
  createMigrationRunner,
  createMigrationGenerator,
  migrate,
  rollback,
  getMigrationStatus,
  MigrationRunner,
  MigrationGenerator,
  MigrationTracker,
} from './migrations/index';
export type {
  Migration,
  MigrationRecord,
  MigrationStatus,
  MigrationConfig,
} from './migrations/index';

// Relations
export { hasOne, hasMany, belongsTo, belongsToMany, RelationLoader } from './relations/index';
export type {
  Relation,
  RelationConfig,
  BelongsToManyConfig,
  EagerLoadOptions,
} from './relations/index';

// Seeders
export {
  BaseSeeder,
  createSeederRunner,
  seed,
  runSeeder,
  SeederRunner,
  Factory,
  defineFactory,
  defineRawFactory,
} from './seeders/index';
export type { Seeder, SeederConfig, FactoryConfig } from './seeders/index';

// Validation
export {
  generateValidationRules,
  schemaToValidator,
  createValidator,
  validateWith,
} from './validation/index';

// Middleware
export { database as databaseMiddleware } from './middleware/index';
export type { DatabaseMiddlewareOptions } from './middleware/index';

// Providers
export { DatabaseServiceProvider } from './providers/index';

// Types
export type {
  DatabaseClient,
  ConnectionConfig,
  DatabaseConfig,
  ColumnType,
  ColumnDefinition,
  SchemaDefinition,
  WhereClause,
  QueryOptions,
  PaginatedResult,
  ModelConstructor,
  MigrationInfo,
  RelationType,
  RelationDefinition,
  ModelAttributes,
  CreateInput,
  UpdateInput,
  HookType,
  HookFunction,
  DatabaseInstance,
} from './types';

import { Model } from './model';
import type { ConnectionConfig } from './types';

/**
 * Helper function to define a model with type inference
 */
export function defineModel<T extends Record<string, any>>(config: {
  tableName: string;
  schema: any;
  connection?: string;
  timestamps?: boolean;
  softDeletes?: boolean;
}): typeof Model<T> {
  class CustomModel extends Model<T> {
    static override tableName = config.tableName;
    static override schema = config.schema;
    static override connection = config.connection || 'default';
    static override timestamps = config.timestamps ?? true;
    static override softDeletes = config.softDeletes ?? false;
  }
  return CustomModel as typeof Model<T>;
}

/**
 * Helper function to define database config
 */
export function defineConfig(config: ConnectionConfig): { default: ConnectionConfig } {
  return {
    default: config,
  };
}
