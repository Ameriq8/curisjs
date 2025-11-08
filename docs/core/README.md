# @curisjs/core

The core framework package providing routing, middleware, validation, and request/response handling.

## Table of Contents

- [Installation](#installation)
- [Application](#application)
- [Routing](#routing)
- [Context API](#context-api)
- [Middleware](#middleware)
- [Validation](#validation)
- [Response Utilities](#response-utilities)
- [Service Providers](#service-providers)
- [Dependency Injection](#dependency-injection)
- [Facades](#facades)
- [Environment Variables](#environment-variables)

## Installation

```bash
npm install @curisjs/core
```

## Application

### Creating an App

```typescript
import { createApp } from '@curisjs/core';

const app = createApp();
```

### App Options

```typescript
interface AppOptions {
  basePath?: string;           // Prefix for all routes
  strict?: boolean;            // Strict routing (trailing slash matters)
  notFound?: Handler;          // Custom 404 handler
  onError?: ErrorHandler;      // Custom error handler
}

const app = createApp({
  basePath: '/api/v1',
  strict: true,
  notFound: (ctx) => ctx.json({ error: 'Route not found' }, 404),
  onError: (error, ctx) => {
    console.error(error);
    return ctx.json({ error: error.message }, 500);
  },
});
```

### Starting the Server

```typescript
// Auto-detect runtime (Node/Bun/Deno)
await app.listen(3000);

// With callback
await app.listen(3000, (port) => {
  console.log(`Server running on port ${port}`);
});

// Manual fetch handler (for edge runtimes)
export default {
  fetch: (req) => app.fetch(req),
};
```

## Routing

CurisJS uses a high-performance radix tree router with O(path_length) lookup time.

### HTTP Methods

```typescript
app.get(path, handler);
app.post(path, handler);
app.put(path, handler);
app.patch(path, handler);
app.delete(path, handler);
app.head(path, handler);
app.httpOptions(path, handler);  // .options() is reserved
app.all(path, handler);  // Matches all methods
```

### Route Patterns

#### Static Routes

```typescript
app.get('/users', (ctx) => {
  return ctx.json({ users: [] });
});

app.get('/users/list', (ctx) => {
  return ctx.json({ users: [] });
});
```

#### Named Parameters

```typescript
app.get('/users/:id', (ctx) => {
  const userId = ctx.params.id;
  return ctx.json({ userId });
});

app.get('/posts/:postId/comments/:commentId', (ctx) => {
  const { postId, commentId } = ctx.params;
  return ctx.json({ postId, commentId });
});
```

#### Wildcard Routes

```typescript
// Matches /files/path/to/file.txt
app.get('/files/*path', (ctx) => {
  const filePath = ctx.params.path; // "path/to/file.txt"
  return ctx.text(`File: ${filePath}`);
});

// Custom wildcard name
app.get('/assets/*filepath', (ctx) => {
  const path = ctx.params.filepath;
  return ctx.text(`Asset: ${path}`);
});
```

### Route Priority

Routes are matched in this order:
1. Static segments (highest priority)
2. Named parameters
3. Wildcards (lowest priority)

```typescript
app.get('/users/list', handler1);    // Matched first
app.get('/users/:id', handler2);     // Matched second
app.get('/users/*path', handler3);   // Matched last
```

## Context API

The `Context` object is passed to every handler and middleware.

### Properties

```typescript
app.get('/example', (ctx) => {
  // Request
  ctx.request: Request           // Native Request object
  
  // Route parameters
  ctx.params: RouteParams        // { id: "123" }
  
  // Query parameters  
  ctx.query: URLSearchParams     // ?name=john&age=25
  
  // Environment (edge runtimes)
  ctx.env: Environment           // { API_KEY: "..." }
  
  // Custom state
  ctx.state: ContextState        // For sharing data between middleware
  
  // Response (set by middleware)
  ctx.response?: Response
});
```

### Methods

#### Request Parsing

```typescript
// Parse JSON body
const data = await ctx.json<{ name: string }>();

// Parse form data
const formData = await ctx.formData();

// Parse text
const text = await ctx.text();

// Parse array buffer
const buffer = await ctx.arrayBuffer();

// Parse blob
const blob = await ctx.blob();
```

#### Headers

```typescript
// Get header
const auth = ctx.header('authorization');
const contentType = ctx.header('content-type');

// All headers
const headers = ctx.request.headers;
```

#### Validation

```typescript
import { z } from '@curisjs/core';

const schema = z.object({
  name: z.string(),
  email: z.string().email(),
});

app.post('/users', async (ctx) => {
  const data = await ctx.validate(schema);
  // data is typed as { name: string; email: string }
  return ctx.json({ user: data });
});
```

#### Response Helpers

```typescript
// JSON
ctx.json(data, status?, headers?);

// Text
ctx.text(content, status?, headers?);

// HTML
ctx.html(markup, status?, headers?);

// Redirect
ctx.redirect(url, status?);

// Stream
ctx.stream(readableStream, headers?);

// Server-Sent Events
ctx.sse(sender);
```

## Middleware

Middleware functions execute in order before route handlers.

### Global Middleware

```typescript
app.use(async (ctx, next) => {
  console.log('Before route handler');
  await next();
  console.log('After route handler');
});
```

### Built-in Middleware

#### CORS

```typescript
import { cors } from '@curisjs/core';

app.use(cors({
  origin: '*',                           // or specific origin
  methods: ['GET', 'POST', 'PUT'],
  credentials: true,
  allowedHeaders: ['Content-Type'],
  exposedHeaders: ['X-Custom-Header'],
  maxAge: 86400,
}));
```

#### Logger

```typescript
import { logger } from '@curisjs/core';

app.use(logger());
// GET /users 200 - 15ms
```

### Custom Middleware

```typescript
// Timing middleware
app.use(async (ctx, next) => {
  const start = Date.now();
  await next();
  const duration = Date.now() - start;
  ctx.response?.headers.set('X-Response-Time', `${duration}ms`);
});

// Authentication middleware
app.use(async (ctx, next) => {
  const token = ctx.header('authorization');
  
  if (!token) {
    return ctx.json({ error: 'Unauthorized' }, 401);
  }
  
  // Verify token and set user
  const user = await verifyToken(token);
  ctx.state.user = user;
  
  await next();
});

// Error handling middleware
app.use(async (ctx, next) => {
  try {
    await next();
  } catch (error) {
    console.error('Error:', error);
    return ctx.json({ error: 'Internal error' }, 500);
  }
});
```

### Short-Circuiting

Middleware can short-circuit the chain by returning a Response:

```typescript
app.use(async (ctx, next) => {
  if (!ctx.header('x-api-key')) {
    return ctx.json({ error: 'API key required' }, 401);
    // next() is never called
  }
  await next();
});
```

## Validation

CurisJS includes a Zod-like validation system.

### Schema Types

```typescript
import { z } from '@curisjs/core';

// String
z.string()
  .min(3)
  .max(50)
  .email()
  .url()
  .uuid()
  .regex(/^[a-z]+$/, 'Lowercase only')

// Number
z.number()
  .min(0)
  .max(100)
  .int()
  .positive()
  .negative()

// Boolean
z.boolean()

// Date
z.date()
  .min(new Date('2024-01-01'))
  .max(new Date('2024-12-31'))

// Array
z.array(z.string())
  .min(1)
  .max(10)
  .nonempty()

// Object
z.object({
  name: z.string(),
  age: z.number(),
  email: z.string().email(),
})

// Enum
z.enum(['admin', 'user', 'guest'])

// Coercion (convert strings to other types)
z.coerce.number()  // "123" → 123
z.coerce.boolean() // "true" → true
z.coerce.date()    // "2024-01-01" → Date

// Optional and nullable
z.string().optional()        // string | undefined
z.string().nullable()        // string | null
z.string().default('hello')  // Use default if undefined
```

### Nested Objects

```typescript
const addressSchema = z.object({
  street: z.string(),
  city: z.string(),
  zipCode: z.string().regex(/^\d{5}$/),
});

const userSchema = z.object({
  name: z.string(),
  email: z.string().email(),
  address: addressSchema,
  tags: z.array(z.string()),
});
```

### Custom Validation

```typescript
const passwordSchema = z.string()
  .min(8, 'Password must be at least 8 characters')
  .refine(
    (val) => /[A-Z]/.test(val),
    'Password must contain uppercase letter'
  )
  .refine(
    (val) => /[0-9]/.test(val),
    'Password must contain number'
  );
```

### Using Validation

```typescript
app.post('/users', async (ctx) => {
  const schema = z.object({
    name: z.string().min(3),
    email: z.string().email(),
    age: z.number().min(18),
  });
  
  try {
    const data = await ctx.validate(schema);
    // data is typed!
    
    return ctx.json({ user: data });
  } catch (error) {
    // Validation failed
    return ctx.json({ 
      errors: error.format() 
    }, 400);
  }
});
```

### Manual Validation

```typescript
const schema = z.object({ name: z.string() });

// Parse and throw on error
const data = schema.parse({ name: 'John' });

// Safe parse (returns result)
const result = schema.safeParse({ name: 'John' });

if (result.success) {
  console.log(result.data);
} else {
  console.log(result.error.issues);
  console.log(result.error.format());
}
```

## Response Utilities

### JSON Response

```typescript
import { json } from '@curisjs/core';

app.get('/users', (ctx) => {
  return json({ users: [] });
});

// With status and headers
app.get('/created', (ctx) => {
  return json(
    { id: 1 },
    201,
    { 'X-Custom': 'value' }
  );
});
```

### Text Response

```typescript
import { text } from '@curisjs/core';

app.get('/plain', (ctx) => {
  return text('Hello, World!');
});
```

### HTML Response

```typescript
import { html } from '@curisjs/core';

app.get('/page', (ctx) => {
  return html('<h1>Hello</h1>');
});
```

### Redirect

```typescript
import { redirect } from '@curisjs/core';

app.get('/old', (ctx) => {
  return redirect('/new', 301);
});
```

### Stream Response

```typescript
import { stream } from '@curisjs/core';

app.get('/stream', (ctx) => {
  const readable = new ReadableStream({
    start(controller) {
      controller.enqueue('chunk 1\n');
      controller.enqueue('chunk 2\n');
      controller.close();
    },
  });
  
  return stream(readable);
});
```

### Server-Sent Events

```typescript
import { sse } from '@curisjs/core';

app.get('/events', (ctx) => {
  return sse((send) => {
    // Send data
    send({ data: 'Hello' });
    
    // Send with event name
    send({ 
      event: 'message',
      data: { text: 'Hello' },
    });
    
    // Send with ID and retry
    send({
      id: '123',
      event: 'update',
      data: { count: 1 },
      retry: 3000,
    });
  });
});
```

## Service Providers

Service providers organize application bootstrapping logic.

### Creating a Provider

```typescript
import { ServiceProvider } from '@curisjs/core';

class AppServiceProvider extends ServiceProvider {
  register() {
    // Register bindings in the container
    this.app.container.singleton('logger', () => new Logger());
  }
  
  boot() {
    // Bootstrap application services
    const logger = this.app.container.make('logger');
    logger.info('Application started');
  }
}
```

### Built-in Providers

```typescript
import { 
  RouteServiceProvider,
  MiddlewareServiceProvider,
  ConfigServiceProvider 
} from '@curisjs/core';

// These are automatically registered
```

## Dependency Injection

CurisJS includes a powerful IoC container.

### Container Basics

```typescript
import { Container } from '@curisjs/core';

const container = new Container();

// Bind instance
container.instance('config', { apiKey: '123' });

// Bind factory
container.bind('logger', () => new Logger());

// Singleton (created once)
container.singleton('database', () => new Database());

// Resolve
const logger = container.make('logger');
```

### Using Application Container

```typescript
import { createApp } from '@curisjs/core';

const app = createApp();

// Register services
app.container.singleton('cache', () => new Cache());

// Use in routes
app.get('/cached', (ctx) => {
  const cache = app.container.make('cache');
  return ctx.json({ cached: cache.get('key') });
});
```

## Facades

Facades provide a static interface to services in the container.

### Creating a Facade

```typescript
import { createFacade } from '@curisjs/core';

class Logger {
  info(message: string) {
    console.log(`[INFO] ${message}`);
  }
}

export const Log = createFacade<Logger>('logger');

// Usage
Log.info('Application started');
```

### Built-in Facades

```typescript
import { Route, Config } from '@curisjs/core';

// Route facade
Route.get('/users', handler);
Route.post('/users', handler);

// Config facade
const apiKey = Config.get('app.apiKey');
```

## Environment Variables

### Loading Environment

```typescript
import { loadEnv, env } from '@curisjs/core';

// Load .env file
loadEnv();

// Access variables
const apiKey = env('API_KEY');
const port = env('PORT', '3000');  // With default
const debug = env('DEBUG') === 'true';
```

### Edge Runtime Environment

```typescript
app.get('/secret', (ctx) => {
  // Access environment from context
  const apiKey = ctx.env.API_KEY;
  return ctx.json({ hasKey: !!apiKey });
});
```

## TypeScript Support

### Type-Safe Routes

```typescript
interface User {
  id: number;
  name: string;
  email: string;
}

app.get('/users/:id', async (ctx) => {
  const userId = ctx.params.id; // string
  const user: User = await findUser(userId);
  return ctx.json<User>(user);
});
```

### Type-Safe Validation

```typescript
const userSchema = z.object({
  name: z.string(),
  email: z.string().email(),
  age: z.number(),
});

type UserInput = z.infer<typeof userSchema>;
// { name: string; email: string; age: number }

app.post('/users', async (ctx) => {
  const data = await ctx.validate(userSchema);
  // data is UserInput
});
```

## Performance

### Router Benchmarks

- Static routes: ~5M req/s
- Parameterized routes: ~4M req/s  
- Wildcard routes: ~3.5M req/s

### Optimization Tips

1. **Use static routes when possible** - They have highest priority
2. **Minimize middleware** - Each middleware adds overhead
3. **Avoid large JSON parsing** - Stream when possible
4. **Use Response caching** - Cache computed responses

## API Reference

See individual files for detailed API:

- [Routing](./routing.md)
- [Context](./context.md)
- [Middleware](./middleware.md)
- [Validation](./validation.md)
- [Container](./container.md)
- [Service Providers](./providers.md)
