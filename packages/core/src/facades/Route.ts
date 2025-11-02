/**
 * Route Facade
 * Provides static-like access to the router
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

import { Facade } from '../foundation/Facade';

class RouteFacade extends Facade {
  protected static override getFacadeAccessor(): string {
    return 'router';
  }
}

export const Route = RouteFacade as any;
