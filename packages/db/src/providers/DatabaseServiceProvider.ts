/**
 * Database Service Provider - Register database in CurisJS application container
 */

import { ServiceProvider } from '@curisjs/core';
import type { Application } from '@curisjs/core';
import { ConnectionManager } from '../connection.js';
import type { DatabaseConfig } from '../types.js';

export class DatabaseServiceProvider extends ServiceProvider {
  private config: DatabaseConfig;

  constructor(app: Application, config: DatabaseConfig) {
    super(app);
    this.config = config;
  }

  /**
   * Register database in container
   */
  override async register(): Promise<void> {
    // Initialize connection manager
    ConnectionManager.initialize(this.config);

    // Register database in container
    this.app.singleton('db', () => {
      return ConnectionManager.getConnection();
    });

    // Register connection manager
    this.app.singleton('db.manager', () => {
      return ConnectionManager;
    });
  }

  /**
   * Boot database services
   */
  override async boot(): Promise<void> {
    // Database is ready
    if (this.app.debug) {
      console.log('📦 Database initialized');
    }
  }

  /**
   * Cleanup when application terminates
   */
  async terminate(): Promise<void> {
    await ConnectionManager.closeAll();
    if (this.app.debug) {
      console.log('📦 Database connections closed');
    }
  }
}
