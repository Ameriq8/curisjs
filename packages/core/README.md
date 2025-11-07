# @curisjs/core

High-performance, multi-runtime web framework built on Web Standards.

## Philosophy

CurisJS is designed to be:

- **Fast**: Optimized radix/trie router, minimal allocations, zero-copy streaming
- **Portable**: Runs on Node.js 18+, Bun, Deno, Cloudflare Workers, Vercel Edge - **without any adapters**
- **Standards-first**: Built entirely on Web Standard Request/Response APIs
- **Production-ready**: Type-safe, well-tested, predictable performance

## Architecture

```
Core Kernel (kernel.ts)
    ├─ Router (radix/trie)
    ├─ Context (minimal state container)
    ├─ Middleware chain (short-circuit support)
    └─ Runtime Detection (auto-detect Bun/Deno/Node)

Web Standards API
    ├─ Request (standard)
    ├─ Response (standard)
    ├─ Headers (standard)
    └─ FormData (standard)
```

## Quick Start

### Universal Example (Works on All Runtimes)

```typescript
import { createApp, json } from '@curisjs/core';

const app = createApp();

app.get('/', (ctx) => {
  return json({ message: 'Hello World!' });
});

app.get('/users/:id', (ctx) => {
  return json({ userId: ctx.params.id });
});

// Auto-detects runtime and starts server
app.listen(3000);
```

**Run on any runtime:**

```bash
# Bun
bun run server.ts

# Deno
deno run --allow-net server.ts

# Node.js 18+
npx tsx server.ts
```

### Cloudflare Workers / Vercel Edge

```typescript
import { createApp, createHandler, json } from '@curisjs/core';

const app = createApp();

app.get('/', (ctx) => {
  return json({ message: 'Hello from the Edge!' });
});

// Export for edge runtime
export default createHandler(app);
```

## Features

### Routing

```typescript
// Static routes
app.get('/users', handler);

// Named parameters
app.get('/users/:id', handler);
app.get('/posts/:postId/comments/:commentId', handler);

// Wildcards (must be last segment)
app.get('/files/*path', handler);

// All methods
app.all('/webhook', handler);
```

### Middleware

```typescript
import { cors, logger } from '@curisjs/framework/middleware';

// Global middleware
app.use(logger());
app.use(
  cors({
    origin: 'https://example.com',
    credentials: true,
  })
);

// Custom middleware
app.use(async (ctx, next) => {
  const start = Date.now();
  await next();
  console.log(`Request took ${Date.now() - start}ms`);
});

// Short-circuit middleware (return Response)
app.use(async (ctx, next) => {
  const auth = ctx.header('Authorization');
  if (!auth) {
    return new Response('Unauthorized', { status: 401 });
  }
  await next();
});
```

### Response Helpers

```typescript
import { json, text, html, redirect } from '@curisjs/framework/utils';

app.get('/api/user', (ctx) => {
  return json({ name: 'Alice', age: 30 });
});

app.get('/hello', (ctx) => {
  return text('Hello World!');
});

app.get('/page', (ctx) => {
  return html('<h1>Welcome</h1>');
});

app.get('/redirect', (ctx) => {
  return redirect('https://example.com', 302);
});
```

### Context API

```typescript
app.post('/api/users', async (ctx) => {
  // Parse JSON body
  const data = await ctx.json();

  // Get headers
  const auth = ctx.header('Authorization');

  // Get query params
  const page = ctx.query('page') || '1';

  // Get route params
  const userId = ctx.params.id;

  // Access state (shared across middleware)
  ctx.state.user = { id: 123 };

  return json({ success: true });
});
```

## Performance

CurisJS is optimized for production workloads:

- **O(path_length)** route matching with radix/trie router
- **Zero-allocation** patterns on hot paths
- **Streaming-first** body handling
- **Minimal per-request overhead**

Benchmark against Hono and Fastify on your target platform:

```bash
cd bench
./run-benchmarks.sh
```

## Development

```bash
# Install dependencies
pnpm install

# Build
pnpm build

# Test
pnpm test

# Benchmark
pnpm bench
```

## License

MIT
