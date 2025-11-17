# Context API

The Context object is passed to every route handler and middleware, providing access to the request, response helpers, and shared state.

## Context Properties

### `ctx.request`

The standard Web API Request object:

```typescript
app.get('/example', (ctx) => {
  const method = ctx.request.method;        // HTTP method
  const url = ctx.request.url;              // Full URL
  const headers = ctx.request.headers;      // Headers object
  
  return json({ method, url });
});
```

### `ctx.params`

Route parameters extracted from the URL:

```typescript
app.get('/users/:id/posts/:postId', (ctx) => {
  const { id, postId } = ctx.params;
  return json({ userId: id, postId });
});
```

### `ctx.url`

Parsed URL object:

```typescript
app.get('/search', (ctx) => {
  const pathname = ctx.url.pathname;                    // /search
  const query = ctx.url.searchParams.get('q');          // Query param
  const host = ctx.url.host;                            // example.com
  const protocol = ctx.url.protocol;                    // https:
  
  return json({ pathname, query, host, protocol });
});
```

### `ctx.state`

Shared state object for passing data between middlewares:

```typescript
// Middleware sets state
app.use(async (ctx, next) => {
  ctx.state.user = await getCurrentUser(ctx);
  await next();
});

// Handler accesses state
app.get('/profile', (ctx) => {
  const user = ctx.state.user;
  return json({ user });
});
```

## Request Methods

### Reading JSON

```typescript
app.post('/api/data', async (ctx) => {
  const body = await ctx.request.json();
  return json({ received: body });
});
```

### Reading Text

```typescript
app.post('/webhook', async (ctx) => {
  const text = await ctx.request.text();
  return json({ received: text });
});
```

### Reading Form Data

```typescript
app.post('/upload', async (ctx) => {
  const formData = await ctx.request.formData();
  const file = formData.get('file');
  const name = formData.get('name');
  
  return json({ filename: file?.name, name });
});
```

### Reading Blob

```typescript
app.post('/binary', async (ctx) => {
  const blob = await ctx.request.blob();
  return json({ size: blob.size, type: blob.type });
});
```

### Reading ArrayBuffer

```typescript
app.post('/raw', async (ctx) => {
  const buffer = await ctx.request.arrayBuffer();
  return json({ byteLength: buffer.byteLength });
});
```

## Headers

### Reading Headers

```typescript
app.get('/info', (ctx) => {
  const userAgent = ctx.request.headers.get('User-Agent');
  const auth = ctx.request.headers.get('Authorization');
  const contentType = ctx.request.headers.get('Content-Type');
  
  return json({ userAgent, auth, contentType });
});
```

### Checking Headers

```typescript
app.post('/api/data', async (ctx) => {
  const contentType = ctx.request.headers.get('Content-Type');
  
  if (!contentType?.includes('application/json')) {
    return json({
      error: 'Content-Type must be application/json'
    }, { status: 415 });
  }
  
  const data = await ctx.request.json();
  return json({ data });
});
```

## Response Helpers

### JSON Response

```typescript
import { json } from '@curisjs/core';

app.get('/api/users', (ctx) => {
  return json({ users: [] });
});

// With status code
app.post('/api/users', (ctx) => {
  return json({ created: true }, { status: 201 });
});

// With custom headers
app.get('/api/data', (ctx) => {
  return json({ data: 'value' }, {
    headers: {
      'X-Custom-Header': 'value',
      'Cache-Control': 'no-cache'
    }
  });
});
```

### Text Response

```typescript
import { text } from '@curisjs/core';

app.get('/robots.txt', (ctx) => {
  return text('User-agent: *\nDisallow: /admin');
});
```

### HTML Response

```typescript
import { html } from '@curisjs/core';

app.get('/', (ctx) => {
  return html('<h1>Welcome</h1>');
});

app.get('/page', (ctx) => {
  return html(`
    <!DOCTYPE html>
    <html>
      <head><title>Page</title></head>
      <body><h1>Hello</h1></body>
    </html>
  `);
});
```

### Redirect

```typescript
import { redirect } from '@curisjs/core';

app.get('/old-url', (ctx) => {
  return redirect('/new-url', 301); // Permanent redirect
});

app.get('/temp', (ctx) => {
  return redirect('/new', 302); // Temporary redirect (default)
});

// Other redirect codes: 303, 307, 308
```

### Custom Response

```typescript
app.get('/custom', (ctx) => {
  return new Response('Custom response', {
    status: 200,
    statusText: 'OK',
    headers: {
      'Content-Type': 'text/plain',
      'X-Custom': 'value'
    }
  });
});
```

### Stream Response

```typescript
import { stream } from '@curisjs/core';

app.get('/stream', (ctx) => {
  const readable = new ReadableStream({
    start(controller) {
      controller.enqueue(new TextEncoder().encode('chunk 1\n'));
      controller.enqueue(new TextEncoder().encode('chunk 2\n'));
      controller.close();
    }
  });
  
  return stream(() => readable);
});
```

### Server-Sent Events

```typescript
import { sse } from '@curisjs/core';

app.get('/events', (ctx) => {
  const stream = new ReadableStream({
    start(controller) {
      const encoder = new TextEncoder();
      
      setInterval(() => {
        const data = `data: ${JSON.stringify({ time: Date.now() })}\n\n`;
        controller.enqueue(encoder.encode(data));
      }, 1000);
    }
  });
  
  return sse(() => stream);
});
```

## Query Parameters

### Single Value

