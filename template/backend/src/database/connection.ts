/**
 * Database connection and setup
 * Using JSON file storage for simplicity
 */

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { env } from '@curisjs/core';
import { resolve } from 'path';

const dbPath = resolve(process.cwd(), env('DATABASE_PATH') || './database.json');

export interface DatabaseSchema {
  todos: Array<{
    id: number;
    title: string;
    description: string | null;
    completed: boolean;
    created_at: string;
    updated_at: string;
  }>;
  _meta: {
    nextId: number;
  };
}

let dbCache: DatabaseSchema | null = null;

/**
 * Initialize database
 */
export function initializeDatabase(): void {
  if (!existsSync(dbPath)) {
    const initialData: DatabaseSchema = {
      todos: [],
      _meta: {
        nextId: 1,
      },
    };
    writeFileSync(dbPath, JSON.stringify(initialData, null, 2), 'utf-8');
  }
  console.log('✓ Database initialized');
}

/**
 * Read database
 */
export function readDB(): DatabaseSchema {
  if (dbCache) return dbCache;

  const data = readFileSync(dbPath, 'utf-8');
  dbCache = JSON.parse(data);
  return dbCache!;
}

/**
 * Write database
 */
export function writeDB(data: DatabaseSchema): void {
  writeFileSync(dbPath, JSON.stringify(data, null, 2), 'utf-8');
  dbCache = data;
}

/**
 * Get next ID and increment
 */
export function getNextId(): number {
  const db = readDB();
  const id = db._meta.nextId;
  db._meta.nextId++;
  writeDB(db);
  return id;
}

/**
 * Close database (no-op for JSON, kept for API compatibility)
 */
export function closeDatabase(): void {
  dbCache = null;
  console.log('✓ Database closed');
}
