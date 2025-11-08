# CurisJS Documentation

Welcome to CurisJS - a modern, high-performance TypeScript web framework built on Web Standards.

## 📚 Table of Contents

- [Getting Started](./getting-started.md)
- [Core Package (@curisjs/core)](./core/README.md)
- [Database Package (@curisjs/db)](./db/README.md)
- [CLI Package (@curisjs/cli)](./cli/README.md)
- [Examples](./examples/README.md)

## What is CurisJS?

CurisJS is a runtime-agnostic web framework that combines the best features from modern frameworks:

- **Runtime Agnostic**: Runs on Node.js, Bun, Deno, and Edge Runtimes (Cloudflare Workers, Vercel Edge)
- **Web Standards**: Built on native Web APIs (Request, Response, URL)
- **High Performance**: Radix tree router with O(path_length) lookup time
- **Type-Safe**: Full TypeScript support with excellent type inference
- **Laravel-Inspired Architecture**: Service Providers, Dependency Injection, Facades
- **Zod-Like Validation**: Built-in schema validation system
- **Active Record ORM**: Elegant database interactions with type safety

## Quick Start

### Installation

```bash
# Using npm
npm install @curisjs/core

# Using pnpm
pnpm add @curisjs/core

# Using bun
bun add @curisjs/core

# Using the CLI to create a new project
npx @curisjs/cli new my-app
```

### Hello World

```typescript
import { createApp } from '@curisjs/core';

const app = createApp();

app.get('/', (ctx) => {
  return new Response('Hello, World!');
});

app.listen(3000);
```

## Key Features

### 1. Runtime Agnostic

CurisJS automatically detects your runtime and adapts:

```typescript
// Works in all runtimes
app.listen(3000); // Auto-detects Node.js/Bun/Deno

// Or use directly with fetch
export default {
  fetch: (req) => app.fetch(req), // Cloudflare Workers, Vercel Edge
};
```

### 2. Type-Safe Routing

```typescript
app.get('/users/:id', (ctx) => {
  const id = ctx.params.id; // Type-safe params
  return ctx.json({ userId: id });
});
```

### 3. Built-in Validation

```typescript
import { z } from '@curisjs/core';

const userSchema = z.object({
  name: z.string().min(3),
  email: z.string().email(),
  age: z.number().min(18),
});

app.post('/users', async (ctx) => {
  const data = await ctx.validate(userSchema);
  return ctx.json({ user: data });
});
```

### 4. Middleware System

```typescript
import { cors, logger } from '@curisjs/core';

app.use(logger());
app.use(cors());

app.use(async (ctx, next) => {
  console.log(`${ctx.request.method} ${ctx.request.url}`);
  await next();
});
```

### 5. Database ORM

```typescript
import { Model } from '@curisjs/db';

class User extends Model {
  static tableName = 'users';
}

// Find users
const users = await User.findMany({ where: { active: true } });

// Create user
const user = await User.create({ name: 'John', email: 'john@example.com' });

// Update user
await user.update({ name: 'John Doe' });
```

## Architecture

CurisJS follows a modular architecture:

```
@curisjs/
├── core/       # Core framework (routing, validation, middleware)
├── db/         # Database ORM and query builder
└── cli/        # Command-line interface and generators
```

Each package can be used independently or together for a complete framework experience.

## Package Overview

### [@curisjs/core](./core/README.md)

The core framework providing:
- HTTP routing with radix tree
- Context API for request/response handling
- Middleware system
- Schema validation
- Service providers and dependency injection
- Response utilities

### [@curisjs/db](./db/README.md)

Database layer providing:
- Active Record ORM
- Query builder
- Migrations
- Seeders
- Relations (hasOne, hasMany, belongsTo, belongsToMany)
- Transactions

### [@curisjs/cli](./cli/README.md)

Command-line tools for:
- Project scaffolding
- Code generation (models, controllers, migrations)
- Database management
- Development server

## Philosophy

CurisJS is built on these core principles:

1. **Web Standards First**: Use native Web APIs whenever possible
2. **Runtime Agnostic**: Write once, run anywhere
3. **Type Safety**: Full TypeScript support with excellent inference
4. **Developer Experience**: Elegant APIs inspired by the best frameworks
5. **Performance**: Zero-cost abstractions and optimized algorithms
6. **Modularity**: Use only what you need

## Community & Support

- **GitHub**: [github.com/Ameriq8/curisjs](https://github.com/Ameriq8/curisjs)
- **Issues**: [github.com/Ameriq8/curisjs/issues](https://github.com/Ameriq8/curisjs/issues)
- **License**: MIT

## Next Steps

- [Getting Started Guide](./getting-started.md)
- [Core Package Documentation](./core/README.md)
- [Database Guide](./db/README.md)
- [CLI Reference](./cli/README.md)
- [Examples](./examples/README.md)
