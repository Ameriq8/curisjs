# @curisjs/core

The core framework package providing routing, middleware, validation, and runtime-agnostic server capabilities.

## Overview

`@curisjs/core` is a high-performance web framework built on Web Standard APIs that runs seamlessly across all JavaScript runtimes without any adapters or configuration changes.

## Installation

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

## Quick Start

```typescript
import { createApp, json } from '@curisjs/core';

const app = createApp();

app.get('/', (ctx) => {
  return json({ message: 'Hello, World!' });
});

app.listen(3000);
```

## Key Features

### 🚀 Multi-Runtime Support

Run your code on any JavaScript runtime without changes:

- **Node.js 18+** - Traditional and reliable
- **Bun** - Fast all-in-one toolkit
- **Deno** - Secure by default
- **Cloudflare Workers** - Global edge deployment
- **Vercel Edge** - Serverless at the edge

### ⚡ High Performance

- **Radix Tree Router** - O(path_length) lookup complexity
- **Zero Allocations** - Minimal memory overhead in hot paths
- **Optimized Middleware** - Efficient pipeline execution
- **Web Streams** - Native streaming support

### 🛡️ Type Safety

Full TypeScript support with intelligent type inference:

```typescript
import { z } from '@curisjs/core';

const schema = z.object({
  name: z.string(),
  age: z.number(),
});

app.post('/users', async (ctx) => {
  const data = schema.parse(await ctx.json());
  // data is fully typed: { name: string; age: number }
});
```

### 🔌 Middleware System

Powerful and flexible middleware pipeline:

```typescript
import { logger, cors, helmet } from '@curisjs/core';

app.use(logger());
app.use(cors());
app.use(helmet());

// Custom middleware
app.use(async (ctx, next) => {
  const start = Date.now();
  await next();
  const duration = Date.now() - start;
  console.log(`${ctx.request.method} ${ctx.url.pathname} - ${duration}ms`);
});
```

## Architecture

### Core Components

```
Application
    ├─ Router (Radix Tree)
    │   ├─ Route Matching
    │   ├─ Parameter Extraction
    │   └─ Handler Resolution
    │
    ├─ Context
    │   ├─ Request (Web API)
    │   ├─ Response Helpers
    │   ├─ State Management
    │   └─ Parameter Access
    │
    ├─ Middleware Pipeline
    │   ├─ Global Middleware
    │   ├─ Route Middleware
    │   └─ Error Handling
    │
    └─ Service Container
        ├─ Dependency Injection
        ├─ Service Providers
        └─ Facades
```

## What's Included

### Core APIs

- [**Application**](/core/application) - Main app instance and configuration
- [**Router**](/core/routing) - High-performance routing system
- [**Context**](/core/context) - Request/response context
- [**Middleware**](/core/middleware) - Middleware system and built-in middlewares

### Built-in Middlewares

- [**Security**](/core/middleware#security-middlewares) - Helmet, CSRF, Sanitizer
- [**Request Processing**](/core/middleware#request-processing) - Body Parser, Validator
- [**Performance**](/core/middleware#performance) - Compression, Rate Limiter
- [**Session Management**](/core/middleware#session-management) - Cookie-based sessions
- [**API Versioning**](/core/middleware#api-versioning) - Multiple versioning strategies
- [**Utilities**](/core/middleware#logging--cors) - Logger, CORS

### Validation

- [**Schema Validation**](/core/validation) - Zod-powered validation system
- [**Custom Validators**](/core/validation#custom-validators) - Build your own validators
- [**Error Handling**](/core/validation#error-handling) - Comprehensive error messages

### Service Container

- [**Dependency Injection**](/core/container) - IoC container
- [**Service Providers**](/core/providers) - Application bootstrapping
- [**Facades**](/core/facades) - Static proxy pattern

## Philosophy

CurisJS core is built on these principles:

1. **Web Standards First** - Use native Web APIs (Request, Response, Headers, FormData)
2. **Runtime Agnostic** - Zero runtime-specific code in the core
3. **Zero Config** - Sensible defaults, configure only when needed
4. **Type Safety** - Full TypeScript with excellent inference
5. **Performance** - Optimized for speed and low memory usage
6. **Developer Experience** - Clean, intuitive APIs

## Runtime Detection

CurisJS automatically detects and adapts to the runtime:

```typescript
// Automatically uses the right server implementation
app.listen(3000); // Works in Node.js, Bun, Deno

// Or export for edge runtimes
export default app; // Works in Cloudflare Workers, Vercel Edge
```

### Node.js

Uses the built-in `http` module:

```typescript
import { createApp } from '@curisjs/core';
const app = createApp();
app.listen(3000); // HTTP server on port 3000
```

### Bun

Uses Bun's native server:

```typescript
import { createApp } from '@curisjs/core';
const app = createApp();
app.listen(3000); // Bun.serve() internally
```

### Deno

Uses Deno's HTTP server:

```typescript
import { createApp } from '@curisjs/core';
const app = createApp();
app.listen(3000); // Deno.serve() internally
```

### Cloudflare Workers

Export the app directly:

```typescript
import { createApp } from '@curisjs/core';
const app = createApp();

app.get('/', (ctx) => json({ message: 'Hello from the edge!' }));

export default app;
```

### Vercel Edge

Same as Cloudflare Workers:

```typescript
import { createApp } from '@curisjs/core';
const app = createApp();
export default app;
```

## Next Steps

- [**Application API**](/core/application) - Learn about the app instance
- [**Routing Guide**](/core/routing) - Master the router
- [**Middleware Guide**](/core/middleware) - Use built-in and custom middleware
- [**Validation**](/core/validation) - Validate requests with schemas
- [**Context API**](/core/context) - Work with request/response
- [**Service Container**](/core/container) - Dependency injection patterns

## Examples

Check out the [examples directory](https://github.com/Ameriq8/curisjs/tree/main/packages/core/examples) for runtime-specific examples:

- Node.js server
- Bun server
- Deno server
- Cloudflare Worker
- Vercel Edge function
