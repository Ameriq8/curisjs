/**
 * Seed CLI commands
 */

import { createDatabaseInstance, loadDatabaseConfig } from '../utils';
import { createSeederRunner } from '../../seeders/index';

export async function runSeedCommand(subcommand: string | undefined, _args: string[]) {
  if (subcommand) {
    await runSpecific(subcommand);
  } else {
    await runAll();
  }
}

async function runAll() {
  try {
    const db = await createDatabaseInstance();
    const config = await loadDatabaseConfig();
    const runner = createSeederRunner(db, config.seeds);

    console.log('Seeding database...');
    const seeders = await runner.run();

    if (seeders.length === 0) {
      console.log('✓ No seeders found');
    } else {
      console.log(`✓ Seeded ${seeders.length} seeder(s)`);
    }

    await db.destroy();
    process.exit(0);
  } catch (error: any) {
    console.error('Seeding failed:', error.message);
    process.exit(1);
  }
}

async function runSpecific(name: string) {
  try {
    const db = await createDatabaseInstance();
    const config = await loadDatabaseConfig();
    const runner = createSeederRunner(db, config.seeds);

    console.log(`Seeding: ${name}...`);
    await runner.runOne(name);
    console.log(`✓ Seeded: ${name}`);

    await db.destroy();
    process.exit(0);
  } catch (error: any) {
    console.error(`Seeding failed for ${name}:`, error.message);
    process.exit(1);
  }
}
