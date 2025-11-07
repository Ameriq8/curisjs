# Runtime-Agnostic Architecture

CurisJS now works natively across all JavaScript runtimes without any adapters! This guide explains how it works and how to use it.

## Overview

CurisJS is built entirely on **Web Standards APIs** (Request/Response/Headers) that are natively supported by:

- ✅ **Bun** (latest)
- ✅ **Deno** (latest)
- ✅ **Node.js 18+**
- ✅ **Cloudflare Workers**
- ✅ **Vercel Edge Functions**
- ✅ **Any runtime with Fetch API support**

## How It Works

### 1. Web Standards First

The entire framework is built on standard Web APIs:

```typescript
// Standard Request object
interface Context {
  request: Request;  // ✅ Web Standard
  params: Record<string, string>;
  env: Record<string, unknown>;
}

// Standard Response
app.get('/', (ctx) => {
  return new Response('Hello');  // ✅ Web Standard
});
```

### 2. Automatic Runtime Detection

CurisJS automatically detects the runtime environment:

```typescript
private detectRuntime(): 'bun' | 'deno' | 'node' | 'worker' {
  if (typeof Bun !== 'undefined') return 'bun';
  if (typeof Deno !== 'undefined') return 'deno';
  if (typeof process !== 'undefined' && process.versions?.node) return 'node';
  return 'worker';
}
```

### 3. Runtime-Specific Servers

When you call `app.listen()`, CurisJS uses the appropriate server:

```typescript
// On Bun
Bun.serve({
  port: 3000,
  fetch: (req) => app.fetch(req)
});

// On Deno
Deno.serve({
  port: 3000,
  handler: (req) => app.fetch(req)
});

// On Node.js 18+
http.createServer((nodeReq, nodeRes) => {
  const request = convertToWebRequest(nodeReq);
  const response = await app.fetch(request);
  convertToNodeResponse(response, nodeRes);
});
```

## Usage Guide

### Server Runtimes (Bun, Deno, Node.js)

Use `app.listen()` - it auto-detects the runtime:

```typescript
import { createApp, json } from '@curisjs/core';

const app = createApp();

app.get('/', (ctx) => {
  return json({ message: 'Hello World!' });
});

// Auto-detects runtime and starts server
app.listen(3000);
```

Run on any runtime:

```bash
# Bun
bun run server.ts

# Deno  
deno run --allow-net server.ts

# Node.js 18+
npx tsx server.ts
```

### Edge Runtimes (Cloudflare Workers, Vercel Edge)

Use `createHandler()` to export the fetch handler:

```typescript
import { createApp, createHandler, json } from '@curisjs/core';

const app = createApp();

app.get('/', (ctx) => {
  return json({ message: 'Hello from the Edge!' });
});

// Export handler for edge runtime
export default createHandler(app);
```

The `createHandler()` function returns:

```typescript
{
  fetch: (request: Request, env?: any) => app.fetch(request, env)
}
```

This matches the expected format for:
- Cloudflare Workers (`export default { fetch }`)
- Vercel Edge Functions
- Other edge platforms

## Examples

### Example 1: Simple API Server

Works on **all runtimes** without changes:

```typescript
import { createApp, json } from '@curisjs/core';

const app = createApp();

// Routes
app.get('/api/health', (ctx) => {
  return json({ status: 'ok', timestamp: Date.now() });
});

app.get('/api/users/:id', (ctx) => {
  return json({ 
    userId: ctx.params.id,
    name: 'John Doe' 
  });
});

app.post('/api/users', async (ctx) => {
  const data = await ctx.json();
  return json({ created: data }, 201);
});

// Start server (auto-detects runtime)
app.listen(3000);
```

### Example 2: With Middleware

```typescript
import { createApp, json } from '@curisjs/core';

const app = createApp();

// Global middleware
app.use(async (ctx, next) => {
  const start = Date.now();
  await next();
  const duration = Date.now() - start;
  console.log(`${ctx.request.method} ${ctx.request.url} - ${duration}ms`);
});

// CORS middleware
app.use(async (ctx, next) => {
  await next();
  if (ctx.response) {
    ctx.response.headers.set('Access-Control-Allow-Origin', '*');
  }
});

app.get('/', (ctx) => json({ message: 'Hello' }));

app.listen(3000);
```

### Example 3: Cloudflare Workers with Environment Variables

```typescript
import { createApp, createHandler, json } from '@curisjs/core';

const app = createApp();

app.get('/', (ctx) => {
  // Access Cloudflare Worker environment
  const apiKey = ctx.env.API_KEY;
  const kv = ctx.env.MY_KV_NAMESPACE;
  
  return json({ 
    message: 'Hello from Workers!',
    hasKey: !!apiKey 
  });
});

export default createHandler(app);
```

### Example 4: Error Handling

