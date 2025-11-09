/**
 * Vercel Edge Functions Example
 * Deploy with: vercel deploy
 */

import { createApp, createHandler, json } from '../src/index';

const app = createApp();

app.get('/', (ctx) => {
  return json({
    message: 'Hello from Vercel Edge!',
    runtime: 'Vercel Edge',
    url: ctx.request.url,
  });
});

app.get('/api/users/:id', (ctx) => {
  return json({
    user: ctx.params.id,
    runtime: 'Vercel Edge',
  });
});

app.post('/api/data', async (ctx) => {
  const data = await ctx.json();
  return json({
    received: data,
    runtime: 'Vercel Edge',
  });
});

// Export handler for Vercel Edge
export default createHandler(app);
