/**
 * Todo Service - Business logic layer
 * Handles business rules and orchestrates data operations
 */

import { TodoRepository } from '../repositories/TodoRepository';
import type { Todo, CreateTodoInput, UpdateTodoInput, TodoFilters } from '../models/Todo.js';

export class TodoService {
  private repository: TodoRepository;

  constructor() {
    this.repository = new TodoRepository();
  }

  /**
   * Get all todos with pagination and filters
   */
  async findAll(filters: TodoFilters = {}): Promise<{
    data: Todo[];
    total: number;
    limit: number;
    offset: number;
  }> {
    const todos = this.repository.findAll(filters);
    const total = this.repository.count(filters);

    return {
      data: todos,
      total,
      limit: filters.limit || 20,
      offset: filters.offset || 0,
    };
  }

  /**
   * Get a single todo by ID
   */
  async findById(id: number): Promise<Todo | null> {
    return this.repository.findById(id);
  }

  /**
   * Create a new todo
   */
  async create(input: CreateTodoInput): Promise<Todo> {
    // Business logic can go here (e.g., validation, sanitization, etc.)
    return this.repository.create(input);
  }

  /**
   * Update an existing todo
   */
  async update(id: number, input: UpdateTodoInput): Promise<Todo | null> {
    return this.repository.update(id, input);
  }

  /**
   * Delete a todo
   */
  async delete(id: number): Promise<boolean> {
    return this.repository.delete(id);
  }

  /**
   * Toggle todo completion status
   */
  async toggleComplete(id: number): Promise<Todo | null> {
    const todo = await this.findById(id);
    if (!todo) return null;

    return this.repository.update(id, {
      completed: !todo.completed,
    });
  }
}
