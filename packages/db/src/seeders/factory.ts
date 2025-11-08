/**
 * @curisjs/db - Factory Pattern
 * Generate fake data for testing and seeding
 */

import type { Model } from '../model';

export class Factory<T = any> {
  private count: number = 1;
  private attributes: Partial<T>[] = [];

  constructor(
    private definition: (index: number) => Partial<T>,
    private modelClass?: typeof Model
  ) {}

  /**
   * Set number of records to create
   */
  times(count: number): this {
    this.count = count;
    return this;
  }

  /**
   * Override specific attributes
   */
  state(attributes: Partial<T>): this {
    this.attributes.push(attributes);
    return this;
  }

  /**
   * Generate attributes without creating records
   */
  make(): Partial<T>[] {
    const records: Partial<T>[] = [];

    for (let i = 0; i < this.count; i++) {
      const baseAttributes = this.definition(i);
      const overrides = this.attributes[i] || {};
      records.push({ ...baseAttributes, ...overrides });
    }

    return records;
  }

  /**
   * Create records in database
   */
  async create(): Promise<T[]> {
    const records = this.make();

    if (!this.modelClass) {
      throw new Error('Model class is required for create()');
    }

    const created: T[] = [];
    for (const record of records) {
      const instance = await this.modelClass.create({ data: record });
      created.push(instance as T);
    }

    return created;
  }

  /**
   * Create a single record
   */
  async createOne(attributes?: Partial<T>): Promise<T> {
    this.count = 1;
    if (attributes) {
      this.state(attributes);
    }
    const records = await this.create();
    return records[0]!;
  }
}

/**
 * Define a factory for a model
 */
export function defineFactory<T = any>(
  modelClass: typeof Model,
  definition: (index: number) => Partial<T>
): Factory<T> {
  return new Factory(definition, modelClass);
}

/**
 * Define a factory without a model (for raw data)
 */
export function defineRawFactory<T = any>(definition: (index: number) => Partial<T>): Factory<T> {
  return new Factory(definition);
}
