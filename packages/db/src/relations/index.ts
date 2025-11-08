/**
 * @curisjs/db - Relations
 * Relationship management for models
 */

export * from './types';
export * from './loader';

import type { Model } from '../model';
import type { RelationConfig, BelongsToManyConfig, Relation } from './types';

/**
 * Define a hasOne relation (one-to-one)
 *
 * @example
 * class User extends Model {
 *   profile() {
 *     return this.hasOne(Profile, 'userId');
 *   }
 * }
 */
export function hasOne(model: typeof Model, foreignKey: string, localKey: string = 'id'): Relation {
  return {
    type: 'hasOne',
    name: '',
    config: {
      model,
      foreignKey,
      localKey,
    } as RelationConfig,
  };
}

/**
 * Define a hasMany relation (one-to-many)
 *
 * @example
 * class User extends Model {
 *   posts() {
 *     return this.hasMany(Post, 'userId');
 *   }
 * }
 */
export function hasMany(
  model: typeof Model,
  foreignKey: string,
  localKey: string = 'id'
): Relation {
  return {
    type: 'hasMany',
    name: '',
    config: {
      model,
      foreignKey,
      localKey,
    } as RelationConfig,
  };
}

/**
 * Define a belongsTo relation (inverse of hasMany)
 *
 * @example
 * class Post extends Model {
 *   user() {
 *     return this.belongsTo(User, 'userId');
 *   }
 * }
 */
export function belongsTo(
  model: typeof Model,
  foreignKey: string,
  localKey: string = 'id'
): Relation {
  return {
    type: 'belongsTo',
    name: '',
    config: {
      model,
      foreignKey,
      localKey,
    } as RelationConfig,
  };
}

/**
 * Define a belongsToMany relation (many-to-many)
 *
 * @example
 * class Post extends Model {
 *   tags() {
 *     return this.belongsToMany(
 *       Tag,
 *       'post_tags',
 *       'postId',
 *       'tagId',
 *       'id',
 *       ['created_at']
 *     );
 *   }
 * }
 */
export function belongsToMany(
  model: typeof Model,
  pivotTable: string,
  pivotForeignKey: string,
  pivotRelatedKey: string,
  localKey: string = 'id',
  pivotColumns: string[] = []
): Relation {
  return {
    type: 'belongsToMany',
    name: '',
    config: {
      model,
      foreignKey: pivotForeignKey,
      localKey,
      pivotTable,
      pivotForeignKey,
      pivotRelatedKey,
      pivotColumns,
    } as BelongsToManyConfig,
  };
}
