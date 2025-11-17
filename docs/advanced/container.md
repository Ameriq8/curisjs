# Service Container

The Service Container is CurisJS's powerful dependency injection container.

::: warning Work in Progress
This feature is currently under development. Documentation will be available soon.
:::

## Overview

The Service Container (IoC Container) is a powerful tool for managing class dependencies and performing dependency injection. It allows you to:

- Bind classes and interfaces
- Resolve dependencies automatically
- Manage singletons
- Create scoped instances
- Use contextual binding

## Basic Usage

```typescript
import { Container } from '@curisjs/core';

// Create container
const container = new Container();

// Bind a service
container.bind('UserService', UserService);

// Resolve a service
const userService = container.make('UserService');
```

## Binding

### Simple Binding

```typescript
container.bind('logger', Logger);
```

### Singleton Binding

```typescript
container.singleton('database', Database);
```

### Instance Binding

```typescript
const config = { apiKey: 'secret' };
container.instance('config', config);
```

## Auto-Resolution

The container can automatically resolve dependencies:

```typescript
class UserController {
  constructor(
    private userService: UserService,
    private logger: Logger
  ) {}
}

// Container will auto-inject dependencies
const controller = container.make(UserController);
```

## Coming Soon

Full documentation will include:

- Advanced binding techniques
- Contextual binding
- Method injection
- Container events
- Service providers integration
- Best practices

## Related

- [Service Providers](/advanced/providers)
- [Facades](/advanced/facades)
- [Application](/core/application)
