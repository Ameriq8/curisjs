# Application API

The Application class is the main entry point for creating CurisJS applications.

## Creating an Application

```typescript
import { createApp } from '@curisjs/core';

const app = createApp();
```

### With Options

```typescript
const app = createApp({
  // Add custom configuration here
});
```

## Routing Methods

### HTTP Methods

Define routes for different HTTP methods:

```typescript
// GET request
app.get('/users', (ctx) => {
  return json({ users: [] });
});

// POST request
app.post('/users', async (ctx) => {
  const data = await ctx.json();
  return json({ user: data }, { status: 201 });
});

// PUT request
app.put('/users/:id', async (ctx) => {
  const id = ctx.params.id;
  const data = await ctx.json();
  return json({ id, ...data });
});

// PATCH request
app.patch('/users/:id', async (ctx) => {
  const id = ctx.params.id;
  const data = await ctx.json();
  return json({ id, updated: data });
});

// DELETE request
app.delete('/users/:id', (ctx) => {
  const id = ctx.params.id;
  return json({ deleted: id });
});

// HEAD request
app.head('/users', (ctx) => {
  return new Response(null, {
    headers: { 'X-Total-Count': '100' }
  });
});

// OPTIONS request
app.options('/users', (ctx) => {
  return new Response(null, {
    headers: { 
      'Allow': 'GET, POST, PUT, DELETE',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE'
    }
  });
});
```

### All Methods

Match any HTTP method:

```typescript
app.all('/health', (ctx) => {
  return json({ status: 'ok' });
});
```

## Middleware

### Global Middleware

Apply middleware to all routes:

```typescript
import { logger, cors, helmet } from '@curisjs/core';

// Single middleware
app.use(logger());

// Multiple middlewares
app.use(cors());
app.use(helmet());

// Custom middleware
app.use(async (ctx, next) => {
  console.log(`${ctx.request.method} ${ctx.url.pathname}`);
  await next();
});
```

### Error Handling Middleware

```typescript
app.use(async (ctx, next) => {
  try {
    await next();
  } catch (error) {
    console.error('Error:', error);
    return json({
      error: 'Internal Server Error',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
});
```

## Starting the Server

### listen()

Start the server on a specific port:

```typescript
// Basic usage
app.listen(3000);

// With callback
app.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});

// With hostname
app.listen({ port: 3000, hostname: '0.0.0.0' });
```

### fetch()

Use the app as a fetch handler (for edge runtimes):

```typescript
// Cloudflare Workers
export default {
  fetch: app.fetch.bind(app)
};

// Or simply
export default app;
```

## Request Handler

Every route handler receives a Context object:

```typescript
app.get('/example', (ctx) => {
  // ctx.request - Web API Request object
  // ctx.params - Route parameters
  // ctx.url - URL object
  // ctx.state - Shared state object
  
  return json({ message: 'Example' });
});
```

## Response Helpers

CurisJS provides helper functions for common response types:

```typescript
import { json, text, html, redirect } from '@curisjs/core';

// JSON response
app.get('/api/data', (ctx) => {
  return json({ data: 'value' });
});

// Text response
app.get('/text', (ctx) => {
  return text('Plain text response');
});

// HTML response
app.get('/page', (ctx) => {
  return html('<h1>Hello World</h1>');
});

// Redirect
app.get('/old', (ctx) => {
  return redirect('/new', 301);
});
```

### Custom Responses

Use the standard Response API:

```typescript
app.get('/custom', (ctx) => {
  return new Response('Custom response', {
    status: 200,
    headers: {
      'Content-Type': 'text/plain',
      'X-Custom-Header': 'value'
    }
  });
});
```

## Async Handlers

All handlers can be async:

```typescript
app.get('/users/:id', async (ctx) => {
  const user = await database.findUser(ctx.params.id);
  return json({ user });
});

app.post('/upload', async (ctx) => {
  const formData = await ctx.request.formData();
  const file = formData.get('file');
  
  // Process file...
  
  return json({ uploaded: true });
});
```

## Error Handling

### Try-Catch in Handlers

```typescript
app.get('/users/:id', async (ctx) => {
  try {
    const user = await database.findUser(ctx.params.id);
    return json({ user });
  } catch (error) {
    return json({ error: 'User not found' }, { status: 404 });
  }
});
```

### Global Error Handler

```typescript
app.use(async (ctx, next) => {
  try {
    await next();
  } catch (error) {
    if (error instanceof ValidationError) {
      return json({
        error: 'Validation failed',
        details: error.issues
      }, { status: 422 });
    }
    
    return json({
      error: 'Internal Server Error'
    }, { status: 500 });
  }
});
```

## Complete Example

```typescript
import { createApp, json, logger, cors, helmet } from '@curisjs/core';

const app = createApp();

// Global middleware
app.use(logger());
app.use(cors());
app.use(helmet());

// Error handler
app.use(async (ctx, next) => {
  try {
    await next();
  } catch (error) {
    console.error('Error:', error);
    return json({ error: 'Server error' }, { status: 500 });
  }
});

// Routes
app.get('/', (ctx) => {
  return json({ message: 'Welcome to CurisJS' });
});

app.get('/api/users', async (ctx) => {
  const users = await database.getUsers();
  return json({ users });
});

app.post('/api/users', async (ctx) => {
  const data = await ctx.json();
  const user = await database.createUser(data);
  return json({ user }, { status: 201 });
});

app.get('/api/users/:id', async (ctx) => {
  const user = await database.findUser(ctx.params.id);
  if (!user) {
    return json({ error: 'User not found' }, { status: 404 });
  }
  return json({ user });
});

// Start server
app.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});
```

## API Reference

### `createApp(options?)`

Creates a new application instance.

**Returns:** `Application`

### `app.get(path, handler)`

Register a GET route.

**Parameters:**
- `path: string` - Route path with optional parameters
- `handler: Handler` - Route handler function

**Returns:** `Application` (chainable)

### `app.post(path, handler)`

Register a POST route.

### `app.put(path, handler)`

Register a PUT route.

### `app.patch(path, handler)`

Register a PATCH route.

### `app.delete(path, handler)`

Register a DELETE route.

### `app.head(path, handler)`

Register a HEAD route.

### `app.options(path, handler)`

Register an OPTIONS route.

### `app.all(path, handler)`

Register a route for all HTTP methods.

### `app.use(middleware)`

Register global middleware.

**Parameters:**
- `middleware: Middleware` - Middleware function

**Returns:** `Application` (chainable)

### `app.listen(port, callback?)`

Start the server.

**Parameters:**
- `port: number` - Port to listen on
- `callback?: () => void` - Optional callback

**Returns:** `void`

### `app.fetch(request)`

Handle a request (for edge runtimes).

**Parameters:**
- `request: Request` - Web API Request object

**Returns:** `Promise<Response>`
