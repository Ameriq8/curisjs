# CLI API Reference

Complete API reference for `@curisjs/cli` package.

## Commands

### `curis new`

Create a new CurisJS project.

**Syntax:**
```bash
curis new <project-name> [options]
```

**Arguments:**
- `project-name` (required): Name of the project to create

**Options:**

| Option | Alias | Type | Default | Description |
|--------|-------|------|---------|-------------|
| `--template` | `-t` | string | `default` | Template to use (default, api, minimal) |
| `--database` | `-d` | string | `sqlite` | Database type (sqlite, postgres, mysql) |
| `--package-manager` | `-p` | string | auto-detect | Package manager (npm, pnpm, yarn, bun) |
| `--no-git` | | boolean | false | Skip git initialization |
| `--no-install` | | boolean | false | Skip dependency installation |

**Examples:**
```bash
# Create basic project
curis new my-app

# Create API project with PostgreSQL
curis new my-api --template api --database postgres

# Create with Bun package manager
curis new my-app -p bun

# Create without git
curis new my-app --no-git

# Short form
curis new my-app -t api -d postgres -p pnpm
```

**Exit Codes:**
- `0`: Success
- `1`: Project directory already exists
- `2`: Invalid template or database type

---

### `curis dev`

Start development server with hot reload.

**Syntax:**
```bash
curis dev [options]
```

**Options:**

| Option | Alias | Type | Default | Description |
|--------|-------|------|---------|-------------|
| `--port` | `-p` | number | 3000 | Port number |
| `--host` | `-h` | string | localhost | Host address |
| `--watch` | `-w` | boolean | true | Enable file watching |
| `--no-clear` | | boolean | false | Don't clear console on restart |

**Examples:**
```bash
# Start on default port
curis dev

# Custom port
curis dev -p 8080

# Listen on all interfaces
curis dev -h 0.0.0.0

# Disable watch mode
curis dev --no-watch
```

---

### `curis build`

Build project for production.

**Syntax:**
```bash
curis build [options]
```

**Options:**

| Option | Alias | Type | Default | Description |
|--------|-------|------|---------|-------------|
| `--output` | `-o` | string | dist | Output directory |
| `--target` | `-t` | string | node | Target runtime |
| `--minify` | | boolean | false | Minify output |
| `--sourcemap` | | boolean | false | Generate sourcemaps |

**Target Runtimes:**
- `node` - Node.js
- `bun` - Bun
- `deno` - Deno
- `cloudflare` - Cloudflare Workers
- `vercel` - Vercel Edge

**Examples:**
```bash
# Build for Node.js
curis build

# Build for Bun with minification
curis build -t bun --minify

# Custom output directory
curis build -o ./build

# Build with sourcemaps
curis build --sourcemap
```

---

### `curis serve`

Serve production build.

**Syntax:**
```bash
curis serve [options]
```

**Options:**

| Option | Alias | Type | Default | Description |
|--------|-------|------|---------|-------------|
| `--port` | `-p` | number | 3000 | Port number |
| `--host` | `-h` | string | localhost | Host address |
| `--dir` | `-d` | string | dist | Build directory |

**Examples:**
```bash
# Serve default build
curis serve

# Serve on custom port
curis serve -p 8080

# Serve custom directory
curis serve -d ./build
```

---

### `curis generate`

Generate code scaffolding.

**Alias:** `curis g`

**Syntax:**
```bash
curis generate <type> <name> [options]
curis g <type> <name> [options]
```

**Types:**
- `model` - Generate a model
- `controller` - Generate a controller
- `middleware` - Generate middleware
- `migration` - Generate a migration
- `validator` - Generate a validator
- `service` - Generate a service

---

#### `curis generate model`

Generate a model file.

**Syntax:**
```bash
curis g model <name> [options]
```

**Options:**

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `--table` | string | pluralized name | Table name |
| `--timestamps` | boolean | true | Include timestamps |
| `--soft-delete` | boolean | false | Enable soft deletes |

**Examples:**
```bash
# Basic model
curis g model User

# With custom table
curis g model User --table app_users

# With soft delete
curis g model Post --soft-delete

# Without timestamps
curis g model Log --no-timestamps
```

**Generated File:**
```
src/app/models/User.ts
```

---

#### `curis generate controller`

Generate a controller file.

**Syntax:**
```bash
curis g controller <name> [options]
```

**Options:**

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `--resource` | boolean | false | Generate resource controller (CRUD) |
| `--api` | boolean | false | Generate API controller (JSON) |

**Examples:**
```bash
# Basic controller
curis g controller UserController

# Resource controller
curis g controller UserController --resource

# API controller
curis g controller UserController --api
```

**Generated File:**
```
src/app/controllers/UserController.ts
```

---

#### `curis generate middleware`

Generate a middleware file.

**Syntax:**
```bash
curis g middleware <name>
```

**Examples:**
```bash
curis g middleware auth
curis g middleware rateLimit
```

**Generated File:**
```
src/app/middleware/auth.ts
```

---

#### `curis generate migration`

Generate a database migration.

**Syntax:**
```bash
curis g migration <name>
```

**Examples:**
```bash
curis g migration CreateUsersTable
curis g migration AddEmailToUsers
```

**Generated File:**
```
src/database/migrations/2024_11_17_100000_create_users_table.ts
```

---

#### `curis generate validator`

Generate a validator schema.

