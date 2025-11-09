# CurisJS Examples

Practical examples and tutorials for building applications with CurisJS.

## Table of Contents

- [Hello World](#hello-world)
- [REST API](#rest-api)
- [Authentication](#authentication)
- [File Upload](#file-upload)
- [Real-time with SSE](#real-time-with-sse)
- [Database CRUD](#database-crud)
- [Multi-Runtime Deployment](#multi-runtime-deployment)

## Hello World

### Basic Server

```typescript
import { createApp } from '@curisjs/core';

const app = createApp();

app.get('/', (ctx) => {
  return ctx.text('Hello, World!');
});

app.listen(3000);
```

### With Multiple Routes

```typescript
import { createApp } from '@curisjs/core';

const app = createApp();

// Text response
app.get('/', (ctx) => {
  return ctx.text('Hello, World!');
});

// JSON response
app.get('/json', (ctx) => {
  return ctx.json({ message: 'Hello from JSON!' });
});

// HTML response
app.get('/html', (ctx) => {
  return ctx.html('<h1>Hello, HTML!</h1>');
});

// Route with parameters
app.get('/hello/:name', (ctx) => {
  const name = ctx.params.name;
  return ctx.json({ greeting: `Hello, ${name}!` });
});

app.listen(3000);
```

## REST API

### Todo API

```typescript
import { createApp, z } from '@curisjs/core';
import { Model, createDatabase } from '@curisjs/db';

// Setup database
await createDatabase({
  default: {
    client: 'sqlite3',
    connection: { filename: './todos.db' },
    useNullAsDefault: true,
  },
});

// Todo model
class Todo extends Model {
  static tableName = 'todos';
}

// Validation schemas
const createTodoSchema = z.object({
  title: z.string().min(1).max(255),
  completed: z.boolean().default(false),
});

const updateTodoSchema = z.object({
  title: z.string().min(1).max(255).optional(),
  completed: z.boolean().optional(),
});

// Create app
const app = createApp();

// List all todos
app.get('/api/todos', async (ctx) => {
  const todos = await Todo.findMany();
  return ctx.json({ todos });
});

// Get single todo
app.get('/api/todos/:id', async (ctx) => {
  const todo = await Todo.find(ctx.params.id);
  
  if (!todo) {
    return ctx.json({ error: 'Todo not found' }, 404);
  }
  
  return ctx.json({ todo });
});

// Create todo
app.post('/api/todos', async (ctx) => {
  const data = await ctx.validate(createTodoSchema);
  const todo = await Todo.create(data);
  return ctx.json({ todo }, 201);
});

// Update todo
app.put('/api/todos/:id', async (ctx) => {
  const todo = await Todo.find(ctx.params.id);
  
  if (!todo) {
    return ctx.json({ error: 'Todo not found' }, 404);
  }
  
  const data = await ctx.validate(updateTodoSchema);
  await todo.update(data);
  
  return ctx.json({ todo });
});

// Delete todo
app.delete('/api/todos/:id', async (ctx) => {
  const todo = await Todo.find(ctx.params.id);
  
  if (!todo) {
    return ctx.json({ error: 'Todo not found' }, 404);
  }
  
  await todo.delete();
  
  return ctx.json({ message: 'Todo deleted' });
});

app.listen(3000);
```

## Authentication

### JWT Authentication

```typescript
import { createApp, z } from '@curisjs/core';
import { Model, createDatabase } from '@curisjs/db';
import * as jose from 'jose';
import * as bcrypt from 'bcrypt';

// User model
class User extends Model {
  static tableName = 'users';
  static timestamps = true;
}

// Schemas
const registerSchema = z.object({
  name: z.string().min(3),
  email: z.string().email(),
  password: z.string().min(8),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

// JWT secret
const secret = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-secret-key'
);

// Helper functions
async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

async function generateToken(userId: number): Promise<string> {
  return new jose.SignJWT({ userId })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('24h')
    .sign(secret);
}

async function verifyToken(token: string): Promise<{ userId: number } | null> {
  try {
    const { payload } = await jose.jwtVerify(token, secret);
    return payload as { userId: number };
  } catch {
    return null;
  }
}

// Auth middleware
async function auth(ctx: any, next: any) {
  const authHeader = ctx.header('authorization');
  
  if (!authHeader?.startsWith('Bearer ')) {
    return ctx.json({ error: 'Unauthorized' }, 401);
  }
  
  const token = authHeader.substring(7);
  const payload = await verifyToken(token);
  
  if (!payload) {
    return ctx.json({ error: 'Invalid token' }, 401);
  }
  
  const user = await User.find(payload.userId);
  
  if (!user) {
    return ctx.json({ error: 'User not found' }, 401);
  }
  
  ctx.state.user = user;
  await next();
}

// Create app
const app = createApp();

// Register
app.post('/api/auth/register', async (ctx) => {
  const data = await ctx.validate(registerSchema);
  
  // Check if user exists
  const existing = await User.query()
    .where('email', data.email)
    .first();
  
  if (existing) {
    return ctx.json({ error: 'Email already registered' }, 400);
  }
  
  // Create user
  const hashedPassword = await hashPassword(data.password);
  const user = await User.create({
    name: data.name,
    email: data.email,
    password: hashedPassword,
  });
  
  // Generate token
  const token = await generateToken(user.id);
  
  return ctx.json({
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
    },
    token,
  }, 201);
});

// Login
app.post('/api/auth/login', async (ctx) => {
  const data = await ctx.validate(loginSchema);
  
  // Find user
  const user = await User.query()
    .where('email', data.email)
    .first();
  
  if (!user) {
    return ctx.json({ error: 'Invalid credentials' }, 401);
  }
  
  // Verify password
  const valid = await verifyPassword(data.password, user.password);
  
  if (!valid) {
    return ctx.json({ error: 'Invalid credentials' }, 401);
  }
  
  // Generate token
  const token = await generateToken(user.id);
  
  return ctx.json({
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
    },
    token,
  });
});

// Protected route
app.get('/api/auth/me', auth, async (ctx) => {
  const user = ctx.state.user;
  
  return ctx.json({
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
    },
  });
});

app.listen(3000);
```

## File Upload

### Single File Upload

```typescript
import { createApp } from '@curisjs/core';
import { writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const app = createApp();

app.post('/api/upload', async (ctx) => {
  const formData = await ctx.formData();
  const file = formData.get('file') as File;
  
  if (!file) {
    return ctx.json({ error: 'No file provided' }, 400);
  }
  
  // Validate file type
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
  if (!allowedTypes.includes(file.type)) {
    return ctx.json({ error: 'Invalid file type' }, 400);
  }
  
  // Validate file size (5MB max)
  const maxSize = 5 * 1024 * 1024;
  if (file.size > maxSize) {
    return ctx.json({ error: 'File too large' }, 400);
  }
  
  // Save file
  const buffer = await file.arrayBuffer();
  const filename = `${Date.now()}-${file.name}`;
  const filepath = join(process.cwd(), 'uploads', filename);
  
  await writeFile(filepath, Buffer.from(buffer));
  
  return ctx.json({
    filename,
    size: file.size,
    type: file.type,
    url: `/uploads/${filename}`,
  });
});

app.listen(3000);
```

### Multiple Files Upload

```typescript
app.post('/api/upload/multiple', async (ctx) => {
  const formData = await ctx.formData();
  const files = formData.getAll('files') as File[];
  
  if (!files.length) {
    return ctx.json({ error: 'No files provided' }, 400);
  }
  
  const uploaded = [];
  
  for (const file of files) {
    const buffer = await file.arrayBuffer();
    const filename = `${Date.now()}-${file.name}`;
    const filepath = join(process.cwd(), 'uploads', filename);
    
    await writeFile(filepath, Buffer.from(buffer));
    
    uploaded.push({
      filename,
      size: file.size,
      type: file.type,
      url: `/uploads/${filename}`,
    });
  }
  
  return ctx.json({ files: uploaded });
});
```

## Real-time with SSE

### Server-Sent Events

```typescript
import { createApp } from '@curisjs/core';

const app = createApp();

// SSE endpoint
app.get('/api/events', (ctx) => {
  return ctx.sse((send) => {
    // Send initial message
    send({ data: { message: 'Connected!' } });
    
    // Send updates every second
    const interval = setInterval(() => {
      send({
        event: 'time',
        data: { time: new Date().toISOString() },
      });
    }, 1000);
    
    // Cleanup on disconnect
    ctx.request.signal.addEventListener('abort', () => {
      clearInterval(interval);
    });
  });
});

app.listen(3000);
```

### Client Usage

```html
<!DOCTYPE html>
<html>
<body>
  <div id="messages"></div>
  
  <script>
    const eventSource = new EventSource('/api/events');
    const messages = document.getElementById('messages');
    
    eventSource.addEventListener('time', (event) => {
      const data = JSON.parse(event.data);
      messages.innerHTML += `<p>${data.time}</p>`;
    });
    
    eventSource.onerror = () => {
      console.error('Connection lost');
    };
  </script>
</body>
</html>
```

## Database CRUD

### Blog with Relations

```typescript
import { createApp } from '@curisjs/core';
import { Model, hasMany, belongsTo, createDatabase } from '@curisjs/db';

// Setup database
await createDatabase({
  default: {
    client: 'pg',
    connection: process.env.DATABASE_URL,
  },
});

// Models
class User extends Model {
  static tableName = 'users';
  
  static relations = {
    posts: hasMany('Post', 'authorId'),
  };
}

class Post extends Model {
  static tableName = 'posts';
  
  static relations = {
    author: belongsTo('User', 'authorId'),
    comments: hasMany('Comment', 'postId'),
  };
}

class Comment extends Model {
  static tableName = 'comments';
  
  static relations = {
    post: belongsTo('Post', 'postId'),
    author: belongsTo('User', 'authorId'),
  };
}

const app = createApp();

// Get posts with author and comments
app.get('/api/posts', async (ctx) => {
  const posts = await Post.query()
    .with(['author', 'comments.author'])
    .orderBy('createdAt', 'desc')
    .get();
  
  return ctx.json({ posts });
});

// Get user with their posts
app.get('/api/users/:id', async (ctx) => {
  const user = await User.query()
    .with(['posts'])
    .where('id', ctx.params.id)
    .first();
  
  if (!user) {
    return ctx.json({ error: 'User not found' }, 404);
  }
  
  return ctx.json({ user });
});

// Create post with transaction
app.post('/api/posts', async (ctx) => {
  const { title, content, tags } = await ctx.json();
  
  await transaction(async (trx) => {
    // Create post
    const post = await Post.query(trx).create({
      title,
      content,
      authorId: ctx.state.user.id,
    });
    
    // Create tags
    for (const tagName of tags) {
      await Tag.query(trx).create({
        postId: post.id,
        name: tagName,
      });
    }
  });
  
  return ctx.json({ message: 'Post created' }, 201);
});

app.listen(3000);
```

## Multi-Runtime Deployment

### Node.js

```typescript
// src/index.ts
import { createApp } from '@curisjs/core';

const app = createApp();

app.get('/', (ctx) => ctx.text('Hello from Node!'));

// Auto-detects Node.js
app.listen(3000);
```

### Bun

```typescript
// src/index.ts
import { createApp } from '@curisjs/core';

const app = createApp();

app.get('/', (ctx) => ctx.text('Hello from Bun!'));

// Auto-detects Bun
app.listen(3000);
```

### Deno

```typescript
// src/index.ts
import { createApp } from '@curisjs/core';

const app = createApp();

app.get('/', (ctx) => ctx.text('Hello from Deno!'));

// Auto-detects Deno
app.listen(3000);
```

### Cloudflare Workers

```typescript
// src/index.ts
import { createApp, createHandler } from '@curisjs/core';

const app = createApp();

app.get('/', (ctx) => {
  // Access Cloudflare environment
  const apiKey = ctx.env.API_KEY;
  return ctx.text('Hello from Cloudflare!');
});

// Export for Workers
export default createHandler(app);
```

**wrangler.toml:**

```toml
name = "my-worker"
main = "src/index.ts"
compatibility_date = "2024-01-01"

[vars]
API_KEY = "your-key"
```

### Vercel Edge Functions

```typescript
// api/index.ts
import { createApp, createHandler } from '@curisjs/core';

const app = createApp();

app.get('/', (ctx) => ctx.text('Hello from Vercel Edge!'));

export default createHandler(app);
```

**vercel.json:**

```json
{
  "functions": {
    "api/index.ts": {
      "runtime": "edge"
    }
  }
}
```

## More Examples

### CORS Configuration

```typescript
import { createApp, cors } from '@curisjs/core';

const app = createApp();

app.use(cors({
  origin: ['https://example.com', 'https://app.example.com'],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true,
  maxAge: 86400,
}));

app.listen(3000);
```

### Rate Limiting

```typescript
const rateLimiter = new Map();

async function rateLimit(ctx: any, next: any) {
  const ip = ctx.request.headers.get('cf-connecting-ip') || 'unknown';
  const now = Date.now();
  const limit = 100; // requests
  const window = 60000; // 1 minute
  
  if (!rateLimiter.has(ip)) {
    rateLimiter.set(ip, { count: 0, resetAt: now + window });
  }
  
  const data = rateLimiter.get(ip);
  
  if (now > data.resetAt) {
    data.count = 0;
    data.resetAt = now + window;
  }
  
  data.count++;
  
  if (data.count > limit) {
    return ctx.json({ error: 'Rate limit exceeded' }, 429);
  }
  
  await next();
}

app.use(rateLimit);
```

### Request Logging

```typescript
import { logger } from '@curisjs/core';

app.use(logger());

// Or custom logger
app.use(async (ctx, next) => {
  const start = Date.now();
  await next();
  const duration = Date.now() - start;
  
  console.log({
    method: ctx.request.method,
    url: ctx.request.url,
    status: ctx.response?.status,
    duration: `${duration}ms`,
  });
});
```

## Next Steps

- Explore the [Core Documentation](../core/README.md)
- Learn about [Database Features](../db/README.md)
- Try the [CLI Tools](../cli/README.md)
