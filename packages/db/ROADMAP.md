# @curisjs/db - ORM Roadmap

A type-safe, Knex-based ORM built specifically for CurisJS framework with runtime-agnostic support (Bun, Deno, Node.js).

## 🎯 Project Goals

- **Type-Safe**: Full TypeScript support with automatic type inference
- **Simple API**: Prisma-like simplicity with Knex power
- **CurisJS Native**: Deep integration with @curisjs/core (context, validation, DI)
- **Runtime Agnostic**: Works on Bun, Deno, Node.js without changes
- **Migration First**: Schema versioning with auto-generated migrations
- **Relation Aware**: First-class support for relational queries

## 🏗️ Architecture

```
@curisjs/db
├── Core Layer
│   ├── Connection Manager (Knex wrapper)
│   ├── Schema Builder (fluent API)
│   ├── Query Builder (type-safe queries)
│   └── Model Base Class (Active Record pattern)
│
├── Feature Layer
│   ├── Migrations (schema versioning)
│   ├── Relations (hasMany, belongsTo, etc.)
│   ├── Transactions (ACID support)
│   ├── Timestamps (created_at, updated_at)
│   ├── Soft Deletes (deleted_at)
│   └── Seeders (test data)
│
├── Integration Layer
│   ├── CurisJS Middleware (ctx.db)
│   ├── Service Provider (DI container)
│   ├── Validation (schema validation)
│   └── Error Handling
│
└── CLI Layer
    ├── Migrations (make, run, rollback)
    ├── Models (generate from schema)
    └── Seeds (make, run)
```

## 📋 Implementation Tasks

### Phase 1: Foundation (Core) ✅ COMPLETED
- [x] 1. Setup Package Configuration
- [x] 2. Core Type Definitions
- [x] 3. Schema Builder API
- [x] 4. Database Connection Manager
- [x] 5. Model Base Class

### Phase 2: Query & Data (Essential Features) ⚠️ PARTIAL
- [x] 6. Query Builder Implementation
- [ ] 7. Migration System
- [ ] 8. Relations Support
- [x] 9. Transaction API

### Phase 3: Integration (CurisJS) ⚠️ PARTIAL
- [x] 10. CurisJS Middleware Integration
- [ ] 11. Validation Integration
- [x] 12. Advanced Features - Timestamps & Soft Deletes (basic implementation)
- [ ] 13. Seeding System

### Phase 4: Developer Experience ⚠️ PARTIAL
- [ ] 14. CLI Tool
- [x] 15. Main Export & API
- [x] 16. Example Integration - Todo App
- [ ] 17. Testing Suite
- [ ] 18. Documentation (basic README completed)

## 💡 Usage Examples

### 1. Define Models

```typescript
// src/models/User.ts
import { Model, schema } from '@curisjs/db';

export const userSchema = schema.define('users', {
  id: schema.integer().primaryKey().autoIncrement(),
  email: schema.string().unique().notNullable(),
  name: schema.string().notNullable(),
  password: schema.string().notNullable(),
  createdAt: schema.datetime().default('now'),
  updatedAt: schema.datetime().default('now').onUpdate('now'),
});

export class User extends Model {
  static tableName = 'users';
  static schema = userSchema;

  // Relations
  posts() {
    return this.hasMany(Post, 'userId');
  }
}
```

### 2. Use in CurisJS Routes

```typescript
// src/routes/users.ts
import { createApp, json } from '@curisjs/core';
import { User } from '../models/User';

const app = createApp();

// List users
app.get('/users', async (ctx) => {
  const users = await ctx.db.users.findMany({
    select: ['id', 'email', 'name'],
    orderBy: { createdAt: 'desc' },
    limit: 10,
  });
  return json(users);
});

// Get user with posts
app.get('/users/:id', async (ctx) => {
  const user = await ctx.db.users.findUnique({
    where: { id: parseInt(ctx.params.id) },
    include: { posts: true },
  });
  
  if (!user) {
    return json({ error: 'User not found' }, { status: 404 });
  }
  
  return json(user);
});

// Create user
app.post('/users', async (ctx) => {
  const data = await ctx.json();
  
  // Validation (integrated with @curisjs/core)
  const validated = await ctx.validateOrFail(userSchema);
  
  const user = await ctx.db.users.create({
    data: validated,
  });
  
  return json(user, { status: 201 });
});

// Update user
app.put('/users/:id', async (ctx) => {
  const data = await ctx.json();
  
  const user = await ctx.db.users.update({
    where: { id: parseInt(ctx.params.id) },
    data,
  });
  
  return json(user);
});

// Delete user (soft delete)
app.delete('/users/:id', async (ctx) => {
  await ctx.db.users.delete({
    where: { id: parseInt(ctx.params.id) },
  });
  
  return json({ message: 'User deleted' });
});
```

### 3. Transactions

```typescript
app.post('/transfer', async (ctx) => {
  const { fromId, toId, amount } = await ctx.json();
  
  const result = await ctx.db.transaction(async (trx) => {
    // Deduct from sender
    await trx.accounts.update({
      where: { id: fromId },
      data: { balance: db.raw('balance - ?', [amount]) },
    });
    
    // Add to receiver
    await trx.accounts.update({
      where: { id: toId },
      data: { balance: db.raw('balance + ?', [amount]) },
    });
    
    // Create transaction record
    return await trx.transactions.create({
      data: { fromId, toId, amount },
    });
  });
  
  return json(result);
});
```

