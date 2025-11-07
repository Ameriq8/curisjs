# CurisJS Runtime Examples

This directory contains examples of running CurisJS across different JavaScript runtimes.

## 🚀 Supported Runtimes

CurisJS works natively across all modern JavaScript runtimes without any adapters:

- ✅ **Bun** - Ultra-fast JavaScript runtime
- ✅ **Deno** - Secure TypeScript runtime
- ✅ **Node.js 18+** - Traditional Node.js with native fetch
- ✅ **Cloudflare Workers** - Edge computing platform
- ✅ **Vercel Edge Functions** - Serverless edge runtime
- ✅ **Any runtime with Web Standards** - Fetch API support

## 📦 Installation

```bash
# Using npm
npm install @curisjs/core

# Using pnpm
pnpm add @curisjs/core

# Using yarn
yarn add @curisjs/core

# Using bun
bun add @curisjs/core
```

## 🏃 Running Examples

### Bun

```bash
bun run bun-server.ts
```

### Deno

```bash
deno run --allow-net deno-server.ts
```

### Node.js 18+

```bash
# Using tsx
npx tsx node-server.ts

# Or using ts-node
node --loader ts-node/esm node-server.ts
```

### Cloudflare Workers

1. Create `wrangler.toml`:
```toml
name = "curisjs-worker"
main = "cloudflare-worker.ts"
compatibility_date = "2024-01-01"
```

2. Deploy:
```bash
wrangler deploy
```

### Vercel Edge Functions

1. Create `vercel.json`:
```json
{
  "functions": {
    "api/**/*.ts": {
      "runtime": "edge"
    }
  }
}
```

2. Deploy:
```bash
vercel deploy
```

## 🎯 Key Features

### Same Code, All Runtimes

The same CurisJS code runs on all runtimes:

```typescript
import { createApp, json } from '@curisjs/core';

const app = createApp();

app.get('/', (ctx) => {
  return json({ message: 'Hello World!' });
});

// For servers (Bun, Deno, Node)
app.listen(3000);

// For edge (Workers, Vercel)
export default createHandler(app);
```

### Auto Runtime Detection

CurisJS automatically detects the runtime and uses the appropriate server:

```typescript
// No configuration needed!
app.listen(3000);

// Logs:
// - "🚀 Server running on http://localhost:3000 (Bun)" on Bun
// - "🚀 Server running on http://localhost:3000 (Deno)" on Deno  
// - "🚀 Server running on http://localhost:3000 (Node.js)" on Node
```

### Web Standards API

Built entirely on Web Standards (Request/Response):

```typescript
app.get('/users/:id', async (ctx) => {
  // Standard Request object
  const headers = ctx.request.headers;
  
  // Standard methods
  const data = await ctx.json();
  
  // Standard Response
  return new Response('Hello', { status: 200 });
});
```

## 📚 Advanced Usage

### Middleware

```typescript
import { createApp, json } from '@curisjs/core';

const app = createApp();

// Global middleware
app.use(async (ctx, next) => {
  console.log(`${ctx.request.method} ${ctx.request.url}`);
  await next();
});

app.get('/', (ctx) => json({ message: 'Hello' }));

app.listen(3000);
```

### Validation

```typescript
import { createApp, json, z } from '@curisjs/core';

const app = createApp();

const userSchema = z.object({
  name: z.string().min(3),
  email: z.string().email(),
});

app.post('/users', async (ctx) => {
  const data = await ctx.validateOrFail(userSchema);
  return json({ user: data });
});

app.listen(3000);
```

### Error Handling

```typescript
const app = createApp({
  onError: (error, ctx) => {
    console.error(error);
    return json({ error: error.message }, 500);
  }
});
```

## 🔧 Legacy Node.js Support

For Node.js < 18, use the adapter:

```typescript
import { createApp } from '@curisjs/core';
import { serve } from '@curisjs/core/adapters/node';

const app = createApp();
app.get('/', () => new Response('Hello'));

serve(app, { port: 3000 });
```

## 📖 Learn More

- [CurisJS Documentation](../../README.md)
- [API Reference](../../docs/API.md)
- [Migration Guide](../../docs/MIGRATION.md)

## 🤝 Contributing

See [CONTRIBUTING.md](../../../CONTRIBUTING.md) for contribution guidelines.

## 📄 License

MIT © [Ameriq8](https://github.com/Ameriq8)