```typescript
import { createApp, json } from '@curisjs/core';

const app = createApp({
  onError: (error, ctx) => {
    console.error('Error:', error);
    return json({ 
      error: error.message,
      path: ctx.request.url 
    }, 500);
  }
});

app.get('/error', (ctx) => {
  throw new Error('Something went wrong!');
});

app.listen(3000);
```

## Migration Guide

### Before (with adapters)

```typescript
// Old approach - required different code per runtime
import { createApp } from '@curisjs/core';
import { serve } from '@curisjs/core/node';  // ❌ Runtime-specific

const app = createApp();
app.get('/', () => new Response('Hello'));

serve(app, { port: 3000 });  // ❌ Only works on Node.js
```

### After (runtime agnostic)

```typescript
// New approach - same code works everywhere
import { createApp } from '@curisjs/core';

const app = createApp();
app.get('/', () => new Response('Hello'));

app.listen(3000);  // ✅ Works on Bun, Deno, Node.js
```

## Legacy Node.js Support

For Node.js < 18 (without native fetch), use the adapter:

```typescript
import { createApp } from '@curisjs/core';
import { serve } from '@curisjs/core/adapters/node';

const app = createApp();
app.get('/', () => new Response('Hello'));

serve(app, { port: 3000 });
```

## Performance Benefits

### 1. Zero Conversion Overhead

On Bun and Deno, there's **zero conversion** between request/response objects:

```typescript
// Native Web Standards - no conversion needed!
Bun.serve({
  fetch: (req: Request) => app.fetch(req)  // ✅ Direct
});
```

### 2. Streaming Support

Full streaming support with Web Standards:

```typescript
app.get('/stream', (ctx) => {
  const stream = new ReadableStream({
    start(controller) {
      controller.enqueue(new TextEncoder().encode('chunk 1\n'));
      controller.enqueue(new TextEncoder().encode('chunk 2\n'));
      controller.close();
    }
  });
  
  return new Response(stream);
});
```

### 3. Minimal Allocations

The framework minimizes object creation:

- Lazy URL parsing
- Reusable context objects
- Zero-copy where possible

## Best Practices

### 1. Use Standard Response Helpers

```typescript
import { json, text, html, redirect } from '@curisjs/core';

app.get('/api', (ctx) => json({ data: 'value' }));
app.get('/page', (ctx) => html('<h1>Hello</h1>'));
app.get('/redirect', (ctx) => redirect('/new-url'));
```

### 2. Type Safety

```typescript
import type { Context } from '@curisjs/core';

interface User {
  id: string;
  name: string;
}

app.get('/users/:id', (ctx: Context) => {
  const userId: string = ctx.params.id;
  const user: User = { id: userId, name: 'John' };
  return json(user);
});
```

### 3. Environment Variables

```typescript
// Works on all runtimes
app.get('/', (ctx) => {
  // Cloudflare Workers: ctx.env.VAR_NAME
  // Node.js: process.env.VAR_NAME
  // Bun: Bun.env.VAR_NAME
  // Deno: Deno.env.get('VAR_NAME')
  
  const config = ctx.env.CONFIG || process.env.CONFIG;
  return json({ config });
});
```

## Deployment

### Bun

```bash
bun run server.ts
```

### Deno

```bash
deno run --allow-net server.ts
```

### Node.js

```bash
node server.js
# or with TypeScript
npx tsx server.ts
```

### Cloudflare Workers

```bash
wrangler deploy
```

### Vercel

```bash
vercel deploy
```

### Docker (Node.js)

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --production
COPY . .
CMD ["node", "server.js"]
```

### Docker (Bun)

```dockerfile
FROM oven/bun:latest
WORKDIR /app
COPY package.json bun.lockb ./
RUN bun install --production
COPY . .
CMD ["bun", "run", "server.ts"]
```

## Troubleshooting

### Issue: `listen()` not working

**Solution**: Make sure you're on a server runtime (Bun/Deno/Node). For edge runtimes, use `createHandler()`:

```typescript
// Edge runtime
export default createHandler(app);

// Server runtime
app.listen(3000);
```

### Issue: Node.js version error

**Error**: `Node.js 18+ is required`

**Solution**: Upgrade to Node.js 18+ or use the adapter:

```typescript
import { serve } from '@curisjs/core/adapters/node';
serve(app, { port: 3000 });
```

### Issue: Type errors with `Request`/`Response`

**Solution**: Make sure your TypeScript config includes Web Standards:

```json
{
  "compilerOptions": {
    "lib": ["ES2022", "DOM"],
    "target": "ES2022",
    "module": "ES2022"
  }
}
```

## Summary

CurisJS is now **truly runtime-agnostic**:

✅ **Same code** runs everywhere  
✅ **No adapters** needed for modern runtimes  
✅ **Web Standards** first  
✅ **Auto-detection** of runtime  
✅ **Type-safe** and production-ready  
✅ **High performance** with zero overhead  

This makes CurisJS one of the most portable web frameworks in the JavaScript ecosystem! 🚀
