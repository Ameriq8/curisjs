/**
 * Model Base Class - Active Record pattern for database models
 */

import type { Knex } from 'knex';
import { getDatabase } from './connection.js';
import { QueryBuilder } from './query-builder.js';
import type {
  CreateInput,
  UpdateInput,
  QueryOptions,
  HookFunction,
  HookType,
  SchemaDefinition,
} from './types.js';

export class Model<T = any> {
  /**
   * Table name (must be overridden in subclass)
   */
  static tableName: string;

  /**
   * Schema definition (optional)
   */
  static schema?: SchemaDefinition;

  /**
   * Connection name
   */
  static connection: string = 'default';

  /**
   * Primary key column
   */
  static primaryKey: string = 'id';

  /**
   * Enable timestamps (created_at, updated_at)
   */
  static timestamps: boolean = true;

  /**
   * Enable soft deletes (deleted_at)
   */
  static softDeletes: boolean = false;

  /**
   * Hooks registry
   */
  private static hooks: Map<HookType, HookFunction[]> = new Map();

  /**
   * Model attributes
   */
  [key: string]: any;

  /**
   * Constructor
   */
  constructor(attributes: Partial<T> = {}) {
    Object.assign(this, attributes);
  }

  /**
   * Get database connection
   */
  protected static getDB(): Knex {
    return getDatabase((this as any).connection);
  }

  /**
   * Get query builder
   */
  static query<T = any>(): QueryBuilder<T> {
    const db = this.getDB();
    let query = db(this.tableName);

    // Apply soft delete scope
    if (this.softDeletes) {
      query = query.whereNull('deletedAt');
    }

    return new QueryBuilder<T>(query, this);
  }

  /**
   * Find record by primary key
   */
  static async find<T = any>(id: number | string): Promise<T | null> {
    const result = await this.query<T>()
      .where(this.primaryKey as any, id)
      .first();
    return result;
  }

  /**
   * Find record by primary key or throw
   */
  static async findOrFail<T = any>(id: number | string): Promise<T> {
    const result = await this.find<T>(id);
    if (!result) {
      throw new Error(`${this.name} with ${this.primaryKey}=${id} not found`);
    }
    return result;
  }

  /**
   * Find many records
   */
  static async findMany<T = any>(options: QueryOptions<T> = {}): Promise<T[]> {
    let query = this.query<T>();

    // Apply where clauses
    if (options.where) {
      query = query.where(options.where as any);
    }

    // Apply select
    if (options.select && options.select.length > 0) {
      query = query.select(...options.select);
    }

    // Apply order by
      if (options.orderBy) {
        for (const [column, direction] of Object.entries(options.orderBy)) {
          query = query.orderBy(column as any, direction as 'asc' | 'desc');
        }
      }    // Apply limit
    if (options.limit) {
      query = query.limit(options.limit);
    }

    // Apply offset
    if (options.offset) {
      query = query.offset(options.offset);
    }

    return query.get();
  }

  /**
   * Find unique record
   */
  static async findUnique<T = any>(options: QueryOptions<T>): Promise<T | null> {
    let query = this.query<T>();

    if (options.where) {
      query = query.where(options.where as any);
    }

    if (options.select && options.select.length > 0) {
      query = query.select(...options.select);
    }

    return query.first();
  }

  /**
   * Get all records
   */
  static async all<T = any>(): Promise<T[]> {
    return this.findMany<T>();
  }

  /**
   * Create a new record
   */
  static async create<T = any>(data: CreateInput<T>): Promise<T> {
    const db = this.getDB();
    const instance = new this(data as any);

    // Run before hooks
    await this.runHooks('beforeCreate', instance);
    await this.runHooks('beforeSave', instance);

    // Add timestamps
    if (this.timestamps) {
      (instance as any).createdAt = new Date();
      (instance as any).updatedAt = new Date();
    }

    // Insert into database
    const [id] = await db(this.tableName).insert(instance);
    (instance as any)[this.primaryKey] = id;

    // Run after hooks
    await this.runHooks('afterCreate', instance);
    await this.runHooks('afterSave', instance);

    return instance as T;
  }

  /**
   * Update record(s)
   */
  static async update<T = any>(
    options: { where: any },
    data: UpdateInput<T>
  ): Promise<number> {
    const db = this.getDB();
    const updateData: any = { ...data };

    // Add updated timestamp
    if (this.timestamps) {
      updateData.updatedAt = new Date();
    }

    // Run hooks (if single record)
    await this.runHooks('beforeUpdate', updateData);

    const count = await db(this.tableName).where(options.where).update(updateData);

    // Run hooks
    await this.runHooks('afterUpdate', updateData);

    return count;
  }