**Syntax:**
```bash
curis g validator <name>
```

**Examples:**
```bash
curis g validator UserValidator
curis g validator PostValidator
```

**Generated File:**
```
src/app/validators/UserValidator.ts
```

---

#### `curis generate service`

Generate a service class.

**Syntax:**
```bash
curis g service <name>
```

**Examples:**
```bash
curis g service EmailService
curis g service PaymentService
```

**Generated File:**
```
src/app/services/EmailService.ts
```

---

### `curis db:migrate`

Run database migrations.

**Syntax:**
```bash
curis db:migrate [options]
```

**Options:**

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `--rollback` | boolean | false | Rollback last migration |
| `--reset` | boolean | false | Reset all migrations |
| `--seed` | boolean | false | Run seeders after migration |
| `--step` | number | | Number of migrations to run/rollback |

**Examples:**
```bash
# Run all pending migrations
curis db:migrate

# Rollback last migration
curis db:migrate --rollback

# Rollback 2 migrations
curis db:migrate --rollback --step 2

# Reset and migrate
curis db:migrate --reset

# Migrate and seed
curis db:migrate --seed
```

---

### `curis db:seed`

Run database seeders.

**Syntax:**
```bash
curis db:seed [options]
```

**Options:**

| Option | Alias | Type | Description |
|--------|-------|------|-------------|
| `--class` | `-c` | string | Specific seeder class to run |

**Examples:**
```bash
# Run all seeders
curis db:seed

# Run specific seeder
curis db:seed -c UserSeeder
```

---

### `curis db:reset`

Reset the database.

**Syntax:**
```bash
curis db:reset
```

**Warning:** This will drop all tables and data.

---

### `curis db:fresh`

Drop all tables and re-run migrations.

**Syntax:**
```bash
curis db:fresh [options]
```

**Options:**

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `--seed` | boolean | false | Seed after fresh migration |

**Examples:**
```bash
# Fresh migration
curis db:fresh

# Fresh migration with seeding
curis db:fresh --seed
```

---

### `curis info`

Display project and system information.

**Syntax:**
```bash
curis info
```

**Output:**
```
CurisJS CLI Information
━━━━━━━━━━━━━━━━━━━━━━━
CurisJS Version:    0.1.0
CLI Version:        0.1.0
Node Version:       v20.10.0
Package Manager:    pnpm
OS:                 Linux
Architecture:       x64
Runtime:            Node.js
```

---

### `curis list`

List all available commands.

**Syntax:**
```bash
curis list
```

---

### `curis version`

Display CLI version.

**Syntax:**
```bash
curis version
curis -v
curis --version
```

---

### `curis help`

Display help information.

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

---

## Configuration

### `curis.config.ts`

Project configuration file.

**Location:** Project root

**Schema:**
```typescript
import { defineConfig } from '@curisjs/cli';

export default defineConfig({
  // Server configuration
  server: {
    port: number;
    host: string;
  },
  
  // Build configuration
  build: {
    outDir: string;
    target: 'node' | 'bun' | 'deno' | 'cloudflare' | 'vercel';
    minify: boolean;
    sourcemap: boolean;
  },
  
  // Database configuration
  database: {
    client: 'better-sqlite3' | 'pg' | 'mysql2';
    connection: {
      filename?: string;
      host?: string;
      port?: number;
      user?: string;
      password?: string;
      database?: string;
    };
    migrations: {
      directory: string;
    };
    seeds: {
      directory: string;
    };
  },
  
  // Generator configuration
  generators: {
    modelsDir: string;
    controllersDir: string;
    middlewareDir: string;
    servicesDir: string;
    validatorsDir: string;
  },
});
```

**Example:**
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
    migrations: {
      directory: './src/database/migrations',
    },
  },
  
  generators: {
    modelsDir: './src/app/models',
    controllersDir: './src/app/controllers',
    middlewareDir: './src/app/middleware',
    servicesDir: './src/app/services',
    validatorsDir: './src/app/validators',
  },
});
```

---

## Environment Variables

The CLI respects the following environment variables:

| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` | Environment mode | development |
| `PORT` | Server port | 3000 |
| `HOST` | Server host | localhost |
| `DATABASE_URL` | Database connection string | |
| `DB_CLIENT` | Database client | better-sqlite3 |

**Example `.env` file:**
```bash
NODE_ENV=development
PORT=3000
HOST=localhost

DB_CLIENT=better-sqlite3
DB_FILENAME=./database.sqlite

# Or PostgreSQL
# DATABASE_URL=postgresql://user:pass@localhost:5432/mydb
```

---

## Exit Codes

| Code | Description |
|------|-------------|
| 0 | Success |
| 1 | General error |
| 2 | Invalid arguments |
| 3 | Configuration error |
| 4 | Database error |
| 5 | File system error |

---

## Template Variables

When generating code, these variables are available:

| Variable | Description | Example |
|----------|-------------|---------|
| `{{name}}` | Resource name | User |
| `{{nameLowerCase}}` | Lowercase name | user |
| `{{namePlural}}` | Plural name | Users |
| `{{tableName}}` | Table name | users |
| `{{timestamp}}` | Current timestamp | 2024_11_17_100000 |

---

## See Also

- [CLI Overview](/cli/)
- [Commands Reference](/cli/commands)
- [Code Generation](/cli/generation)
- [Getting Started](/getting-started)
