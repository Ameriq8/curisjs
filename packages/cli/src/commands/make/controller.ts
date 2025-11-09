/**
 * Make controller command
 */

import { join } from 'node:path';
import {
  success,
  error as showError,
  toPascalCase,
  writeFile,
  getProjectRoot,
} from '../../utils.js';

export async function runMakeController(args: string[]) {
  const name = args[0];

  if (!name) {
    showError('Controller name is required');
    console.log('Usage: curis make:controller <name>');
    process.exit(1);
  }

  try {
    const controllerName = toPascalCase(name.replace(/Controller$/i, '')) + 'Controller';
    const fileName = `${controllerName}.ts`;
    const filePath = join(getProjectRoot(), 'src/controllers', fileName);

    const content = `import type { Context } from '@curisjs/core';

/**
 * ${controllerName}
 */
export class ${controllerName} {
  /**
   * List all resources
   */
  async index(ctx: Context) {
    // TODO: Implement index
    return ctx.json({ message: 'List all resources' });
  }

  /**
   * Get a single resource
   */
  async show(ctx: Context) {
    const { id } = ctx.params;
    // TODO: Implement show
    return ctx.json({ message: \`Show resource \${id}\` });
  }

  /**
   * Create a new resource
   */
  async store(ctx: Context) {
    const data = await ctx.json();
    // TODO: Implement store
    return ctx.json({ message: 'Resource created', data }, { status: 201 });
  }

  /**
   * Update an existing resource
   */
  async update(ctx: Context) {
    const { id } = ctx.params;
    const data = await ctx.json();
    // TODO: Implement update
    return ctx.json({ message: \`Resource \${id} updated\`, data });
  }

  /**
   * Delete a resource
   */
  async destroy(ctx: Context) {
    const { id } = ctx.params;
    // TODO: Implement destroy
    return ctx.json({ message: \`Resource \${id} deleted\` });
  }
}
`;

    await writeFile(filePath, content);
    success(`Created controller: ${filePath}`);
    process.exit(0);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    showError(`Failed to create controller: ${message}`);
    process.exit(1);
  }
}
