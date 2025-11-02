/**
 * Unit tests for Context
 */

import { describe, it, expect } from 'vitest';
import { ContextImpl } from '../src/context';

describe('Context', () => {
  it('should parse JSON body', async () => {
    const request = new Request('http://localhost/api', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Alice' }),
    });

    const ctx = new ContextImpl(request);
    const data = await ctx.json();

    expect(data).toEqual({ name: 'Alice' });
  });

  it('should parse text body', async () => {
    const request = new Request('http://localhost/api', {
      method: 'POST',
      body: 'Hello World',
    });

    const ctx = new ContextImpl(request);
    const text = await ctx.text();

    expect(text).toBe('Hello World');
  });

  it('should get headers', () => {
    const request = new Request('http://localhost/api', {
      headers: { 'X-Custom': 'value' },
    });

    const ctx = new ContextImpl(request);

    expect(ctx.header('X-Custom')).toBe('value');
    expect(ctx.header('X-Missing')).toBeNull();
  });

  it('should get query parameters', () => {
    const request = new Request('http://localhost/api?foo=bar&baz=qux');

    const ctx = new ContextImpl(request);

    expect(ctx.query('foo')).toBe('bar');
    expect(ctx.query('baz')).toBe('qux');
    expect(ctx.query('missing')).toBeNull();
  });

  it('should get all queries with duplicates', () => {
    const request = new Request('http://localhost/api?tag=a&tag=b&single=value');

    const ctx = new ContextImpl(request);
    const queries = ctx.queries();

    expect(queries.tag).toEqual(['a', 'b']);
    expect(queries.single).toBe('value');
  });

  it('should maintain route params', () => {
    const request = new Request('http://localhost/users/123');

    const ctx = new ContextImpl(request);
    ctx.params = { id: '123' };

    expect(ctx.params.id).toBe('123');
  });

  it('should maintain state', () => {
    const request = new Request('http://localhost/');

    const ctx = new ContextImpl(request);
    ctx.state.user = { id: 1, name: 'Alice' };

    expect(ctx.state.user).toEqual({ id: 1, name: 'Alice' });
  });
});
