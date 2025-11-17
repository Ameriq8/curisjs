# CLI Commands Reference

Complete reference for all CurisJS CLI commands.

## Global Commands

### `curis new`

Create a new CurisJS project.

**Syntax:**
```bash
curis new <project-name> [options]
```

**Options:**
- `-t, --template <name>` - Template to use (default, api, minimal)
- `-d, --db <type>` - Database type (sqlite, postgres, mysql)
- `-p, --package-manager <pm>` - Package manager (npm, pnpm, yarn, bun)
- `--no-git` - Skip git initialization
- `--no-install` - Skip dependency installation

**Examples:**
```bash
# Create a basic project
curis new my-app

# Create an API project with PostgreSQL
curis new my-api -t api -d postgres

# Create with custom package manager
curis new my-app -p bun

# Create without git
curis new my-app --no-git
```

### `curis dev`

Start the development server with hot reload.

**Syntax:**
```bash
curis dev [options]
```

**Options:**
- `-p, --port <number>` - Port number (default: 3000)
- `-h, --host <host>` - Host address (default: localhost)
- `-w, --watch` - Enable file watching (default: true)
- `--no-clear` - Don't clear console on restart

**Examples:**
```bash
# Start on default port
curis dev

# Start on custom port
curis dev -p 8080

# Start on all interfaces
curis dev -h 0.0.0.0
```

### `curis build`

Build the project for production.

**Syntax:**
```bash
curis build [options]
```

**Options:**
- `-o, --output <dir>` - Output directory (default: dist)
- `-t, --target <runtime>` - Target runtime (node, bun, deno, cloudflare, vercel)
- `--minify` - Minify output
- `--sourcemap` - Generate sourcemaps

**Examples:**
```bash
# Build for Node.js
curis build

# Build for Bun
curis build -t bun

# Build with minification
curis build --minify

# Custom output directory
curis build -o ./build
```

### `curis serve`

Serve the production build.

**Syntax:**
```bash
curis serve [options]
```

**Options:**
- `-p, --port <number>` - Port number (default: 3000)
- `-h, --host <host>` - Host address
- `-d, --dir <directory>` - Build directory (default: dist)

**Examples:**
```bash
# Serve production build
curis serve

# Serve on custom port
curis serve -p 8080

# Serve from custom directory
curis serve -d ./build
```

## Generator Commands

### `curis generate model`

Generate a model file.

**Syntax:**
```bash
curis generate model <name> [options]
curis g model <name> [options]
```

**Options:**
- `--table <name>` - Table name (default: pluralized model name)
- `--timestamps` - Include timestamps (default: true)
- `--soft-delete` - Enable soft deletes

**Examples:**
```bash
# Generate User model
curis g model User

# Generate with custom table name
curis g model User --table app_users

# Generate without timestamps
curis g model Log --no-timestamps
```

### `curis generate controller`

Generate a controller file.

**Syntax:**
```bash
curis generate controller <name> [options]
curis g controller <name> [options]
```

**Options:**
- `--resource` - Generate resource controller (CRUD methods)
- `--api` - Generate API controller (JSON responses)

**Examples:**
```bash
# Generate basic controller
curis g controller UserController

# Generate resource controller
curis g controller UserController --resource

# Generate API controller
curis g controller UserController --api
```

### `curis generate middleware`

Generate a middleware file.

**Syntax:**
```bash
curis generate middleware <name>
curis g middleware <name>
```

**Examples:**
```bash
# Generate auth middleware
curis g middleware auth

# Generate logging middleware
curis g middleware requestLogger
```

### `curis generate migration`

Generate a database migration.

**Syntax:**
```bash
curis generate migration <name>
curis g migration <name>
```

**Examples:**
```bash
# Generate migration
curis g migration CreateUsersTable

# Generate migration for adding column
curis g migration AddEmailToUsers
```

## Database Commands

### `curis db:migrate`

Run database migrations.

**Syntax:**
```bash
curis db:migrate [options]
```

**Options:**
- `--rollback` - Rollback last migration
- `--reset` - Reset all migrations
- `--seed` - Run seeders after migration
- `--step <n>` - Run/rollback specific number of migrations

**Examples:**
```bash
# Run all pending migrations
curis db:migrate

# Rollback last migration
curis db:migrate --rollback

# Rollback specific steps
curis db:migrate --rollback --step 2

# Reset and migrate
curis db:migrate --reset

# Migrate and seed
curis db:migrate --seed
```

### `curis db:seed`

Run database seeders.

**Syntax:**
```bash
curis db:seed [options]
```

**Options:**
- `-c, --class <name>` - Specific seeder class to run

**Examples:**
```bash
# Run all seeders
curis db:seed

# Run specific seeder
curis db:seed -c UserSeeder
```

### `curis db:reset`

Reset the database.

**Syntax:**
```bash
curis db:reset
```

### `curis db:fresh`

Drop all tables and re-run migrations.

**Syntax:**
```bash
curis db:fresh [options]
```

**Options:**
- `--seed` - Seed after fresh migration

**Examples:**
```bash
# Fresh migration
curis db:fresh

# Fresh migration with seeding
curis db:fresh --seed
```

## Utility Commands

### `curis info`

Display project information.

**Syntax:**
```bash
curis info
```

**Output:**
- CurisJS version
- Node.js version
- Package manager
- Runtime environment
- Installed packages

### `curis list`

List all available commands.

**Syntax:**
```bash
curis list
```

### `curis version`

Display CLI version.

**Syntax:**
```bash
curis version
curis -v
curis --version
```

### `curis help`

Display help for commands.

**Syntax:**
```bash
curis help [command]
curis <command> --help
```

**Examples:**
```bash
# General help
curis help

# Help for specific command
curis help generate
curis generate --help
```

## Configuration

### curis.config.ts

All commands respect the configuration file:

```typescript
import { defineConfig } from '@curisjs/cli';

export default defineConfig({
  server: {
    port: 3000,
    host: 'localhost',
  },
  build: {
    outDir: 'dist',
    target: 'node',
    minify: true,
  },
  database: {
    client: 'better-sqlite3',
    connection: {
      filename: './database.sqlite',
    },
  },
});
```

### Environment Variables

Commands also respect environment variables:

```bash
NODE_ENV=development
PORT=3000
HOST=localhost

DB_CLIENT=better-sqlite3
DB_FILENAME=./database.sqlite
```

## Exit Codes

- `0` - Success
- `1` - General error
- `2` - Invalid arguments
- `3` - Configuration error
- `4` - Database error

## Troubleshooting

### Command Not Found

If `curis` command is not found:

```bash
# Install globally
npm install -g @curisjs/cli

# Or use npx
npx @curisjs/cli <command>

# Or use package script
npm run curis <command>
```

### Permission Errors

On Unix systems, you may need to make scripts executable:

```bash
chmod +x node_modules/.bin/curis
```

### Port Already in Use

If port is in use:

```bash
# Use a different port
curis dev -p 3001

# Or kill the process using the port
lsof -ti:3000 | xargs kill
```

## Next Steps

- [CLI Overview](/cli/)
- [Code Generation](/cli/generation)
- [Getting Started](/getting-started)
