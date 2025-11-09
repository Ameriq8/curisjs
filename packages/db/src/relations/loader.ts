/**
 * @curisjs/db - Relation Loader
 * Handles eager and lazy loading of relations
 */

import type { Model } from '../model';
import type { Relation, EagerLoadOptions, RelationConfig, BelongsToManyConfig } from './types';

export class RelationLoader {
  /**
   * Load a single relation for one model instance
   */
  static async loadOne<T extends Model>(instance: T, relation: Relation): Promise<any> {
    const { type, config } = relation;

    switch (type) {
      case 'hasOne':
        return await this.loadHasOne(instance, config as RelationConfig);
      case 'hasMany':
        return await this.loadHasMany(instance, config as RelationConfig);
      case 'belongsTo':
        return await this.loadBelongsTo(instance, config as RelationConfig);
      case 'belongsToMany':
        return await this.loadBelongsToMany(instance, config as BelongsToManyConfig);
      default:
        throw new Error(`Unknown relation type: ${type}`);
    }
  }

  /**
   * Load relations for multiple model instances (eager loading)
   */
  static async loadMany<T extends Model>(
    instances: T[],
    relations: string[] | EagerLoadOptions[],
    modelRelations: Map<string, Relation>
  ): Promise<void> {
    if (instances.length === 0) return;

    // Normalize relations to EagerLoadOptions
    const normalizedRelations = relations.map((rel) =>
      typeof rel === 'string' ? { relation: rel } : rel
    );

    for (const relOption of normalizedRelations) {
      const relation = modelRelations.get(relOption.relation);
      if (!relation) {
        throw new Error(`Unknown relation: ${relOption.relation}`);
      }

      const { type } = relation;

      switch (type) {
        case 'hasOne':
          await this.eagerLoadHasOne(instances, relation, relOption);
          break;
        case 'hasMany':
          await this.eagerLoadHasMany(instances, relation, relOption);
          break;
        case 'belongsTo':
          await this.eagerLoadBelongsTo(instances, relation, relOption);
          break;
        case 'belongsToMany':
          await this.eagerLoadBelongsToMany(instances, relation, relOption);
          break;
      }
    }
  }

  /**
   * Load hasOne relation (one-to-one)
   */
  private static async loadHasOne(instance: Model, config: RelationConfig): Promise<any> {
    const localKey = config.localKey || 'id';
    const localValue = (instance as any)[localKey];

    if (!localValue) return null;

    const query = config.model.query();
    return await query.where(config.foreignKey, '=', localValue).first();
  }

  /**
   * Load hasMany relation (one-to-many)
   */
  private static async loadHasMany(instance: Model, config: RelationConfig): Promise<any[]> {
    const localKey = config.localKey || 'id';
    const localValue = (instance as any)[localKey];

    if (!localValue) return [];

    const query = config.model.query();
    return await query.where(config.foreignKey, '=', localValue).get();
  }

  /**
   * Load belongsTo relation (inverse one-to-many)
   */
  private static async loadBelongsTo(instance: Model, config: RelationConfig): Promise<any> {
    const foreignValue = (instance as any)[config.foreignKey];

    if (!foreignValue) return null;

    const localKey = config.localKey || 'id';
    const query = config.model.query();
    return await query.where(localKey, '=', foreignValue).first();
  }

  /**
   * Load belongsToMany relation (many-to-many)
   */
  private static async loadBelongsToMany(
    instance: Model,
    config: BelongsToManyConfig
  ): Promise<any[]> {
    const localKey = config.localKey || 'id';
    const localValue = (instance as any)[localKey];

    if (!localValue) return [];

    const RelatedModel = config.model;
    const relatedTable = RelatedModel.tableName;

    // Build query with pivot table join
    const query = RelatedModel.query();
    const qb = (query as any).queryBuilder;

    qb.select(`${relatedTable}.*`);

    // Add pivot columns if requested
    if (config.pivotColumns) {
      config.pivotColumns.forEach((col) => {
        qb.select(`${config.pivotTable}.${col} as pivot_${col}`);
      });
    }

    qb.innerJoin(
      config.pivotTable,
      `${relatedTable}.${config.localKey || 'id'}`,
      `${config.pivotTable}.${config.pivotRelatedKey}`
    ).where(`${config.pivotTable}.${config.pivotForeignKey}`, localValue);

    return await query.get();
  }

  /**
   * Eager load hasOne for multiple instances
   */
  private static async eagerLoadHasOne(
    instances: Model[],
    relation: Relation,
    options: EagerLoadOptions
  ): Promise<void> {
    const config = relation.config as RelationConfig;
    const localKey = config.localKey || 'id';
    const localValues = instances
      .map((instance) => (instance as any)[localKey])
      .filter((val) => val != null);

    if (localValues.length === 0) return;

    const query = config.model.query();

    if (options.query) {
      options.query(query);
    }

    const related = await query.whereIn(config.foreignKey, localValues).get();

    // Map related back to instances
    const relatedMap = new Map();
    for (const rel of related) {
      relatedMap.set((rel as any)[config.foreignKey], rel);
    }

    for (const instance of instances) {
      const localValue = (instance as any)[localKey];
      (instance as any)[relation.name] = relatedMap.get(localValue) || null;
    }

    // Load nested relations
    if (options.include && related.length > 0) {
      const nestedRelations = (config.model as any).relations || new Map();
      await this.loadMany(related as any[], options.include, nestedRelations);
    }
  }