  /**
   * Delete record(s)
   */
  static async delete(options: { where: any }): Promise<number> {
    const db = this.getDB();

    // Run hooks
    await this.runHooks('beforeDelete', options.where);

    let count: number;

    if (this.softDeletes) {
      // Soft delete
      count = await db(this.tableName)
        .where(options.where)
        .update({ deletedAt: new Date() });
    } else {
      // Hard delete
      count = await db(this.tableName).where(options.where).del();
    }

    // Run hooks
    await this.runHooks('afterDelete', options.where);

    return count;
  }

  /**
   * Count records
   */
  static async count(options: QueryOptions = {}): Promise<number> {
    let query = this.query();

    if (options.where) {
      query = query.where(options.where as any);
    }

    return query.count();
  }

  /**
   * Check if record exists
   */
  static async exists(options: QueryOptions): Promise<boolean> {
    const count = await this.count(options);
    return count > 0;
  }

  /**
   * Instance: Save model
   */
  async save(): Promise<this> {
    const Constructor = this.constructor as typeof Model;
    const db = Constructor.getDB();
    const pk = Constructor.primaryKey;

    if ((this as any)[pk]) {
      // Update existing record
      await Constructor.runHooks('beforeUpdate', this);
      await Constructor.runHooks('beforeSave', this);

      if (Constructor.timestamps) {
        (this as any).updatedAt = new Date();
      }

      await db(Constructor.tableName)
        .where(pk, (this as any)[pk])
        .update(this);

      await Constructor.runHooks('afterUpdate', this);
      await Constructor.runHooks('afterSave', this);
    } else {
      // Create new record
      await Constructor.runHooks('beforeCreate', this);
      await Constructor.runHooks('beforeSave', this);

      if (Constructor.timestamps) {
        (this as any).createdAt = new Date();
        (this as any).updatedAt = new Date();
      }

      const [id] = await db(Constructor.tableName).insert(this);
      (this as any)[pk] = id;

      await Constructor.runHooks('afterCreate', this);
      await Constructor.runHooks('afterSave', this);
    }

    return this;
  }

  /**
   * Instance: Delete model
   */
  async deleteInstance(): Promise<boolean> {
    const Constructor = this.constructor as typeof Model;
    const pk = Constructor.primaryKey;

    if (!(this as any)[pk]) {
      return false;
    }

    await Constructor.delete({ where: { [pk]: (this as any)[pk] } });
    return true;
  }

  /**
   * Instance: Refresh model from database
   */
  async refresh(): Promise<this> {
    const Constructor = this.constructor as typeof Model;
    const pk = Constructor.primaryKey;

    if (!(this as any)[pk]) {
      throw new Error('Cannot refresh model without primary key');
    }

    const fresh = await Constructor.find((this as any)[pk]);
    if (fresh) {
      Object.assign(this, fresh);
    }

    return this;
  }

  /**
   * Register a hook
   */
  static hook(type: HookType, fn: HookFunction): void {
    if (!this.hooks.has(type)) {
      this.hooks.set(type, []);
    }
    this.hooks.get(type)!.push(fn);
  }

  /**
   * Run hooks
   */
  private static async runHooks(type: HookType, data: any): Promise<void> {
    const hooks = this.hooks.get(type) || [];
    for (const hook of hooks) {
      await hook(data);
    }
  }

  /**
   * With trashed records (soft deletes)
   */
  static withTrashed<T = any>(): QueryBuilder<T> {
    const db = this.getDB();
    return new QueryBuilder<T>(db(this.tableName), this);
  }

  /**
   * Only trashed records (soft deletes)
   */
  static onlyTrashed<T = any>(): QueryBuilder<T> {
    const db = this.getDB();
    return new QueryBuilder<T>(db(this.tableName).whereNotNull('deletedAt'), this);
  }

  /**
   * Restore soft deleted record
   */
  static async restore(options: { where: any }): Promise<number> {
    if (!this.softDeletes) {
      throw new Error('Soft deletes not enabled on this model');
    }

    const db = this.getDB();
    return await db(this.tableName).where(options.where).update({ deletedAt: null });
  }

  /**
   * Convert model to JSON
   */
  toJSON(): Record<string, any> {
    const json: Record<string, any> = {};
    for (const key in this) {
      if (Object.prototype.hasOwnProperty.call(this, key) && typeof this[key] !== 'function') {
        json[key] = this[key];
      }
    }
    return json;
  }
}
