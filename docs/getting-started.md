# Getting Started with CurisJS

This guide will help you get started with CurisJS and build your first application.

## Prerequisites

- Node.js 18+ (or Bun 1.0+, or Deno 1.30+)
- Basic knowledge of TypeScript
- A package manager (npm, pnpm, yarn, or bun)

## Installation

### Option 1: Using the CLI (Recommended)

The fastest way to start a new CurisJS project:

```bash
# Using npx
npx @curisjs/cli new my-app

# Or install globally
npm install -g @curisjs/cli
curis new my-app

# Navigate to your project
cd my-app

# Install dependencies
pnpm install

# Start development server
pnpm dev
```

The CLI will ask you:
- Which package manager to use (pnpm, npm, yarn, bun)
- Whether to include database support (@curisjs/db)
- Whether to initialize a git repository

### Option 2: Manual Installation

```bash
# Create a new directory
mkdir my-app
cd my-app

# Initialize package.json
npm init -y

# Install CurisJS
npm install @curisjs/core

# Install TypeScript (if not already installed)
npm install -D typescript @types/node tsx
```

## Your First Application

### 1. Create `src/index.ts`

```typescript
import { createApp } from '@curisjs/core';

const app = createApp();

// Define routes
app.get('/', (ctx) => {
  return ctx.text('Hello, CurisJS!');
});

app.get('/json', (ctx) => {
  return ctx.json({ message: 'Hello from JSON!' });
});

app.get('/users/:id', (ctx) => {
  const userId = ctx.params.id;
  return ctx.json({ userId, name: 'John Doe' });
});

// Start server
app.listen(3000, () => {
  console.log('🚀 Server running on http://localhost:3000');
});
```

### 2. Add Scripts to `package.json`

```json
{
  "type": "module",
  "scripts": {
    "dev": "tsx watch src/index.ts",
    "build": "tsc",
    "start": "node dist/index.js"
  }
}
```

### 3. Run Your App

```bash
npm run dev
```

Visit `http://localhost:3000` to see your app running!

## Understanding the Basics

### Creating an Application

```typescript
import { createApp } from '@curisjs/core';

const app = createApp({
  basePath: '/api',        // Optional: prefix all routes
  strict: false,           // Optional: strict routing
  notFound: (ctx) => {     // Optional: custom 404 handler
    return ctx.json({ error: 'Not found' }, 404);
  },
  onError: (error, ctx) => {  // Optional: custom error handler
    console.error(error);
    return ctx.json({ error: 'Internal error' }, 500);
  },
});
```

### Routing

CurisJS uses a high-performance radix tree router:

```typescript
// Basic routes
app.get('/users', handler);
app.post('/users', handler);
app.put('/users/:id', handler);
app.delete('/users/:id', handler);

// Route parameters
app.get('/users/:id', (ctx) => {
  const id = ctx.params.id;
  return ctx.json({ userId: id });
});

// Wildcard routes
app.get('/files/*path', (ctx) => {
  const filePath = ctx.params.path;
  return ctx.text(`File: ${filePath}`);
});

// Multiple methods
app.all('/ping', (ctx) => {
  return ctx.text('pong');
});
```

### Request Context

Every route handler receives a `Context` object:

```typescript
app.get('/example', async (ctx) => {
  // Request information
  const method = ctx.request.method;
  const url = ctx.request.url;
  const headers = ctx.request.headers;
  
  // Route parameters
  const params = ctx.params;
  
  // Query parameters
  const query = ctx.query;
  
  // Parse JSON body
  const body = await ctx.json();
  
  // Get form data
  const formData = await ctx.formData();
  
  // Get specific header
  const auth = ctx.header('authorization');
  
  // Environment variables (in edge runtimes)
  const env = ctx.env;
  
  // Custom state
  ctx.state.user = { id: 1 };
  
  return ctx.json({ success: true });
});
```

### Response Helpers

```typescript
// JSON response
app.get('/json', (ctx) => {
  return ctx.json({ message: 'Hello' }, 200);
});

// Text response
app.get('/text', (ctx) => {
  return ctx.text('Plain text');
});

// HTML response
app.get('/html', (ctx) => {
  return ctx.html('<h1>Hello</h1>');
});

// Redirect
app.get('/old', (ctx) => {
  return ctx.redirect('/new', 301);
});

// Stream response
app.get('/stream', (ctx) => {
  const stream = new ReadableStream({
    start(controller) {
      controller.enqueue('chunk 1\n');
      controller.enqueue('chunk 2\n');
      controller.close();
    },
  });
  return ctx.stream(stream);
});

// Server-Sent Events
app.get('/events', (ctx) => {
  return ctx.sse((send) => {
    send({ data: 'Hello' });
    send({ event: 'custom', data: 'World' });
  });
});
```