  /**
   * Eager load hasMany for multiple instances
   */
  private static async eagerLoadHasMany(
    instances: Model[],
    relation: Relation,
    options: EagerLoadOptions
  ): Promise<void> {
    const config = relation.config as RelationConfig;
    const localKey = config.localKey || 'id';
    const localValues = instances
      .map((instance) => (instance as any)[localKey])
      .filter((val) => val != null);

    if (localValues.length === 0) return;

    const query = config.model.query();

    if (options.query) {
      options.query(query);
    }

    const related = await query.whereIn(config.foreignKey, localValues).get();

    // Group related by foreign key
    const relatedMap = new Map<any, any[]>();
    for (const rel of related) {
      const foreignValue = (rel as any)[config.foreignKey];
      if (!relatedMap.has(foreignValue)) {
        relatedMap.set(foreignValue, []);
      }
      relatedMap.get(foreignValue)!.push(rel);
    }

    for (const instance of instances) {
      const localValue = (instance as any)[localKey];
      (instance as any)[relation.name] = relatedMap.get(localValue) || [];
    }

    // Load nested relations
    if (options.include && related.length > 0) {
      const nestedRelations = (config.model as any).relations || new Map();
      await this.loadMany(related as any[], options.include, nestedRelations);
    }
  }

  /**
   * Eager load belongsTo for multiple instances
   */
  private static async eagerLoadBelongsTo(
    instances: Model[],
    relation: Relation,
    options: EagerLoadOptions
  ): Promise<void> {
    const config = relation.config as RelationConfig;
    const foreignValues = instances
      .map((instance) => (instance as any)[config.foreignKey])
      .filter((val) => val != null);

    if (foreignValues.length === 0) return;

    const localKey = config.localKey || 'id';
    const query = config.model.query();

    if (options.query) {
      options.query(query);
    }

    const related = await query.whereIn(localKey, foreignValues).get();

    // Map related by local key
    const relatedMap = new Map();
    for (const rel of related) {
      relatedMap.set((rel as any)[localKey], rel);
    }

    for (const instance of instances) {
      const foreignValue = (instance as any)[config.foreignKey];
      (instance as any)[relation.name] = relatedMap.get(foreignValue) || null;
    }

    // Load nested relations
    if (options.include && related.length > 0) {
      const nestedRelations = (config.model as any).relations || new Map();
      await this.loadMany(related as any[], options.include, nestedRelations);
    }
  }

  /**
   * Eager load belongsToMany for multiple instances
   */
  private static async eagerLoadBelongsToMany(
    instances: Model[],
    relation: Relation,
    options: EagerLoadOptions
  ): Promise<void> {
    const config = relation.config as BelongsToManyConfig;
    const localKey = config.localKey || 'id';
    const localValues = instances
      .map((instance) => (instance as any)[localKey])
      .filter((val) => val != null);

    if (localValues.length === 0) return;

    const RelatedModel = config.model;
    const relatedTable = RelatedModel.tableName;

    // Query pivot table to get all relationships
    const query = RelatedModel.query();
    const qb = (query as any).queryBuilder;

    qb.select(`${relatedTable}.*`, `${config.pivotTable}.${config.pivotForeignKey} as __pivot_key`);

    // Add pivot columns
    if (config.pivotColumns) {
      config.pivotColumns.forEach((col) => {
        qb.select(`${config.pivotTable}.${col} as pivot_${col}`);
      });
    }

    qb.innerJoin(
      config.pivotTable,
      `${relatedTable}.${config.localKey || 'id'}`,
      `${config.pivotTable}.${config.pivotRelatedKey}`
    ).whereIn(`${config.pivotTable}.${config.pivotForeignKey}`, localValues);

    if (options.query) {
      options.query(query);
    }

    const related = await query.get();

    // Group related by pivot key
    const relatedMap = new Map<any, any[]>();
    for (const rel of related) {
      const pivotKey = (rel as any).__pivot_key;
      if (!relatedMap.has(pivotKey)) {
        relatedMap.set(pivotKey, []);
      }
      delete (rel as any).__pivot_key;
      relatedMap.get(pivotKey)!.push(rel);
    }

    for (const instance of instances) {
      const localValue = (instance as any)[localKey];
      (instance as any)[relation.name] = relatedMap.get(localValue) || [];
    }

    // Load nested relations
    if (options.include && related.length > 0) {
      const nestedRelations = (config.model as any).relations || new Map();
      await this.loadMany(related as any[], options.include, nestedRelations);
    }
  }
}
