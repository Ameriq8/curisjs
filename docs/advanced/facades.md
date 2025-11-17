# Facades

Facades provide a static interface to classes in the service container.

::: warning Work in Progress
This feature is currently under development. Documentation will be available soon.
:::

## Overview

Facades provide a simple, memorable syntax for using services from the container. They offer:

- Clean, expressive syntax
- Easy testing and mocking
- IDE autocomplete support
- Consistent API across the framework

## Basic Usage

```typescript
import { Route, Config, DB } from '@curisjs/core';

// Using facades
Route.get('/users', async () => {
  const users = await DB.table('users').get();
  const appName = Config.get('app.name');
  
  return { users, appName };
});
```

## How Facades Work

Behind the scenes, facades:

1. Resolve the underlying service from the container
2. Proxy method calls to the resolved instance
3. Provide type safety through TypeScript

```typescript
// This facade call
Route.get('/users', handler);

// Is equivalent to
app.make('router').get('/users', handler);
```

## Built-in Facades

CurisJS includes several built-in facades:

### Route

```typescript
import { Route } from '@curisjs/core';

Route.get('/users', handler);
Route.post('/users', handler);
Route.group({ prefix: '/api' }, () => {
  Route.resource('/posts', PostController);
});
```

### Config

```typescript
import { Config } from '@curisjs/core';

const dbHost = Config.get('database.host');
const appName = Config.get('app.name', 'CurisJS');
```

### DB

```typescript
import { DB } from '@curisjs/db';

const users = await DB.table('users').where('active', true).get();
const user = await DB.table('users').find(1);
```

### Cache

```typescript
import { Cache } from '@curisjs/core';

await Cache.put('key', 'value', 3600);
const value = await Cache.get('key');
await Cache.forget('key');
```

## Creating Custom Facades

```typescript
import { Facade } from '@curisjs/core';

class Logger extends Facade {
  static getAccessor() {
    return 'logger';
  }
}

export { Logger };
```

Usage:

```typescript
import { Logger } from './facades/Logger';

Logger.info('User logged in', { userId: 1 });
Logger.error('Failed to process payment', { error });
```

## Testing with Facades

Facades are easy to mock in tests:

```typescript
import { describe, it, expect, vi } from 'vitest';
import { DB } from '@curisjs/db';

describe('UserService', () => {
  it('should fetch users', async () => {
    // Mock the facade
    const mockGet = vi.fn().mockResolvedValue([{ id: 1 }]);
    vi.spyOn(DB, 'table').mockReturnValue({
      get: mockGet,
    });
    
    const users = await UserService.getAll();
    
    expect(mockGet).toHaveBeenCalled();
    expect(users).toHaveLength(1);
  });
});
```

## Facade vs. Dependency Injection

Both approaches have their place:

**Use Facades when:**
- Writing quick scripts or prototypes
- Working in routes or controllers
- You want concise, readable code

**Use Dependency Injection when:**
- Writing testable service classes
- Building reusable packages
- You need explicit dependencies

Example combining both:

```typescript
// Controller using facades (concise)
export class UserController {
  static async index() {
    return DB.table('users').get();
  }
}

// Service using DI (testable)
export class UserService {
  constructor(
    private db: Database,
    private cache: Cache
  ) {}
  
  async getUsers() {
    const cached = await this.cache.get('users');
    if (cached) return cached;
    
    const users = await this.db.table('users').get();
    await this.cache.put('users', users, 3600);
    
    return users;
  }
}
```

## Coming Soon

Full documentation will include:

- Advanced facade patterns
- Real-time facades
- Facade mocking strategies
- Performance considerations
- Creating facade packages
- Best practices

## Related

- [Service Container](/advanced/container)
- [Service Providers](/advanced/providers)
- [Testing](/advanced/testing)
