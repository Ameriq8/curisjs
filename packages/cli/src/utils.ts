/**
 * Shared CLI utilities
 */

import { promises as fs } from 'node:fs';
import { resolve, join } from 'node:path';
import pc from 'picocolors';

/**
 * Get current timestamp for file naming
 */
export function getTimestamp(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hour = String(now.getHours()).padStart(2, '0');
  const minute = String(now.getMinutes()).padStart(2, '0');
  const second = String(now.getSeconds()).padStart(2, '0');

  return `${year}${month}${day}${hour}${minute}${second}`;
}

/**
 * Convert string to snake_case
 */
export function toSnakeCase(str: string): string {
  return str
    .replace(/([A-Z])/g, '_$1')
    .toLowerCase()
    .replace(/^_/, '')
    .replace(/\s+/g, '_');
}

/**
 * Convert string to PascalCase
 */
export function toPascalCase(str: string): string {
  return str
    .split(/[-_\s]+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join('');
}

/**
 * Convert string to camelCase
 */
export function toCamelCase(str: string): string {
  const pascal = toPascalCase(str);
  return pascal.charAt(0).toLowerCase() + pascal.slice(1);
}

/**
 * Convert string to kebab-case
 */
export function toKebabCase(str: string): string {
  return str
    .replace(/([A-Z])/g, '-$1')
    .toLowerCase()
    .replace(/^-/, '')
    .replace(/\s+/g, '-');
}

/**
 * Pluralize a word (simple implementation)
 */
export function pluralize(word: string): string {
  if (word.endsWith('y')) {
    return word.slice(0, -1) + 'ies';
  }
  if (word.endsWith('s') || word.endsWith('x') || word.endsWith('z')) {
    return word + 'es';
  }
  return word + 's';
}

/**
 * Ensure directory exists
 */
export async function ensureDirectory(path: string): Promise<void> {
  await fs.mkdir(path, { recursive: true });
}

/**
 * Check if file exists
 */
export async function fileExists(path: string): Promise<boolean> {
  try {
    await fs.access(path);
    return true;
  } catch {
    return false;
  }
}

/**
 * Write file with directory creation
 */
export async function writeFile(filePath: string, content: string): Promise<void> {
  const dir = join(filePath, '..');
  await ensureDirectory(dir);
  await fs.writeFile(filePath, content, 'utf-8');
}

/**
 * Load database configuration
 */
export async function loadDatabaseConfig(): Promise<{
  connection?: Record<string, unknown>;
  migrations?: Record<string, unknown>;
  seeders?: Record<string, unknown>;
  [key: string]: unknown;
}> {
  const configPaths = [
    'curisdb.config.ts',
    'curisdb.config.js',
    'database.config.ts',
    'database.config.js',
  ];

  for (const configPath of configPaths) {
    const fullPath = resolve(process.cwd(), configPath);
    if (await fileExists(fullPath)) {
      const config = await import(fullPath);
      return config.default || config;
    }
  }

  throw new Error(pc.red('Database configuration file not found. Please create curisdb.config.ts'));
}

/**
 * Check if in CurisJS project
 */
export async function isCurisProject(): Promise<boolean> {
  const packageJsonPath = resolve(process.cwd(), 'package.json');
  if (!(await fileExists(packageJsonPath))) {
    return false;
  }

  try {
    const content = await fs.readFile(packageJsonPath, 'utf-8');
    const packageJson = JSON.parse(content);
    return !!(
      packageJson.dependencies?.['@curisjs/core'] || packageJson.devDependencies?.['@curisjs/core']
    );
  } catch {
    return false;
  }
}

/**
 * Get project root directory
 */
export function getProjectRoot(): string {
  return process.cwd();
}

/**
 * Success message
 */
export function success(message: string): void {
  console.log(pc.green('✓'), message);
}

/**
 * Error message
 */
export function error(message: string): void {
  console.error(pc.red('✗'), message);
}

/**
 * Warning message
 */
export function warn(message: string): void {
  console.warn(pc.yellow('⚠'), message);
}

/**
 * Info message
 */
export function info(message: string): void {
  console.log(pc.cyan('ℹ'), message);
}

/**
 * Create a spinner (simple console implementation)
 */
export function spinner(text: string) {
  const frames = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];
  let i = 0;
  let intervalId: NodeJS.Timeout;

  return {
    start() {
      process.stdout.write(`${frames[0]} ${text}`);
      intervalId = setInterval(() => {
        i = (i + 1) % frames.length;
        process.stdout.write(`\r${frames[i]} ${text}`);
      }, 80);
    },
    stop(message?: string) {
      clearInterval(intervalId);
      process.stdout.write('\r');
      if (message) {
        success(message);
      }
    },
    fail(message?: string) {
      clearInterval(intervalId);
      process.stdout.write('\r');
      if (message) {
        error(message);
      }
    },
  };
}
