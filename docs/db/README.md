# @curisjs/db

Type-safe ORM and query builder for CurisJS applications.

## Table of Contents

- [Installation](#installation)
- [Quick Start](#quick-start)
- [Configuration](#configuration)
- [Models](#models)
- [Query Builder](#query-builder)
- [Migrations](#migrations)
- [Seeders](#seeders)
- [Relations](#relations)
- [Transactions](#transactions)
- [Schema Builder](#schema-builder)
- [Validation](#validation)

## Installation

```bash
npm install @curisjs/db
```

### Required Dependencies

```bash
npm install knex
npm install pg        # PostgreSQL
# or
npm install mysql2    # MySQL
# or
npm install sqlite3   # SQLite
```

## Quick Start

### 1. Create Database Config

Create `database.json`:

```json
{
  "default": {
    "client": "pg",
    "connection": {
      "host": "localhost",
      "port": 5432,
      "user": "postgres",
      "password": "password",
      "database": "myapp"
    },
    "pool": {
      "min": 2,
      "max": 10
    },
    "migrations": {
      "directory": "./database/migrations",
      "tableName": "migrations"
    },
    "seeds": {
      "directory": "./database/seeds"
    }
  }
}
```

### 2. Initialize Database

```typescript
import { createDatabase } from '@curisjs/db';

// Load config and create connection
await createDatabase({
  default: {
    client: 'pg',
    connection: process.env.DATABASE_URL,
  }
});
```

### 3. Create a Model

```typescript
import { Model } from '@curisjs/db';

class User extends Model {
  static tableName = 'users';
  static timestamps = true;  // created_at, updated_at
  static softDeletes = false;  // deleted_at
}

// Usage
const users = await User.findMany();
const user = await User.find(1);
```

## Configuration

### Connection Config

```typescript
import { defineConfig } from '@curisjs/db';

export default defineConfig({
  client: 'pg',  // 'pg' | 'mysql2' | 'sqlite3'
  connection: {
    host: '127.0.0.1',
    port: 5432,
    user: 'postgres',
    password: 'secret',
    database: 'myapp',
  },
  pool: {
    min: 2,
    max: 10,
  },
  migrations: {
    directory: './database/migrations',
    tableName: 'migrations',
  },
  seeds: {
    directory: './database/seeds',
  },
});
```

### Multiple Connections

```typescript
await createDatabase({
  default: {
    client: 'pg',
    connection: process.env.DATABASE_URL,
  },
  analytics: {
    client: 'mysql2',
    connection: process.env.ANALYTICS_DB_URL,
  },
});

// Use specific connection
class AnalyticsEvent extends Model {
  static tableName = 'events';
  static connection = 'analytics';
}
```

### Environment Variables

```bash
# .env
DATABASE_URL=postgresql://user:pass@localhost:5432/myapp
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=secret
DB_NAME=myapp
```

```typescript
import { createDatabase } from '@curisjs/db';

await createDatabase({
  default: {
    client: 'pg',
    connection: {
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT || '5432'),
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
    },
  },
});
```

## Models

Models use the Active Record pattern for database interactions.

### Defining Models

```typescript
import { Model } from '@curisjs/db';

class User extends Model {
  static tableName = 'users';
  static primaryKey = 'id';
  static timestamps = true;
  static softDeletes = false;
  static connection = 'default';
}

// With TypeScript types
interface UserAttributes {
  id: number;
  name: string;
  email: string;
  age: number;
  createdAt: Date;
  updatedAt: Date;
}

class User extends Model<UserAttributes> {
  static tableName = 'users';
}
```

### Finding Records

```typescript
// Find by primary key
const user = await User.find(1);
// Returns User | null

// Find or throw error
const user = await User.findOrFail(1);
// Returns User or throws error

// Find many
const users = await User.findMany({
  where: { active: true },
  orderBy: { createdAt: 'desc' },
  limit: 10,
  offset: 0,
});

// Find unique
const user = await User.findUnique({
  where: { email: 'john@example.com' },
});

// Find first
const admin = await User.findFirst({
  where: { role: 'admin' },
  orderBy: { createdAt: 'asc' },
});
```

### Creating Records

```typescript
// Create single record
const user = await User.create({
  name: 'John Doe',
  email: 'john@example.com',
  age: 25,
});

// Create many records
const users = await User.createMany([
  { name: 'John', email: 'john@example.com' },
  { name: 'Jane', email: 'jane@example.com' },
]);
```

### Updating Records

```typescript
// Update specific record
const user = await User.find(1);
await user.update({
  name: 'John Updated',
  email: 'newemail@example.com',
});

// Update where
const count = await User.updateWhere(
  { active: false },  // where
  { status: 'inactive' }  // data
);

// Update or create
const user = await User.upsert(
  { email: 'john@example.com' },  // unique where
  { name: 'John Updated' },  // update data
  { name: 'John', age: 25 }  // create data
);
```

### Deleting Records

```typescript
// Delete specific record
const user = await User.find(1);
await user.delete();

// Delete where
const count = await User.deleteWhere({ active: false });

// Soft delete (if enabled)
class User extends Model {
  static softDeletes = true;
}

await user.delete();  // Sets deleted_at
await user.restore();  // Clears deleted_at

// Force delete (permanent)
await user.forceDelete();

// Include soft deleted in queries
const users = await User.query().withTrashed().get();
const users = await User.query().onlyTrashed().get();
```

### Timestamps

```typescript
class User extends Model {
  static timestamps = true;
}

// Automatically manages:
// - created_at: Set on creation
// - updated_at: Updated on every save
```

### Model Hooks

```typescript
class User extends Model {
  static async beforeCreate(data: any) {
    // Hash password before creation
    data.password = await hash(data.password);
  }
  
  static async afterCreate(user: any) {
    // Send welcome email
    await sendWelcomeEmail(user.email);
  }
  
  static async beforeUpdate(data: any) {
    // Validate data
  }
  
  static async afterUpdate(user: any) {
    // Log changes
  }
  
  static async beforeDelete(user: any) {
    // Check dependencies
  }
  
  static async afterDelete(user: any) {
    // Cleanup related data
  }
}
```

## Query Builder

Fluent API for building complex queries.

### Basic Queries

```typescript
// Get all records
const users = await User.query().get();

// Get first record
const user = await User.query()
  .where('active', true)
  .first();

// Count records
const count = await User.query()
  .where('role', 'admin')
  .count();

// Check existence
const exists = await User.query()
  .where('email', 'john@example.com')
  .exists();
```

### Where Clauses

```typescript
// Simple where
User.query().where('name', 'John');
User.query().where('age', '>', 18);
User.query().where('status', '!=', 'banned');

// Multiple where (AND)
User.query()
  .where('active', true)
  .where('role', 'admin')
  .where('age', '>', 18);

// OR where
User.query()
  .where('role', 'admin')
  .orWhere('role', 'moderator');

// Where object
User.query().where({
  active: true,
  role: 'admin',
});

// Where IN
User.query().whereIn('role', ['admin', 'moderator']);
User.query().whereNotIn('status', ['banned', 'suspended']);

// Where NULL
User.query().whereNull('deletedAt');
User.query().whereNotNull('emailVerifiedAt');

// Where BETWEEN
User.query().whereBetween('age', [18, 65]);

// Raw where
User.query().whereRaw('age > ? AND role = ?', [18, 'admin']);
```

### Selecting Columns

```typescript
// Select specific columns
User.query().select('id', 'name', 'email');

// Select with aliases
User.query().select('name as fullName', 'email');

// Raw select
User.query().selectRaw('COUNT(*) as total');
```

### Ordering

```typescript
// Order by single column
User.query().orderBy('createdAt', 'desc');

// Order by multiple columns
User.query()
  .orderBy('role', 'asc')
  .orderBy('name', 'asc');

// Raw order by
User.query().orderByRaw('created_at DESC NULLS LAST');
```

### Limiting & Pagination

```typescript
// Limit
User.query().limit(10);

// Offset
User.query().limit(10).offset(20);

// Paginate
const result = await User.query().paginate({
  page: 1,
  perPage: 10,
});
// Returns: { data: [...], total: 100, page: 1, perPage: 10 }
```

### Joins

```typescript
// Inner join
User.query()
  .join('profiles', 'users.id', 'profiles.userId')
  .select('users.*', 'profiles.bio');

// Left join
User.query()
  .leftJoin('posts', 'users.id', 'posts.authorId');

// Multiple joins
User.query()
  .join('profiles', 'users.id', 'profiles.userId')
  .leftJoin('posts', 'users.id', 'posts.authorId')
  .where('posts.published', true);
```

### Aggregates

```typescript
// Count
const count = await User.query().count();
const activeCount = await User.query()
  .where('active', true)
  .count();

// Sum
const total = await Order.query().sum('amount');

// Average
const avgAge = await User.query().avg('age');

// Min/Max
const minAge = await User.query().min('age');
const maxAge = await User.query().max('age');
```

### Grouping

```typescript
User.query()
  .select('role')
  .count('* as total')
  .groupBy('role')
  .having('total', '>', 5);
```

### Raw Queries

```typescript
import { getDatabase } from '@curisjs/db';

const db = getDatabase();

// Raw query
const users = await db.raw('SELECT * FROM users WHERE active = ?', [true]);

// Raw in query builder
User.query()
  .whereRaw('age > ?', [18])
  .orderByRaw('created_at DESC');
```

## Migrations

Manage database schema changes.

### Creating Migrations

```bash
curis make:migration create_users_table
curis make:migration add_email_to_users
```

### Migration File

```typescript
import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('users', (table) => {
    table.increments('id').primary();
    table.string('name', 100).notNullable();
    table.string('email', 255).notNullable().unique();
    table.string('password', 255).notNullable();
    table.integer('age').unsigned();
    table.enum('role', ['user', 'admin']).defaultTo('user');
    table.boolean('active').defaultTo(true);
    table.timestamps(true, true);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('users');
}
```

### Running Migrations

```bash
# Run all pending migrations
curis db:migrate

# Rollback last batch
curis db:rollback

# Rollback all migrations
curis db:reset

# Check migration status
curis db:status
```

### Programmatic Migrations

```typescript
import { migrate, rollback, getMigrationStatus } from '@curisjs/db';

// Run migrations
await migrate();

// Rollback
await rollback();

// Get status
const status = await getMigrationStatus();
```

### Schema Builder

```typescript
import { schema } from '@curisjs/db';

// Create table
await schema.createTable('posts', (table) => {
  table.increments('id');
  table.string('title');
  table.text('content');
  table.integer('authorId').unsigned();
  table.foreign('authorId').references('users.id');
  table.timestamps(true, true);
});

// Alter table
await schema.alterTable('posts', (table) => {
  table.string('slug').unique();
  table.integer('views').defaultTo(0);
});

// Drop table
await schema.dropTable('posts');

// Check if table exists
const exists = await schema.hasTable('posts');
```

### Column Types

```typescript
table.increments('id');              // Auto-incrementing ID
table.bigIncrements('id');           // Big integer auto-increment
table.integer('count');              // Integer
table.bigInteger('big_count');       // Big integer
table.string('name', 100);           // VARCHAR(100)
table.text('description');           // TEXT
table.boolean('active');             // BOOLEAN
table.date('birthdate');             // DATE
table.datetime('created_at');        // DATETIME
table.timestamp('updated_at');       // TIMESTAMP
table.timestamps(true, true);        // created_at, updated_at
table.json('metadata');              // JSON
table.jsonb('data');                 // JSONB (PostgreSQL)
table.uuid('id');                    // UUID
table.enum('status', ['active', 'inactive']);
table.decimal('price', 8, 2);        // DECIMAL(8,2)
```

### Column Modifiers

```typescript
table.string('email')
  .notNullable()           // NOT NULL
  .unique()                // UNIQUE
  .defaultTo('default')    // DEFAULT value
  .unsigned()              // UNSIGNED (numbers)
  .index()                 // Create index
  .comment('User email');  // Column comment
```

### Indexes

```typescript
// Simple index
table.index('email');
table.index(['firstName', 'lastName'], 'full_name_index');

// Unique index
table.unique('email');
table.unique(['companyId', 'email']);

// Drop index
table.dropIndex('email');
table.dropUnique('email');
```

### Foreign Keys

```typescript
table.integer('userId').unsigned();
table.foreign('userId')
  .references('id')
  .inTable('users')
  .onDelete('CASCADE')
  .onUpdate('CASCADE');

// Shorthand
table.integer('userId')
  .unsigned()
  .references('id')
  .inTable('users')
  .onDelete('CASCADE');
```

## Seeders

Populate database with test data.

### Creating Seeders

```bash
curis make:seeder UserSeeder
```

### Seeder File

```typescript
import { BaseSeeder } from '@curisjs/db';
import type { Knex } from 'knex';

export default class UserSeeder extends BaseSeeder {
  async run(knex: Knex): Promise<void> {
    // Clear existing data
    await knex('users').del();
    
    // Insert data
    await knex('users').insert([
      { name: 'John Doe', email: 'john@example.com', role: 'admin' },
      { name: 'Jane Doe', email: 'jane@example.com', role: 'user' },
    ]);
  }
}
```

### Running Seeders

```bash
# Run all seeders
curis db:seed

# Run specific seeder
curis db:seed --class=UserSeeder
```

### Model Factories

```typescript
import { defineFactory } from '@curisjs/db';

const userFactory = defineFactory('User', () => ({
  name: faker.person.fullName(),
  email: faker.internet.email(),
  age: faker.number.int({ min: 18, max: 80 }),
  role: faker.helpers.arrayElement(['user', 'admin']),
}));

// Use in seeder
export default class UserSeeder extends BaseSeeder {
  async run(knex: Knex): Promise<void> {
    const users = userFactory.createMany(10);
    await knex('users').insert(users);
  }
}
```

## Relations

Define relationships between models.

### One-to-One (hasOne)

```typescript
import { Model, hasOne } from '@curisjs/db';

class User extends Model {
  static tableName = 'users';
  
  static relations = {
    profile: hasOne('Profile', 'userId'),
  };
}

class Profile extends Model {
  static tableName = 'profiles';
}

// Usage
const user = await User.find(1);
const profile = await user.profile();
```

### One-to-Many (hasMany)

```typescript
class User extends Model {
  static tableName = 'users';
  
  static relations = {
    posts: hasMany('Post', 'authorId'),
  };
}

class Post extends Model {
  static tableName = 'posts';
}

// Usage
const user = await User.find(1);
const posts = await user.posts();
```

### Belongs To (belongsTo)

```typescript
class Post extends Model {
  static tableName = 'posts';
  
  static relations = {
    author: belongsTo('User', 'authorId'),
  };
}

// Usage
const post = await Post.find(1);
const author = await post.author();
```

### Many-to-Many (belongsToMany)

```typescript
class User extends Model {
  static tableName = 'users';
  
  static relations = {
    roles: belongsToMany('Role', {
      through: 'user_roles',
      foreignKey: 'userId',
      otherKey: 'roleId',
    }),
  };
}

class Role extends Model {
  static tableName = 'roles';
}

// Usage
const user = await User.find(1);
const roles = await user.roles();
```

### Eager Loading

```typescript
// Without eager loading (N+1 problem)
const users = await User.findMany();
for (const user of users) {
  const posts = await user.posts();  // N queries
}

// With eager loading
const users = await User.query()
  .with(['posts', 'profile'])
  .get();

// Nested eager loading
const users = await User.query()
  .with(['posts.comments', 'profile'])
  .get();
```

## Transactions

Execute multiple queries atomically.

### Basic Transaction

```typescript
import { transaction } from '@curisjs/db';

await transaction(async (trx) => {
  await User.query(trx).create({ name: 'John' });
  await Post.query(trx).create({ title: 'Hello', authorId: 1 });
  
  // If any query fails, all are rolled back
});
```

### Manual Transactions

```typescript
import { beginTransaction } from '@curisjs/db';

const trx = await beginTransaction();

try {
  await User.query(trx).create({ name: 'John' });
  await Post.query(trx).create({ title: 'Hello' });
  
  await trx.commit();
} catch (error) {
  await trx.rollback();
  throw error;
}
```

### Transaction Isolation

```typescript
await transaction(async (trx) => {
  // Set isolation level
  await trx.raw('SET TRANSACTION ISOLATION LEVEL SERIALIZABLE');
  
  // Your queries
}, {
  isolationLevel: 'serializable'
});
```

## Validation

Generate validation schemas from database schemas.

### Schema to Validator

```typescript
import { Model, schemaToValidator } from '@curisjs/db';
import { z } from '@curisjs/core';

class User extends Model {
  static tableName = 'users';
  
  static schema = {
    name: { type: 'string', maxLength: 100 },
    email: { type: 'string', maxLength: 255 },
    age: { type: 'integer', min: 18 },
  };
}

// Generate validator
const userValidator = schemaToValidator(User.schema);

// Use in routes
app.post('/users', async (ctx) => {
  const data = await ctx.validate(userValidator);
  const user = await User.create(data);
  return ctx.json({ user });
});
```

## Best Practices

### 1. Use Transactions for Multiple Operations

```typescript
await transaction(async (trx) => {
  const user = await User.query(trx).create({ name: 'John' });
  await Profile.query(trx).create({ userId: user.id });
});
```

### 2. Use Eager Loading to Avoid N+1

```typescript
// Bad
const users = await User.findMany();
for (const user of users) {
  user.posts = await user.posts();
}

// Good
const users = await User.query().with(['posts']).get();
```

### 3. Index Frequently Queried Columns

```typescript
await schema.createTable('users', (table) => {
  table.string('email').unique().index();
  table.string('username').index();
});
```

### 4. Use Soft Deletes for Important Data

```typescript
class User extends Model {
  static softDeletes = true;
}

await user.delete();  // Sets deleted_at instead of removing
```

### 5. Validate Input Data

```typescript
const data = await ctx.validate(userSchema);
await User.create(data);
```

## API Reference

- [Model API](./model.md)
- [Query Builder API](./query-builder.md)
- [Migrations API](./migrations.md)
- [Relations API](./relations.md)
- [Transactions API](./transactions.md)