### 4. Query Builder

```typescript
// Complex queries
app.get('/search', async (ctx) => {
  const { query, status, minPrice } = ctx.queries();
  
  const products = await ctx.db.products
    .where('name', 'like', `%${query}%`)
    .orWhere('description', 'like', `%${query}%`)
    .where('status', status)
    .where('price', '>=', minPrice)
    .orderBy('price', 'asc')
    .limit(20)
    .get();
  
  return json(products);
});
```

### 5. Relations

```typescript
// Define relations
class User extends Model {
  posts() {
    return this.hasMany(Post, 'userId');
  }
  
  profile() {
    return this.hasOne(Profile, 'userId');
  }
}

class Post extends Model {
  author() {
    return this.belongsTo(User, 'userId');
  }
  
  tags() {
    return this.belongsToMany(Tag, 'post_tags', 'postId', 'tagId');
  }
}

// Use relations
const user = await User.find(1).include(['posts', 'profile']);
const post = await Post.find(1).include(['author', 'tags']);
```

### 6. Migrations

```bash
# Create migration
curisdb make:migration create_users_table

# Run migrations
curisdb migrate

# Rollback
curisdb migrate:rollback

# Reset database
curisdb migrate:reset
```

```typescript
// migrations/001_create_users_table.ts
export async function up(db) {
  await db.schema.createTable('users', (table) => {
    table.increments('id').primary();
    table.string('email').unique().notNullable();
    table.string('name').notNullable();
    table.string('password').notNullable();
    table.timestamps(true, true);
  });
}

export async function down(db) {
  await db.schema.dropTable('users');
}
```

### 7. Seeders

```typescript
// seeders/UserSeeder.ts
import { Seeder } from '@curisjs/db';
import { User } from '../models/User';

export class UserSeeder extends Seeder {
  async run() {
    await User.create({
      email: 'admin@example.com',
      name: 'Admin User',
      password: await hash('password'),
    });
    
    // Create 100 test users
    await User.factory(100).create();
  }
}
```

### 8. CurisJS Setup

```typescript
// src/index.ts
import { createApp } from '@curisjs/core';
import { Database } from '@curisjs/db';
import { DatabaseServiceProvider } from '@curisjs/db/providers';

const app = createApp();

// Register database service provider
app.register(new DatabaseServiceProvider({
  connection: {
    client: 'better-sqlite3',
    connection: {
      filename: './database.sqlite',
    },
  },
}));

// Boot application (initializes database)
await app.boot();

// Now ctx.db is available in all routes
app.get('/users', async (ctx) => {
  const users = await ctx.db.users.findMany();
  return json(users);
});

app.listen(3000);
```

## 🔧 Configuration

```typescript
// curisdb.config.ts
import { defineConfig } from '@curisjs/db';

export default defineConfig({
  // Database connection
  connection: {
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
  },
  
  // Migrations
  migrations: {
    directory: './migrations',
    tableName: 'migrations',
  },
  
  // Seeds
  seeds: {
    directory: './seeders',
  },
  
  // Features
  features: {
    timestamps: true,
    softDeletes: true,
  },
});
```

## 🎨 Design Principles

1. **Simple First**: Common tasks should be simple, complex tasks should be possible
2. **Type Safety**: TypeScript first with full type inference
3. **CurisJS Native**: Deep integration, not just a plugin
4. **Performance**: Leverage Knex's optimizations, minimal overhead
5. **Developer Experience**: Great error messages, intuitive API
6. **Runtime Agnostic**: Same code on Bun, Deno, Node.js

## 📦 Dependencies

- **knex**: SQL query builder (foundation)
- **better-sqlite3**: SQLite driver (default)
- **pg**: PostgreSQL driver (optional)
- **mysql2**: MySQL driver (optional)
- **@curisjs/core**: Framework integration

## 🚀 Getting Started

```bash
# Install
pnpm add @curisjs/db

# Initialize
curisdb init

# Create migration
curisdb make:migration create_users_table

# Run migrations
curisdb migrate

# Create seeder
curisdb make:seeder UserSeeder

# Run seeders
curisdb seed
```

## 📊 Comparison with Other ORMs

| Feature | @curisjs/db | Prisma | Drizzle | TypeORM |
|---------|-------------|--------|---------|---------|
| Type Safety | ✅ Full | ✅ Full | ✅ Full | ⚠️ Partial |
| CurisJS Integration | ✅ Native | ❌ None | ❌ None | ❌ None |
| Runtime Agnostic | ✅ Yes | ⚠️ Limited | ✅ Yes | ✅ Yes |
| Schema in TypeScript | ✅ Yes | ❌ No (DSL) | ✅ Yes | ✅ Yes |
| Query Builder | ✅ Knex | ❌ Custom | ✅ Drizzle | ✅ TypeORM |
| Learning Curve | 🟢 Easy | 🟡 Medium | 🟢 Easy | 🔴 Hard |
| Bundle Size | 🟢 Small | 🔴 Large | 🟢 Small | 🔴 Large |

## 🎯 Next Steps

1. Start with Phase 1 (Foundation)
2. Build working prototype
3. Create example Todo app
4. Write comprehensive tests
5. Document everything
6. Publish to npm

Let's build the best ORM for CurisJS! 🚀
