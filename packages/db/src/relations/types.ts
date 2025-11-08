/**
 * @curisjs/db - Relation Types
 */

import type { Model } from '../model';
import type { QueryBuilder } from '../query-builder';

/**
 * Relation types
 */
export type RelationType = 'hasOne' | 'hasMany' | 'belongsTo' | 'belongsToMany';

/**
 * Base relation configuration
 */
export interface RelationConfig {
  /**
   * Related model class
   */
  model: typeof Model;

  /**
   * Foreign key in related table (or this table for belongsTo)
   */
  foreignKey: string;

  /**
   * Local key (defaults to 'id')
   */
  localKey?: string;
}

/**
 * BelongsToMany specific configuration
 */
export interface BelongsToManyConfig extends RelationConfig {
  /**
   * Pivot table name
   */
  pivotTable: string;

  /**
   * Foreign key in pivot table for this model
   */
  pivotForeignKey: string;

  /**
   * Foreign key in pivot table for related model
   */
  pivotRelatedKey: string;

  /**
   * Additional pivot columns to retrieve
   */
  pivotColumns?: string[];
}

/**
 * Relation definition
 */
export interface Relation {
  type: RelationType;
  config: RelationConfig | BelongsToManyConfig;
  name: string;
}

/**
 * Eager loading options
 */
export interface EagerLoadOptions {
  /**
   * Relation name
   */
  relation: string;

  /**
   * Nested relations to load
   */
  include?: EagerLoadOptions[];

  /**
   * Custom query builder modifications
   */
  query?: (qb: QueryBuilder<any>) => void;
}

/**
 * Loaded relation data
 */
export interface LoadedRelation<T = any> {
  name: string;
  data: T | T[] | null;
}
