/**
 * Cloudflare Workers Example
 * Deploy with: wrangler deploy
 */

import { createApp, createHandler, json } from '../src/index';

const app = createApp();

app.get('/', (ctx) => {
  return json({
    message: 'Hello from Cloudflare Workers!',
    runtime: 'Cloudflare Workers',
    url: ctx.request.url,
  });
});

app.get('/users/:id', (ctx) => {
  return json({
    user: ctx.params.id,
    runtime: 'Cloudflare Workers',
  });
});

app.post('/data', async (ctx) => {
  const data = await ctx.json();
  return json({
    received: data,
    runtime: 'Cloudflare Workers',
  });
});

// Export handler for Cloudflare Workers
export default createHandler(app);
