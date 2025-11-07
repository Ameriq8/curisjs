/**
 * Database Middleware - Inject database into CurisJS context
 */

import type { Context, Middleware, Next } from '@curisjs/core';
import { getDatabase } from '../connection.js';
import type { Knex } from 'knex';
import { transaction } from '../transaction.js';

/**
 * Database middleware options
 */
export interface DatabaseMiddlewareOptions {
  connection?: string;
}

/**
 * Create database middleware
 * Injects ctx.db into the context
 */
export function database(options: DatabaseMiddlewareOptions = {}): Middleware {
  const connectionName = options.connection || 'default';

  return async (ctx: Context, next: Next) => {
    const db = getDatabase(connectionName);

    // Inject database into context
    ctx.db = {
      knex: db,
      transaction: async <T>(callback: (trx: Knex.Transaction) => Promise<T>) => {
        return transaction(callback, connectionName);
      },
      raw: async (query: string, bindings?: any[]) => {
        return db.raw(query, bindings || []);
      },
      destroy: async () => {
        await db.destroy();
      },
    };

    // Add dynamic model accessors
    // This allows ctx.db.users, ctx.db.posts, etc.
    // Models should be registered with the database instance

    await next();
  };
}
