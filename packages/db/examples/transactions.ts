/**
 * @curisjs/db - Transaction Example
 *
 * Demonstrates transaction usage for ACID-compliant operations
 *
 * Run: bun run examples/transactions.ts
 */

import { createDatabase, transaction } from '../src/index';

// Initialize database
const db = createDatabase({
  client: 'better-sqlite3',
  connection: { filename: ':memory:' },
  useNullAsDefault: true,
});

// Create accounts table
await db.schema.createTable('accounts', (table) => {
  table.increments('id').primary();
  table.string('name').notNullable();
  table.decimal('balance', 10, 2).notNullable();
});

// Create transactions table
await db.schema.createTable('transactions', (table) => {
  table.increments('id').primary();
  table.integer('from_account_id').notNullable();
  table.integer('to_account_id').notNullable();
  table.decimal('amount', 10, 2).notNullable();
  table.timestamp('created_at').defaultTo(db.fn.now());
});

// Insert test accounts
await db('accounts').insert([
  { name: 'Alice', balance: 1000.0 },
  { name: 'Bob', balance: 500.0 },
  { name: 'Charlie', balance: 750.0 },
]);

console.log('💰 Transaction Examples\n');

// Show initial balances
console.log('Initial balances:');
const initialBalances = await db('accounts').select('*');
console.table(initialBalances);
console.log('');

// Example 1: Successful transfer
console.log('1️⃣ Transfer $200 from Alice to Bob (SUCCESS):');
try {
  await transaction(async (trx) => {
    // Deduct from Alice
    await trx('accounts').where('name', 'Alice').decrement('balance', 200);

    // Add to Bob
    await trx('accounts').where('name', 'Bob').increment('balance', 200);

    // Record transaction
    await trx('transactions').insert({
      from_account_id: 1,
      to_account_id: 2,
      amount: 200,
    });

    console.log('✅ Transfer completed successfully!');
  });
} catch (error) {
  console.error('❌ Transfer failed:', error);
}

const balancesAfterSuccess = await db('accounts').select('*');
console.table(balancesAfterSuccess);
console.log('');

// Example 2: Failed transfer (insufficient funds - will rollback)
console.log('2️⃣ Transfer $1000 from Bob to Charlie (FAIL - insufficient funds):');
try {
  await transaction(async (trx) => {
    // Get Bob's balance
    const bob = await trx('accounts').where('name', 'Bob').first();

    if (bob.balance < 1000) {
      throw new Error('Insufficient funds');
    }

    // This won't execute due to the error above
    await trx('accounts').where('name', 'Bob').decrement('balance', 1000);

    await trx('accounts').where('name', 'Charlie').increment('balance', 1000);

    await trx('transactions').insert({
      from_account_id: 2,
      to_account_id: 3,
      amount: 1000,
    });
  });
} catch (error) {
  console.log('❌ Transfer failed (as expected):', (error as Error).message);
}

const balancesAfterFail = await db('accounts').select('*');
console.log('Balances unchanged due to rollback:');
console.table(balancesAfterFail);
console.log('');

// Example 3: Multiple operations in one transaction
console.log('3️⃣ Chain transfer: Alice → Bob → Charlie ($100 each):');
try {
  await transaction(async (trx) => {
    // Alice to Bob
    await trx('accounts').where('name', 'Alice').decrement('balance', 100);
    await trx('accounts').where('name', 'Bob').increment('balance', 100);
    await trx('transactions').insert({
      from_account_id: 1,
      to_account_id: 2,
      amount: 100,
    });

    // Bob to Charlie
    await trx('accounts').where('name', 'Bob').decrement('balance', 100);
    await trx('accounts').where('name', 'Charlie').increment('balance', 100);
    await trx('transactions').insert({
      from_account_id: 2,
      to_account_id: 3,
      amount: 100,
    });

    console.log('✅ Chain transfer completed!');
  });
} catch (error) {
  console.error('❌ Chain transfer failed:', error);
}

const finalBalances = await db('accounts').select('*');
console.log('Final balances:');
console.table(finalBalances);
console.log('');

// Show all transactions
console.log('Transaction history:');
const allTransactions = await db('transactions').select('*').orderBy('created_at', 'desc');
console.table(allTransactions);

// Cleanup
await db.destroy();
console.log('\n✅ Examples completed!');
