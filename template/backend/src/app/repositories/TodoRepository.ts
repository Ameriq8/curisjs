/**
 * Todo Repository - Data access layer
 * Handles all database operations for todos using JSON storage
 */

import { readDB, writeDB, getNextId } from '../../database/connection.js';
import type { Todo, CreateTodoInput, UpdateTodoInput, TodoFilters } from '../models/Todo.js';

export class TodoRepository {
  /**
   * Find all todos with optional filters
   */
  findAll(filters: TodoFilters = {}): Todo[] {
    const db = readDB();
    let todos = [...db.todos];

    // Filter by completed status
    if (filters.completed !== undefined) {
      todos = todos.filter((todo) => todo.completed === filters.completed);
    }

    // Search in title and description
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      todos = todos.filter(
        (todo) =>
          todo.title.toLowerCase().includes(searchLower) ||
          (todo.description && todo.description.toLowerCase().includes(searchLower))
      );
    }

    // Sort by created_at descending (newest first)
    todos.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    // Pagination
    const offset = filters.offset || 0;
    const limit = filters.limit || 20;

    return todos.slice(offset, offset + limit);
  }

  /**
   * Find todo by ID
   */
  findById(id: number): Todo | null {
    const db = readDB();
    return db.todos.find((todo) => todo.id === id) || null;
  }

  /**
   * Create a new todo
   */
  create(input: CreateTodoInput): Todo {
    const db = readDB();
    const now = new Date().toISOString();

    const todo: Todo = {
      id: getNextId(),
      title: input.title,
      description: input.description || null,
      completed: input.completed || false,
      created_at: now,
      updated_at: now,
    };

    db.todos.push(todo);
    writeDB(db);

    return todo;
  }

  /**
   * Update an existing todo
   */
  update(id: number, input: UpdateTodoInput): Todo | null {
    const db = readDB();
    const index = db.todos.findIndex((todo) => todo.id === id);

    if (index === -1) return null;

    const todo = db.todos[index]!;
    const now = new Date().toISOString();

    // Update fields if provided
    if (input.title !== undefined) {
      todo.title = input.title;
    }
    if (input.description !== undefined) {
      todo.description = input.description || null;
    }
    if (input.completed !== undefined) {
      todo.completed = input.completed;
    }

    todo.updated_at = now;

    db.todos[index] = todo;
    writeDB(db);

    return todo;
  }

  /**
   * Delete a todo
   */
  delete(id: number): boolean {
    const db = readDB();
    const initialLength = db.todos.length;

    db.todos = db.todos.filter((todo) => todo.id !== id);

    if (db.todos.length < initialLength) {
      writeDB(db);
      return true;
    }

    return false;
  }

  /**
   * Count todos with optional filters
   */
  count(filters: TodoFilters = {}): number {
    const db = readDB();
    let todos = db.todos;

    // Filter by completed status
    if (filters.completed !== undefined) {
      todos = todos.filter((todo) => todo.completed === filters.completed);
    }

    // Search in title and description
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      todos = todos.filter(
        (todo) =>
          todo.title.toLowerCase().includes(searchLower) ||
          (todo.description && todo.description.toLowerCase().includes(searchLower))
      );
    }

    return todos.length;
  }
}