### Middleware

Middleware functions execute before route handlers:

```typescript
import { cors, logger } from '@curisjs/core';

// Global middleware
app.use(logger());
app.use(cors());

// Custom middleware
app.use(async (ctx, next) => {
  const start = Date.now();
  await next();
  const duration = Date.now() - start;
  console.log(`${ctx.request.method} ${ctx.request.url} - ${duration}ms`);
});

// Authentication middleware
app.use(async (ctx, next) => {
  const token = ctx.header('authorization');
  if (!token) {
    return ctx.json({ error: 'Unauthorized' }, 401);
  }
  
  // Verify token...
  ctx.state.user = { id: 1, name: 'John' };
  
  await next();
});
```

### Validation

CurisJS includes a built-in Zod-like validation system:

```typescript
import { z } from '@curisjs/core';

const userSchema = z.object({
  name: z.string().min(3).max(50),
  email: z.string().email(),
  age: z.number().min(18).max(120),
  role: z.enum(['user', 'admin']),
});

app.post('/users', async (ctx) => {
  try {
    const data = await ctx.validate(userSchema);
    // data is fully typed!
    return ctx.json({ user: data });
  } catch (error) {
    return ctx.json({ errors: error.format() }, 400);
  }
});
```

## Runtime-Specific Examples

### Node.js

```typescript
import { createApp } from '@curisjs/core';

const app = createApp();
app.get('/', (ctx) => ctx.text('Hello from Node!'));

app.listen(3000); // Auto-detects Node.js
```

### Bun

```typescript
import { createApp } from '@curisjs/core';

const app = createApp();
app.get('/', (ctx) => ctx.text('Hello from Bun!'));

app.listen(3000); // Auto-detects Bun
```

### Deno

```typescript
import { createApp } from '@curisjs/core';

const app = createApp();
app.get('/', (ctx) => ctx.text('Hello from Deno!'));

app.listen(3000); // Auto-detects Deno
```

### Cloudflare Workers

```typescript
import { createApp, createHandler } from '@curisjs/core';

const app = createApp();

app.get('/', (ctx) => {
  // Access environment variables
  const apiKey = ctx.env.API_KEY;
  return ctx.text('Hello from Cloudflare!');
});

export default createHandler(app);
```

### Vercel Edge Functions

```typescript
import { createApp, createHandler } from '@curisjs/core';

const app = createApp();
app.get('/', (ctx) => ctx.text('Hello from Vercel Edge!'));

export default createHandler(app);
```

## Next Steps

Now that you understand the basics:

1. **Add Database Support**: [Database Guide](./db/README.md)
2. **Learn Advanced Routing**: [Core Documentation](./core/README.md)
3. **Use the CLI**: [CLI Reference](./cli/README.md)
4. **Explore Examples**: [Examples](./examples/README.md)

## Common Patterns

### Error Handling

```typescript
app.get('/error', async (ctx) => {
  try {
    // Your code that might throw
    throw new Error('Something went wrong');
  } catch (error) {
    console.error(error);
    return ctx.json({ error: 'Internal error' }, 500);
  }
});

// Or use global error handler
const app = createApp({
  onError: (error, ctx) => {
    console.error(error);
    return ctx.json({ 
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
    }, 500);
  },
});
```

### File Uploads

```typescript
app.post('/upload', async (ctx) => {
  const formData = await ctx.formData();
  const file = formData.get('file') as File;
  
  if (!file) {
    return ctx.json({ error: 'No file provided' }, 400);
  }
  
  // Process file...
  const buffer = await file.arrayBuffer();
  
  return ctx.json({ 
    filename: file.name,
    size: file.size,
    type: file.type,
  });
});
```

### CORS Configuration

```typescript
import { cors } from '@curisjs/core';

app.use(cors({
  origin: 'https://example.com',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true,
  maxAge: 86400,
}));
```

## Troubleshooting

### Port already in use

```bash
# Find process using port 3000
lsof -i :3000

# Kill the process
kill -9 <PID>
```

### TypeScript errors

Make sure your `tsconfig.json` has:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "lib": ["ES2022"],
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true
  }
}
```

### Module not found

CurisJS uses ES modules. Ensure `package.json` has:

```json
{
  "type": "module"
}
```
