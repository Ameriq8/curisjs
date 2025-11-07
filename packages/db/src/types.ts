/**
 * Core Type Definitions for @curisjs/db
 */

import type { Knex } from 'knex';

/**
 * Supported database clients
 */
export type DatabaseClient = 'better-sqlite3' | 'pg' | 'mysql2' | 'mysql';

/**
 * Database connection configuration
 */
export interface ConnectionConfig {
  client: DatabaseClient;
  connection: string | Knex.ConnectionConfig | Knex.Sqlite3ConnectionConfig;
  pool?: {
    min?: number;
    max?: number;
    acquireTimeoutMillis?: number;
    idleTimeoutMillis?: number;
  };
  migrations?: {
    directory?: string;
    tableName?: string;
    extension?: string;
  };
  seeds?: {
    directory?: string;
    extension?: string;
  };
  useNullAsDefault?: boolean;
  debug?: boolean;
}

/**
 * Database configuration
 */
export interface DatabaseConfig {
  default: string;
  connections: Record<string, ConnectionConfig>;
  features?: {
    timestamps?: boolean;
    softDeletes?: boolean;
  };
}

/**
 * Column types
 */
export type ColumnType =
  | 'string'
  | 'text'
  | 'integer'
  | 'bigInteger'
  | 'float'
  | 'decimal'
  | 'boolean'
  | 'date'
  | 'datetime'
  | 'timestamp'
  | 'time'
  | 'json'
  | 'jsonb'
  | 'uuid'
  | 'binary'
  | 'enum';

/**
 * Column definition
 */
export interface ColumnDefinition {
  type: ColumnType;
  name?: string;
  length?: number;
  precision?: number;
  scale?: number;
  unsigned?: boolean;
  nullable?: boolean;
  defaultValue?: any;
  primary?: boolean;
  unique?: boolean;
  index?: boolean;
  autoIncrement?: boolean;
  enumValues?: string[];
  references?: {
    table: string;
    column: string;
    onDelete?: 'CASCADE' | 'SET NULL' | 'RESTRICT' | 'NO ACTION';
    onUpdate?: 'CASCADE' | 'SET NULL' | 'RESTRICT' | 'NO ACTION';
  };
}

/**
 * Schema definition
 */
export interface SchemaDefinition {
  tableName: string;
  columns: Record<string, ColumnDefinition>;
  indexes?: Array<{
    columns: string[];
    unique?: boolean;
    name?: string;
  }>;
  timestamps?: boolean;
  softDeletes?: boolean;
}

/**
 * Query builder where clause
 */
export type WhereClause<T = any> = {
  [K in keyof T]?: T[K] | T[K][] | { [op: string]: any };
};

/**
 * Query options
 */
export interface QueryOptions<T = any> {
  where?: WhereClause<T>;
  select?: (keyof T)[];
  orderBy?: { [K in keyof T]?: 'asc' | 'desc' };
  limit?: number;
  offset?: number;
  include?: Record<string, boolean | QueryOptions>;
}

/**
 * Pagination result
 */
export interface PaginatedResult<T> {
  data: T[];
  total: number;
  limit: number;
  offset: number;
  hasMore: boolean;
}

/**
 * Model constructor
 */
export interface ModelConstructor<T = any> {
  new (data?: Partial<T>): T;
  tableName: string;
  schema?: SchemaDefinition;
  connection?: string;
}

/**
 * Transaction interface
 */
export interface Transaction {
  commit(): Promise<void>;
  rollback(): Promise<void>;
  isCompleted(): boolean;
}

/**
 * Migration interface
 */
export interface Migration {
  up(db: Knex): Promise<void>;
  down(db: Knex): Promise<void>;
}

/**
 * Migration info
 */
export interface MigrationInfo {
  name: string;
  batch: number;
  migration_time: Date;
}

/**
 * Seeder interface
 */
export interface Seeder {
  run(db: Knex): Promise<void>;
}

/**
 * Relation types
 */
export type RelationType = 'hasOne' | 'hasMany' | 'belongsTo' | 'belongsToMany';

/**
 * Relation definition
 */
export interface RelationDefinition {
  type: RelationType;
  model: string | ModelConstructor;
  foreignKey?: string;
  localKey?: string;
  pivotTable?: string;
  pivotForeignKey?: string;
  pivotRelatedKey?: string;
}

/**
 * Model attributes
 */
export type ModelAttributes<T> = {
  [K in keyof T]: T[K];
};

/**
 * Create input (excludes auto-generated fields)
 */
export type CreateInput<T> = Omit<T, 'id' | 'createdAt' | 'updatedAt'>;

/**
 * Update input (all fields optional)
 */
export type UpdateInput<T> = Partial<Omit<T, 'id' | 'createdAt'>>;

/**
 * Hook types
 */
export type HookType =
  | 'beforeCreate'
  | 'afterCreate'
  | 'beforeUpdate'
  | 'afterUpdate'
  | 'beforeDelete'
  | 'afterDelete'
  | 'beforeSave'
  | 'afterSave';

/**
 * Hook function
 */
export type HookFunction<T = any> = (model: T) => Promise<void> | void;

/**
 * Database instance for CurisJS context
 */
export interface DatabaseInstance {
  knex: Knex;
  transaction<T>(callback: (trx: Knex.Transaction) => Promise<T>): Promise<T>;
  raw(query: string, bindings?: any[]): Promise<any>;
  destroy(): Promise<void>;
  [tableName: string]: any; // Dynamic model accessors
}

/**
 * Extend CurisJS Context with database
 */
declare module '@curisjs/core' {
  interface Context {
    db?: DatabaseInstance;
  }
}
