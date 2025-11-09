/**
 * Deno Server Example
 * Run with: deno run --allow-net deno-server.ts
 */

import { createApp, json } from '../src/index.ts';

const app = createApp();

app.get('/', (ctx) => {
  return json({
    message: 'Hello from Deno!',
    runtime: 'Deno',
    url: ctx.request.url,
  });
});

app.get('/users/:id', (ctx) => {
  return json({
    user: ctx.params.id,
    runtime: 'Deno',
  });
});

app.post('/data', async (ctx) => {
  const data = await ctx.json();
  return json({
    received: data,
    runtime: 'Deno',
  });
});

// Start server - auto-detects Deno runtime
app.listen(3000);
