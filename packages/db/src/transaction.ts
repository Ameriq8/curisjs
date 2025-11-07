/**
 * Transaction API - Managed database transactions
 */

import type { Knex } from 'knex';
import { getDatabase } from './connection.js';

/**
 * Execute a function within a transaction
 * Automatically commits on success, rollsback on error
 */
export async function transaction<T>(
  callback: (trx: Knex.Transaction) => Promise<T>,
  connectionName: string = 'default'
): Promise<T> {
  const db = getDatabase(connectionName);

  return db.transaction(async (trx) => {
    return callback(trx);
  });
}

/**
 * Transaction wrapper class
 */
export class Transaction {
  private trx: Knex.Transaction;
  private completed: boolean = false;

  constructor(trx: Knex.Transaction) {
    this.trx = trx;
  }

  /**
   * Get the underlying Knex transaction
   */
  get connection(): Knex.Transaction {
    return this.trx;
  }

  /**
   * Commit the transaction
   */
  async commit(): Promise<void> {
    if (this.completed) {
      throw new Error('Transaction already completed');
    }
    await this.trx.commit();
    this.completed = true;
  }

  /**
   * Rollback the transaction
   */
  async rollback(): Promise<void> {
    if (this.completed) {
      throw new Error('Transaction already completed');
    }
    await this.trx.rollback();
    this.completed = true;
  }

  /**
   * Check if transaction is completed
   */
  isCompleted(): boolean {
    return this.completed;
  }
}

/**
 * Create a manual transaction (requires explicit commit/rollback)
 */
export async function beginTransaction(
  connectionName: string = 'default'
): Promise<Transaction> {
  const db = getDatabase(connectionName);
  const trx = await db.transaction();
  return new Transaction(trx);
}
