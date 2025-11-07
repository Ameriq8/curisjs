/**
 * Node.js Server Example (Node 18+)
 * Run with: node --loader ts-node/esm node-server.ts
 * Or: tsx node-server.ts
 */

import { createApp, json } from '../src/index.js';

const app = createApp();

app.get('/', (ctx) => {
  return json({
    message: 'Hello from Node.js!',
    runtime: 'Node.js',
    version: process.version,
    url: ctx.request.url
  });
});

app.get('/users/:id', (ctx) => {
  return json({
    user: ctx.params.id,
    runtime: 'Node.js'
  });
});

app.post('/data', async (ctx) => {
  const data = await ctx.json();
  return json({
    received: data,
    runtime: 'Node.js'
  });
});

// Start server - auto-detects Node.js runtime
app.listen(3000);
