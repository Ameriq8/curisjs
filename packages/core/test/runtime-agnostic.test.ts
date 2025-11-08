/**
 * Universal Server Test
 * This file tests that the same code works across all runtimes
 */

import { createApp, createHandler, json, text, html } from '../src/index';
import { describe, it, expect } from 'vitest';

describe('Runtime Agnostic Features', () => {
  it('should create app without errors', () => {
    const app = createApp();
    expect(app).toBeDefined();
    expect(typeof app.fetch).toBe('function');
    expect(typeof app.listen).toBe('function');
  });

  it('should handle GET request', async () => {
    const app = createApp();

    app.get('/test', (ctx) => {
      return json({ message: 'Hello World!' });
    });

    const request = new Request('http://localhost/test');
    const response = await app.fetch(request);

    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data).toEqual({ message: 'Hello World!' });
  });

  it('should handle route parameters', async () => {
    const app = createApp();

    app.get('/users/:id', (ctx) => {
      return json({ userId: ctx.params.id });
    });

    const request = new Request('http://localhost/users/123');
    const response = await app.fetch(request);

    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data).toEqual({ userId: '123' });
  });

  it('should handle POST with JSON body', async () => {
    const app = createApp();

    app.post('/users', async (ctx) => {
      const data = await ctx.json();
      return json({ received: data }, { status: 201 });
    });

    const request = new Request('http://localhost/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'John', age: 30 }),
    });

    const response = await app.fetch(request);

    expect(response.status).toBe(201);
    const data = await response.json();
    expect(data.received).toEqual({ name: 'John', age: 30 });
  });

  it('should handle middleware', async () => {
    const app = createApp();
    let middlewareCalled = false;

    app.use(async (ctx, next) => {
      middlewareCalled = true;
      await next();
    });

    app.get('/test', (ctx) => json({ ok: true }));

    const request = new Request('http://localhost/test');
    await app.fetch(request);

    expect(middlewareCalled).toBe(true);
  });

  it('should handle 404', async () => {
    const app = createApp();

    app.get('/exists', (ctx) => json({ ok: true }));

    const request = new Request('http://localhost/not-found');
    const response = await app.fetch(request);

    expect(response.status).toBe(404);
  });

  it('should handle custom error handler', async () => {
    const app = createApp({
      onError: (error, ctx) => {
        return json({ error: error.message }, { status: 500 });
      },
    });

    app.get('/error', (ctx) => {
      throw new Error('Test error');
    });

    const request = new Request('http://localhost/error');
    const response = await app.fetch(request);

    expect(response.status).toBe(500);
    const data = await response.json();
    expect(data.error).toBe('Test error');
  });

  it('should support response helpers', async () => {
    const app = createApp();

    app.get('/json', (ctx) => json({ type: 'json' }));
    app.get('/text', (ctx) => text('plain text'));
    app.get('/html', (ctx) => html('<h1>HTML</h1>'));

    // Test JSON
    const jsonResponse = await app.fetch(new Request('http://localhost/json'));
    expect(jsonResponse.headers.get('Content-Type')).toContain('application/json');

    // Test Text
    const textResponse = await app.fetch(new Request('http://localhost/text'));
    expect(textResponse.headers.get('Content-Type')).toContain('text/plain');

    // Test HTML
    const htmlResponse = await app.fetch(new Request('http://localhost/html'));
    expect(htmlResponse.headers.get('Content-Type')).toContain('text/html');
  });

  it('should handle query parameters', async () => {
    const app = createApp();

    app.get('/search', (ctx) => {
      const q = ctx.query('q');
      const page = ctx.query('page');
      return json({ query: q, page });
    });

    const request = new Request('http://localhost/search?q=test&page=2');
    const response = await app.fetch(request);

    const data = await response.json();
    expect(data).toEqual({ query: 'test', page: '2' });
  });

  it('should handle request headers', async () => {
    const app = createApp();

    app.get('/headers', (ctx) => {
      const auth = ctx.header('authorization');
      return json({ auth });
    });

    const request = new Request('http://localhost/headers', {
      headers: { Authorization: 'Bearer token123' },
    });

    const response = await app.fetch(request);
    const data = await response.json();
    expect(data.auth).toBe('Bearer token123');
  });

  it('should support multiple HTTP methods on same path', async () => {
    const app = createApp();

    app.get('/resource', (ctx) => json({ method: 'GET' }));
    app.post('/resource', (ctx) => json({ method: 'POST' }));
    app.put('/resource', (ctx) => json({ method: 'PUT' }));
    app.delete('/resource', (ctx) => json({ method: 'DELETE' }));

    // Test GET
    const getRes = await app.fetch(new Request('http://localhost/resource'));
    const getData = await getRes.json();
    expect(getData.method).toBe('GET');

    // Test POST
    const postRes = await app.fetch(new Request('http://localhost/resource', { method: 'POST' }));
    const postData = await postRes.json();
    expect(postData.method).toBe('POST');

    // Test PUT
    const putRes = await app.fetch(new Request('http://localhost/resource', { method: 'PUT' }));
    const putData = await putRes.json();
    expect(putData.method).toBe('PUT');

    // Test DELETE
    const delRes = await app.fetch(new Request('http://localhost/resource', { method: 'DELETE' }));
    const delData = await delRes.json();
    expect(delData.method).toBe('DELETE');
  });
});

describe('createHandler for Edge Runtimes', () => {
  it('should create handler with fetch method', async () => {
    const app = createApp();
    app.get('/', (ctx) => json({ edge: true }));

    const handler = createHandler(app);

    expect(handler).toBeDefined();
    expect(typeof handler.fetch).toBe('function');

    const request = new Request('http://localhost/');
    const response = await handler.fetch(request);

    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.edge).toBe(true);
  });

  it('should pass environment to handler', async () => {
    const app = createApp();

    app.get('/', (ctx) => {
      return json({ apiKey: ctx.env.API_KEY });
    });

    const handler = createHandler(app);
    const request = new Request('http://localhost/');
    const env = { API_KEY: 'secret123' };
    const response = await handler.fetch(request, env);

    const data = await response.json();
    expect(data.apiKey).toBe('secret123');
  });
});
