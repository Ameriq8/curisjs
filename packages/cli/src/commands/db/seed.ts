/**
 * Database seed commands
 */

import { loadDatabaseConfig, success, error as showError, info } from '../../utils';

export async function runSeedCommand(subcommand: string | undefined, _args: string[]) {
  if (subcommand) {
    await runSpecific(subcommand);
  } else {
    await runAll();
  }
}

async function runAll() {
  try {
    const { createDatabase } = await import('@curisjs/db');
    const { createSeederRunner } = await import('@curisjs/db');

    const config = await loadDatabaseConfig();
    const db = createDatabase((config.connection || config) as never);
    const runner = createSeederRunner(db, config.seeds as never);

    info('Seeding database...');
    const seeders = await runner.run();

    if (seeders.length === 0) {
      success('No seeders found');
    } else {
      success(`Seeded ${seeders.length} seeder(s)`);
    }

    await db.destroy();
    process.exit(0);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    showError(`Seeding failed: ${message}`);
    process.exit(1);
  }
}

async function runSpecific(name: string) {
  try {
    const { createDatabase } = await import('@curisjs/db');
    const { createSeederRunner } = await import('@curisjs/db');

    const config = await loadDatabaseConfig();
    const db = createDatabase((config.connection || config) as never);
    const runner = createSeederRunner(db, config.seeds as never);

    info(`Seeding: ${name}...`);
    await runner.runOne(name);
    success(`Seeded: ${name}`);

    await db.destroy();
    process.exit(0);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    showError(`Seeding failed for ${name}: ${message}`);
    process.exit(1);
  }
}
