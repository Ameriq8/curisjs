/**
 * CurisJS Backend API
 * Production-ready backend template with Todo CRUD example
 */

import { createApp, cors, logger } from '@curisjs/core';
import { serve } from '@curisjs/core/node';
import { initializeDatabase, closeDatabase } from './database/connection.js';
import { registerRoutes } from './routes/index.js';
import { errorHandler } from './middleware/errorHandler.js';
import { requestTimer } from './middleware/timing.js';

// Initialize database
initializeDatabase();

// Create app instance
const app = createApp();

// Global middleware
app.use(errorHandler); // Error handling (should be first)
app.use(logger({ timing: true })); // Request logging
app.use(requestTimer); // Response timing
app.use(
  cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    credentials: false,
  })
); // CORS support

// Register all routes
registerRoutes(app);

// Start server
const port = parseInt(process.env.PORT || '3001', 10);

serve(app, {
  port,
  onListen: (port: number, hostname: string) => {
    console.log(`
🚀 Server running on http://${hostname}:${port}

📚 API Endpoints:
   GET    /health              - Health check
   GET    /todos               - List todos (with filters)
   GET    /todos/:id           - Get single todo
   POST   /todos               - Create todo
   PUT    /todos/:id           - Update todo
   PATCH  /todos/:id/toggle    - Toggle todo status
   DELETE /todos/:id           - Delete todo

🔧 Environment: ${process.env.NODE_ENV || 'development'}
`);
  },
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n👋 Shutting down gracefully...');
  closeDatabase();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n👋 Shutting down gracefully...');
  closeDatabase();
  process.exit(0);
});
