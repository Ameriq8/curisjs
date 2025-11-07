/**
 * CurisJS Backend API
 * Production-ready backend template with Todo CRUD example
 * Runtime-agnostic: Works on Bun, Deno, Node.js 18+
 */

import { createApp, cors, logger } from '@curisjs/core';
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

// Start server (runtime-agnostic - auto-detects Bun, Deno, Node.js)
const port = parseInt(process.env.PORT || '3001', 10);

app.listen(port, (p) => {
  console.log(`
🚀 Server running on http://localhost:${p}

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
});

// Graceful shutdown
const shutdown = async () => {
  console.log('\n👋 Shutting down gracefully...');
  closeDatabase();
  process.exit(0);
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
