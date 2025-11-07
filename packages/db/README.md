# @curisjs/db

Type-safe ORM for CurisJS framework built on Knex.js. Runtime-agnostic (Bun, Deno, Node.js 18+).

## Features

- ✅ **Type-Safe**: Full TypeScript support with automatic type inference
- ✅ **Simple API**: Prisma-like simplicity with Knex power
- ✅ **CurisJS Native**: Deep integration with @curisjs/core
- ✅ **Runtime Agnostic**: Works on Bun, Deno, Node.js without changes
- ✅ **Fluent Schema**: Define schemas in TypeScript, not separate DSL
- ✅ **Query Builder**: Fluent, type-safe query API
- ✅ **Migrations**: Schema versioning with auto-generation
- ✅ **Relations**: hasMany, belongsTo, belongsToMany support
- ✅ **Transactions**: ACID-compliant with automatic rollback
- ✅ **Timestamps**: Automatic created_at/updated_at
- ✅ **Soft Deletes**: Optional soft delete support

## Installation

```bash
# Using pnpm
pnpm add @curisjs/db

# Using npm
npm install @curisjs/db

# Using bun
bun add @curisjs/db
```

### Database Drivers

Install the driver for your database:

```bash
# SQLite (default)
pnpm add better-sqlite3

# PostgreSQL
pnpm add pg

# MySQL
pnpm add mysql2
```

## Quick Start

### 1. Define Models

```typescript
import { Model, schema } from '@curisjs/db';

// Define schema
const todoSchema = schema.define('todos', {
  id: schema.integer().primaryKey().autoIncrement(),
  title: schema.string().notNullable(),
  completed: schema.boolean().default(false).notNullable(),
}, {
  timestamps: true, // Adds createdAt, updatedAt
});

// Create model
export class Todo extends Model {
  static tableName = 'todos';
  static schema = todoSchema;
  
  id!: number;
  title!: string;
  completed!: boolean;
  createdAt!: Date;
  updatedAt!: Date;
}
```

### 2. Use in CurisJS Routes

```typescript
import { createApp } from '@curisjs/core';
import { createDatabase, databaseMiddleware } from '@curisjs/db';
import { Todo } from './models/Todo';

// Create database connection
const db = createDatabase({
  client: 'better-sqlite3',
  connection: {
    filename: './database.sqlite',
  },
  useNullAsDefault: true,
});

const app = createApp();

// Add database middleware
app.use(databaseMiddleware(db));

// List todos
app.get('/todos', async (ctx) => {
  const todos = await Todo.findMany({
    orderBy: { createdAt: 'desc' },
    limit: 10,
  });
  return ctx.json(todos);
});

// Create todo
app.post('/todos', async (ctx) => {
  const data = await ctx.json();
  const todo = await Todo.create(data);
  return ctx.json(todo, { status: 201 });
});

app.listen(3000);
```

### 3. Using Query Builder

```typescript
// Complex queries
const todos = await Todo.query()
  .where('completed', false)
  .orderBy('createdAt', 'desc')
  .limit(10)
  .get();

// With raw Knex queries
const results = await ctx.db.knex('todos')
  .where('completed', true)
  .count('* as total');
```

### 4. Transactions

```typescript
import { transaction } from '@curisjs/db';

app.post('/transfer', async (ctx) => {
  const { fromId, toId, amount } = await ctx.json();
  
  const result = await transaction(async (trx) => {
    // Deduct from sender
    await trx('accounts')
      .where({ id: fromId })
      .decrement('balance', amount);
    
    // Add to receiver
    await trx('accounts')
      .where({ id: toId })
      .increment('balance', amount);
    
    // Create record
    const [id] = await trx('transactions').insert({
      fromId,
      toId,
      amount,
    });
    
    return id;
  });
  
  return json({ transactionId: result });
});
```

## API Reference

### Model Methods

#### Static Methods

- `find(id)` - Find by primary key
- `findMany(options)` - Find multiple records
- `findUnique(options)` - Find single record
- `all()` - Get all records
- `create(data)` - Create new record
- `update(where, data)` - Update record(s)
- `delete(where)` - Delete record(s)
- `count(options)` - Count records
- `exists(options)` - Check if exists
- `query()` - Get query builder

#### Instance Methods

- `save()` - Save model
- `deleteInstance()` - Delete model
- `refresh()` - Reload from database
- `toJSON()` - Convert to JSON

### Query Builder

- `where(column, value)` - Add WHERE clause
- `orWhere(column, value)` - Add OR WHERE
- `whereIn(column, values)` - WHERE IN
- `whereNull(column)` - WHERE NULL
- `select(...columns)` - Select columns
- `orderBy(column, direction)` - Order results
- `limit(count)` - Limit results
- `offset(count)` - Offset results
- `join(table, ...)` - Join tables
- `first()` - Get first result
- `get()` - Get all results
- `count()` - Count results

### Schema Builder

- `schema.string(length)` - String column
- `schema.integer()` - Integer column
- `schema.boolean()` - Boolean column
- `schema.date()` - Date column
- `schema.datetime()` - Datetime column
- `schema.json()` - JSON column
- `schema.uuid()` - UUID column

#### Column Modifiers

- `.primaryKey()` - Mark as primary key
- `.unique()` - Add unique constraint
- `.nullable()` - Allow NULL
- `.notNullable()` - Disallow NULL
- `.default(value)` - Set default value
- `.autoIncrement()` - Auto increment
- `.references(table, column)` - Foreign key

## Configuration

```typescript
import { createDatabase } from '@curisjs/db';

createDatabase({
  client: 'pg', // or 'mysql2', 'better-sqlite3'
  connection: {
    host: 'localhost',
    port: 5432,
    user: 'postgres',
    password: 'password',
    database: 'myapp',
  },
  pool: {
    min: 2,
    max: 10,
  },
});
```

## License

MIT
