/**
 * Make validator command
 */

import { join } from 'node:path';
import {
  success,
  error as showError,
  toCamelCase,
  writeFile,
  getProjectRoot,
} from '../../utils.js';

export async function runMakeValidator(args: string[]) {
  const name = args[0];

  if (!name) {
    showError('Validator name is required');
    console.log('Usage: curis make:validator <name>');
    process.exit(1);
  }

  try {
    const validatorName = toCamelCase(name.replace(/Validator$/i, '')) + 'Validator';
    const fileName = `${validatorName}.ts`;
    const filePath = join(getProjectRoot(), 'src/validators', fileName);

    const content = `import { Validator } from '@curisjs/core';

/**
 * ${validatorName}
 */
export const ${validatorName} = new Validator({
  // Define your validation rules here
  // Example:
  // name: ['required', 'string', 'min:3'],
  // email: ['required', 'email'],
  // age: ['required', 'integer', 'min:18'],
});
`;

    await writeFile(filePath, content);
    success(`Created validator: ${filePath}`);
    process.exit(0);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    showError(`Failed to create validator: ${message}`);
    process.exit(1);
  }
}
