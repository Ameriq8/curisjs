/**
 * @curisjs/db - Query Builder Example
 *
 * Demonstrates advanced query building features
 *
 * Run: bun run examples/query-builder.ts
 */

import { createDatabase } from '../src/index';

// Initialize database
const db = createDatabase({
  client: 'better-sqlite3',
  connection: { filename: ':memory:' },
  useNullAsDefault: true,
});

// Create users table
await db.schema.createTable('users', (table) => {
  table.increments('id').primary();
  table.string('name').notNullable();
  table.string('email').unique().notNullable();
  table.integer('age').notNullable();
  table.string('city').nullable();
  table.timestamps(true, true);
});

// Insert test data
await db('users').insert([
  { name: 'Alice', email: 'alice@example.com', age: 25, city: 'New York' },
  { name: 'Bob', email: 'bob@example.com', age: 30, city: 'London' },
  { name: 'Charlie', email: 'charlie@example.com', age: 35, city: 'Paris' },
  { name: 'Diana', email: 'diana@example.com', age: 28, city: 'New York' },
  { name: 'Eve', email: 'eve@example.com', age: 32, city: 'London' },
]);

console.log('📊 Query Builder Examples\n');

// Example 1: Simple select
console.log('1️⃣ All users:');
const allUsers = await db('users').select('*');
console.log(allUsers);
console.log('');

// Example 2: Filtered query
console.log('2️⃣ Users from New York:');
const nyUsers = await db('users').where('city', 'New York').select('name', 'email');
console.log(nyUsers);
console.log('');

// Example 3: Age range
console.log('3️⃣ Users aged 28-32:');
const ageRange = await db('users')
  .whereBetween('age', [28, 32])
  .orderBy('age', 'asc')
  .select('name', 'age');
console.log(ageRange);
console.log('');

// Example 4: Multiple conditions
console.log('4️⃣ Young users from London or Paris:');
const youngEuropeans = await db('users')
  .where('age', '<', 33)
  .whereIn('city', ['London', 'Paris'])
  .select('name', 'city', 'age');
console.log(youngEuropeans);
console.log('');

// Example 5: Count and group
console.log('5️⃣ Users per city:');
const usersByCity = await db('users')
  .select('city')
  .count('* as count')
  .groupBy('city')
  .orderBy('count', 'desc');
console.log(usersByCity);
console.log('');

// Example 6: Average age
console.log('6️⃣ Average age:');
const avgAge = await db('users').avg('age as avgAge').first();
console.log(`Average age: ${avgAge?.avgAge || 0}`);
console.log('');

// Example 7: Update
console.log("7️⃣ Update Bob's age:");
await db('users').where('name', 'Bob').update({ age: 31 });
const bob = await db('users').where('name', 'Bob').first();
console.log(`Bob's new age: ${bob.age}`);
console.log('');

// Example 8: Raw queries
console.log('8️⃣ Raw query - users with names starting with "A" or "E":');
const rawResult = await db('users')
  .whereRaw('name LIKE ? OR name LIKE ?', ['A%', 'E%'])
  .select('name');
console.log(rawResult);
console.log('');

// Cleanup
await db.destroy();
console.log('✅ Examples completed!');
