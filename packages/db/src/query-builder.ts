/**
 * Query Builder - Fluent API for building database queries
 */

import type { Knex } from 'knex';
import type { WhereClause } from './types';

export class QueryBuilder<T = any> {
  protected query: Knex.QueryBuilder;
  protected Model: any;

  constructor(query: Knex.QueryBuilder, Model?: any) {
    this.query = query;
    this.Model = Model;
  }

  /**
   * Add where clause
   */
  where(column: keyof T | WhereClause<T>, operator?: any, value?: any): this {
    if (typeof column === 'object') {
      // Object syntax: where({ name: 'John', age: 25 })
      this.query.where(column as any);
    } else if (arguments.length === 2) {
      // Two args: where('name', 'John')
      this.query.where(column as string, operator);
    } else {
      // Three args: where('age', '>', 18)
      this.query.where(column as string, operator, value);
    }
    return this;
  }

  /**
   * Add OR where clause
   */
  orWhere(column: keyof T | WhereClause<T>, operator?: any, value?: any): this {
    if (typeof column === 'object') {
      this.query.orWhere(column as any);
    } else if (arguments.length === 2) {
      this.query.orWhere(column as string, operator);
    } else {
      this.query.orWhere(column as string, operator, value);
    }
    return this;
  }

  /**
   * Where IN clause
   */
  whereIn(column: keyof T, values: any[]): this {
    this.query.whereIn(column as string, values);
    return this;
  }

  /**
   * Where NOT IN clause
   */
  whereNotIn(column: keyof T, values: any[]): this {
    this.query.whereNotIn(column as string, values);
    return this;
  }

  /**
   * Where NULL clause
   */
  whereNull(column: keyof T): this {
    this.query.whereNull(column as string);
    return this;
  }

  /**
   * Where NOT NULL clause
   */
  whereNotNull(column: keyof T): this {
    this.query.whereNotNull(column as string);
    return this;
  }

  /**
   * Where BETWEEN clause
   */
  whereBetween(column: keyof T, range: [any, any]): this {
    this.query.whereBetween(column as string, range);
    return this;
  }

  /**
   * Select specific columns
   */
  select(...columns: (keyof T)[]): this {
    if (columns.length > 0) {
      this.query.select(columns as string[]);
    }
    return this;
  }

  /**
   * Order by column
   */
  orderBy(column: keyof T, direction: 'asc' | 'desc' = 'asc'): this {
    this.query.orderBy(column as string, direction);
    return this;
  }

  /**
   * Limit results
   */
  limit(count: number): this {
    this.query.limit(count);
    return this;
  }

  /**
   * Offset results
   */
  offset(count: number): this {
    this.query.offset(count);
    return this;
  }

  /**
   * Join table
   */
  join(table: string, first: string, operator?: string, second?: string): this {
    if (second) {
      this.query.join(table, first, operator!, second);
    } else {
      this.query.join(table, first, operator!);
    }
    return this;
  }

  /**
   * Left join table
   */
  leftJoin(table: string, first: string, operator?: string, second?: string): this {
    if (second) {
      this.query.leftJoin(table, first, operator!, second);
    } else {
      this.query.leftJoin(table, first, operator!);
    }
    return this;
  }

  /**
   * Group by columns
   */
  groupBy(...columns: (keyof T)[]): this {
    this.query.groupBy(columns as string[]);
    return this;
  }

  /**
   * Having clause
   */
  having(column: keyof T, operator: string, value: any): this {
    this.query.having(column as string, operator, value);
    return this;
  }

  /**
   * Count records
   */
  async count(column: keyof T | '*' = '*'): Promise<number> {
    const result = await this.query.count(column as string, { as: 'count' });
    return parseInt(result[0]?.count as string, 10) || 0;
  }

  /**
   * Get first result
   */
  async first(): Promise<T | null> {
    const result = await this.query.first();
    return result ? (this.Model ? new this.Model(result) : result) : null;
  }

  /**
   * Get all results
   */
  async get(): Promise<T[]> {
    const results = await this.query;
    return this.Model ? results.map((row: any) => new this.Model(row)) : results;
  }

  /**
   * Execute query and get results
   */
  async execute(): Promise<T[]> {
    return this.get();
  }

  /**
   * Get SQL query string (for debugging)
   */
  toSQL(): string {
    return this.query.toSQL().sql;
  }

  /**
   * Clone query builder
   */
  clone(): QueryBuilder<T> {
    return new QueryBuilder<T>(this.query.clone(), this.Model);
  }
}
