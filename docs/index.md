---
layout: home

hero:
  name: CurisJS
  text: High-performance multi-runtime web framework
  tagline: Build fast, type-safe APIs that run everywhere - Node.js, Bun, Deno, and Edge
  actions:
    - theme: brand
      text: Get Started
      link: /getting-started
    - theme: alt
      text: View on GitHub
      link: https://github.com/Ameriq8/curisjs

features:
  - icon: 🚀
    title: Multi-Runtime Support
    details: Run your code seamlessly on Node.js, Bun, Deno, Cloudflare Workers, and Vercel Edge without any changes.
    
  - icon: ⚡
    title: Lightning Fast
    details: Built for performance with zero-allocation routing, optimized middleware pipeline, and minimal overhead.
    
  - icon: 🛡️
    title: Type-Safe
    details: Full TypeScript support with complete type inference, schema validation using Zod, and compile-time safety.
    
  - icon: 🧩
    title: Modular Architecture
    details: Use only what you need - core framework, database ORM, CLI tools, or the complete stack.
    
  - icon: 🔒
    title: Security First
    details: Built-in security middlewares including helmet, CSRF protection, rate limiting, and input sanitization.
    
  - icon: 📦
    title: Batteries Included
    details: Complete set of middlewares - body parsing, compression, sessions, API versioning, validation, and more.

  - icon: 🗄️
    title: Powerful ORM
    details: Type-safe database queries with support for PostgreSQL, MySQL, SQLite - featuring query builder and model system.
    
  - icon: 🛠️
    title: Developer Experience
    details: Intuitive API, comprehensive documentation, CLI scaffolding, and excellent error messages.
---

## Quick Start

Install CurisJS packages:

::: code-group

```bash [npm]
npm install @curisjs/core
```

```bash [pnpm]
pnpm add @curisjs/core
```

```bash [yarn]
yarn add @curisjs/core
```

```bash [bun]
bun add @curisjs/core
```

:::

Create your first app:

```typescript
import { createApp, json } from '@curisjs/core';

const app = createApp();

app.get('/hello', (ctx) => {
  return json({ message: 'Hello, World!' });
});

app.listen(3000);
```

## Why CurisJS?

### 🌐 True Multi-Runtime

Write your code once, deploy anywhere. CurisJS uses Web Standard APIs to ensure your application runs identically across all JavaScript runtimes:

- **Node.js** - The traditional powerhouse
- **Bun** - The fast all-in-one toolkit
- **Deno** - The secure runtime
- **Cloudflare Workers** - Global edge deployment
- **Vercel Edge** - Serverless at the edge

### ⚡ Performance Focused

CurisJS is built from the ground up for speed:

- **Radix Tree Router** - O(path_length) lookup time
- **Zero-Allocation** - Minimal memory allocations in hot paths
- **Optimized Middleware** - Efficient pipeline execution
- **Web Streams** - Native streaming support

### 🎯 Type-Safe by Default

Full TypeScript support with intelligent type inference:

```typescript
import { z } from '@curisjs/core';

const userSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
});

app.post('/users', async (ctx) => {
  const result = userSchema.safeParse(await ctx.json());
  if (!result.success) {
    return json({ error: result.error }, { status: 422 });
  }
  
  const user = result.data; // Fully typed!
  return json({ user });
});
```

## Packages

<div class="packages-grid">

### [@curisjs/core](https://npmjs.com/package/@curisjs/core)

The core framework with routing, middleware system, and Web Standard APIs.

### [@curisjs/db](https://npmjs.com/package/@curisjs/db)

Type-safe database ORM with query builder, models, and migrations.

### [@curisjs/cli](https://npmjs.com/package/@curisjs/cli)

Command-line tools for scaffolding, development, and deployment.

</div>

## Community

- [GitHub](https://github.com/Ameriq8/curisjs) - Source code and issues
- [npm Organization](https://www.npmjs.com/org/curisjs) - Published packages

## License

CurisJS is [MIT licensed](https://github.com/Ameriq8/curisjs/blob/main/LICENSE).

<style>
.packages-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
  margin-top: 1rem;
}

.packages-grid h3 {
  margin-top: 0;
}
</style>
