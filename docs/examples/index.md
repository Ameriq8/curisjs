# Examples

Learn by example with practical CurisJS applications.

## Overview

This section contains complete, working examples of CurisJS applications. Each example demonstrates specific features and best practices.

## Quick Examples

### Hello World

The simplest CurisJS application:

```typescript
import { Application } from '@curisjs/core';

const app = new Application();

app.get('/', (ctx) => {
  return ctx.json({ message: 'Hello World' });
});

app.listen({ port: 3000 });
```

### JSON API

A basic JSON API with multiple routes:

```typescript
import { Application } from '@curisjs/core';

const app = new Application();

// List items
app.get('/api/items', async (ctx) => {
  const items = await db.items.findMany();
  return ctx.json({ items });
});

// Get single item
app.get('/api/items/:id', async (ctx) => {
  const item = await db.items.findById(ctx.params.id);
  
  if (!item) {
    return ctx.json({ error: 'Not found' }, { status: 404 });
  }
  
  return ctx.json({ item });
});

// Create item
app.post('/api/items', async (ctx) => {
  const data = await ctx.request.json();
  const item = await db.items.create(data);
  return ctx.json({ item }, { status: 201 });
});

app.listen({ port: 3000 });
```

### With Middleware

Using middleware for logging and error handling:

```typescript
import { Application, logger, cors } from '@curisjs/core';

const app = new Application();

// Global middleware
app.use(logger());
app.use(cors());

// Error handling
app.use(async (ctx, next) => {
  try {
    await next();
  } catch (error) {
    console.error(error);
    return ctx.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
});

// Routes
app.get('/api/users', async (ctx) => {
  const users = await getUsers();
  return ctx.json({ users });
});

app.listen({ port: 3000 });
```

### With Validation

Input validation using schemas:

```typescript
import { Application, z } from '@curisjs/core';

const app = new Application();

const createUserSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  age: z.number().min(18).max(120),
});

app.post('/api/users', async (ctx) => {
  const body = await ctx.request.json();
  
  // Validate input
  const result = createUserSchema.safeParse(body);
  
  if (!result.success) {
    return ctx.json(
      { 
        error: 'Validation failed',
        issues: result.error.issues 
      },
      { status: 422 }
    );
  }
  
  const user = await createUser(result.data);
  return ctx.json({ user }, { status: 201 });
});

app.listen({ port: 3000 });
```

## Complete Applications

### RESTful API

A complete REST API with CRUD operations:

```typescript
import { Application, z } from '@curisjs/core';
import { User } from './models/User';

const app = new Application();

// Schemas
const createUserSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
});

const updateUserSchema = createUserSchema.partial();

// List users
app.get('/api/users', async (ctx) => {
  const page = parseInt(ctx.url.searchParams.get('page') || '1');
  const limit = parseInt(ctx.url.searchParams.get('limit') || '10');
  
  const users = await User.findMany({
    limit,
    offset: (page - 1) * limit,
  });
  
  const total = await User.count();
  
  return ctx.json({
    data: users,
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  });
});

// Get user
app.get('/api/users/:id', async (ctx) => {
  const user = await User.findById(ctx.params.id);
  
  if (!user) {
    return ctx.json({ error: 'User not found' }, { status: 404 });
  }
  
  return ctx.json({ data: user });
});

// Create user
app.post('/api/users', async (ctx) => {
  const body = await ctx.request.json();
  const result = createUserSchema.safeParse(body);
  
  if (!result.success) {
    return ctx.json({
      error: 'Validation failed',
      issues: result.error.issues,
    }, { status: 422 });
  }
  
  const user = await User.create(result.data);
  return ctx.json({ data: user }, { status: 201 });
});

// Update user
app.put('/api/users/:id', async (ctx) => {
  const user = await User.findById(ctx.params.id);
  
  if (!user) {
    return ctx.json({ error: 'User not found' }, { status: 404 });
  }
  
  const body = await ctx.request.json();
  const result = updateUserSchema.safeParse(body);
  
  if (!result.success) {
    return ctx.json({
      error: 'Validation failed',
      issues: result.error.issues,
    }, { status: 422 });
  }
  
  await user.update(result.data);
  return ctx.json({ data: user });
});

// Delete user
app.delete('/api/users/:id', async (ctx) => {
  const user = await User.findById(ctx.params.id);
  
  if (!user) {
    return ctx.json({ error: 'User not found' }, { status: 404 });
  }
  
  await user.delete();
  return new Response(null, { status: 204 });
});

app.listen({ port: 3000 });
```

### Authentication API

API with authentication and protected routes:

