/**
 * Todo routes
 */

import type { App, Context } from '@curisjs/core';
import { TodoController } from '../app/controllers/TodoController.js';

export function registerTodoRoutes(app: App): void {
  const controller = new TodoController();

  // RESTful API endpoints
  app.get('/todos', (ctx: Context) => controller.index(ctx));
  app.get('/todos/:id', (ctx: Context) => controller.show(ctx));
  app.post('/todos', (ctx: Context) => controller.create(ctx));
  app.put('/todos/:id', (ctx: Context) => controller.update(ctx));
  app.delete('/todos/:id', (ctx: Context) => controller.delete(ctx));

  // Additional endpoint for toggling completion
  app.patch('/todos/:id/toggle', (ctx: Context) => controller.toggle(ctx));
}
