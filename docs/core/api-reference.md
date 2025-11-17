# Core API Reference

Complete API reference for `@curisjs/core` package.

::: tip Source Code
All source code is available on [GitHub](https://github.com/Ameriq8/curisjs/tree/develop/packages/core/src)
:::

## Application

### Class: `Application`

<Badge type="tip" text="Source" /> [View on GitHub](https://github.com/Ameriq8/curisjs/blob/develop/packages/core/src/foundation/Application.ts)

The main application class that handles routing and middleware.

#### Constructor

```typescript
new Application(options?: ApplicationOptions)
```

**Parameters:**
- `options` (optional): Application configuration options

**Example:**
```typescript
import { Application } from '@curisjs/core';

const app = new Application();
```

#### Methods

##### `get(path, ...handlers)`

Register a GET route.

**Signature:**
```typescript
get(path: string, ...handlers: Handler[]): Application
```

**Parameters:**
- `path`: Route path pattern
- `handlers`: One or more handler functions

**Returns:** Application instance for chaining

**Example:**
```typescript
app.get('/users', (ctx) => ctx.json({ users: [] }));
app.get('/users/:id', authMiddleware, (ctx) => {
  return ctx.json({ id: ctx.params.id });
});
```

##### `post(path, ...handlers)`

Register a POST route.

**Signature:**
```typescript
post(path: string, ...handlers: Handler[]): Application
```

**Parameters:**
- `path`: Route path pattern
- `handlers`: One or more handler functions

**Returns:** Application instance for chaining

**Example:**
```typescript
app.post('/users', async (ctx) => {
  const data = await ctx.request.json();
  return ctx.json({ user: data }, { status: 201 });
});
```

##### `put(path, ...handlers)`

Register a PUT route.

**Signature:**
```typescript
put(path: string, ...handlers: Handler[]): Application
```

##### `patch(path, ...handlers)`

Register a PATCH route.

**Signature:**
```typescript
patch(path: string, ...handlers: Handler[]): Application
```

##### `delete(path, ...handlers)`

Register a DELETE route.

**Signature:**
```typescript
delete(path: string, ...handlers: Handler[]): Application
```

##### `head(path, ...handlers)`

Register a HEAD route.

**Signature:**
```typescript
head(path: string, ...handlers: Handler[]): Application
```

##### `options(path, ...handlers)`

Register an OPTIONS route.

**Signature:**
```typescript
options(path: string, ...handlers: Handler[]): Application
```

##### `all(path, ...handlers)`

Register a route that matches all HTTP methods.

**Signature:**
```typescript
all(path: string, ...handlers: Handler[]): Application
```

##### `use(...handlers)`

Register global middleware.

**Signature:**
```typescript
use(...handlers: Handler[]): Application
```

**Parameters:**
- `handlers`: One or more middleware functions

**Returns:** Application instance for chaining

**Example:**
```typescript
import { logger, cors } from '@curisjs/core/middleware';

app.use(logger());
app.use(cors());
app.use(async (ctx, next) => {
  ctx.state.requestTime = Date.now();
  await next();
});
```

##### `listen(options)`

Start the HTTP server (Node.js only).

**Signature:**
```typescript
listen(options: ListenOptions): Server
```

**Parameters:**
- `options.port`: Port number (default: 3000)
- `options.host`: Host address (default: 'localhost')
- `options.callback`: Optional callback when server starts

**Returns:** Node.js HTTP Server instance

**Example:**
```typescript
app.listen({ 
  port: 3000,
  callback: () => console.log('Server running on port 3000')
});
```

##### `fetch(request, env?)`

Handle a Web Standard Request (for edge runtimes).

**Signature:**
```typescript
fetch(request: Request, env?: any): Promise<Response>
```

**Parameters:**
- `request`: Web Standard Request object
- `env`: Optional environment object (for Cloudflare Workers, etc.)

**Returns:** Promise resolving to Web Standard Response

**Example:**
```typescript
// Bun
Bun.serve({ port: 3000, fetch: app.fetch });

// Deno
Deno.serve({ port: 3000 }, app.fetch);

// Cloudflare Workers
export default { fetch: app.fetch };
```

---

## Context

### Interface: `Context`

<Badge type="tip" text="Source" /> [View on GitHub](https://github.com/Ameriq8/curisjs/blob/develop/packages/core/src/context.ts)

The context object passed to all handlers and middleware.

#### Properties

##### `request`

**Type:** `Request`

The Web Standard Request object.

**Example:**
```typescript
const method = ctx.request.method;
const headers = ctx.request.headers;
```

##### `params`

**Type:** `Record<string, string>`

Route parameters extracted from the URL path.

**Example:**
```typescript
// Route: /users/:id
app.get('/users/:id', (ctx) => {
  const userId = ctx.params.id;
});
```

##### `url`

**Type:** `URL`

Parsed URL object.

**Example:**
```typescript
const pathname = ctx.url.pathname;
const search = ctx.url.searchParams.get('q');
```

##### `state`

**Type:** `Record<string, any>`

State object for sharing data between middleware.

**Example:**
```typescript
app.use((ctx, next) => {
  ctx.state.user = { id: 1 };
  return next();
});
```

#### Methods

##### `json(data, options?)`

Return a JSON response.

**Signature:**
```typescript
json(data: any, options?: ResponseOptions): Response
```

**Parameters:**
- `data`: Data to serialize as JSON
- `options.status`: HTTP status code (default: 200)
- `options.headers`: Additional headers

**Returns:** Response object

**Example:**
```typescript
return ctx.json({ message: 'Success' });
return ctx.json({ error: 'Not found' }, { status: 404 });
```

##### `text(text, options?)`

Return a plain text response.

**Signature:**
```typescript
text(text: string, options?: ResponseOptions): Response
```

**Example:**
```typescript
return ctx.text('Hello World');
```

##### `html(html, options?)`

Return an HTML response.

**Signature:**
```typescript
html(html: string, options?: ResponseOptions): Response
```

**Example:**
```typescript
return ctx.html('<h1>Hello World</h1>');
```

##### `redirect(url, status?)`

Redirect to another URL.

**Signature:**
```typescript
redirect(url: string, status?: number): Response
```

**Parameters:**
- `url`: Target URL
- `status`: HTTP status code (default: 302)

**Example:**
```typescript
return ctx.redirect('/login');
return ctx.redirect('/home', 301); // Permanent redirect
```

##### `stream(stream, options?)`

Return a streaming response.

**Signature:**
```typescript
stream(stream: ReadableStream, options?: ResponseOptions): Response
```

##### `sse()`

Create a Server-Sent Events stream.

**Signature:**
```typescript
sse(): { stream: ReadableStream; send: (data: any) => void; close: () => void }
```

**Example:**
```typescript
app.get('/events', (ctx) => {
  const { stream, send, close } = ctx.sse();
  
  const interval = setInterval(() => {
    send({ time: Date.now() });
  }, 1000);
  
  setTimeout(() => {
    close();
    clearInterval(interval);
  }, 10000);
  
  return ctx.stream(stream);
});
```

##### `setHeader(name, value)`

Set a response header.

**Signature:**
```typescript
setHeader(name: string, value: string): void
```

##### `getHeader(name)`

Get a request header.

**Signature:**
```typescript
getHeader(name: string): string | null
```

##### `cookie(name, value, options?)`

Set a cookie.

**Signature:**
```typescript
cookie(name: string, value: string, options?: CookieOptions): void
```

**Options:**
- `maxAge`: Cookie lifetime in seconds
- `expires`: Expiration date
- `path`: Cookie path
- `domain`: Cookie domain
- `secure`: HTTPS only
- `httpOnly`: Not accessible via JavaScript
- `sameSite`: 'Strict' | 'Lax' | 'None'

**Example:**
```typescript
ctx.cookie('session', 'abc123', {
  httpOnly: true,
  secure: true,
  maxAge: 86400, // 1 day
  sameSite: 'Strict'
});
```

##### `getCookie(name)`

Get a cookie value.

**Signature:**
```typescript
getCookie(name: string): string | undefined
```

---

## Types

<Badge type="tip" text="Source" /> [View on GitHub](https://github.com/Ameriq8/curisjs/blob/develop/packages/core/src/types/index.ts)

### `Handler`

Request handler or middleware function.

```typescript
type Handler = (ctx: Context, next: Next) => Response | Promise<Response> | void | Promise<void>
```

### `Next`

Function to call the next middleware in the chain.

```typescript
type Next = () => Promise<void>
```

### `Middleware`

Alias for Handler type.

```typescript
type Middleware = Handler
```

### `RouteHandler`

Route-specific handler (no next function).

```typescript
type RouteHandler = (ctx: Context) => Response | Promise<Response>
```

### `ApplicationOptions`

Configuration options for Application.

```typescript
interface ApplicationOptions {
  // Future options
}
```

### `ListenOptions`

Options for starting the server.

```typescript
interface ListenOptions {
  port?: number;
  host?: string;
  callback?: () => void;
}
```

### `ResponseOptions`

Options for response helpers.

```typescript
interface ResponseOptions {
  status?: number;
  headers?: Record<string, string>;
}
```

### `CookieOptions`

Options for setting cookies.

```typescript
interface CookieOptions {
  maxAge?: number;
  expires?: Date;
  path?: string;
  domain?: string;
  secure?: boolean;
  httpOnly?: boolean;
  sameSite?: 'Strict' | 'Lax' | 'None';
}
```

---

## Middleware

<Badge type="tip" text="Source" /> [View on GitHub](https://github.com/Ameriq8/curisjs/blob/develop/packages/core/src/middleware)

### Built-in Middleware

#### `logger(options?)`

[Source](https://github.com/Ameriq8/curisjs/blob/develop/packages/core/src/middleware/logger.ts)

Request logging middleware.

**Signature:**
```typescript
logger(options?: LoggerOptions): Middleware
```

**Options:**
- `format`: Log format ('combined' | 'common' | 'short' | 'tiny')

**Example:**
```typescript
import { logger } from '@curisjs/core/middleware';

app.use(logger({ format: 'combined' }));
```

#### `cors(options?)`

[Source](https://github.com/Ameriq8/curisjs/blob/develop/packages/core/src/middleware/cors.ts)

CORS middleware.

**Signature:**
```typescript
cors(options?: CorsOptions): Middleware
```

**Options:**
- `origin`: Allowed origins
- `methods`: Allowed methods
- `allowedHeaders`: Allowed headers
- `exposedHeaders`: Exposed headers
- `credentials`: Allow credentials
- `maxAge`: Preflight cache duration

**Example:**
```typescript
import { cors } from '@curisjs/core/middleware';

app.use(cors({
  origin: 'https://example.com',
  methods: ['GET', 'POST'],
  credentials: true
}));
```

---

## Validation

<Badge type="tip" text="Source" /> [View on GitHub](https://github.com/Ameriq8/curisjs/blob/develop/packages/core/src/validation)

### `z` Object

Zod-like schema validation.

#### String Schema

```typescript
z.string(): StringSchema
```

**Methods:**
- `.min(n)`: Minimum length
- `.max(n)`: Maximum length
- `.email()`: Email validation
- `.url()`: URL validation
- `.uuid()`: UUID validation
- `.regex(pattern)`: Regex validation
- `.optional()`: Make optional
- `.nullable()`: Allow null

**Example:**
```typescript
import { z } from '@curisjs/core';

const schema = z.string().min(3).max(50).email();
```

#### Number Schema

```typescript
z.number(): NumberSchema
```

**Methods:**
- `.min(n)`: Minimum value
- `.max(n)`: Maximum value
- `.positive()`: Positive numbers only
- `.negative()`: Negative numbers only
- `.int()`: Integers only

#### Boolean Schema

```typescript
z.boolean(): BooleanSchema
```

#### Object Schema

```typescript
z.object(shape): ObjectSchema
```

**Example:**
```typescript
const userSchema = z.object({
  name: z.string(),
  email: z.string().email(),
  age: z.number().min(18)
});
```

#### Array Schema

```typescript
z.array(elementSchema): ArraySchema
```

**Example:**
```typescript
const tagsSchema = z.array(z.string());
```

#### Validation Methods

##### `parse(data)`

Parse and validate data, throw on error.

```typescript
const result = schema.parse(data);
```

##### `safeParse(data)`

Parse and validate data, return result object.

```typescript
const result = schema.safeParse(data);
if (result.success) {
  console.log(result.data);
} else {
  console.log(result.error);
}
```

---

## Utilities

<Badge type="tip" text="Source" /> [View on GitHub](https://github.com/Ameriq8/curisjs/blob/develop/packages/core/src/utils/response.ts)

### `json(data, options?)`

Create a JSON response.

```typescript
import { json } from '@curisjs/core';

return json({ message: 'Success' });
```

### `text(text, options?)`

Create a text response.

```typescript
import { text } from '@curisjs/core';

return text('Hello World');
```

### `html(html, options?)`

Create an HTML response.

```typescript
import { html } from '@curisjs/core';

return html('<h1>Hello</h1>');
```

### `redirect(url, status?)`

Create a redirect response.

```typescript
import { redirect } from '@curisjs/core';

return redirect('/login');
```

---

## Adapters

<Badge type="tip" text="Source" /> [View on GitHub](https://github.com/Ameriq8/curisjs/blob/develop/packages/core/src/adapters)

### Node.js Adapter

[Source](https://github.com/Ameriq8/curisjs/blob/develop/packages/core/src/adapters/node.ts)

```typescript
import { nodeAdapter } from '@curisjs/core/adapters';
import { createServer } from 'node:http';

const server = createServer(nodeAdapter(app));
server.listen(3000);
```

---

## Error Handling

### Custom Error Classes

```typescript
class HttpError extends Error {
  constructor(
    public status: number,
    message: string
  ) {
    super(message);
  }
}
```

**Usage:**
```typescript
app.get('/users/:id', (ctx) => {
  const user = findUser(ctx.params.id);
  if (!user) {
    throw new HttpError(404, 'User not found');
  }
  return ctx.json({ user });
});
```

---

## Type Inference

### Infer Types from Schemas

```typescript
const userSchema = z.object({
  name: z.string(),
  email: z.string().email()
});

type User = z.infer<typeof userSchema>;
// { name: string; email: string }
```

---

## Constants

### HTTP Status Codes

```typescript
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500,
} as const;
```

### HTTP Methods

```typescript
export const HTTP_METHODS = [
  'GET',
  'POST',
  'PUT',
  'PATCH',
  'DELETE',
  'HEAD',
  'OPTIONS'
] as const;
```

---

## See Also

- [Application Guide](/core/application)
- [Routing Guide](/core/routing)
- [Context Guide](/core/context)
- [Middleware Guide](/core/middleware)
- [Validation Guide](/core/validation)
