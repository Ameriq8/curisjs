# @curisjs/db

Type-safe ORM and query builder for CurisJS framework.

## Overview

`@curisjs/db` is a powerful, type-safe database layer built on top of Knex.js, providing an elegant ActiveRecord-style ORM with query builder capabilities.

## Installation

::: code-group

```bash [npm]
npm install @curisjs/db
```

```bash [pnpm]
pnpm add @curisjs/db
```

```bash [yarn]
yarn add @curisjs/db
```

```bash [bun]
bun add @curisjs/db
```

:::

### Database Drivers

Install the appropriate driver for your database:

::: code-group

```bash [SQLite]
npm install better-sqlite3
```

```bash [PostgreSQL]
npm install pg
```

```bash [MySQL]
npm install mysql2
```

:::

## Quick Start

### Database Connection

```typescript
import { createDatabase } from '@curisjs/db';

const db = createDatabase({
  client: 'better-sqlite3',
  connection: {
    filename: './database.sqlite',
  },
  useNullAsDefault: true,
});
```

### Define a Model

```typescript
import { Model } from '@curisjs/db';

class User extends Model {
  static tableName = 'users';
  
  id!: number;
  name!: string;
  email!: string;
  createdAt!: Date;
  updatedAt!: Date;
}
```

### Use in Routes

```typescript
import { createApp, json } from '@curisjs/core';
import { databaseMiddleware } from '@curisjs/db';

const app = createApp();

// Add database middleware
app.use(databaseMiddleware(db));

// Create user
app.post('/users', async (ctx) => {
  const data = await ctx.request.json();
  const user = await User.create(data);
  return json({ user }, { status: 201 });
});

// Get all users
app.get('/users', async (ctx) => {
  const users = await User.findMany();
  return json({ users });
});

// Get user by ID
app.get('/users/:id', async (ctx) => {
  const user = await User.findById(ctx.params.id);
  
  if (!user) {
    return json({ error: 'User not found' }, { status: 404 });
  }
  
  return json({ user });
});
```

## Key Features

### 🎯 Type Safety

Full TypeScript support with automatic type inference:

```typescript
class User extends Model {
  static tableName = 'users';
  
  id!: number;
  name!: string;
  email!: string;
}

// Fully typed results
const user = await User.findById(1);
// user.name is string
// user.email is string
```

### 📦 ActiveRecord Pattern

Intuitive model-based API:

```typescript
// Create
const user = await User.create({ name: 'John', email: 'john@example.com' });

// Read
const user = await User.findById(1);
const users = await User.findMany({ where: { active: true } });

// Update
await user.update({ name: 'John Doe' });

// Delete
await user.delete();
```

### 🔍 Query Builder

Powerful fluent query API:

```typescript
const users = await User.query()
  .where('age', '>', 18)
  .andWhere('active', true)
  .orderBy('name', 'asc')
  .limit(10)
  .offset(0)
  .select('id', 'name', 'email');
```

### 🔗 Relations

Support for all common relationships:

```typescript
class User extends Model {
  static tableName = 'users';
  
  posts() {
    return this.hasMany(Post, 'userId');
  }
}

class Post extends Model {
  static tableName = 'posts';
  
  user() {
    return this.belongsTo(User, 'userId');
  }
}

// Eager loading
const user = await User.findById(1, {
  with: ['posts']
});
```

### 💾 Transactions

ACID-compliant transactions:

```typescript
await db.transaction(async (trx) => {
  const user = await User.create({ name: 'John' }, { transaction: trx });
  const post = await Post.create({ userId: user.id, title: 'First Post' }, { transaction: trx });
  
  // Automatically commits or rolls back
});
```

### ⏰ Timestamps

Automatic timestamp management:

```typescript
class User extends Model {
  static tableName = 'users';
  static timestamps = true; // Adds createdAt, updatedAt
}

const user = await User.create({ name: 'John' });
// user.createdAt and user.updatedAt are automatically set
```

## What's Included

### Core Features

- [**Models**](/db/models) - ActiveRecord-style models
- [**Query Builder**](/db/query-builder) - Fluent query interface
- [**Transactions**](/db/transactions) - Database transactions
- [**Migrations**](/db/migrations) - Schema migrations
- [**Relations**](/db/relations) - Model relationships

### Database Support

- **SQLite** - Lightweight, file-based database
- **PostgreSQL** - Advanced open-source database
- **MySQL** - Popular relational database
- **MariaDB** - MySQL fork

### Runtime Support

- **Node.js 18+** - LTS and current versions
- **Bun** - Fast all-in-one runtime
- **Deno** - Secure runtime (with compatibility layer)

## Architecture

```
@curisjs/db
    ├─ Connection Manager
    │   ├─ Database Configuration
    │   ├─ Connection Pool
    │   └─ Driver Abstraction
    │
    ├─ Model Layer
    │   ├─ ActiveRecord Pattern
    │   ├─ Type Inference
    │   └─ Lifecycle Hooks
    │
    ├─ Query Builder
    │   ├─ Fluent API
    │   ├─ WHERE Conditions
    │   ├─ JOIN Operations
    │   └─ Aggregations
    │
    ├─ Relations
    │   ├─ hasOne / hasMany
    │   ├─ belongsTo
    │   └─ belongsToMany
    │
    └─ Transactions
        ├─ Begin / Commit / Rollback
        ├─ Savepoints
        └─ Isolation Levels
```

## Database Configuration

### SQLite

```typescript
const db = createDatabase({
  client: 'better-sqlite3',
  connection: {
    filename: './database.sqlite',
  },
  useNullAsDefault: true,
});
```

### PostgreSQL

```typescript
const db = createDatabase({
  client: 'pg',
  connection: {
    host: 'localhost',
    port: 5432,
    user: 'postgres',
    password: 'password',
    database: 'myapp',
  },
});
```

### MySQL

```typescript
const db = createDatabase({
  client: 'mysql2',
  connection: {
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: 'password',
    database: 'myapp',
  },
});
```

### Environment Variables

```typescript
const db = createDatabase({
  client: process.env.DB_CLIENT || 'better-sqlite3',
  connection: {
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || '5432'),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  },
});
```

## Middleware Integration

Add database access to your CurisJS application:

```typescript
import { createApp } from '@curisjs/core';
import { createDatabase, databaseMiddleware } from '@curisjs/db';

const db = createDatabase({
  client: 'better-sqlite3',
  connection: { filename: './database.sqlite' },
});

const app = createApp();

// Database middleware adds db to context
app.use(databaseMiddleware(db));

// Access database in routes
app.get('/users', async (ctx) => {
  // ctx.state.db is available
  const users = await User.findMany();
  return json({ users });
});
```

## Next Steps

- [**Models Guide**](/db/models) - Learn about model definition and usage
- [**Query Builder**](/db/query-builder) - Master the query API
- [**Relations**](/db/relations) - Work with related data
- [**Transactions**](/db/transactions) - Ensure data integrity
- [**Migrations**](/db/migrations) - Manage schema changes

## Examples

Check out the [examples directory](https://github.com/Ameriq8/curisjs/tree/main/packages/db/examples) for complete examples:

- Model CRUD operations
- Query builder usage
- Relations and eager loading
- Transactions
- Integration with CurisJS core
