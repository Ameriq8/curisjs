/**
 * @curisjs/db - Type-safe ORM for CurisJS
 * Built on Knex.js with runtime-agnostic support
 */

// Core exports
export { Model } from './model.js';
export { QueryBuilder } from './query-builder.js';
export { schema, SchemaBuilder, ColumnBuilder } from './schema/builder.js';

// Connection management
export {
  ConnectionManager,
  createDatabase,
  getDatabase,
  closeDatabase,
} from './connection.js';

// Transactions
export { transaction, beginTransaction, Transaction } from './transaction.js';

// Middleware
export { database as databaseMiddleware } from './middleware/index.js';
export type { DatabaseMiddlewareOptions } from './middleware/index.js';

// Providers
export { DatabaseServiceProvider } from './providers/index.js';

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
  Migration,
  MigrationInfo,
  Seeder,
  RelationType,
  RelationDefinition,
  ModelAttributes,
  CreateInput,
  UpdateInput,
  HookType,
  HookFunction,
  DatabaseInstance,
} from './types.js';

import { Model } from './model.js';
import type { ConnectionConfig } from './types.js';

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
export function defineConfig(
  config: ConnectionConfig
): { default: ConnectionConfig } {
  return {
    default: config,
  };
}
