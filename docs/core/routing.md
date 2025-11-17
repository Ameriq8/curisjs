# Routing

CurisJS uses a high-performance radix tree router with O(path_length) lookup complexity.

## Basic Routing

### Simple Routes

```typescript
import { createApp, json } from '@curisjs/core';

const app = createApp();

app.get('/hello', (ctx) => {
  return json({ message: 'Hello, World!' });
});

app.get('/about', (ctx) => {
  return json({ page: 'about' });
});
```

### Route Parameters

Capture dynamic values from the URL:

```typescript
// Single parameter
app.get('/users/:id', (ctx) => {
  const userId = ctx.params.id;
  return json({ userId });
});

// Multiple parameters
app.get('/posts/:postId/comments/:commentId', (ctx) => {
  const { postId, commentId } = ctx.params;
  return json({ postId, commentId });
});

// Parameters with patterns
app.get('/files/:filename', (ctx) => {
  const filename = ctx.params.filename;
  return json({ filename });
});
```

### Wildcard Routes

Capture the rest of the path:

```typescript
// Catch-all route
app.get('/files/*path', (ctx) => {
  const filePath = ctx.params.path;
  return json({ path: filePath });
});

// Example matches:
// /files/docs/readme.md -> path = "docs/readme.md"
// /files/images/logo.png -> path = "images/logo.png"
```

## HTTP Methods

### Supported Methods

```typescript
app.get('/resource', handler);      // GET
app.post('/resource', handler);     // POST
app.put('/resource', handler);      // PUT
app.patch('/resource', handler);    // PATCH
app.delete('/resource', handler);   // DELETE
app.head('/resource', handler);     // HEAD
app.options('/resource', handler);  // OPTIONS
app.all('/resource', handler);      // All methods
```

### Method-Specific Logic

```typescript
app.all('/users/:id', (ctx) => {
  const method = ctx.request.method;
  const id = ctx.params.id;
  
  switch (method) {
    case 'GET':
      return json({ action: 'get', id });
    case 'PUT':
      return json({ action: 'update', id });
    case 'DELETE':
      return json({ action: 'delete', id });
    default:
      return json({ error: 'Method not allowed' }, { status: 405 });
  }
});
```

## Route Patterns

### Static Routes

Exact path matching:

```typescript
app.get('/', handler);
app.get('/about', handler);
app.get('/contact', handler);
```

### Dynamic Routes

With parameters:

```typescript
// User by ID
app.get('/users/:id', (ctx) => {
  return json({ userId: ctx.params.id });
});

// Blog post by slug
app.get('/blog/:slug', (ctx) => {
  return json({ slug: ctx.params.slug });
});

// Nested resources
app.get('/users/:userId/posts/:postId', (ctx) => {
  const { userId, postId } = ctx.params;
  return json({ userId, postId });
});
```

### Wildcard Routes

Catch-all patterns:

```typescript
// Serve static files
app.get('/static/*filepath', (ctx) => {
  const filepath = ctx.params.filepath;
  // Serve file from filesystem
  return new Response(fileContent);
});

// API versioning fallback
app.get('/api/v1/*endpoint', (ctx) => {
  const endpoint = ctx.params.endpoint;
  return json({ version: 'v1', endpoint });
});
```

## Route Priority

Routes are matched in order of specificity:

1. **Static routes** (exact matches)
2. **Parameterized routes** (with `:param`)
3. **Wildcard routes** (with `*path`)

```typescript
app.get('/users/me', (ctx) => {
  return json({ message: 'Current user' }); // Matches first
});

app.get('/users/:id', (ctx) => {
  return json({ userId: ctx.params.id }); // Matches second
});

app.get('/users/*path', (ctx) => {
  return json({ path: ctx.params.path }); // Matches last
});

// GET /users/me -> "Current user"
// GET /users/123 -> { userId: "123" }
// GET /users/active/list -> { path: "active/list" }
```

## Accessing Request Data

### URL Parameters

```typescript
app.get('/users/:id', (ctx) => {
  const id = ctx.params.id;
  return json({ id });
});
```

### Query Parameters

```typescript
app.get('/search', (ctx) => {
  const query = ctx.url.searchParams.get('q');
  const page = ctx.url.searchParams.get('page') || '1';
  
  return json({ query, page });
});

// GET /search?q=test&page=2
// -> { query: "test", page: "2" }
```

### Request Body

```typescript
app.post('/users', async (ctx) => {
  const body = await ctx.request.json();
  return json({ received: body });
});
```

### Request Headers

```typescript
app.get('/protected', (ctx) => {
  const auth = ctx.request.headers.get('Authorization');
  
  if (!auth) {
    return json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  return json({ authenticated: true });
});
```

## Grouping Routes

While CurisJS doesn't have built-in route grouping, you can organize routes logically:

```typescript
// User routes
app.get('/api/users', getAllUsers);
app.post('/api/users', createUser);
app.get('/api/users/:id', getUser);
app.put('/api/users/:id', updateUser);
app.delete('/api/users/:id', deleteUser);

// Post routes
app.get('/api/posts', getAllPosts);
app.post('/api/posts', createPost);
app.get('/api/posts/:id', getPost);
app.put('/api/posts/:id', updatePost);
app.delete('/api/posts/:id', deletePost);
```

