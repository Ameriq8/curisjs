/**
 * Bun Server Example
 * Run with: bun run bun-server.ts
 */

import { createApp, json } from '../src/index';

const app = createApp();

app.get('/', (ctx) => {
  return json({
    message: 'Hello from Bun!',
    runtime: 'Bun',
    url: ctx.request.url
  });
});

app.get('/users/:id', (ctx) => {
  return json({
    user: ctx.params.id,
    runtime: 'Bun'
  });
});

app.post('/data', async (ctx) => {
  const data = await ctx.json();
  return json({
    received: data,
    runtime: 'Bun'
  });
});

// Start server - auto-detects Bun runtime
app.listen(3000);
