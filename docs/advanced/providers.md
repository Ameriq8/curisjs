# Service Providers

Service Providers are the central place to configure and bootstrap your application.

::: warning Work in Progress
This feature is currently under development. Documentation will be available soon.
:::

## Overview

Service Providers are the primary mechanism for organizing and bootstrapping your application's services. They allow you to:

- Register services in the container
- Bootstrap application components
- Configure third-party packages
- Set up middleware
- Define route bindings

## Basic Structure

```typescript
import { ServiceProvider } from '@curisjs/core';

export class AppServiceProvider extends ServiceProvider {
  /**
   * Register services in the container
   */
  register() {
    this.app.bind('UserRepository', UserRepository);
    this.app.singleton('Cache', RedisCache);
  }
  
  /**
   * Bootstrap application services
   */
  boot() {
    // Set up event listeners
    // Configure middleware
    // Load routes
  }
}
```

## Registering Providers

```typescript
import { Application } from '@curisjs/core';
import { AppServiceProvider } from './providers/AppServiceProvider';

const app = new Application();

// Register service provider
app.register(AppServiceProvider);
```

## Built-in Providers

CurisJS includes several built-in service providers:

- **RouteServiceProvider** - Registers routes
- **MiddlewareServiceProvider** - Registers middleware
- **DatabaseServiceProvider** - Configures database
- **ConfigServiceProvider** - Loads configuration

## Creating Custom Providers

```typescript
export class EmailServiceProvider extends ServiceProvider {
  register() {
    this.app.singleton('mailer', () => {
      return new Mailer({
        driver: this.app.config.get('mail.driver'),
        from: this.app.config.get('mail.from'),
      });
    });
  }
  
  boot() {
    // Bootstrap email templates
    // Set up event listeners
  }
}
```

## Deferred Providers

For performance, you can defer provider loading:

```typescript
export class HeavyServiceProvider extends ServiceProvider {
  defer = true;
  
  provides() {
    return ['heavy.service'];
  }
  
  register() {
    this.app.singleton('heavy.service', HeavyService);
  }
}
```

## Coming Soon

Full documentation will include:

- Provider lifecycle hooks
- Deferred provider loading
- Provider dependencies
- Publishing provider assets
- Testing service providers
- Best practices

## Related

- [Service Container](/advanced/container)
- [Application](/core/application)
- [Configuration](/core/configuration)
