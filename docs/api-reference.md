# API Reference Index

Quick reference for all CurisJS APIs.

## @curisjs/core

### Application

```typescript
import { createApp } from '@curisjs/core';

const app = createApp(options?);
app.use(middleware);
app.get(path, handler);
app.post(path, handler);
app.put(path, handler);
app.patch(path, handler);
app.delete(path, handler);
app.listen(port);
```

### Context

```typescript
ctx.request: Request
ctx.params: RouteParams
ctx.query: URLSearchParams
ctx.env: Environment
ctx.state: ContextState
ctx.response?: Response

await ctx.json()
await ctx.text()
await ctx.formData()
await ctx.arrayBuffer()
ctx.header(name)
await ctx.validate(schema)

ctx.json(data, status?, headers?)
ctx.text(content, status?, headers?)
ctx.html(markup, status?, headers?)
ctx.redirect(url, status?)
ctx.stream(readable, headers?)
ctx.sse(sender)
```

### Validation (z)

```typescript
import { z } from '@curisjs/core';

z.string().min(n).max(n).email().url().uuid()
z.number().min(n).max(n).int().positive()
z.boolean()
z.date()
z.array(schema).min(n).max(n)
z.object({ ... })
z.enum([...])
z.coerce.number()

schema.parse(value)
schema.safeParse(value)
schema.optional()
schema.nullable()
schema.default(value)
schema.refine(fn, message)
```

### Middleware

```typescript
import { cors, logger } from '@curisjs/core';

app.use(cors(options));
app.use(logger());
app.use(async (ctx, next) => { ... });
```

### Response Utilities

```typescript
import { json, text, html, redirect, stream, sse } from '@curisjs/core';

json(data, status?, headers?)
text(content, status?, headers?)
html(markup, status?, headers?)
redirect(url, status?)
stream(readable, headers?)
sse(sender)
```

### Container

```typescript
import { Container } from '@curisjs/core';

container.bind(name, factory)
container.singleton(name, factory)
container.instance(name, instance)
container.make(name)
```

### Environment

```typescript
import { loadEnv, env } from '@curisjs/core';

loadEnv()
env(key, default?)
```

## @curisjs/db

### Connection

```typescript
import { createDatabase, getDatabase, closeDatabase } from '@curisjs/db';

await createDatabase(config)
getDatabase(name?)
await closeDatabase(name?)
```

### Model

```typescript
import { Model } from '@curisjs/db';

class User extends Model {
  static tableName = 'users';
  static primaryKey = 'id';
  static timestamps = true;
  static softDeletes = false;
  static connection = 'default';
}

// Finders
await User.find(id)
await User.findOrFail(id)
await User.findMany(options)
await User.findUnique(options)
await User.findFirst(options)

// Create
await User.create(data)
await User.createMany(data[])

// Update
await user.update(data)
await User.updateWhere(where, data)
await User.upsert(where, update, create)

// Delete
await user.delete()
await User.deleteWhere(where)
await user.restore()
await user.forceDelete()
```

### Query Builder

```typescript
User.query()
  .where(column, operator?, value?)
  .orWhere(...)
  .whereIn(column, values)
  .whereNotIn(column, values)
  .whereNull(column)
  .whereNotNull(column)
  .whereBetween(column, [min, max])
  .select(...columns)
  .orderBy(column, direction)
  .limit(n)
  .offset(n)
  .join(table, col1, col2)
  .leftJoin(...)
  .count()
  .sum(column)
  .avg(column)
  .min(column)
  .max(column)
  .groupBy(column)
  .having(column, operator, value)
  .paginate({ page, perPage })
  .get()
  .first()
  .exists()
```

### Migrations

```typescript
import { migrate, rollback, getMigrationStatus } from '@curisjs/db';

await migrate()
await rollback()
await getMigrationStatus()
```

### Schema Builder

```typescript
import { schema } from '@curisjs/db';

await schema.createTable(name, callback)
await schema.alterTable(name, callback)
await schema.dropTable(name)
await schema.hasTable(name)

// Inside callback:
table.increments('id')
table.string('name', length?)
table.text('content')
table.integer('count')
table.boolean('active')
table.date('birthdate')
table.timestamp('created_at')
table.timestamps(true, true)
table.json('data')
table.uuid('id')
table.enum('role', [...])
table.decimal('price', precision, scale)

// Modifiers:
.notNullable()
.unique()
.defaultTo(value)
.unsigned()
.index()
.comment(text)

// Foreign keys:
table.foreign('userId').references('id').inTable('users').onDelete('CASCADE')
```

### Transactions

```typescript
import { transaction, beginTransaction } from '@curisjs/db';

await transaction(async (trx) => {
  await User.query(trx).create(...)
  await Post.query(trx).create(...)
})

const trx = await beginTransaction()
try {
  await User.query(trx).create(...)
  await trx.commit()
} catch {
  await trx.rollback()
}
```

