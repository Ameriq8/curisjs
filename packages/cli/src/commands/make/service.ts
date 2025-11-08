/**
 * Make service command
 */

import { join } from 'node:path';
import { success, error as showError, toPascalCase, writeFile, getProjectRoot } from '../../utils';

export async function runMakeService(args: string[]) {
  const name = args[0];

  if (!name) {
    showError('Service name is required');
    console.log('Usage: curis make:service <name>');
    process.exit(1);
  }

  try {
    const serviceName = toPascalCase(name.replace(/Service$/i, '')) + 'Service';
    const fileName = `${serviceName}.ts`;
    const filePath = join(getProjectRoot(), 'src/services', fileName);

    const content = `/**
 * ${serviceName}
 */
export class ${serviceName} {
  /**
   * Example method
   */
  async execute() {
    // TODO: Implement service logic
    return { success: true };
  }
}
`;

    await writeFile(filePath, content);
    success(`Created service: ${filePath}`);
    process.exit(0);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    showError(`Failed to create service: ${message}`);
    process.exit(1);
  }
}