```typescript
app.get('/search', (ctx) => {
  const query = ctx.url.searchParams.get('q');
  
  if (!query) {
    return json({ error: 'Query parameter required' }, { status: 400 });
  }
  
  return json({ query });
});

// GET /search?q=test -> { query: "test" }
```

### Multiple Values

```typescript
app.get('/filter', (ctx) => {
  const tags = ctx.url.searchParams.getAll('tag');
  return json({ tags });
});

// GET /filter?tag=js&tag=ts -> { tags: ["js", "ts"] }
```

### With Defaults

```typescript
app.get('/list', (ctx) => {
  const page = parseInt(ctx.url.searchParams.get('page') || '1');
  const limit = parseInt(ctx.url.searchParams.get('limit') || '10');
  
  return json({ page, limit });
});

// GET /list -> { page: 1, limit: 10 }
// GET /list?page=2&limit=20 -> { page: 2, limit: 20 }
```

### All Parameters

```typescript
app.get('/debug', (ctx) => {
  const params = Object.fromEntries(ctx.url.searchParams);
  return json({ params });
});

// GET /debug?a=1&b=2&c=3 -> { params: { a: "1", b: "2", c: "3" } }
```

## Cookies

### Reading Cookies

```typescript
app.get('/profile', (ctx) => {
  const cookieHeader = ctx.request.headers.get('Cookie');
  
  // Parse cookies manually
  const cookies = Object.fromEntries(
    cookieHeader?.split(';').map(c => {
      const [key, ...values] = c.trim().split('=');
      return [key, values.join('=')];
    }) || []
  );
  
  const sessionId = cookies.session;
  return json({ sessionId });
});
```

### Setting Cookies

```typescript
app.get('/login', (ctx) => {
  return json({ success: true }, {
    headers: {
      'Set-Cookie': 'session=abc123; HttpOnly; Secure; SameSite=Strict'
    }
  });
});

// Multiple cookies
app.get('/auth', (ctx) => {
  return json({ success: true }, {
    headers: {
      'Set-Cookie': [
        'session=abc123; HttpOnly; Secure',
        'user=john; Max-Age=3600'
      ]
    }
  });
});
```

## State Management

Share data between middlewares and route handlers:

```typescript
// Authentication middleware
app.use(async (ctx, next) => {
  const token = ctx.request.headers.get('Authorization');
  
  if (token) {
    const user = await verifyToken(token);
    ctx.state.user = user;
    ctx.state.authenticated = true;
  } else {
    ctx.state.authenticated = false;
  }
  
  await next();
});

// Protected route
app.get('/api/profile', (ctx) => {
  if (!ctx.state.authenticated) {
    return json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  return json({ user: ctx.state.user });
});
```

### Typed State

```typescript
interface AppState {
  user?: User;
  authenticated: boolean;
  requestId: string;
}

// In middleware
app.use(async (ctx, next) => {
  const state = ctx.state as AppState;
  state.requestId = crypto.randomUUID();
  await next();
});

// In handler
app.get('/example', (ctx) => {
  const state = ctx.state as AppState;
  return json({ requestId: state.requestId });
});
```

## Request Information

### Method

```typescript
app.all('/resource', (ctx) => {
  const method = ctx.request.method; // GET, POST, PUT, DELETE, etc.
  return json({ method });
});
```

### URL Information

```typescript
app.get('/info', (ctx) => {
  return json({
    href: ctx.url.href,           // Full URL
    origin: ctx.url.origin,       // https://example.com
    protocol: ctx.url.protocol,   // https:
    host: ctx.url.host,           // example.com:3000
    hostname: ctx.url.hostname,   // example.com
    port: ctx.url.port,           // 3000
    pathname: ctx.url.pathname,   // /info
    search: ctx.url.search,       // ?key=value
    hash: ctx.url.hash            // #section
  });
});
```

### Client IP

```typescript
app.get('/ip', (ctx) => {
  // Check for proxy headers first
  const ip = 
    ctx.request.headers.get('X-Forwarded-For')?.split(',')[0] ||
    ctx.request.headers.get('X-Real-IP') ||
    'unknown';
  
  return json({ ip });
});
```

## Complete Example

```typescript
import { createApp, json, text, redirect } from '@curisjs/core';

const app = createApp();

// Middleware - add request ID
app.use(async (ctx, next) => {
  ctx.state.requestId = crypto.randomUUID();
  await next();
});

// Middleware - authentication
app.use(async (ctx, next) => {
  const token = ctx.request.headers.get('Authorization');
  ctx.state.user = token ? await verifyToken(token) : null;
  await next();
});

// Home
app.get('/', (ctx) => {
  return json({
    message: 'Welcome',
    requestId: ctx.state.requestId
  });
});

// Get user profile
app.get('/api/profile', (ctx) => {
  if (!ctx.state.user) {
    return json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  return json({ user: ctx.state.user });
});

// Create resource
app.post('/api/posts', async (ctx) => {
  if (!ctx.state.user) {
    return json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  const body = await ctx.request.json();
  const post = await database.create({
    ...body,
    authorId: ctx.state.user.id
  });
  
  return json({ post }, { status: 201 });
});

// Search with query params
app.get('/api/search', (ctx) => {
  const query = ctx.url.searchParams.get('q') || '';
  const page = parseInt(ctx.url.searchParams.get('page') || '1');
  const limit = parseInt(ctx.url.searchParams.get('limit') || '10');
  
  return json({ query, page, limit, results: [] });
});

app.listen(3000);
```