### Relations

```typescript
import { hasOne, hasMany, belongsTo, belongsToMany } from '@curisjs/db';

static relations = {
  profile: hasOne('Profile', 'userId'),
  posts: hasMany('Post', 'authorId'),
  author: belongsTo('User', 'authorId'),
  roles: belongsToMany('Role', {
    through: 'user_roles',
    foreignKey: 'userId',
    otherKey: 'roleId',
  }),
}

// Usage:
await user.posts()
await post.author()

// Eager loading:
User.query().with(['posts', 'profile']).get()
```

### Seeders

```typescript
import { BaseSeeder, seed, runSeeder } from '@curisjs/db';

class UserSeeder extends BaseSeeder {
  async run(knex) {
    await knex('users').insert([...])
  }
}

await seed()
await runSeeder(UserSeeder)
```

## @curisjs/cli

### Commands

```bash
# Project
curis new <name>
curis dev
curis build

# Generators
curis make:migration <name>
curis make:model <name> [--migration] [--controller] [--all]
curis make:controller <name> [--resource] [--api]
curis make:service <name>
curis make:middleware <name>
curis make:seeder <name>
curis make:validator <name>

# Database
curis db:migrate [--step n] [--connection name]
curis db:rollback [--step n] [--all]
curis db:reset
curis db:status
curis db:seed [--class name]
curis db:wipe

# Info
curis --version
curis --help
```

## Type Definitions

### Core Types

```typescript
interface AppOptions {
  basePath?: string;
  strict?: boolean;
  notFound?: Handler;
  onError?: ErrorHandler;
}

interface Context {
  request: Request;
  params: RouteParams;
  query: URLSearchParams;
  env: Environment;
  state: ContextState;
  response?: Response;
  
  json<T>(): Promise<T>;
  text(): Promise<string>;
  formData(): Promise<FormData>;
  header(name: string): string | null;
  validate<T>(schema: Schema<T>): Promise<T>;
  
  json(data: any, status?: number, headers?: HeadersInit): Response;
  text(content: string, status?: number, headers?: HeadersInit): Response;
  html(markup: string, status?: number, headers?: HeadersInit): Response;
  redirect(url: string, status?: number): Response;
  stream(readable: ReadableStream, headers?: HeadersInit): Response;
  sse(sender: SSESender): Response;
}

type Handler = (ctx: Context) => Response | Promise<Response>;
type Middleware = (ctx: Context, next: Next) => void | Response | Promise<void | Response>;
type Next = () => Promise<void>;
```

### Database Types

```typescript
interface ConnectionConfig {
  client: 'pg' | 'mysql2' | 'sqlite3';
  connection: string | ConnectionDetails;
  pool?: PoolConfig;
  migrations?: MigrationConfig;
  seeds?: SeedConfig;
}

interface QueryOptions<T> {
  where?: WhereClause<T>;
  select?: (keyof T)[];
  orderBy?: { [K in keyof T]?: 'asc' | 'desc' };
  limit?: number;
  offset?: number;
}

interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  perPage: number;
}
```

## Configuration Files

### tsconfig.json

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "lib": ["ES2022"],
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "outDir": "./dist",
    "rootDir": "./src"
  }
}
```

### database.json

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
    "pool": { "min": 2, "max": 10 },
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

### package.json

```json
{
  "type": "module",
  "scripts": {
    "dev": "tsx watch src/index.ts",
    "build": "tsc",
    "start": "node dist/index.js"
  },
  "dependencies": {
    "@curisjs/core": "^0.1.0",
    "@curisjs/db": "^0.1.0"
  },
  "devDependencies": {
    "typescript": "^5.3.3",
    "tsx": "^4.7.0"
  }
}
```

## Environment Variables

```env
# Database
DATABASE_URL=postgresql://user:pass@localhost:5432/db
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=secret
DB_NAME=myapp

# Application
PORT=3000
NODE_ENV=development
JWT_SECRET=your-secret-key
API_KEY=your-api-key

# Runtime-specific
# Cloudflare Workers: Use wrangler.toml vars
# Vercel: Use .env.local
```

## Quick Reference

### Create Project
```bash
curis new my-app
cd my-app
pnpm install
pnpm dev
```

### Add Route
```typescript
app.get('/users/:id', async (ctx) => {
  const user = await User.find(ctx.params.id);
  return ctx.json({ user });
});
```

### Add Model
```bash
curis make:model User --migration
```

### Run Migration
```bash
curis db:migrate
```

### Add Middleware
```typescript
app.use(async (ctx, next) => {
  console.log(ctx.request.method, ctx.request.url);
  await next();
});
```

### Validate Request
```typescript
const schema = z.object({
  name: z.string(),
  email: z.string().email(),
});

const data = await ctx.validate(schema);
```
