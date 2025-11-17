# @curisjs/cli

Command-line interface tools for CurisJS projects.

## Overview

`@curisjs/cli` provides command-line tools for creating, managing, and deploying CurisJS applications.

## Installation

### Global Installation

```bash
npm install -g @curisjs/cli
```

### Project Installation

```bash
npm install --save-dev @curisjs/cli
```

### Using npx

```bash
npx @curisjs/cli <command>
```

## Quick Start

### Create a New Project

```bash
# Create a new project
curis new my-app

# Navigate to project
cd my-app

# Install dependencies
npm install

# Start development server
npm run dev
```

## Commands

### `new`

Create a new CurisJS project:

```bash
curis new <project-name> [options]
```

**Options:**
- `--template <name>` - Use a specific template (default, api, fullstack)
- `--db <type>` - Database type (sqlite, postgres, mysql)
- `--no-git` - Skip git initialization

**Examples:**

```bash
# Basic project
curis new my-app

# API-only project with PostgreSQL
curis new my-api --template api --db postgres

# Full-stack project with MySQL
curis new my-app --template fullstack --db mysql
```

### `generate` (or `g`)

Generate boilerplate code:

```bash
curis generate <type> <name> [options]
curis g <type> <name> [options]
```

**Types:**
- `model` - Generate a database model
- `controller` - Generate a controller
- `middleware` - Generate middleware
- `migration` - Generate a database migration

**Examples:**

```bash
# Generate a model
curis g model User

# Generate a controller
curis g controller UserController

# Generate middleware
curis g middleware auth

# Generate migration
curis g migration CreateUsersTable
```

### `dev`

Start the development server:

```bash
curis dev [options]
```

**Options:**
- `--port <number>` - Port number (default: 3000)
- `--host <host>` - Host address (default: localhost)
- `--watch` - Enable file watching

**Example:**

```bash
curis dev --port 8080 --watch
```

### `build`

Build the project for production:

```bash
curis build [options]
```

**Options:**
- `--output <dir>` - Output directory (default: dist)
- `--target <runtime>` - Target runtime (node, bun, deno)

**Example:**

```bash
curis build --target node --output ./build
```

### `db`

Database management commands:

```bash
curis db <subcommand> [options]
```

**Subcommands:**

#### `db:migrate`

Run database migrations:

```bash
curis db:migrate [options]
```

**Options:**
- `--rollback` - Rollback the last migration
- `--reset` - Reset the database
- `--seed` - Run seeders after migration

**Examples:**

```bash
# Run migrations
curis db:migrate

# Rollback last migration
curis db:migrate --rollback

# Reset and migrate
curis db:migrate --reset

# Migrate and seed
curis db:migrate --seed
```

#### `db:seed`

Run database seeders:

```bash
curis db:seed [options]
```

**Examples:**

```bash
# Run all seeders
curis db:seed

# Run specific seeder
curis db:seed --class UserSeeder
```

#### `db:reset`

Reset the database:

```bash
curis db:reset
```

### `serve`

Serve the built application:

```bash
curis serve [options]
```

**Options:**
- `--port <number>` - Port number (default: 3000)
- `--host <host>` - Host address

**Example:**

```bash
curis serve --port 8080
```

## Project Structure

When you create a new project with `curis new`, this is the generated structure:

```
my-app/
├── src/
│   ├── app/
│   │   ├── controllers/
│   │   ├── models/
│   │   ├── middleware/
│   │   └── validators/
│   ├── database/
│   │   ├── migrations/
│   │   └── seeds/
│   ├── routes/
│   │   └── index.ts
│   └── index.ts
├── .env
├── .gitignore
├── package.json
├── tsconfig.json
└── README.md
```

## Code Generation

### Model Generation

```bash
curis g model User
```

Generates:

```typescript
// src/app/models/User.ts
import { Model } from '@curisjs/db';

export class User extends Model {
  static tableName = 'users';
  
  id!: number;
  createdAt!: Date;
  updatedAt!: Date;
}
```

