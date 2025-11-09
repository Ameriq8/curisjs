# CurisJS Backend API Template

A production-ready backend API template built with **CurisJS**, featuring a complete Todo CRUD application with clean architecture, type safety, and modern best practices.

**Runtime Agnostic**: Same code runs on Bun, Deno, and Node.js 18+ without any modifications!

## ✨ Features

- **� Runtime Agnostic**: Works on Bun, Deno, Node.js 18+ - write once, run anywhere
- **�🏗️ Clean Architecture**: Controller → Service → Repository pattern
- **🛡️ Type Safety**: Full TypeScript with strict mode
- **📦 Complete CRUD**: Todo List API with in-memory database
- **✅ Validation**: Built-in Zod-like schema validation
- **🔧 Development Ready**: Hot reload with `tsx watch` or native runtime watch
- **🚀 Production Ready**: Error handling, CORS, logging, timing
- **📊 RESTful API**: Proper HTTP methods and status codes
- **🎯 Query Filters**: Pagination, search, and filtering support
- **🔌 DB Ready**: Prepared for @curisjs/db integration

## 📋 Prerequisites

Choose your runtime (all supported!):

- **Bun** (Recommended - Fastest): [Install Bun](https://bun.sh)
- **Deno**: [Install Deno](https://deno.land)
- **Node.js 18+**: [Install Node.js](https://nodejs.org)

## 🚀 Quick Start

### Using Bun (Recommended)

```bash
# Install dependencies
bun install

# Development
bun run dev:bun

# Production
bun run build
bun run start:bun
```

### Using Deno

```bash
# No install needed! Run directly
deno run --allow-net --allow-read --allow-env --watch src/index.ts

# Or use the npm script
bun install  # Only for TypeScript definitions
bun run dev:deno
```

### Using Node.js 18+

```bash
# Install dependencies
npm install
# or
pnpm install

# Development
npm run dev

# Production
npm run build
npm start
```

### 2. Setup Environment (Optional)

```bash
cp .env.example .env
```

Edit `.env` if needed:

```env
NODE_ENV=development
APP_DEBUG=true
PORT=3000
DATABASE_PATH=./database.sqlite
```

### 3. Start Development Server

```bash
pnpm dev
```

The API will be available at `http://localhost:3000`

## 📚 API Endpoints

### Health Check

```http
GET /health
```

**Response:**

```json
{
  "success": true,
  "message": "API is running",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### List Todos

```http
GET /todos?completed=false&search=buy&limit=20&offset=0
```

**Query Parameters:**

- `completed` (boolean, optional): Filter by completion status
- `search` (string, optional): Search in title and description
- `limit` (number, optional): Items per page (default: 20, max: 100)
- `offset` (number, optional): Pagination offset (default: 0)

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "title": "Buy groceries",
      "description": "Milk, bread, eggs",
      "completed": false,
      "created_at": "2024-01-01T00:00:00.000Z",
      "updated_at": "2024-01-01T00:00:00.000Z"
    }
  ],
  "pagination": {
    "total": 1,
    "limit": 20,
    "offset": 0,
    "hasMore": false
  }
}
```

### Get Single Todo

```http
GET /todos/:id
```

**Response:**

```json
{
  "success": true,
  "data": {
    "id": 1,
    "title": "Buy groceries",
    "description": "Milk, bread, eggs",
    "completed": false,
    "created_at": "2024-01-01T00:00:00.000Z",
    "updated_at": "2024-01-01T00:00:00.000Z"
  }
}
```

### Create Todo

```http
POST /todos
Content-Type: application/json

{
  "title": "Buy groceries",
  "description": "Milk, bread, eggs",
  "completed": false
}
```

**Validation Rules:**

- `title`: Required, 1-200 characters
- `description`: Optional, max 1000 characters
- `completed`: Optional, boolean (default: false)

**Response (201):**

```json
{
  "success": true,
  "data": {
    "id": 1,
    "title": "Buy groceries",
    "description": "Milk, bread, eggs",
    "completed": false,
    "created_at": "2024-01-01T00:00:00.000Z",
    "updated_at": "2024-01-01T00:00:00.000Z"
  },
  "message": "Todo created successfully"
}
```

### Update Todo

```http
PUT /todos/:id
Content-Type: application/json

{
  "title": "Buy groceries and snacks",
  "completed": true
}
```

**Note:** All fields are optional in updates

**Response:**

```json
{
  "success": true,
  "data": {
    "id": 1,
    "title": "Buy groceries and snacks",
    "description": "Milk, bread, eggs",
    "completed": true,
    "created_at": "2024-01-01T00:00:00.000Z",
    "updated_at": "2024-01-01T00:10:00.000Z"
  },
  "message": "Todo updated successfully"
}
```

### Toggle Todo Status

```http
PATCH /todos/:id/toggle
```

**Response:**

```json
{
  "success": true,
  "data": {
    "id": 1,
    "title": "Buy groceries",
    "completed": true,
    "created_at": "2024-01-01T00:00:00.000Z",
    "updated_at": "2024-01-01T00:10:00.000Z"
  },
  "message": "Todo status toggled successfully"
}
```

### Delete Todo

```http
DELETE /todos/:id
```

**Response:**

```json
{
  "success": true,
  "message": "Todo deleted successfully"
}
```

## 📁 Project Structure

```
src/
├── app/
│   ├── controllers/       # HTTP request handlers
│   │   └── TodoController.ts
│   ├── services/          # Business logic layer
│   │   └── TodoService.ts
│   ├── repositories/      # Data access layer
│   │   └── TodoRepository.ts
│   ├── validators/        # Input validation schemas
│   │   └── TodoValidator.ts
│   └── models/           # TypeScript interfaces
│       └── Todo.ts
├── database/             # Database setup & connection
│   └── connection.ts
├── middleware/           # Custom middleware
│   ├── errorHandler.ts
│   └── timing.ts
├── routes/              # Route definitions
│   ├── index.ts
│   └── todos.ts
└── index.ts            # Application entry point
```

## 🏗️ Architecture

### Layered Architecture

The template follows a clean, layered architecture:

```
Controller → Service → Repository → Database
```

**Benefits:**

- **Separation of Concerns**: Each layer has a single responsibility
- **Testability**: Easy to mock and test each layer independently
- **Maintainability**: Changes in one layer don't affect others
- **Reusability**: Business logic can be shared across controllers

### Layer Responsibilities

1. **Controller**: Handle HTTP requests/responses, validation, formatting
2. **Service**: Business logic, orchestration, transactions
3. **Repository**: Data access, database queries
4. **Models**: Type definitions, interfaces

## 🛠️ Development

### Available Scripts

```bash
# Development with hot reload
pnpm dev

# Build for production
pnpm build

# Start production server
pnpm start

# Type checking
pnpm typecheck

# Linting
pnpm lint

# Format code
pnpm format

# Clean build directory
pnpm clean
```

### Adding a New Feature

Let's add a "User" feature as an example:

#### 1. Create Model

```typescript
// src/app/models/User.ts
export interface User {
  id: number;
  name: string;
  email: string;
  created_at: string;
}

export interface CreateUserInput {
  name: string;
  email: string;
}
```

#### 2. Create Validator

```typescript
// src/app/validators/UserValidator.ts
import { z } from '@curisjs/core';

export const createUserSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
});
```

#### 3. Create Repository

```typescript
// src/app/repositories/UserRepository.ts
import { db } from '../../database/connection.js';
import type { User, CreateUserInput } from '../models/User.js';

export class UserRepository {
  findAll(): User[] {
    return db.prepare('SELECT * FROM users').all() as User[];
  }

  findById(id: number): User | null {
    return db.prepare('SELECT * FROM users WHERE id = ?').get(id) as User | null;
  }

  create(input: CreateUserInput): User {
    const result = db
      .prepare('INSERT INTO users (name, email) VALUES (?, ?)')
      .run(input.name, input.email);

    return this.findById(result.lastInsertRowid as number)!;
  }
}
```

#### 4. Create Service

```typescript
// src/app/services/UserService.ts
import { UserRepository } from '../repositories/UserRepository.js';
import type { User, CreateUserInput } from '../models/User.js';

export class UserService {
  private repository = new UserRepository();

  async findAll(): Promise<User[]> {
    return this.repository.findAll();
  }

  async create(input: CreateUserInput): Promise<User> {
    // Add business logic here (e.g., check for duplicate email)
    return this.repository.create(input);
  }
}
```

#### 5. Create Controller

```typescript
// src/app/controllers/UserController.ts
import { json } from '@curisjs/core';
import type { Context } from '@curisjs/core';
import { UserService } from '../services/UserService.js';
import { createUserSchema } from '../validators/UserValidator.js';

export class UserController {
  private service = new UserService();

  async index(ctx: Context): Promise<Response> {
    const users = await this.service.findAll();
    return json({ success: true, data: users });
  }

  async create(ctx: Context): Promise<Response> {
    const result = await ctx.validate(createUserSchema);

    if (!result.success) {
      return json(
        {
          success: false,
          error: 'Validation failed',
          details: result.error.format(),
        },
        { status: 400 }
      );
    }

    const user = await this.service.create(result.data);
    return json({ success: true, data: user }, { status: 201 });
  }
}
```

#### 6. Register Routes

```typescript
// src/routes/users.ts
import type { App } from '@curisjs/core';
import { UserController } from '../app/controllers/UserController.js';

export function registerUserRoutes(app: App): void {
  const controller = new UserController();

  app.get('/users', (ctx) => controller.index(ctx));
  app.post('/users', (ctx) => controller.create(ctx));
}
```

```typescript
// src/routes/index.ts
import { registerUserRoutes } from './users.js';

export function registerRoutes(app: App): void {
  // ... existing routes
  registerUserRoutes(app);
}
```

## 🗄️ Database

### SQLite Setup

The template uses **better-sqlite3** for synchronous SQLite operations:

- Fast and efficient
- Type-safe with TypeScript
- No async/await overhead for simple queries
- Perfect for small to medium applications

### Migrations

For production apps, consider adding a migration system. Here's a simple approach:

```typescript
// src/database/migrations/001_create_users.ts
export function up(db: Database) {
  db.exec(`
    CREATE TABLE users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
}

export function down(db: Database) {
  db.exec('DROP TABLE users');
}
```

### Switching to PostgreSQL

To use PostgreSQL instead of SQLite:

1. Install dependencies:

```bash
pnpm add pg
pnpm add -D @types/pg
```

2. Update repository to use `pg`:

```typescript
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Use async queries
const result = await pool.query('SELECT * FROM todos');
```

## 🧪 Testing

Add tests using Vitest:

```bash
pnpm add -D vitest @vitest/ui
```

Example test:

```typescript
// src/app/services/TodoService.test.ts
import { describe, it, expect } from 'vitest';
import { TodoService } from './TodoService';

describe('TodoService', () => {
  it('should create a todo', async () => {
    const service = new TodoService();
    const todo = await service.create({
      title: 'Test todo',
      completed: false,
    });

    expect(todo).toHaveProperty('id');
    expect(todo.title).toBe('Test todo');
  });
});
```

## 🚀 Production Deployment

### Build for Production

```bash
pnpm build
```

### Environment Variables

Set these in production:

```env
NODE_ENV=production
APP_DEBUG=false
PORT=3000
DATABASE_PATH=/var/lib/app/database.sqlite
```

### Docker Support

Create `Dockerfile`:

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package.json pnpm-lock.yaml ./
RUN npm install -g pnpm && pnpm install --frozen-lockfile

COPY . .
RUN pnpm build

EXPOSE 3000

CMD ["node", "dist/index.js"]
```

Build and run:

```bash
docker build -t curis-backend .
docker run -p 3000:3000 curis-backend
```

## 🔧 Configuration

### CORS Configuration

Modify CORS settings in `src/index.ts`:

```typescript
app.use(
  cors({
    origin: ['https://yourdomain.com', 'https://app.yourdomain.com'],
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);
```

### Custom Middleware

Add middleware in `src/middleware/`:

```typescript
// src/middleware/auth.ts
import type { Middleware } from '@curisjs/core';

export function auth(): Middleware {
  return async (ctx, next) => {
    const token = ctx.header('Authorization');

    if (!token) {
      return new Response('Unauthorized', { status: 401 });
    }

    // Verify token...
    await next();
  };
}
```

Use in routes:

```typescript
import { auth } from '../middleware/auth.js';

app.use(auth());
```

## 📖 Learn More

- [CurisJS Documentation](https://github.com/curisjs/curisjs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Better SQLite3](https://github.com/WiseLibs/better-sqlite3)

## 📄 License

MIT

## 🤝 Contributing

Contributions are welcome! Please open an issue or submit a pull request.

## 💬 Support

- [GitHub Issues](https://github.com/curisjs/curisjs/issues)
- [Discussions](https://github.com/curisjs/curisjs/discussions)
