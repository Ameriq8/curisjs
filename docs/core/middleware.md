# CurisJS Built-in Middlewares

Comprehensive guide to all built-in middlewares in CurisJS.

## Table of Contents

- [Installation](#installation)
- [Security Middlewares](#security-middlewares)
  - [Helmet](#helmet)
  - [CSRF Protection](#csrf-protection)
  - [Sanitizer](#sanitizer)
- [Request Processing](#request-processing)
  - [Body Parser](#body-parser)
  - [Validator](#validator)
- [Performance](#performance)
  - [Compression](#compression)
  - [Rate Limiter](#rate-limiter)
- [Session Management](#session-management)
- [API Versioning](#api-versioning)
- [Logging & CORS](#logging--cors)

## Installation

All middlewares are included in `@curisjs/core`:

```typescript
import { 
  helmet, 
  csrf, 
  sanitizer, 
  bodyParser,
  validator,
  compression,
  rateLimiter,
  session,
  apiVersion,
  logger,
  cors,
} from '@curisjs/core';
```

## Security Middlewares

### Helmet

Sets secure HTTP headers to protect against common web vulnerabilities.

**Usage:**

```typescript
import { createApp, helmet } from '@curisjs/core';

const app = createApp();

app.use(helmet());
```

**Options:**

```typescript
app.use(helmet({
  // Content Security Policy
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    }
  },
  
  // HTTP Strict Transport Security
  hsts: {
    maxAge: 31536000, // 1 year in seconds
    includeSubDomains: true,
    preload: true,
  },
  
  // X-Frame-Options
  frameguard: {
    action: 'deny', // or 'sameorigin'
  },
  
  // Other headers
  noSniff: true, // X-Content-Type-Options: nosniff
  xssFilter: true, // X-XSS-Protection: 1; mode=block
  referrerPolicy: 'strict-origin-when-cross-origin',
}));
```

**Headers Set:**

- `Content-Security-Policy` - Prevents XSS attacks
- `Strict-Transport-Security` - Forces HTTPS
- `X-Frame-Options` - Prevents clickjacking
- `X-Content-Type-Options` - Prevents MIME sniffing
- `X-XSS-Protection` - XSS filter
- `Referrer-Policy` - Controls referrer information

### CSRF Protection

Prevents Cross-Site Request Forgery attacks using double-submit cookie pattern.

**Usage:**

```typescript
import { createApp, csrf, json } from '@curisjs/core';

const app = createApp();

// Apply CSRF protection
app.use(csrf({
  secret: 'your-secret-key',
  cookieName: '_csrf',
  headerName: 'x-csrf-token',
}));

// Get CSRF token endpoint
app.get('/api/csrf-token', (ctx) => {
  return json({ csrfToken: ctx.state.csrfToken });
});

// Protected POST request
app.post('/api/data', async (ctx) => {
  // CSRF middleware has validated the token
  const data = await ctx.json();
  return json({ success: true, data });
});
```

**Options:**

```typescript
interface CSRFOptions {
  secret: string;              // Secret for token generation
  cookieName?: string;         // Cookie name (default: '_csrf')
  headerName?: string;         // Header name (default: 'x-csrf-token')
  safeMethods?: string[];      // Safe methods (default: ['GET', 'HEAD', 'OPTIONS'])
  tokenLength?: number;        // Token length (default: 32)
  expirationTime?: number;     // Token expiration in ms (default: 1 hour)
}
```

**Client-Side Usage:**

```javascript
// Get CSRF token
const { csrfToken } = await fetch('/api/csrf-token').then(r => r.json());

// Include in subsequent requests
await fetch('/api/data', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-csrf-token': csrfToken,
  },
  body: JSON.stringify({ data: 'example' }),
});
```

### Sanitizer

Sanitizes user input to prevent XSS and injection attacks.

**Usage:**

```typescript
import { createApp, sanitizer, bodyParser, json } from '@curisjs/core';

const app = createApp();

app.use(bodyParser());
app.use(sanitizer({
  body: true,
  query: true,
  params: true,
  stripTags: true,
  escapeHtml: true,
  allowedTags: ['b', 'i', 'em', 'strong'],
}));

app.post('/api/comment', async (ctx) => {
  // ctx.state.body is now sanitized
  const comment = ctx.state.body;
  return json({ comment });
});
```

**Options:**

```typescript
interface SanitizerOptions {
  body?: boolean;              // Sanitize request body (default: true)
  query?: boolean;             // Sanitize query params (default: true)
  params?: boolean;            // Sanitize URL params (default: true)
  stripTags?: boolean;         // Remove HTML tags (default: true)
  escapeHtml?: boolean;        // Escape HTML entities (default: true)
  allowedTags?: string[];      // Tags to keep (default: [])
}
```

## Request Processing

### Body Parser

Parses incoming request bodies in various formats.

**Usage:**

```typescript
import { createApp, bodyParser, json } from '@curisjs/core';

const app = createApp();

app.use(bodyParser({
  json: { limit: 2 * 1024 * 1024 }, // 2MB
  form: true,
  text: true,
  raw: false,
}));

app.post('/api/data', async (ctx) => {
  // Parsed body available in ctx.state.body
  const data = ctx.state.body;
  return json({ received: data });
});
```

**Supported Formats:**

- `application/json` - JSON data
- `application/x-www-form-urlencoded` - Form data
- `multipart/form-data` - File uploads
- `text/*` - Plain text
- Raw binary data

**Options:**

```typescript
interface BodyParserOptions {
  json?: {
    limit?: number;            // Size limit in bytes (default: 1MB)
  };
  form?: boolean;              // Parse form data (default: true)
  text?: boolean;              // Parse text (default: false)
  raw?: boolean;               // Parse as raw buffer (default: false)
}
```

### Validator

Schema-based validation using Zod with detailed error handling.

**Usage:**

```typescript
import { createApp, validator, validateBody, json, z } from '@curisjs/core';

const app = createApp();

// Define schema
const userSchema = z.object({
  name: z.string().min(2).max(50),
  email: z.string().email(),
  age: z.number().min(18).max(120).optional(),
});

// Manual validation in handler
app.post('/api/users', async (ctx) => {
  const body = await ctx.json();
  const result = userSchema.safeParse(body);
  
  if (!result.success) {
    return json({
      error: 'Validation failed',
      issues: result.error.issues,
    }, { status: 422 });
  }
  
  return json({ user: result.data });
});

// Or use validator middleware
app.use(validator({
  schema: userSchema,
  source: 'body',
}));

app.post('/api/users-2', async (ctx) => {
  // Validated data available in ctx.state.validated
  const user = ctx.state.validated;
  return json({ user });
});
```

**Helper Functions:**

```typescript
// Validate body
app.use(validateBody(userSchema));

// Validate query parameters
app.use(validateQuery(searchSchema));

// Validate URL parameters
app.use(validateParams(paramsSchema));

// Validate headers
app.use(validateHeaders(headersSchema));
```

**Error Response (422):**

```json
{
  "error": "Validation failed",
  "issues": [
    {
      "path": ["email"],
      "message": "Invalid email address"
    },
    {
      "path": ["age"],
      "message": "Age must be at least 18"
    }
  ]
}
```

## Performance

### Compression

Compresses response bodies using gzip or brotli.

**Usage:**

```typescript
import { createApp, compression, json } from '@curisjs/core';

const app = createApp();

app.use(compression({
  threshold: 1024,              // Only compress if > 1KB
  preferredEncoding: 'gzip',    // 'gzip' or 'brotli'
  compressibleTypes: [
    'text/html',
    'text/css',
    'application/javascript',
    'application/json',
  ],
}));

app.get('/api/large-data', (ctx) => {
  return json({ /* large data */ });
});
```

**Options:**

```typescript
interface CompressionOptions {
  threshold?: number;          // Minimum size to compress (default: 1024)
  preferredEncoding?: 'gzip' | 'brotli'; // Preferred encoding
  compressibleTypes?: string[]; // MIME types to compress
}
```

### Rate Limiter

Prevents abuse by limiting the number of requests from a client.

**Usage:**

```typescript
import { createApp, rateLimiter, json } from '@curisjs/core';

const app = createApp();

// Global rate limit
app.use(rateLimiter({
  max: 100,                     // 100 requests
  windowMs: 15 * 60 * 1000,     // per 15 minutes
  message: 'Too many requests',
  keyGenerator: (ctx) => {
    // Default: uses IP address
    return ctx.request.headers.get('x-forwarded-for') || 'unknown';
  },
}));

// Stricter limit for specific routes
app.post('/api/login', async (ctx) => {
  // Custom rate limit logic
  return json({ success: true });
});
```

**Options:**

```typescript
interface RateLimiterOptions {
  max: number;                 // Max requests per window
  windowMs: number;            // Time window in milliseconds
  message?: string;            // Error message
  keyGenerator?: (ctx) => string; // Custom key generator
  standardHeaders?: boolean;   // Send standard headers (default: true)
  legacyHeaders?: boolean;     // Send legacy headers (default: false)
  store?: RateLimitStore;      // Custom store (Redis, etc.)
}
```

**Response Headers:**

```
RateLimit-Limit: 100
RateLimit-Remaining: 95
RateLimit-Reset: 1640000000
```

**Custom Store (Redis):**

```typescript
class RedisStore implements RateLimitStore {
  async increment(key: string, windowMs: number): Promise<{ count: number; resetTime: number }> {
    // Redis implementation
  }
  async resetKey(key: string): Promise<void> {
    // Redis implementation
  }
}

app.use(rateLimiter({
  max: 100,
  windowMs: 60000,
  store: new RedisStore(),
}));
```

## Session Management

Cookie-based session management with customizable storage.

**Usage:**

```typescript
import { createApp, session, json } from '@curisjs/core';

const app = createApp();

app.use(session({
  secret: 'your-secret-key',
  cookie: {
    httpOnly: true,
    secure: true,
    sameSite: 'strict',
    maxAge: 86400, // 24 hours in seconds
  },
}));

app.get('/api/login', async (ctx) => {
  const session = ctx.state.session as any;
  session.userId = '12345';
  session.username = 'john_doe';
  
  return json({ message: 'Logged in' });
});

app.get('/api/profile', (ctx) => {
  const session = ctx.state.session as any;
  
  if (!session?.userId) {
    return json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  return json({ userId: session.userId });
});
```

**Options:**

```typescript
interface SessionOptions {
  secret: string;              // Secret for HMAC (future use)
  cookie?: {
    name?: string;             // Cookie name (default: 'session')
    httpOnly?: boolean;        // HttpOnly flag (default: true)
    secure?: boolean;          // Secure flag (default: false)
    sameSite?: 'strict' | 'lax' | 'none'; // SameSite
    maxAge?: number;           // Max age in seconds
    path?: string;             // Cookie path (default: '/')
    domain?: string;           // Cookie domain
  };
  store?: SessionStore;        // Custom store (Redis, etc.)
}
```

**Custom Store:**

```typescript
class RedisSessionStore implements SessionStore {
  async get(id: string): Promise<SessionData | undefined> {
    // Redis implementation
  }
  async set(id: string, data: SessionData): Promise<void> {
    // Redis implementation
  }
  async destroy(id: string): Promise<void> {
    // Redis implementation
  }
}
```

## API Versioning

Support multiple API versions with different strategies.

**Usage:**

```typescript
import { createApp, apiVersion, json } from '@curisjs/core';

const app = createApp();

// Header-based versioning
app.use(apiVersion({
  strategy: 'header',
  header: 'api-version',
  versions: ['1', '2'],
  default: '1',
}));

app.get('/api/users', (ctx) => {
  const version = ctx.state.apiVersion;
  
  if (version === '2') {
    // V2 format
    return json({
      data: { /* ... */ },
      meta: { version: '2.0' }
    });
  }
  
  // V1 format
  return json({ /* ... */ });
});
```

**Strategies:**

```typescript
// 1. Header-based (recommended)
app.use(apiVersion({
  strategy: 'header',
  header: 'api-version', // Custom header
  versions: ['1', '2'],
}));
// Client: fetch('/api/users', { headers: { 'api-version': '2' } })

// 2. Path-based
app.use(apiVersion({
  strategy: 'path',
  versions: ['1', '2'],
}));
// Client: fetch('/v2/api/users')

// 3. Query parameter
app.use(apiVersion({
  strategy: 'query',
  queryParam: 'version',
  versions: ['1', '2'],
}));
// Client: fetch('/api/users?version=2')

// 4. Accept header
app.use(apiVersion({
  strategy: 'accept',
  versions: ['1', '2'],
}));
// Client: fetch('/api/users', { headers: { 'Accept': 'application/vnd.api+json;version=2' } })
```

## Logging & CORS

### Logger

Logs HTTP requests with timing information.

```typescript
import { createApp, logger } from '@curisjs/core';

const app = createApp();

app.use(logger());
```

**Output:**

```
GET /api/users 200 45ms
POST /api/data 201 123ms
```

### CORS

Enables Cross-Origin Resource Sharing.

```typescript
import { createApp, cors } from '@curisjs/core';

const app = createApp();

app.use(cors({
  origin: '*', // or ['https://example.com']
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: ['X-Total-Count'],
  credentials: true,
  maxAge: 86400, // 24 hours
}));
```

## Complete Example

See [`examples/middleware-demo.ts`](./examples/middleware-demo.ts) for a comprehensive example using all middlewares together.

```typescript
import { createApp, helmet, rateLimiter, bodyParser, json } from '@curisjs/core';

const app = createApp();

// Security first
app.use(helmet());

// Rate limiting
app.use(rateLimiter({ max: 100, windowMs: 60000 }));

// Request processing
app.use(bodyParser());

// Your routes
app.get('/api/health', () => json({ status: 'ok' }));

export default app;
```

## Best Practices

1. **Order Matters**: Apply middlewares in this order:
   - Security headers (helmet)
   - CORS
   - Compression
   - Body parser
   - Sanitizer
   - Session
   - CSRF
   - Rate limiting
   - API versioning
   - Logger
   - Your routes

2. **Production Settings**:
   ```typescript
   app.use(helmet({ /* strict settings */ }));
   app.use(rateLimiter({ max: 100 }));
   app.use(csrf({ secret: process.env.CSRF_SECRET }));
   app.use(session({ 
     secret: process.env.SESSION_SECRET,
     cookie: { secure: true }
   }));
   ```

3. **Development vs Production**:
   ```typescript
   const isDev = process.env.NODE_ENV === 'development';
   
   app.use(session({
     cookie: {
       secure: !isDev, // Only HTTPS in production
       sameSite: isDev ? 'lax' : 'strict',
     }
   }));
   ```

4. **Custom Stores**: Use Redis or similar for:
   - Rate limiting in distributed systems
   - Sessions in multi-server deployments

5. **Error Handling**: Always add error handler as last middleware:
   ```typescript
   app.use(async (ctx, next) => {
     try {
       await next();
     } catch (error) {
       return json({ error: 'Server error' }, { status: 500 });
     }
   });
   ```