### Controller Generation

```bash
curis g controller UserController
```

Generates:

```typescript
// src/app/controllers/UserController.ts
import { Context, json } from '@curisjs/core';

export class UserController {
  static async index(ctx: Context) {
    return json({ users: [] });
  }
  
  static async show(ctx: Context) {
    const id = ctx.params.id;
    return json({ user: {} });
  }
  
  static async store(ctx: Context) {
    const data = await ctx.request.json();
    return json({ user: data }, { status: 201 });
  }
  
  static async update(ctx: Context) {
    const id = ctx.params.id;
    const data = await ctx.request.json();
    return json({ user: data });
  }
  
  static async destroy(ctx: Context) {
    const id = ctx.params.id;
    return new Response(null, { status: 204 });
  }
}
```

### Middleware Generation

```bash
curis g middleware auth
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
  
  // Verify token
  ctx.state.user = await verifyToken(token);
  
  await next();
};
```

### Migration Generation

```bash
curis g migration CreateUsersTable
```

Generates:

```typescript
// src/database/migrations/2024_01_01_000000_create_users_table.ts
import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('users', (table) => {
    table.increments('id').primary();
    table.timestamps(true, true);
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('users');
}
```

## Configuration

### curis.config.ts

Create a configuration file in your project root:

```typescript
// curis.config.ts
import { defineConfig } from '@curisjs/cli';

export default defineConfig({
  // Server configuration
  server: {
    port: 3000,
    host: 'localhost',
  },
  
  // Database configuration
  database: {
    client: 'better-sqlite3',
    connection: {
      filename: './database.sqlite',
    },
  },
  
  // Build configuration
  build: {
    outDir: 'dist',
    target: 'node',
  },
});
```

## Environment Variables

The CLI respects these environment variables:

```bash
# Development
NODE_ENV=development
PORT=3000
HOST=localhost

# Database
DB_CLIENT=better-sqlite3
DB_FILENAME=./database.sqlite

# Or for PostgreSQL
DB_CLIENT=pg
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=password
DB_NAME=myapp
```

## Scripts

Add these scripts to your `package.json`:

```json
{
  "scripts": {
    "dev": "curis dev",
    "build": "curis build",
    "start": "curis serve",
    "db:migrate": "curis db:migrate",
    "db:seed": "curis db:seed",
    "db:reset": "curis db:reset",
    "generate": "curis generate"
  }
}
```

## Templates

The CLI includes several project templates:

### Default Template

Full-stack application with:
- CurisJS core
- Database ORM
- Example routes and controllers
- Authentication middleware

### API Template

API-only application with:
- REST API structure
- Database models
- API versioning
- Authentication

### Minimal Template

Minimal setup with:
- Basic routing
- No database
- Essential middleware

## Deployment

### Build for Production

```bash
# Build the project
curis build

# The output is in ./dist directory
# Deploy the dist folder to your server
```

### Deploy to Different Runtimes

```bash
# For Node.js
curis build --target node

# For Bun
curis build --target bun

# For Deno
curis build --target deno
```

## Best Practices

1. **Use code generation** - Save time with generators
2. **Follow conventions** - Use the generated folder structure
3. **Environment variables** - Never commit sensitive data
4. **Migrations** - Always create migrations for schema changes
5. **Build before deploy** - Test the production build locally

## Complete Workflow

```bash
# 1. Create project
curis new my-blog --db postgres

# 2. Navigate to project
cd my-blog

# 3. Generate models
curis g model Post
curis g model User

# 4. Generate migration
curis g migration CreatePostsTable

# 5. Run migrations
curis db:migrate

# 6. Generate controllers
curis g controller PostController
curis g controller UserController

# 7. Start development
curis dev

# 8. Build for production
curis build

# 9. Serve production build
curis serve
```

## Next Steps

- [Create your first project](/getting-started)
- [Learn about models](/db/models)
- [Explore middleware](/core/middleware)
- [Master routing](/core/routing)
