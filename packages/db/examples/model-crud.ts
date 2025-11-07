/**
 * @curisjs/db - Model CRUD Example
 *
 * Demonstrates Model class usage with Active Record pattern
 *
 * Run: bun run examples/model-crud.ts
 */

import { Model, schema, createDatabase } from '../src/index.js';

// Initialize database
const db = createDatabase({
  client: 'better-sqlite3',
  connection: { filename: ':memory:' },
  useNullAsDefault: true,
});

// Define schema
const userSchema = schema.define('users', {
  id: schema.integer().primaryKey().autoIncrement(),
  name: schema.string().length(255).notNullable(),
  email: schema.string().length(255).unique().notNullable(),
  age: schema.integer().nullable(),
  active: schema.boolean().default(true).notNullable(),
}, {
  timestamps: true,
  softDeletes: true,
});

// Define model
class User extends Model {
  static tableName = 'users';
  static schema = userSchema;

  id!: number;
  name!: string;
  email!: string;
  age?: number;
  active!: boolean;
  createdAt!: Date;
  updatedAt!: Date;
  deletedAt?: Date;
}

// Create table
await db.schema.createTable('users', (table) => {
  table.increments('id').primary();
  table.string('name', 255).notNullable();
  table.string('email', 255).unique().notNullable();
  table.integer('age').nullable();
  table.boolean('active').defaultTo(true).notNullable();
  table.timestamps(true, true);
  table.datetime('deletedAt').nullable();
});

console.log('👥 Model CRUD Examples\n');

// Example 1: Create users
console.log('1️⃣ Creating users:');
const user1 = await User.create({
  name: 'Alice Johnson',
  email: 'alice@example.com',
  age: 25,
});
console.log('Created:', user1);

const user2 = await User.create({
  name: 'Bob Smith',
  email: 'bob@example.com',
  age: 30,
});

const user3 = await User.create({
  name: 'Charlie Brown',
  email: 'charlie@example.com',
  // age is optional
});
console.log('');

// Example 2: Find by ID
console.log('2️⃣ Find user by ID:');
const foundUser = await User.find(1);
console.log('Found:', foundUser);
console.log('');

// Example 3: Find many with filters
console.log('3️⃣ Find users with age >= 25:');
const adults = await User.findMany({
  where: { age: 25 },
  orderBy: { age: 'asc' },
});
console.log('Found:', adults.length, 'users');
console.table(adults);
console.log('');

// Example 4: Find all
console.log('4️⃣ All users:');
const allUsers = await User.all();
console.log('Total users:', allUsers.length);
console.log('');

// Example 5: Update
console.log('5️⃣ Update user:');
await User.update(
  { where: { id: 1 } },
  { age: 26, name: 'Alice Johnson Jr.' }
);
const updated = await User.find(1);
console.log('Updated user:', updated);
console.log('');

// Example 6: Count
console.log('6️⃣ Count users:');
const totalCount = await User.count();
const activeCount = await User.count({ where: { active: true } });
console.log(`Total: ${totalCount}, Active: ${activeCount}`);
console.log('');

// Example 7: Soft delete
console.log('7️⃣ Soft delete user:');
await User.delete({ where: { id: 2 } });
const remainingUsers = await User.findMany();
console.log('Remaining users after delete:', remainingUsers.length);
console.table(remainingUsers);
console.log('');

// Example 8: With trashed
console.log('8️⃣ Include soft-deleted users:');
const withTrashed = await User.withTrashed().get();
console.log('With trashed:', withTrashed.length);
console.table(withTrashed);
console.log('');

// Example 9: Only trashed
console.log('9️⃣ Only soft-deleted users:');
const onlyTrashed = await User.onlyTrashed().get();
console.log('Trashed users:', onlyTrashed.length);
console.table(onlyTrashed);
console.log('');

// Example 10: Restore
console.log('🔟 Restore soft-deleted user:');
await User.restore({ where: { id: 2 } });
const afterRestore = await User.findMany();
console.log('Users after restore:', afterRestore.length);
console.table(afterRestore);
console.log('');

// Example 11: Query builder
console.log('1️⃣1️⃣ Using query builder:');
const youngUsers = await User.query()
  .where('age', '<', 30)
  .orderBy('name', 'asc')
  .get();
console.log('Young users:', youngUsers);
console.log('');

// Example 12: Exists
console.log('1️⃣2️⃣ Check if user exists:');
const exists = await User.exists({ where: { email: 'alice@example.com' } });
console.log('Alice exists:', exists);
console.log('');

// Cleanup
await db.destroy();
console.log('✅ Examples completed!');
