/**
 * Integration tests for CurisApp
 */

import { describe, it, expect } from 'vitest';
import type { Context, Next } from '../src/types';
import { createApp } from '../src/kernel';
import { json, text } from '../src/utils/response';

describe('CurisApp Integration', () => {
  it('should handle basic GET request', async () => {
    const app = createApp();

    app.get('/hello', () => text('Hello World'));

    const response = await app.fetch(new Request('http://localhost/hello'));
    const body = await response.text();

    expect(response.status).toBe(200);
    expect(body).toBe('Hello World');
  });

  it('should handle route params', async () => {
    const app = createApp();

    app.get('/users/:id', (ctx: Context) => json({ userId: ctx.params.id }));

    const response = await app.fetch(new Request('http://localhost/users/123'));
    const body = await response.json();

    expect(body).toEqual({ userId: '123' });
  });

  it('should execute middleware in order', async () => {
    const app = createApp();
    const order: number[] = [];

    app.use(async (ctx: Context, next: Next) => {
      order.push(1);
      await next();
      order.push(4);
    });

    app.use(async (ctx: Context, next: Next) => {
      order.push(2);
      await next();
      order.push(3);
    });

    app.get('/', () => {
      order.push(2.5);
      return text('OK');
    });

    await app.fetch(new Request('http://localhost/'));

    expect(order).toEqual([1, 2, 2.5, 3, 4]);
  });

  it('should handle middleware short-circuit', async () => {
    const app = createApp();
    let handlerCalled = false;

    app.use(() => {
      return new Response('Unauthorized', { status: 401 });
    });

    app.get('/', () => {
      handlerCalled = true;
      return text('OK');
    });

    const response = await app.fetch(new Request('http://localhost/'));

    expect(response.status).toBe(401);
    expect(handlerCalled).toBe(false);
  });

  it('should handle POST with JSON body', async () => {
    const app = createApp();

    app.post('/echo', async (ctx: Context) => {
      const data = await ctx.json();
      return json(data);
    });

    const response = await app.fetch(
      new Request('http://localhost/echo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: 'hello' }),
      })
    );

    const body = await response.json();
    expect(body).toEqual({ message: 'hello' });
  });

  it('should return 404 for unknown routes', async () => {
    const app = createApp();

    app.get('/exists', () => text('Found'));

    const response = await app.fetch(new Request('http://localhost/unknown'));

    expect(response.status).toBe(404);
  });

  it('should support custom 404 handler', async () => {
    const app = createApp({
      notFound: () => json({ error: 'Custom 404' }, { status: 404 }),
    });

    const response = await app.fetch(new Request('http://localhost/unknown'));
    const body = await response.json();

    expect(response.status).toBe(404);
    expect(body).toEqual({ error: 'Custom 404' });
  });

  it('should handle errors with custom handler', async () => {
    const app = createApp({
      onError: (error: Error) => json({ error: error.message }, { status: 500 }),
    });

    app.get('/error', () => {
      throw new Error('Test error');
    });

    const response = await app.fetch(new Request('http://localhost/error'));
    const body = await response.json();

    expect(response.status).toBe(500);
    expect(body).toEqual({ error: 'Test error' });
  });

  it('should support base path', async () => {
    const app = createApp({ basePath: '/api' });

    app.get('/users', () => json({ users: [] }));

    // Request to /api/users should match /users route
    const response = await app.fetch(new Request('http://localhost/api/users'));

    expect(response.status).toBe(200);

    const body = await response.json();
    expect(body).toEqual({ users: [] });
  });
});
