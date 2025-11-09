/**
 * Dev server command
 */

import { info } from '../utils.js';

export async function runDevCommand(_args: string[]) {
  info('Development server command');
  info('This feature is coming soon!');
  info('For now, use: bun run dev or npm run dev');
  process.exit(0);
}
