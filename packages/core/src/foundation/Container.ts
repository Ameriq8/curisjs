/**
 * Service Container - Laravel-like IoC Container
 * Provides dependency injection, service binding, and automatic resolution
 */

export type Constructor<T = unknown> = new (...args: unknown[]) => T;
export type Factory<T = unknown> = (container: Container) => T;
export type Binding<T = unknown> = Constructor<T> | Factory<T>;

interface ServiceBinding {
  binding: Binding;
  singleton: boolean;
  instance?: unknown;
}

export class Container {
  private bindings = new Map<string | symbol, ServiceBinding>();
  private aliases = new Map<string, string | symbol>();
  private resolvedSet = new Set<string | symbol>();

  /**
   * Bind a service to the container
   */
  bind<T>(abstract: string | symbol, concrete?: Binding<T>, singleton = false): this {
    const binding: ServiceBinding = {
      binding: concrete || (abstract as any),
      singleton,
    };

    this.bindings.set(abstract, binding);
    this.resolvedSet.delete(abstract);

    return this;
  }

  /**
   * Bind a singleton service
   */
  singleton<T>(abstract: string | symbol, concrete?: Binding<T>): this {
    return this.bind(abstract, concrete, true);
  }

  /**
   * Register an existing instance as a singleton
   */
  instance<T>(abstract: string | symbol, instance: T): this {
    const binding: ServiceBinding = {
      binding: () => instance,
      singleton: true,
      instance,
    };

    this.bindings.set(abstract, binding);
    this.resolvedSet.add(abstract);

    return this;
  }

  /**
   * Resolve a service from the container
   */
  make<T>(abstract: string | symbol): T {
    // Check for alias
    const key = this.aliases.get(abstract as string) || abstract;

    // Get binding
    const binding = this.bindings.get(key);

    if (!binding) {
      // Try to auto-resolve if it's a constructor
      if (typeof abstract === 'function') {
        return this.build(abstract as Constructor<T>);
      }
      throw new Error(`Target [${String(abstract)}] is not bound in the container.`);
    }

    // Return singleton instance if already resolved
    if (binding.singleton && binding.instance !== undefined) {
      return binding.instance as T;
    }

    // Build the instance
    const instance = this.build(binding.binding);

    // Store singleton instance
    if (binding.singleton) {
      binding.instance = instance;
      this.resolvedSet.add(key);
    }

    return instance as T;
  }

  /**
   * Build a concrete instance
   */
  private build<T>(concrete: Binding<T>): T {
    // If it's a factory function, call it
    if (typeof concrete === 'function' && concrete.length > 0 && !this.isConstructor(concrete)) {
      return (concrete as Factory<T>)(this);
    }

    // If it's a constructor, instantiate it
    if (this.isConstructor(concrete)) {
      return new (concrete as Constructor<T>)();
    }

    // Otherwise, just call the function
    return (concrete as any)(this);
  }

  /**
   * Check if a value is a constructor
   */
  private isConstructor(fn: any): boolean {
    try {
      return fn.prototype && fn.prototype.constructor === fn;
    } catch {
      return false;
    }
  }

  /**
   * Create an alias for a binding
   */
  alias(abstract: string, alias: string): this {
    this.aliases.set(alias, abstract);
    return this;
  }

  /**
   * Check if a service is bound
   */
  bound(abstract: string | symbol): boolean {
    const key = this.aliases.get(abstract as string) || abstract;
    return this.bindings.has(key);
  }

  /**
   * Check if a service has been resolved
   */
  resolved(abstract: string | symbol): boolean {
    const key = this.aliases.get(abstract as string) || abstract;
    return this.resolvedSet.has(key);
  }

  /**
   * Remove a binding
   */
  forget(abstract: string | symbol): void {
    const key = this.aliases.get(abstract as string) || abstract;
    this.bindings.delete(key);
    this.resolvedSet.delete(key);
  }

  /**
   * Flush all bindings and instances
   */
  flush(): void {
    this.bindings.clear();
    this.aliases.clear();
    this.resolvedSet.clear();
  }

  /**
   * Call a function with dependency injection
   */
  call<T>(fn: (...args: any[]) => T, parameters: any[] = []): T {
    return fn(...parameters);
  }
}

/**
 * Global container instance
 */
export const container = new Container();
