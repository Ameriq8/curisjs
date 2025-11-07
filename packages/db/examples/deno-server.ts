/**
 * @curisjs/db - Deno Server Example
 *
 * Simple Todo API demonstrating @curisjs/db with Deno runtime
 *
 * Run: deno run --allow-net --allow-read --allow-write examples/deno-server.ts
 */

import { createApp, json } from '@curisjs/core';
import { Model, schema, createDatabase, databaseMiddleware } from '../src/index.ts';

// Define Todo schema
const todoSchema = schema.define('todos', {
  id: schema.integer().primaryKey().autoIncrement(),
  title: schema.string().length(255).notNullable(),
  completed: schema.boolean().default(false).notNullable(),
}, {
  timestamps: true,
});

// Define Todo model
class Todo extends Model {
  static tableName = 'todos';
  static schema = todoSchema;

  id!: number;
  title!: string;
  completed!: boolean;
  createdAt!: Date;
  updatedAt!: Date;
}

// Initialize database (SQLite)
const db = createDatabase({
  client: 'better-sqlite3',
  connection: {
    filename: ':memory:', // In-memory database for this example
  },
  useNullAsDefault: true,
});

// Create table
await db.schema.createTable('todos', (table) => {
  table.increments('id').primary();
  table.string('title', 255).notNullable();
  table.boolean('completed').defaultTo(false).notNullable();
  table.timestamps(true, true);
});

// Seed some data
await Todo.create({ title: 'Learn CurisJS', completed: false });
await Todo.create({ title: 'Build awesome apps', completed: false });

// Create app
const app = createApp();

// Add database middleware (pass empty options to use default connection)
app.use(databaseMiddleware());

// Routes
app.get('/', (ctx) => {
  return json({
    message: 'Todo API with @curisjs/db',
    endpoints: {
      'GET /todos': 'List all todos',
      'POST /todos': 'Create todo',
      'PUT /todos/:id': 'Update todo',
      'DELETE /todos/:id': 'Delete todo',
    },
  });
});

app.get('/todos', async (ctx) => {
  const todos = await Todo.findMany({
    orderBy: { createdAt: 'desc' },
  });
  return json(todos);
});

app.post('/todos', async (ctx) => {
  const data = await ctx.json();
  const todo = await Todo.create(data as any);
  return json(todo, { status: 201 });
});

app.put('/todos/:id', async (ctx) => {
  const id = parseInt(ctx.params.id!);
  await Todo.update({ where: { id } }, await ctx.json() as any);
  const todo = await Todo.find(id);
  return json(todo);
});

app.delete('/todos/:id', async (ctx) => {
  const id = parseInt(ctx.params.id!);
  await Todo.delete({ where: { id } });
  return json({ message: 'Todo deleted' });
});

// Start server
app.listen(3000, () => {
  console.log('🚀 Deno server running on http://localhost:3000');
});
