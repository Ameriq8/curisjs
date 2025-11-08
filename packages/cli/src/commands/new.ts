/**
 * New project command
 */

import { success, error as showError, info } from '../utils';

export async function runNewCommand(args: string[]) {
  const name = args[0];

  if (!name) {
    showError('Project name is required');
    console.log('Usage: curis new <project-name>');
    process.exit(1);
  }

  try {
    info(`Creating new CurisJS project: ${name}`);
    info('This feature is coming soon!');
    info('For now, please clone the template repository:');
    console.log('');
    console.log('  git clone https://github.com/Ameriq8/curisjs-template.git', name);
    console.log('  cd', name);
    console.log('  pnpm install');
    console.log('');
    success('Happy coding!');
    process.exit(0);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    showError(`Failed to create project: ${message}`);
    process.exit(1);
  }
}
