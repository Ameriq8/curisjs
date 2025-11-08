# @curisjs/cli

Command-line interface for CurisJS applications.

## Table of Contents

- [Installation](#installation)
- [Commands](#commands)
- [Project Scaffolding](#project-scaffolding)
- [Code Generators](#code-generators)
- [Database Commands](#database-commands)
- [Development Server](#development-server)

## Installation

### Global Installation

```bash
# npm
npm install -g @curisjs/cli

# pnpm
pnpm add -g @curisjs/cli

# yarn
yarn global add @curisjs/cli

# bun
bun add -g @curisjs/cli
```

### Usage without Installation

```bash
# npx
npx @curisjs/cli new my-app

# pnpm
pnpm dlx @curisjs/cli new my-app

# bunx
bunx @curisjs/cli new my-app
```

## Commands

### Help

```bash
curis --help
curis -h
```

### Version

```bash
curis --version
curis -v
```

## Project Scaffolding

### Create New Project

```bash
curis new <project-name>
```

The CLI will interactively ask:

1. **Package Manager**: pnpm, npm, yarn, or bun
2. **Database Support**: Include @curisjs/db package
3. **Git Repository**: Initialize git repository

#### Example

```bash
$ curis new my-app

✔ Which package manager do you want to use? › pnpm (recommended)
✔ Do you want to include database support (@curisjs/db)? … yes
✔ Initialize a git repository? … yes
✔ Project created successfully!

✓ Project "my-app" created successfully!

ℹ Next steps:

  cd my-app
  pnpm install
  pnpm dev

✓ Happy coding!
```

### Project Structure

The generated project has this structure:

```
my-app/
├── src/
│   ├── index.ts                 # Application entry point
│   ├── app/
│   │   ├── controllers/         # HTTP controllers
│   │   │   └── TodoController.ts
│   │   ├── models/              # Database models
│   │   │   └── Todo.ts
│   │   ├── validators/          # Request validators
│   │   └── services/            # Business logic
│   ├── database/
│   │   └── connection.ts        # Database config
│   ├── middleware/
│   │   ├── errorHandler.ts      # Error handling
│   │   └── timing.ts            # Request timing
│   └── routes/
│       ├── index.ts             # Route definitions
│       └── todos.ts             # Todo routes
├── database.json                # Database configuration
├── .env.example                 # Environment template
├── .env                         # Environment variables
├── package.json
├── tsconfig.json
├── docker-compose.yml           # PostgreSQL setup
├── Dockerfile
└── README.md
```

## Code Generators

### Make Migration

Create a new database migration file.

```bash
curis make:migration <name>
```

**Examples:**

```bash
curis make:migration create_users_table
curis make:migration add_email_to_users
curis make:migration create_posts_table
```

**Generated file:**

```typescript
// database/migrations/20240108_120000_create_users_table.ts
import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('users', (table) => {
    table.increments('id').primary();
    table.string('name', 100).notNullable();
    table.string('email', 255).notNullable().unique();
    table.timestamps(true, true);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('users');
}
```

### Make Model

Create a new database model.

```bash
curis make:model <name>
```

**Options:**
- `--migration, -m`: Also create a migration
- `--controller, -c`: Also create a controller
- `--all, -a`: Create model, migration, and controller

**Examples:**

```bash
curis make:model User
curis make:model Post --migration
curis make:model Product --all
```

**Generated file:**

```typescript
// src/app/models/User.ts
import { Model } from '@curisjs/db';

export interface UserAttributes {
  id: number;
  name: string;
  email: string;
  createdAt: Date;
  updatedAt: Date;
}

export class User extends Model<UserAttributes> {
  static tableName = 'users';
  static timestamps = true;
  static softDeletes = false;
  
  // Define relationships
  // static relations = {
  //   posts: hasMany('Post', 'userId'),
  // };
}
```

### Make Controller

Create a new HTTP controller.

```bash
curis make:controller <name>
```

**Options:**
- `--resource, -r`: Create RESTful resource controller
- `--api`: Create API resource controller (no views)

**Examples:**

```bash
curis make:controller UserController
curis make:controller PostController --resource
curis make:controller ApiController --api
```

**Generated file (resource controller):**

```typescript
// src/app/controllers/UserController.ts
import type { Context } from '@curisjs/core';
import { User } from '../models/User';

export class UserController {
  /**
   * Display a listing of the resource.
   */
  async index(ctx: Context) {
    const users = await User.findMany();
    return ctx.json({ users });
  }

  /**
   * Store a newly created resource.
   */
  async store(ctx: Context) {
    const data = await ctx.json();
    const user = await User.create(data);
    return ctx.json({ user }, 201);
  }

  /**
   * Display the specified resource.
   */
  async show(ctx: Context) {
    const { id } = ctx.params;
    const user = await User.findOrFail(id);
    return ctx.json({ user });
  }

  /**
   * Update the specified resource.
   */
  async update(ctx: Context) {
    const { id } = ctx.params;
    const data = await ctx.json();
    const user = await User.findOrFail(id);
    await user.update(data);
    return ctx.json({ user });
  }

  /**
   * Remove the specified resource.
   */
  async destroy(ctx: Context) {
    const { id } = ctx.params;
    const user = await User.findOrFail(id);
    await user.delete();
    return ctx.json({ message: 'User deleted' });
  }
}
```

### Make Service

Create a new service class.

```bash
curis make:service <name>
```

**Examples:**

```bash
curis make:service AuthService
curis make:service EmailService
curis make:service PaymentService
```

**Generated file:**

```typescript
// src/app/services/AuthService.ts
export class AuthService {
  async login(email: string, password: string) {
    // Implementation
  }
  
  async register(data: any) {
    // Implementation
  }
  
  async logout(token: string) {
    // Implementation
  }
}
```

### Make Middleware

Create a new middleware function.

```bash
curis make:middleware <name>
```

**Examples:**

```bash
curis make:middleware auth
curis make:middleware rateLimit
curis make:middleware validateApiKey
```

**Generated file:**

```typescript
// src/middleware/auth.ts
import type { Context, Next } from '@curisjs/core';

export async function auth(ctx: Context, next: Next) {
  const token = ctx.header('authorization');
  
  if (!token) {
    return ctx.json({ error: 'Unauthorized' }, 401);
  }
  
  // Verify token
  // ctx.state.user = verifiedUser;
  
  await next();
}
```

### Make Seeder

Create a new database seeder.

```bash
curis make:seeder <name>
```

**Examples:**

```bash
curis make:seeder UserSeeder
curis make:seeder DatabaseSeeder
```

**Generated file:**

```typescript
// database/seeds/UserSeeder.ts
import { BaseSeeder } from '@curisjs/db';
import type { Knex } from 'knex';

export default class UserSeeder extends BaseSeeder {
  async run(knex: Knex): Promise<void> {
    await knex('users').del();
    
    await knex('users').insert([
      {
        name: 'John Doe',
        email: 'john@example.com',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
  }
}
```

### Make Validator

Create a new validation schema.

```bash
curis make:validator <name>
```

**Examples:**

```bash
curis make:validator UserValidator
curis make:validator CreatePostValidator
```

**Generated file:**

```typescript
// src/app/validators/UserValidator.ts
import { z } from '@curisjs/core';

export const createUserSchema = z.object({
  name: z.string().min(3).max(100),
  email: z.string().email(),
  password: z.string().min(8),
  age: z.number().min(18).optional(),
});

export const updateUserSchema = z.object({
  name: z.string().min(3).max(100).optional(),
  email: z.string().email().optional(),
  age: z.number().min(18).optional(),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
```

## Database Commands

### Run Migrations

Run all pending migrations.

```bash
curis db:migrate
```

**Options:**
- `--step <n>`: Run n migrations
- `--connection <name>`: Use specific connection

**Example:**

```bash
$ curis db:migrate

Batch 1 ran the following migrations:
✓ 20240108_120000_create_users_table.ts
✓ 20240108_120001_create_posts_table.ts
```

### Rollback Migrations

Rollback the last batch of migrations.

```bash
curis db:rollback
```

**Options:**
- `--step <n>`: Rollback n batches
- `--all`: Rollback all migrations

**Examples:**

```bash
curis db:rollback
curis db:rollback --step 2
curis db:rollback --all
```

### Reset Database

Rollback all migrations.

```bash
curis db:reset
```

### Migration Status

Show migration status.

```bash
curis db:status
```

**Example output:**

```bash
$ curis db:status

Migration Status:
✓ Ran    20240108_120000_create_users_table.ts
✓ Ran    20240108_120001_create_posts_table.ts
✗ Pending 20240108_130000_add_role_to_users.ts
```

### Run Seeders

Run database seeders.

```bash
curis db:seed
```

**Options:**
- `--class <name>`: Run specific seeder

**Examples:**

```bash
curis db:seed
curis db:seed --class=UserSeeder
```

### Wipe Database

Drop all database tables.

```bash
curis db:wipe
```

⚠️ **Warning:** This will delete all data!

## Development Server

### Start Development Server

```bash
curis dev
```

**Options:**
- `--port <n>`: Specify port (default: 3000)
- `--watch`: Watch for file changes (default: true)

**Examples:**

```bash
curis dev
curis dev --port 4000
```

### Build for Production

```bash
curis build
```

Compiles TypeScript to JavaScript in the `dist/` directory.

## Configuration

### Global Config

CLI configuration can be stored in `curis.config.json`:

```json
{
  "generator": {
    "controllers": "src/app/controllers",
    "models": "src/app/models",
    "services": "src/app/services",
    "middleware": "src/middleware",
    "validators": "src/app/validators"
  },
  "database": {
    "migrations": "database/migrations",
    "seeds": "database/seeds"
  }
}
```

## Tips & Tricks

### 1. Use Aliases

Add to your shell profile:

```bash
alias c='curis'
alias cmm='curis make:migration'
alias cmo='curis make:model'
alias cmc='curis make:controller'
```

### 2. Generate Everything at Once

```bash
curis make:model User --all
# Creates: User.ts, UserController.ts, create_users_table migration
```

### 3. Database Workflow

```bash
# 1. Create migration
curis make:migration create_users_table

# 2. Edit migration file
# ...

# 3. Run migration
curis db:migrate

# 4. Create model
curis make:model User

# 5. Create seeder (optional)
curis make:seeder UserSeeder
curis db:seed
```

### 4. Development Workflow

```bash
# Terminal 1: Development server
curis dev

# Terminal 2: Make changes
curis make:controller ApiController
curis make:migration add_field

# Terminal 3: Database operations
curis db:migrate
curis db:seed
```

## Troubleshooting

### Command Not Found

```bash
# Reinstall globally
npm install -g @curisjs/cli

# Or use npx
npx @curisjs/cli <command>
```

### Permission Errors

```bash
# On Linux/Mac, use sudo
sudo npm install -g @curisjs/cli

# Or fix npm permissions
npm config set prefix ~/.npm-global
export PATH=~/.npm-global/bin:$PATH
```

### Migration Errors

```bash
# Check database connection
curis db:status

# Rollback and retry
curis db:rollback
curis db:migrate
```

## Examples

### Full CRUD Workflow

```bash
# 1. Create new project
curis new blog-api
cd blog-api

# 2. Create post model with everything
curis make:model Post --all

# 3. Edit migration
# database/migrations/*_create_posts_table.ts

# 4. Run migration
curis db:migrate

# 5. Create validator
curis make:validator PostValidator

# 6. Edit controller to use validator
# src/app/controllers/PostController.ts

# 7. Create routes
# src/routes/posts.ts

# 8. Start dev server
pnpm dev
```

### Service-Based Architecture

```bash
# Create services
curis make:service AuthService
curis make:service EmailService
curis make:service StorageService

# Create controller that uses services
curis make:controller AuthController

# Edit AuthController to use AuthService
```

## API Reference

All commands follow this format:

```bash
curis <command> [arguments] [options]
```

### Command List

| Command | Description |
|---------|-------------|
| `new <name>` | Create new project |
| `make:migration <name>` | Create migration |
| `make:model <name>` | Create model |
| `make:controller <name>` | Create controller |
| `make:service <name>` | Create service |
| `make:middleware <name>` | Create middleware |
| `make:seeder <name>` | Create seeder |
| `make:validator <name>` | Create validator |
| `db:migrate` | Run migrations |
| `db:rollback` | Rollback migrations |
| `db:reset` | Reset database |
| `db:status` | Migration status |
| `db:seed` | Run seeders |
| `db:wipe` | Drop all tables |
| `dev` | Start dev server |
| `build` | Build for production |

## Future Commands (Planned)

- `curis serve` - Production server
- `curis test` - Run tests
- `curis lint` - Run linter
- `curis format` - Format code
- `curis deploy` - Deploy to platform
- `curis inspect` - Inspect application
