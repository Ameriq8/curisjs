# Testing

Learn how to test your CurisJS applications effectively.

::: warning Work in Progress
This feature is currently under development. Documentation will be available soon.
:::

## Overview

CurisJS provides excellent testing support with:

- Built-in test helpers
- Request/response testing utilities
- Database testing utilities
- Easy mocking and stubbing
- Integration with Vitest, Jest, or Node's test runner

## Quick Start

```typescript
import { describe, it, expect } from 'vitest';
import { Application } from '@curisjs/core';

describe('Application', () => {
  it('should handle GET requests', async () => {
    const app = new Application();
    
    app.get('/hello', (ctx) => {
      return ctx.json({ message: 'Hello World' });
    });
    
    const response = await app.handle(
      new Request('http://localhost/hello')
    );
    
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data).toEqual({ message: 'Hello World' });
  });
});
```

## Testing Routes

```typescript
import { describe, it, expect } from 'vitest';
import { testRequest } from '@curisjs/testing';
import { app } from '../src/app';

describe('User Routes', () => {
  it('should list users', async () => {
    const response = await testRequest(app).get('/users');
    
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('users');
  });
  
  it('should create user', async () => {
    const response = await testRequest(app)
      .post('/users')
      .send({ name: 'John', email: 'john@example.com' });
    
    expect(response.status).toBe(201);
    expect(response.body.user).toHaveProperty('id');
  });
  
  it('should validate input', async () => {
    const response = await testRequest(app)
      .post('/users')
      .send({ name: '' });
    
    expect(response.status).toBe(422);
    expect(response.body).toHaveProperty('errors');
  });
});
```

## Testing with Database

```typescript
import { describe, it, beforeEach, afterEach } from 'vitest';
import { db } from '@curisjs/db';

describe('UserService', () => {
  beforeEach(async () => {
    // Run migrations
    await db.migrate.latest();
  });
  
  afterEach(async () => {
    // Rollback migrations
    await db.migrate.rollback();
  });
  
  it('should create user', async () => {
    const user = await UserService.create({
      name: 'John',
      email: 'john@example.com',
    });
    
    expect(user.id).toBeDefined();
    expect(user.name).toBe('John');
  });
});
```

## Mocking Dependencies

```typescript
import { describe, it, vi } from 'vitest';
import { UserService } from '../src/services/UserService';

describe('UserService', () => {
  it('should send welcome email', async () => {
    // Mock email service
    const sendEmail = vi.fn();
    const emailService = { send: sendEmail };
    
    const userService = new UserService(emailService);
    await userService.createUser({
      name: 'John',
      email: 'john@example.com',
    });
    
    expect(sendEmail).toHaveBeenCalledWith(
      'john@example.com',
      'Welcome',
      expect.any(String)
    );
  });
});
```

## Test Helpers

```typescript
// Create test app
import { createTestApp } from '@curisjs/testing';

const app = createTestApp({
  // Test-specific configuration
});

// Make authenticated request
const response = await testRequest(app)
  .get('/profile')
  .auth('token', { type: 'bearer' });

// Set headers
const response = await testRequest(app)
  .post('/api/users')
  .set('Content-Type', 'application/json')
  .send({ name: 'John' });

// Test file upload
const response = await testRequest(app)
  .post('/upload')
  .attach('file', './test.jpg');
```

## Coming Soon

Full documentation will include:

- Unit testing strategies
- Integration testing
- E2E testing
- Database testing utilities
- Mock helpers
- Test coverage
- CI/CD integration
- Performance testing
- Security testing
- Best practices

## Related

- [Service Container](/advanced/container)
- [Facades](/advanced/facades)
- [Database Models](/db/models)
