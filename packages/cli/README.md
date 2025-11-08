# @curisjs/cli

Command-line interface for CurisJS framework. Generate code, manage databases, and scaffold projects with ease.

## Installation

### Global Installation

Install globally to use the `curis` command anywhere:

```bash
npm install -g @curisjs/cli
# or
pnpm add -g @curisjs/cli
# or
yarn global add @curisjs/cli
```

### Use with npx/pnpm dlx

No installation required:

```bash
npx @curisjs/cli <command>
# or
pnpm dlx @curisjs/cli <command>
```

### Project Installation

Install as a dev dependency in your project:

```bash
pnpm add -D @curisjs/cli
```

Then use via package.json scripts or `pnpm curis`.

## Quick Start

```bash
# Create a new project
curis new my-app

# Navigate to project
cd my-app

# Install dependencies
pnpm install

# Start development server
curis dev
```

## Commands

### Project Commands

#### `curis new <name>`

Create a new CurisJS project

```bash
curis new my-app
curis new my-api
```

#### `curis dev`

Start development server with hot reload

```bash
curis dev
```

#### `curis build`

Build project for production

```bash
curis build
```

### Database Commands

#### `curis db:migrate`

Run all pending migrations

```bash
curis db:migrate
curis db:migrate --step 1  # Run only 1 migration
```

#### `curis db:rollback`

Rollback the last migration batch

```bash
curis db:rollback
curis db:rollback --step 2  # Rollback 2 batches
```

#### `curis db:reset`

Rollback all migrations

```bash
curis db:reset
```

#### `curis db:status`

Show migration status

```bash
curis db:status
```

#### `curis db:seed`

Run all seeders

```bash
curis db:seed
curis db:seed UserSeeder  # Run specific seeder
```

#### `curis db:wipe`

Drop all database tables ⚠️

```bash
curis db:wipe
```

### Code Generators

#### `curis make:migration <name>`

Create a new migration file

```bash
curis make:migration create_users_table
curis make:migration add_email_to_users
```

Creates:

```typescript
// migrations/20241108120000_create_users_table.ts
import type { Knex } from 'knex';

export async function up(db: Knex): Promise<void> {
  await db.schema.createTable('users', (table) => {
    table.increments('id').primary();
    table.string('name').notNullable();
    table.timestamps(true, true);
  });
}

export async function down(db: Knex): Promise<void> {
  await db.schema.dropTableIfExists('users');
}
```

#### `curis make:model <name>`

Create a new model

```bash
curis make:model User
curis make:model BlogPost
```

Creates:

```typescript
// src/models/User.ts
import { Model, schema } from '@curisjs/db';

export const userSchema = schema.define('users', {
  id: schema.integer().primaryKey().autoIncrement(),
  createdAt: schema.datetime().default('now'),
  updatedAt: schema.datetime().default('now'),
});

export class User extends Model {
  static tableName = 'users';
  static schema = userSchema;
  static timestamps = true;
}
```

#### `curis make:controller <name>`

Create a new controller

```bash
curis make:controller UserController
curis make:controller PostController
```

Creates:

```typescript
// src/controllers/UserController.ts
import type { Context } from '@curisjs/core';

export class UserController {
  async index(ctx: Context) {
    return ctx.json({ message: 'List all resources' });
  }

  async show(ctx: Context) {
    const { id } = ctx.params;
    return ctx.json({ message: `Show resource ${id}` });
  }

  async store(ctx: Context) {
    const data = await ctx.json();
    return ctx.json({ message: 'Resource created', data }, { status: 201 });
  }

  async update(ctx: Context) {
    const { id } = ctx.params;
    const data = await ctx.json();
    return ctx.json({ message: `Resource ${id} updated`, data });
  }

  async destroy(ctx: Context) {
    const { id } = ctx.params;
    return ctx.json({ message: `Resource ${id} deleted` });
  }
}
```

#### `curis make:service <name>`

Create a new service

```bash
curis make:service UserService
curis make:service EmailService
```

#### `curis make:middleware <name>`

Create a new middleware

```bash
curis make:middleware auth
curis make:middleware cors
```

#### `curis make:seeder <name>`

Create a new seeder

```bash
curis make:seeder UserSeeder
curis make:seeder ProductSeeder
```

#### `curis make:validator <name>`

Create a new validator

```bash
curis make:validator userValidator
curis make:validator loginValidator
```

## Configuration

Create `curisdb.config.ts` in your project root:

```typescript
import { defineConfig } from '@curisjs/db';

export default defineConfig({
  connection: {
    client: 'better-sqlite3',
    connection: {
      filename: './database.sqlite',
    },
    useNullAsDefault: true,
  },

  migrations: {
    directory: './migrations',
    tableName: 'migrations',
    extension: '.ts',
  },

  seeds: {
    directory: './seeders',
    extension: '.ts',
  },
});
```

## Typical Workflow

### Starting a New Project

```bash
# 1. Create project
curis new my-app
cd my-app

# 2. Install dependencies
pnpm install

# 3. Create first migration
curis make:migration create_users_table

# 4. Edit migration file, then run
curis db:migrate

# 5. Create model
curis make:model User

# 6. Create controller
curis make:controller UserController

# 7. Start development
curis dev
```

### Adding a New Feature

```bash
# 1. Create migration
curis make:migration create_posts_table

# 2. Create model
curis make:model Post

# 3. Create controller
curis make:controller PostController

# 4. Create service (optional)
curis make:service PostService

# 5. Run migration
curis db:migrate

# 6. Create seeder
curis make:seeder PostSeeder

# 7. Seed database
curis db:seed
```

## Environment Variables

The CLI respects the following environment variables:

- `NODE_ENV` - Environment (development/production)
- `DATABASE_URL` - Database connection string
- `DEBUG` - Enable debug logging

## Tips & Best Practices

1. **Use descriptive names** - Name your files clearly
2. **Follow naming conventions** - PascalCase for classes, camelCase for functions
3. **Version control** - Commit generated files to git
4. **Test migrations** - Always test both up and down
5. **Keep seeders separate** - Don't mix seeders with migrations

## Troubleshooting

### Command not found

If `curis` command is not found after global installation:

- Check if npm/pnpm global bin directory is in your PATH
- Try using `npx @curisjs/cli` instead

### Database errors

- Make sure `curisdb.config.ts` exists
- Check database connection settings
- Ensure database server is running

### Import errors

- Make sure you have `@curisjs/core` and `@curisjs/db` installed
- Run `pnpm install` in your project

## See Also

- [@curisjs/core](../core) - CurisJS framework core
- [@curisjs/db](../db) - Database ORM
- [Documentation](https://github.com/Ameriq8/curisjs)

## License

MIT © Ameriq8
