/**
 * Database Connection Manager
 * Manages Knex instances with singleton pattern and runtime detection
 */

import knex, { type Knex } from 'knex';
import type { ConnectionConfig, DatabaseConfig } from './types';

/**
 * Connection manager class
 */
export class ConnectionManager {
  private static instances: Map<string, Knex> = new Map();
  private static config: DatabaseConfig | null = null;

  /**
   * Initialize database configuration
   */
  static initialize(config: DatabaseConfig): void {
    this.config = config;
  }

  /**
   * Get or create a connection
   */
  static getConnection(name: string = 'default'): Knex {
    if (!this.config) {
      throw new Error('Database not initialized. Call ConnectionManager.initialize() first.');
    }

    // Return existing connection
    if (this.instances.has(name)) {
      return this.instances.get(name)!;
    }

    // Get connection name (resolve 'default' to actual connection name)
    const connectionName = name === 'default' ? this.config.default : name;
    const connectionConfig = this.config.connections[connectionName];

    if (!connectionConfig) {
      throw new Error(`Connection '${connectionName}' not found in configuration.`);
    }

    // Create new connection
    const instance = this.createKnexInstance(connectionConfig);
    this.instances.set(name, instance);

    return instance;
  }

  /**
   * Create Knex instance with runtime-specific optimizations
   */
  private static createKnexInstance(config: ConnectionConfig): Knex {
    const knexConfig: Knex.Config = {
      client: config.client,
      connection: config.connection,
      useNullAsDefault: config.useNullAsDefault ?? config.client === 'better-sqlite3',
      debug: config.debug ?? false,
    };

    // Add pool configuration
    if (config.pool) {
      knexConfig.pool = {
        min: config.pool.min ?? 2,
        max: config.pool.max ?? 10,
        acquireTimeoutMillis: config.pool.acquireTimeoutMillis,
        idleTimeoutMillis: config.pool.idleTimeoutMillis,
      };
    }

    // Add migration configuration
    if (config.migrations) {
      knexConfig.migrations = {
        directory: config.migrations.directory ?? './migrations',
        tableName: config.migrations.tableName ?? 'migrations',
        extension: config.migrations.extension ?? 'ts',
      };
    }

    // Add seeds configuration
    if (config.seeds) {
      knexConfig.seeds = {
        directory: config.seeds.directory ?? './seeders',
        extension: config.seeds.extension ?? 'ts',
      };
    }

    // Runtime-specific optimizations
    const runtime = this.detectRuntime();

    if (runtime === 'bun' && config.client === 'better-sqlite3') {
      // Bun has native SQLite support
      // Use Bun's native sqlite for better performance
      // For now, we'll use the standard driver
    }

    return knex(knexConfig);
  }

  /**
   * Detect current runtime
   */
  private static detectRuntime(): 'bun' | 'deno' | 'node' {
    // @ts-expect-error - Bun global
    if (typeof Bun !== 'undefined') return 'bun';
    // @ts-expect-error - Deno global
    if (typeof Deno !== 'undefined') return 'deno';
    return 'node';
  }

  /**
   * Close a specific connection
   */
  static async closeConnection(name: string = 'default'): Promise<void> {
    const instance = this.instances.get(name);
    if (instance) {
      await instance.destroy();
      this.instances.delete(name);
    }
  }

  /**
   * Close all connections
   */
  static async closeAll(): Promise<void> {
    const closePromises = Array.from(this.instances.values()).map((instance) => instance.destroy());
    await Promise.all(closePromises);
    this.instances.clear();
  }

  /**
   * Check if connection exists
   */
  static hasConnection(name: string = 'default'): boolean {
    return this.instances.has(name);
  }

  /**
   * Get all connection names
   */
  static getConnectionNames(): string[] {
    return Array.from(this.instances.keys());
  }
}

/**
 * Create a database instance with connection
 */
export function createDatabase(config: ConnectionConfig, name: string = 'default'): Knex {
  const fullConfig: DatabaseConfig = {
    default: name,
    connections: {
      [name]: config,
    },
  };

  ConnectionManager.initialize(fullConfig);
  return ConnectionManager.getConnection(name);
}

/**
 * Get the default database connection
 */
export function getDatabase(name?: string): Knex {
  return ConnectionManager.getConnection(name);
}

/**
 * Close database connections
 */
export async function closeDatabase(name?: string): Promise<void> {
  if (name) {
    await ConnectionManager.closeConnection(name);
  } else {
    await ConnectionManager.closeAll();
  }
}
