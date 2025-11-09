/**
 * @curisjs/db - Seeder Runner
 * Executes database seeders
 */

import type { Knex } from 'knex';
import type { SeederConfig, Seeder } from './types';
import { promises as fs } from 'node:fs';
import { join, resolve } from 'node:path';

export class SeederRunner {
  constructor(
    private db: Knex,
    private config: SeederConfig
  ) {}

  /**
   * Load all seeder files
   */
  async loadSeeders(): Promise<{ name: string; seeder: Seeder }[]> {
    const directory = resolve(this.config.directory);

    try {
      const files = await fs.readdir(directory);
      const seederFiles = files.filter((file) => file.endsWith(this.config.extension)).sort();

      const seeders: { name: string; seeder: Seeder }[] = [];

      for (const file of seederFiles) {
        // If specific seeders are requested, filter
        if (
          this.config.specific &&
          this.config.specific.length > 0 &&
          !this.config.specific.includes(file)
        ) {
          continue;
        }

        const filePath = join(directory, file);
        const module = await import(filePath);

        // Support both default export and named Seeder class
        const SeederClass = module.default || module.Seeder || module;

        if (typeof SeederClass === 'function') {
          seeders.push({
            name: file,
            seeder: new SeederClass(),
          });
        } else if (typeof SeederClass === 'object' && typeof SeederClass.run === 'function') {
          seeders.push({
            name: file,
            seeder: SeederClass,
          });
        } else {
          console.warn(`Invalid seeder file: ${file}`);
        }
      }

      return seeders;
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
        return [];
      }
      throw error;
    }
  }

  /**
   * Run all seeders
   */
  async run(): Promise<string[]> {
    const seeders = await this.loadSeeders();

    if (seeders.length === 0) {
      console.log('No seeders found');
      return [];
    }

    const ran: string[] = [];

    for (const { name, seeder } of seeders) {
      console.log(`Seeding: ${name}`);

      try {
        await seeder.run(this.db);
        console.log(`Seeded: ${name}`);
        ran.push(name);
      } catch (error) {
        console.error(`Failed to seed: ${name}`);
        throw error;
      }
    }

    return ran;
  }

  /**
   * Run a specific seeder
   */
  async runOne(name: string): Promise<void> {
    const seeders = await this.loadSeeders();
    const seeder = seeders.find((s) => s.name === name);

    if (!seeder) {
      throw new Error(`Seeder not found: ${name}`);
    }

    console.log(`Seeding: ${seeder.name}`);
    await seeder.seeder.run(this.db);
    console.log(`Seeded: ${seeder.name}`);
  }
}