```typescript
import { Application, z } from '@curisjs/core';
import { sign, verify } from 'jsonwebtoken';

const app = new Application();

const JWT_SECRET = process.env.JWT_SECRET || 'secret';

// Auth middleware
const auth = async (ctx, next) => {
  const token = ctx.request.headers.get('Authorization')?.replace('Bearer ', '');
  
  if (!token) {
    return ctx.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  try {
    const payload = verify(token, JWT_SECRET);
    ctx.state.user = payload;
    await next();
  } catch (error) {
    return ctx.json({ error: 'Invalid token' }, { status: 401 });
  }
};

// Public routes
app.post('/api/register', async (ctx) => {
  const { email, password } = await ctx.request.json();
  
  // Hash password and create user
  const user = await createUser({ email, password });
  
  const token = sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });
  
  return ctx.json({ user, token }, { status: 201 });
});

app.post('/api/login', async (ctx) => {
  const { email, password } = await ctx.request.json();
  
  const user = await findUserByCredentials(email, password);
  
  if (!user) {
    return ctx.json({ error: 'Invalid credentials' }, { status: 401 });
  }
  
  const token = sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });
  
  return ctx.json({ user, token });
});

// Protected routes
app.get('/api/profile', auth, async (ctx) => {
  const user = await User.findById(ctx.state.user.userId);
  return ctx.json({ user });
});

app.put('/api/profile', auth, async (ctx) => {
  const user = await User.findById(ctx.state.user.userId);
  const updates = await ctx.request.json();
  
  await user.update(updates);
  return ctx.json({ user });
});

app.listen({ port: 3000 });
```

### File Upload API

Handling file uploads:

```typescript
import { Application } from '@curisjs/core';
import { writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const app = new Application();

app.post('/api/upload', async (ctx) => {
  const formData = await ctx.request.formData();
  const file = formData.get('file') as File;
  
  if (!file) {
    return ctx.json({ error: 'No file provided' }, { status: 400 });
  }
  
  // Validate file type
  if (!file.type.startsWith('image/')) {
    return ctx.json({ error: 'Only images allowed' }, { status: 400 });
  }
  
  // Validate file size (5MB max)
  if (file.size > 5 * 1024 * 1024) {
    return ctx.json({ error: 'File too large' }, { status: 400 });
  }
  
  // Save file
  const filename = `${Date.now()}-${file.name}`;
  const filepath = join('uploads', filename);
  
  const buffer = await file.arrayBuffer();
  await writeFile(filepath, Buffer.from(buffer));
  
  return ctx.json({
    filename,
    size: file.size,
    type: file.type,
    url: `/uploads/${filename}`,
  }, { status: 201 });
});

// Serve uploaded files
app.get('/uploads/:filename', async (ctx) => {
  const filepath = join('uploads', ctx.params.filename);
  
  try {
    const file = await Bun.file(filepath);
    return new Response(file);
  } catch {
    return ctx.json({ error: 'File not found' }, { status: 404 });
  }
});

app.listen({ port: 3000 });
```

## Runtime-Specific Examples

### Node.js Server

```typescript
import { Application } from '@curisjs/core';
import { nodeAdapter } from '@curisjs/core/adapters';
import { createServer } from 'node:http';

const app = new Application();

app.get('/', (ctx) => ctx.json({ runtime: 'Node.js' }));

const server = createServer(nodeAdapter(app));
server.listen(3000);
```

### Bun Server

```typescript
import { Application } from '@curisjs/core';

const app = new Application();

app.get('/', (ctx) => ctx.json({ runtime: 'Bun' }));

Bun.serve({
  port: 3000,
  fetch: app.fetch,
});
```

### Deno Server

```typescript
import { Application } from '@curisjs/core';

const app = new Application();

app.get('/', (ctx) => ctx.json({ runtime: 'Deno' }));

Deno.serve({ port: 3000 }, app.fetch);
```

### Cloudflare Workers

```typescript
import { Application } from '@curisjs/core';

const app = new Application();

app.get('/', (ctx) => ctx.json({ runtime: 'Cloudflare Workers' }));

export default {
  fetch: app.fetch,
};
```

## Source Code

Full source code for these examples is available in the repository:

- [Basic Examples](https://github.com/Ameriq8/curisjs/tree/main/packages/core/examples)
- [Template Applications](https://github.com/Ameriq8/curisjs/tree/main/template)
- [Database Examples](https://github.com/Ameriq8/curisjs/tree/main/packages/db/examples)

## Next Steps

- [Getting Started Guide](/getting-started)
- [Core Package Documentation](/core/)
- [Database Documentation](/db/)
- [CLI Tools](/cli/)
