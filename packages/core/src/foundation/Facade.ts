/**
 * Facade - Laravel-like Facade Pattern
 * Provides static-like access to services in the container
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

import type { Container } from './Container';

let globalContainer: Container | null = null;

export abstract class Facade {
  /**
   * Set the global container instance
   */
  static setContainer(container: Container): void {
    globalContainer = container;
  }

  /**
   * Get the container instance
   */
  protected static getContainer(): Container {
    if (!globalContainer) {
      throw new Error('Container not set on Facade. Call Facade.setContainer() first.');
    }
    return globalContainer;
  }

  /**
   * Get the registered name of the component
   * Must be implemented by subclasses
   */
  protected static getFacadeAccessor(): string | symbol {
    throw new Error('Facade does not implement getFacadeAccessor method.');
  }

  /**
   * Resolve the facade root instance
   */
  public static resolveFacadeInstance(): any {
    const accessor = this.getFacadeAccessor();
    return this.getContainer().make(accessor);
  }

  /**
   * Handle dynamic static calls
   */
  static __call(method: string, ...args: any[]): any {
    const instance = this.resolveFacadeInstance();

    if (typeof instance[method] !== 'function') {
      throw new Error(`Method ${method} does not exist on ${String(this.getFacadeAccessor())}`);
    }

    return instance[method](...args);
  }
}

/**
 * Create a facade proxy
 */
export function createFacade<T extends typeof Facade>(FacadeClass: T): T {
  return new Proxy(FacadeClass, {
    get(target, prop) {
      // If the property exists on the facade class itself, return it
      if (prop in target) {
        return (target as any)[prop];
      }

      // Otherwise, resolve from the container and call the method
      return (...args: any[]) => {
        const instance = target.resolveFacadeInstance();
        const method = instance[prop];

        if (typeof method === 'function') {
          return method.apply(instance, args);
        }

        return method;
      };
    },
  }) as T;
}
