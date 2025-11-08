/**
 * Make middleware command
 */

import { join } from 'node:path';
import {
  success,
  error as showError,
  toCamelCase,
  writeFile,
  getProjectRoot,
} from '../../utils.js';

export async function runMakeMiddleware(args: string[]) {
  const name = args[0];

  if (!name) {
    showError('Middleware name is required');
    console.log('Usage: curis make:middleware <name>');
    process.exit(1);
  }

  try {
    const middlewareName = toCamelCase(name);
    const fileName = `${middlewareName}.ts`;
    const filePath = join(getProjectRoot(), 'src/middleware', fileName);

    const content = `import type { Context, Next } from '@curisjs/core';

/**
 * ${middlewareName} middleware
 */
export async function ${middlewareName}(ctx: Context, next: Next) {
  // Before request processing
  console.log('Before:', ctx.request.url);

  await next();

  // After request processing
  console.log('After:', ctx.response.status);
}
`;

    await writeFile(filePath, content);
    success(`Created middleware: ${filePath}`);
    process.exit(0);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    showError(`Failed to create middleware: ${message}`);
    process.exit(1);
  }
}
