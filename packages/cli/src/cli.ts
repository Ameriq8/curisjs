/**
 * CLI Command Registry and Parser
 */

import { Command } from 'commander';
import pc from 'picocolors';
import { VERSION, NAME } from './version.js';

export interface CommandOptions {
  name: string;
  description: string;
  aliases?: string[];
  arguments?: Array<{ name: string; description: string; required?: boolean }>;
  options?: Array<{
    flags: string;
    description: string;
    defaultValue?: string | boolean;
  }>;
  action: (...args: unknown[]) => Promise<void> | void;
  examples?: string[];
}

export class CLI {
  private program: Command;
  private commands: Map<string, CommandOptions> = new Map();

  constructor() {
    this.program = new Command();
    this.program
      .name('curis')
      .description(pc.cyan(NAME) + ' - The TypeScript framework for modern web applications')
      .version(VERSION, '-v, --version', 'Show version number')
      .helpOption('-h, --help', 'Show help information');

    // Add global options
    this.program.option('--debug', 'Enable debug mode');
    this.program.option('--no-color', 'Disable colored output');
  }

  /**
   * Register a command
   */
  registerCommand(options: CommandOptions): void {
    this.commands.set(options.name, options);

    const cmd = this.program.command(options.name).description(options.description);

    // Add aliases
    if (options.aliases) {
      cmd.aliases(options.aliases);
    }

    // Add arguments
    if (options.arguments) {
      for (const arg of options.arguments) {
        const argSyntax = arg.required ? `<${arg.name}>` : `[${arg.name}]`;
        cmd.argument(argSyntax, arg.description);
      }
    }

    // Add options
    if (options.options) {
      for (const opt of options.options) {
        cmd.option(opt.flags, opt.description, opt.defaultValue);
      }
    }

    // Set action
    cmd.action(options.action);

    // Add examples to help
    if (options.examples && options.examples.length > 0) {
      const examplesText =
        '\n' +
        pc.bold('Examples:') +
        '\n' +
        options.examples.map((ex) => `  ${pc.dim('$')} ${ex}`).join('\n');
      cmd.addHelpText('after', examplesText);
    }
  }

  /**
   * Parse arguments and execute command
   */
  async parse(argv: string[]): Promise<void> {
    try {
      await this.program.parseAsync(argv);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      console.error(pc.red('Error:'), message);
      if (this.program.opts().debug && error instanceof Error) {
        console.error(pc.dim(error.stack || ''));
      }
      process.exit(1);
    }
  }

  /**
   * Get the commander program instance
   */
  getProgram(): Command {
    return this.program;
  }
}
