# Code Generation

Automate boilerplate code creation with CurisJS generators.

## Overview

The CurisJS CLI includes powerful code generators that help you quickly scaffold models, controllers, middleware, and more while following best practices.

## Model Generator

### Basic Model

```bash
curis generate model User
```

Generates:

```typescript
// src/app/models/User.ts
import { Model } from '@curisjs/db';

export class User extends Model {
  static tableName = 'users';
  static timestamps = true;
  
  id!: number;
  createdAt!: Date;
  updatedAt!: Date;
}
```

### With Custom Options

```bash
curis g model Post --table blog_posts --soft-delete
```

Generates:

```typescript
// src/app/models/Post.ts
import { Model } from '@curisjs/db';

export class Post extends Model {
  static tableName = 'blog_posts';
  static timestamps = true;
  static softDelete = true;
  
  id!: number;
  deletedAt?: Date;
  createdAt!: Date;
  updatedAt!: Date;
}
```

## Controller Generator

### Basic Controller

```bash
curis generate controller UserController
```

Generates:

```typescript
// src/app/controllers/UserController.ts
import { Context } from '@curisjs/core';

export class UserController {
  static async index(ctx: Context) {
    // List all users
  }
  
  static async show(ctx: Context) {
    // Show single user
  }
}
```

### Resource Controller

```bash
curis g controller UserController --resource
```

Generates a full CRUD controller:

```typescript
// src/app/controllers/UserController.ts
import { Context, json } from '@curisjs/core';
import { User } from '../models/User';

export class UserController {
  /**
   * List all users
   * GET /users
   */
  static async index(ctx: Context) {
    const users = await User.findMany();
    return json({ users });
  }
  
  /**
   * Show user details
   * GET /users/:id
   */
  static async show(ctx: Context) {
    const user = await User.findById(ctx.params.id);
    
    if (!user) {
      return json({ error: 'User not found' }, { status: 404 });
    }
    
    return json({ user });
  }
  
  /**
   * Create new user
   * POST /users
   */
  static async store(ctx: Context) {
    const data = await ctx.request.json();
    const user = await User.create(data);
    return json({ user }, { status: 201 });
  }
  
  /**
   * Update user
   * PUT /users/:id
   */
  static async update(ctx: Context) {
    const user = await User.findById(ctx.params.id);
    
    if (!user) {
      return json({ error: 'User not found' }, { status: 404 });
    }
    
    const data = await ctx.request.json();
    await user.update(data);
    
    return json({ user });
  }
  
  /**
   * Delete user
   * DELETE /users/:id
   */
  static async destroy(ctx: Context) {
    const user = await User.findById(ctx.params.id);
    
    if (!user) {
      return json({ error: 'User not found' }, { status: 404 });
    }
    
    await user.delete();
    
    return new Response(null, { status: 204 });
  }
}
```

### API Controller

```bash
curis g controller UserController --api
```

Generates an API-focused controller with validation:

```typescript
// src/app/controllers/UserController.ts
import { Context, json, z } from '@curisjs/core';
import { User } from '../models/User';

const createUserSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
});

const updateUserSchema = createUserSchema.partial();

export class UserController {
  static async index(ctx: Context) {
    const page = parseInt(ctx.url.searchParams.get('page') || '1');
    const limit = parseInt(ctx.url.searchParams.get('limit') || '10');
    
    const users = await User.findMany({
      limit,
      offset: (page - 1) * limit,
    });
    
    const total = await User.count();
    
    return json({
      data: users,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  }
  
  static async show(ctx: Context) {
    const user = await User.findById(ctx.params.id);
    
    if (!user) {
      return json({ error: 'User not found' }, { status: 404 });
    }
    
    return json({ data: user });
  }
  
  static async store(ctx: Context) {
    const body = await ctx.request.json();
    const result = createUserSchema.safeParse(body);
    
    if (!result.success) {
      return json({
        error: 'Validation failed',
        issues: result.error.issues,
      }, { status: 422 });
    }
    
    const user = await User.create(result.data);
    return json({ data: user }, { status: 201 });
  }
  
  static async update(ctx: Context) {
    const user = await User.findById(ctx.params.id);
    
    if (!user) {
      return json({ error: 'User not found' }, { status: 404 });
    }
    
    const body = await ctx.request.json();
    const result = updateUserSchema.safeParse(body);
    
    if (!result.success) {
      return json({
        error: 'Validation failed',
        issues: result.error.issues,
      }, { status: 422 });
    }
    
    await user.update(result.data);
    return json({ data: user });
  }
  
  static async destroy(ctx: Context) {
    const user = await User.findById(ctx.params.id);
    
    if (!user) {
      return json({ error: 'User not found' }, { status: 404 });
    }
    
    await user.delete();
    return new Response(null, { status: 204 });
  }
}
```

## Middleware Generator

```bash
curis generate middleware auth
```

Generates:

```typescript
// src/app/middleware/auth.ts
import { Context, Middleware, Next, json } from '@curisjs/core';

export const auth: Middleware = async (ctx: Context, next: Next) => {
  const token = ctx.request.headers.get('Authorization');
  
  if (!token) {
    return json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  try {
    // Verify token
    const user = await verifyToken(token);
    ctx.state.user = user;
    
    await next();
  } catch (error) {
    return json({ error: 'Invalid token' }, { status: 401 });
  }
};
```

## Migration Generator

```bash
curis generate migration CreateUsersTable
```

Generates:

```typescript
// src/database/migrations/2024_11_17_100000_create_users_table.ts
import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('users', (table) => {
    table.increments('id').primary();
    table.string('name').notNullable();
    table.string('email').notNullable().unique();
    table.timestamps(true, true);
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('users');
}
```

## Validator Generator

```bash
curis generate validator UserValidator
```

Generates:

```typescript
// src/app/validators/UserValidator.ts
import { z } from '@curisjs/core';

export const createUserSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  password: z.string().min(8),
});

export const updateUserSchema = createUserSchema.partial();

export const userIdSchema = z.object({
  id: z.string().uuid(),
});
```

## Service Generator

```bash
curis generate service EmailService
```

Generates:

```typescript
// src/app/services/EmailService.ts
export class EmailService {
  static async send(to: string, subject: string, body: string) {
    // Email sending logic
  }
  
  static async sendWelcome(email: string, name: string) {
    return this.send(
      email,
      'Welcome!',
      `Hello ${name}, welcome to our platform!`
    );
  }
}
```

## Complete Example Workflow

```bash
# 1. Create a new project
curis new blog

# 2. Navigate to project
cd blog

# 3. Generate Post model
curis g model Post --soft-delete

# 4. Generate migration
curis g migration CreatePostsTable

# 5. Generate Post controller
curis g controller PostController --resource

# 6. Generate validators
curis g validator PostValidator

# 7. Generate auth middleware
curis g middleware auth

# 8. Run migrations
curis db:migrate

# 9. Start development
curis dev
```

## Customizing Templates

You can customize generator templates by creating a `templates/` directory in your project:

```
my-app/
├── templates/
│   ├── model.ts.ejs
│   ├── controller.ts.ejs
│   └── middleware.ts.ejs
└── src/
```

The CLI will use your custom templates instead of the defaults.

## Tips

1. **Use descriptive names** - `UserController` is better than `UC`
2. **Follow conventions** - Models are singular, tables are plural
3. **Generate early** - It's easier to modify generated code than write from scratch
4. **Review generated code** - Always check the output before using
5. **Customize as needed** - Generated code is a starting point

## Next Steps

- [CLI Commands Reference](/cli/commands)
- [Models Guide](/db/models)
- [Routing Guide](/core/routing)
