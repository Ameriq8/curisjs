/**
 * Route registration
 */

import type { App } from '@curisjs/core';
import { registerTodoRoutes } from './todos.js';

export function registerRoutes(app: App): void {
  // Health check endpoint
  app.get('/health', () => {
    return new Response(
      JSON.stringify({
        success: true,
        message: 'API is running',
        timestamp: new Date().toISOString(),
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  });

  // API routes
  registerTodoRoutes(app);

  // 404 handler
  app.all('*', () => {
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Route not found',
      }),
      {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  });
}
