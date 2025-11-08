# CurisJS Database CLI Guide

The `curisdb` CLI provides powerful commands to manage your database, migrations, seeders, and models.

## Installation

The CLI is automatically available when you install `@curisjs/db`:

```bash
pnpm add @curisjs/db
```

## Quick Start

```bash
# Initialize your project
curisdb init

# Create your first migration
curisdb make:migration create_users_table

# Run migrations
curisdb migrate

# Create a model
curisdb make:model User

# Create a seeder
curisdb make:seeder UserSeeder

# Run seeders
curisdb seed
```

## Commands

### Initialization

#### `curisdb init`

Initialize database configuration and create necessary directories.

```bash
curisdb init
```

Creates:

- `curisdb.config.ts` - Database configuration file
- `migrations/` - Directory for migration files
- `seeders/` - Directory for seeder files

### Migrations

#### `curisdb migrate`

Run all pending migrations.

```bash
curisdb migrate
curisdb migrate --step 1  # Run only 1 migration
```

#### `curisdb migrate:rollback`

Rollback the last migration batch.

```bash
curisdb migrate:rollback
curisdb migrate:rollback --step 2  # Rollback 2 batches
```

#### `curisdb migrate:reset`

Rollback all migrations.

```bash
curisdb migrate:reset
```

#### `curisdb migrate:refresh`

Reset and re-run all migrations.

```bash
curisdb migrate:refresh
```

#### `curisdb migrate:status`

Show migration status.

```bash
curisdb migrate:status
```

Output:

```
Migration Status:

Name                                              Status      Batch
----------------------------------------------------------------------
20241201120000_create_users_table                 ✓ Applied   1
20241201120001_create_posts_table                 ✓ Applied   1
20241201120002_add_email_to_users                 ✗ Pending   -
```

### Generators

#### `curisdb make:migration <name>`

Create a new migration file.

```bash
curisdb make:migration create_users_table
curisdb make:migration add_email_to_users
```

Generates:

```typescript
// migrations/20241201120000_create_users_table.ts
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

#### `curisdb make:model <name>`

Create a new model file.

```bash
curisdb make:model User
curisdb make:model BlogPost
```

Generates:

```typescript
// src/models/User.ts
import { Model, schema } from '@curisjs/db';

export const userSchema = schema.define('users', {
  id: schema.integer().primaryKey().autoIncrement(),
  // Add your columns here
  createdAt: schema.datetime().default('now'),
  updatedAt: schema.datetime().default('now'),
});

export class User extends Model {
  static tableName = 'users';
  static schema = userSchema;
  static timestamps = true;

  // Define relations here
}
```

#### `curisdb make:seeder <name>`

Create a new seeder file.

```bash
curisdb make:seeder UserSeeder
curisdb make:seeder ProductSeeder
```

Generates:

```typescript
// seeders/20241201120000_UserSeeder.ts
import { BaseSeeder } from '@curisjs/db';
import type { Knex } from 'knex';

export default class UserSeeder extends BaseSeeder {
  async run(db: Knex): Promise<void> {
    await db('users').insert([
      {
        // Add your seed data here
      },
    ]);
  }
}
```

### Seeding

#### `curisdb seed`

Run all seeders.

```bash
curisdb seed
```

#### `curisdb seed:run <name>`

Run a specific seeder.

```bash
curisdb seed:run UserSeeder
curisdb seed:run 20241201120000_UserSeeder.ts
```

### Database Utilities

#### `curisdb db:wipe`

Drop all tables from the database.

```bash
curisdb db:wipe
```

**⚠️ Warning:** This command is destructive and cannot be undone!

### General

#### `curisdb --version` or `curisdb -v`

Show CLI version.

```bash
curisdb --version
```

#### `curisdb --help` or `curisdb -h`

Show help information.

```bash
curisdb --help
```

## Configuration

The CLI looks for configuration in `curisdb.config.ts`:

```typescript
import { defineConfig } from '@curisjs/db';

export default defineConfig({
  // Database connection
  connection: {
    client: 'better-sqlite3', // or 'pg', 'mysql2'
    connection: {
      filename: './database.sqlite',
    },
    useNullAsDefault: true,
  },

  // Migrations configuration
  migrations: {
    directory: './migrations',
    tableName: 'migrations',
    extension: '.ts',
  },

  // Seeds configuration
  seeds: {
    directory: './seeders',
    extension: '.ts',
  },
});
```

### Database Clients

#### SQLite (default)

```typescript
{
  client: 'better-sqlite3',
  connection: {
    filename: './database.sqlite',
  },
  useNullAsDefault: true,
}
```

#### PostgreSQL

```typescript
{
  client: 'pg',
  connection: {
    host: 'localhost',
    port: 5432,
    user: 'postgres',
    password: 'password',
    database: 'myapp',
  },
}
```

#### MySQL

```typescript
{
  client: 'mysql2',
  connection: {
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: 'password',
    database: 'myapp',
  },
}
```

## Workflow Examples

### Setting Up a New Project

```bash
# 1. Initialize
curisdb init

# 2. Update curisdb.config.ts with your database settings

# 3. Create your first migration
curisdb make:migration create_users_table

# 4. Edit the migration file

# 5. Run migrations
curisdb migrate

# 6. Create a model
curisdb make:model User

# 7. Create a seeder
curisdb make:seeder UserSeeder

# 8. Edit seeder file

# 9. Run seeders
curisdb seed
```

### Making Database Changes

```bash
# 1. Create a migration
curisdb make:migration add_email_to_users

# 2. Edit migration file

# 3. Run migration
curisdb migrate

# 4. If something goes wrong, rollback
curisdb migrate:rollback

# 5. Fix and re-run
curisdb migrate
```

### Resetting Database

```bash
# Reset all migrations
curisdb migrate:reset

# Or drop all tables
curisdb db:wipe

# Then re-run migrations
curisdb migrate

# And re-seed
curisdb seed
```

## Tips & Best Practices

1. **Always test migrations** - Test both up and down migrations
2. **Use meaningful names** - Name migrations descriptively
3. **One change per migration** - Keep migrations focused
4. **Version control** - Commit migration files to git
5. **Don't edit applied migrations** - Create new migrations instead
6. **Use seeders for test data** - Keep seeders separate from migrations
7. **Back up production data** - Before running migrations in production

## Troubleshooting

### "Database configuration file not found"

Make sure you've run `curisdb init` and have `curisdb.config.ts` in your project root.

### "No migrations found"

Check that your `migrations` directory exists and contains migration files.

### "Migration failed"

- Check your database connection settings
- Ensure your database is running
- Review the migration file for syntax errors

### "Table already exists"

This usually means the migration was partially applied. Either:

- Drop the table manually
- Run `curisdb db:wipe` and start over
- Modify the migration to check if table exists

## Advanced Usage

### Custom Migration Directory

```typescript
// curisdb.config.ts
export default defineConfig({
  migrations: {
    directory: './database/migrations', // Custom path
    tableName: 'schema_migrations', // Custom table name
    extension: '.ts',
  },
});
```

### Environment-Specific Configuration

```typescript
// curisdb.config.ts
const env = process.env.NODE_ENV || 'development';

export default defineConfig({
  connection: {
    client: 'pg',
    connection:
      env === 'production'
        ? process.env.DATABASE_URL
        : {
            host: 'localhost',
            database: 'myapp_dev',
          },
  },
});
```

## See Also

- [Main README](../README.md) - Full ORM documentation
- [IMPLEMENTATION_STATUS](../IMPLEMENTATION_STATUS.md) - Feature completion status
- [ROADMAP](../ROADMAP.md) - Future plans
