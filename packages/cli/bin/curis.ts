#!/usr/bin/env node
/**
 * CurisJS CLI
 * Main entry point for all CurisJS commands
 */

import pc from 'picocolors';

const args = process.argv.slice(2);
const command = args[0];
const subcommand = args[1];

async function main() {
  try {
    // Show banner for help
    if (!command || command === '--help' || command === '-h') {
      printHelp();
      return;
    }

    if (command === '--version' || command === '-v') {
      console.log('curis version 0.1.0');
      return;
    }

    switch (command) {
      // Project scaffolding
      case 'new': {
        const { runNewCommand } = await import('../src/commands/new.js');
        await runNewCommand(args[1]);
        break;
      }

      // Database commands
      case 'db:migrate': {
        const { runMigrateCommand } = await import('../src/commands/db/migrate.js');
        await runMigrateCommand(subcommand, args.slice(2));
        break;
      }

      case 'db:seed': {
        const { runSeedCommand } = await import('../src/commands/db/seed.js');
        await runSeedCommand(subcommand, args.slice(2));
        break;
      }

      case 'db:rollback': {
        const { runRollbackCommand } = await import('../src/commands/db/migrate.js');
        await runRollbackCommand(args.slice(1));
        break;
      }

      case 'db:reset': {
        const { runResetCommand } = await import('../src/commands/db/migrate.js');
        await runResetCommand();
        break;
      }

      case 'db:status': {
        const { runStatusCommand } = await import('../src/commands/db/migrate.js');
        await runStatusCommand();
        break;
      }

      case 'db:wipe': {
        const { runWipeCommand } = await import('../src/commands/db/utils.js');
        await runWipeCommand();
        break;
      }

      // Code generators
      case 'make:migration': {
        const { runMakeMigration } = await import('../src/commands/make/migration.js');
        await runMakeMigration(args.slice(1));
        break;
      }

      case 'make:model': {
        const { runMakeModel } = await import('../src/commands/make/model.js');
        await runMakeModel(args.slice(1));
        break;
      }

      case 'make:controller': {
        const { runMakeController } = await import('../src/commands/make/controller.js');
        await runMakeController(args.slice(1));
        break;
      }

      case 'make:service': {
        const { runMakeService } = await import('../src/commands/make/service.js');
        await runMakeService(args.slice(1));
        break;
      }

      case 'make:middleware': {
        const { runMakeMiddleware } = await import('../src/commands/make/middleware.js');
        await runMakeMiddleware(args.slice(1));
        break;
      }

      case 'make:seeder': {
        const { runMakeSeeder } = await import('../src/commands/make/seeder.js');
        await runMakeSeeder(args.slice(1));
        break;
      }

      case 'make:validator': {
        const { runMakeValidator } = await import('../src/commands/make/validator.js');
        await runMakeValidator(args.slice(1));
        break;
      }

      // Development server
      case 'dev': {
        const { runDevCommand } = await import('../src/commands/dev.js');
        await runDevCommand(args.slice(1));
        break;
      }

      case 'build': {
        const { runBuildCommand } = await import('../src/commands/build.js');
        await runBuildCommand(args.slice(1));
        break;
      }

      default:
        console.error(pc.red(`Unknown command: ${command}`));
        console.log('');
        printHelp();
        process.exit(1);
    }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(pc.red('Error:'), message);
    if (process.env.DEBUG && error instanceof Error) {
      console.error(error.stack);
    }
    process.exit(1);
  }
}

function printHelp() {
  console.log(`
${pc.cyan(pc.bold('CurisJS CLI'))} - The TypeScript framework for modern web applications

${pc.bold('Usage:')}
  curis <command> [options]

${pc.bold('Project Commands:')}
  ${pc.green('new <name>')}              Create a new CurisJS project
  ${pc.green('dev')}                     Start development server
  ${pc.green('build')}                   Build for production

${pc.bold('Database Commands:')}
  ${pc.green('db:migrate')}              Run pending migrations
  ${pc.green('db:rollback')}             Rollback last migration batch
  ${pc.green('db:reset')}                Rollback all migrations
  ${pc.green('db:status')}               Show migration status
  ${pc.green('db:seed')}                 Run all seeders
  ${pc.green('db:wipe')}                 Drop all database tables

${pc.bold('Code Generators:')}
  ${pc.green('make:migration <name>')}   Create a new migration
  ${pc.green('make:model <name>')}       Create a new model
  ${pc.green('make:controller <name>')}  Create a new controller
  ${pc.green('make:service <name>')}     Create a new service
  ${pc.green('make:middleware <name>')}  Create a new middleware
  ${pc.green('make:seeder <name>')}      Create a new seeder
  ${pc.green('make:validator <name>')}   Create a new validator

${pc.bold('Options:')}
  ${pc.green('--version, -v')}           Show version
  ${pc.green('--help, -h')}              Show help

${pc.bold('Examples:')}
  ${pc.dim('$')} curis new my-app
  ${pc.dim('$')} curis make:controller UserController
  ${pc.dim('$')} curis make:model User
  ${pc.dim('$')} curis db:migrate
  ${pc.dim('$')} curis dev

${pc.bold('Learn more:')}
  Documentation: ${pc.cyan('https://github.com/Ameriq8/curisjs')}
  Report issues: ${pc.cyan('https://github.com/Ameriq8/curisjs/issues')}
`);
}

main();