Or create helper functions:

```typescript
function registerUserRoutes(app: Application) {
  app.get('/users', getAllUsers);
  app.post('/users', createUser);
  app.get('/users/:id', getUser);
  app.put('/users/:id', updateUser);
  app.delete('/users/:id', deleteUser);
}

function registerPostRoutes(app: Application) {
  app.get('/posts', getAllPosts);
  app.post('/posts', createPost);
  // ... more routes
}

registerUserRoutes(app);
registerPostRoutes(app);
```

## RESTful Routes

Example of a complete REST API:

```typescript
import { createApp, json } from '@curisjs/core';

const app = createApp();

// List all resources
app.get('/api/users', async (ctx) => {
  const users = await database.findMany();
  return json({ users });
});

// Create resource
app.post('/api/users', async (ctx) => {
  const data = await ctx.request.json();
  const user = await database.create(data);
  return json({ user }, { status: 201 });
});

// Get single resource
app.get('/api/users/:id', async (ctx) => {
  const user = await database.findById(ctx.params.id);
  
  if (!user) {
    return json({ error: 'User not found' }, { status: 404 });
  }
  
  return json({ user });
});

// Update resource (full)
app.put('/api/users/:id', async (ctx) => {
  const data = await ctx.request.json();
  const user = await database.update(ctx.params.id, data);
  return json({ user });
});

// Update resource (partial)
app.patch('/api/users/:id', async (ctx) => {
  const data = await ctx.request.json();
  const user = await database.patch(ctx.params.id, data);
  return json({ user });
});

// Delete resource
app.delete('/api/users/:id', async (ctx) => {
  await database.delete(ctx.params.id);
  return new Response(null, { status: 204 });
});
```

## Nested Resources

```typescript
// Comments for a specific post
app.get('/api/posts/:postId/comments', async (ctx) => {
  const comments = await database.findCommentsByPost(ctx.params.postId);
  return json({ comments });
});

app.post('/api/posts/:postId/comments', async (ctx) => {
  const { postId } = ctx.params;
  const data = await ctx.request.json();
  const comment = await database.createComment(postId, data);
  return json({ comment }, { status: 201 });
});

app.get('/api/posts/:postId/comments/:commentId', async (ctx) => {
  const { postId, commentId } = ctx.params;
  const comment = await database.findComment(postId, commentId);
  return json({ comment });
});
```

## Route Validation

Use with the validation system:

```typescript
import { z } from '@curisjs/core';

const userSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  age: z.number().min(18).optional(),
});

app.post('/users', async (ctx) => {
  const body = await ctx.request.json();
  const result = userSchema.safeParse(body);
  
  if (!result.success) {
    return json({
      error: 'Validation failed',
      issues: result.error.issues
    }, { status: 422 });
  }
  
  const user = await database.create(result.data);
  return json({ user }, { status: 201 });
});
```

## Performance Tips

### Route Organization

Order routes from most specific to least specific:

```typescript
// Good - specific routes first
app.get('/users/me', handler);
app.get('/users/:id', handler);
app.get('/users/*path', handler);

// Avoid - wildcard catches everything
app.get('/users/*path', handler); // This catches all /users/* routes
app.get('/users/me', handler);    // Never reached!
```

### Static Routes

Static routes are matched faster than dynamic routes:

```typescript
// Faster
app.get('/api/users', handler);
app.get('/api/posts', handler);

// Slower (but still fast)
app.get('/api/:resource', handler);
```

## Error Handling

### 404 Not Found

```typescript
// Add at the end of all routes
app.all('*', (ctx) => {
  return json({
    error: 'Not Found',
    path: ctx.url.pathname
  }, { status: 404 });
});
```

### Method Not Allowed

```typescript
// Handle unsupported methods
app.get('/users/:id', getUser);
app.put('/users/:id', updateUser);

// Catch other methods
app.all('/users/:id', (ctx) => {
  const allowed = ['GET', 'PUT'];
  return new Response('Method Not Allowed', {
    status: 405,
    headers: {
      'Allow': allowed.join(', ')
    }
  });
});
```

## Complete Example

```typescript
import { createApp, json } from '@curisjs/core';

const app = createApp();

// Home
app.get('/', (ctx) => {
  return json({ message: 'Welcome to the API' });
});

// API endpoints
app.get('/api/users', getAllUsers);
app.post('/api/users', createUser);
app.get('/api/users/:id', getUser);
app.put('/api/users/:id', updateUser);
app.delete('/api/users/:id', deleteUser);

// Nested resources
app.get('/api/users/:userId/posts', getUserPosts);
app.post('/api/users/:userId/posts', createUserPost);

// Static files
app.get('/static/*filepath', serveStatic);

// 404 handler
app.all('*', (ctx) => {
  return json({ error: 'Not Found' }, { status: 404 });
});

app.listen(3000);
```
