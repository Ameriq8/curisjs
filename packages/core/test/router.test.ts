/**
 * Router tests
 */

import { describe, it, expect } from 'vitest';
import { Router } from '../src/router';

describe('Router', () => {
  it('should match static routes', () => {
    const router = new Router();
    const handler = () => new Response('OK');

    router.add('GET', '/users', handler);

    const match = router.find('GET', '/users');
    expect(match).toBeDefined();
    expect(match?.handler).toBe(handler);
    expect(match?.params).toEqual({});
  });

  it('should match param routes', () => {
    const router = new Router();
    const handler = () => new Response('OK');

    router.add('GET', '/users/:id', handler);

    const match = router.find('GET', '/users/123');
    expect(match).toBeDefined();
    expect(match?.handler).toBe(handler);
    expect(match?.params).toEqual({ id: '123' });
  });

  it('should match multiple params', () => {
    const router = new Router();
    const handler = () => new Response('OK');

    router.add('GET', '/users/:userId/posts/:postId', handler);

    const match = router.find('GET', '/users/123/posts/456');
    expect(match).toBeDefined();
    expect(match?.params).toEqual({ userId: '123', postId: '456' });
  });

  it('should match wildcard routes', () => {
    const router = new Router();
    const handler = () => new Response('OK');

    router.add('GET', '/files/*path', handler);

    const match = router.find('GET', '/files/docs/readme.md');
    expect(match).toBeDefined();
    expect(match?.params).toEqual({ path: 'docs/readme.md' });
  });

  it('should prioritize static over param routes', () => {
    const router = new Router();
    const staticHandler = () => new Response('Static');
    const paramHandler = () => new Response('Param');

    router.add('GET', '/users/:id', paramHandler);
    router.add('GET', '/users/me', staticHandler);

    const match1 = router.find('GET', '/users/me');
    expect(match1?.handler).toBe(staticHandler);

    const match2 = router.find('GET', '/users/123');
    expect(match2?.handler).toBe(paramHandler);
  });

  it('should return null for non-matching routes', () => {
    const router = new Router();
    const handler = () => new Response('OK');

    router.add('GET', '/users', handler);

    const match = router.find('GET', '/posts');
    expect(match).toBeNull();
  });

  it('should distinguish between methods', () => {
    const router = new Router();
    const getHandler = () => new Response('GET');
    const postHandler = () => new Response('POST');

    router.add('GET', '/users', getHandler);
    router.add('POST', '/users', postHandler);

    const getMatch = router.find('GET', '/users');
    expect(getMatch?.handler).toBe(getHandler);

    const postMatch = router.find('POST', '/users');
    expect(postMatch?.handler).toBe(postHandler);
  });

  it('should handle root path', () => {
    const router = new Router();
    const handler = () => new Response('Root');

    router.add('GET', '/', handler);

    const match = router.find('GET', '/');
    expect(match).toBeDefined();
    expect(match?.handler).toBe(handler);
  });

  it('should handle trailing slashes', () => {
    const router = new Router();
    const handler = () => new Response('OK');

    router.add('GET', '/users/', handler);

    const match = router.find('GET', '/users');
    expect(match).toBeDefined();
  });
});
