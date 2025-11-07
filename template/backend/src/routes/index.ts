/**
 * Route registration
 */

import type { App } from '@curisjs/core';
import { json } from '@curisjs/core';
import { registerTodoRoutes } from './todos.js';

export function registerRoutes(app: App): void {
  // Health check endpoint
  app.get('/health', () => {
    return json({
      success: true,
      message: 'API is running',
      timestamp: new Date().toISOString(),
    });
  });

  // API routes
  registerTodoRoutes(app);

  // 404 handler
  app.all('*', () => {
    return json(
      {
        success: false,
        error: 'Route not found',
      },
      { status: 404 }
    );
  });
}
