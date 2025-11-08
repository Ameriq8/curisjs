/**
 * Build command
 */

import { info } from '../utils';

export async function runBuildCommand(_args: string[]) {
  info('Build command');
  info('This feature is coming soon!');
  info('For now, use: bun run build or npm run build');
  process.exit(0);
}
