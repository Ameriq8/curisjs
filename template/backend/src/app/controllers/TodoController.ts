/**
 * Todo Controller - HTTP request handlers
 * Handles request/response logic and delegates to service layer
 */

import { json } from '@curisjs/core';
import type { Context } from '@curisjs/core';
import { TodoService } from '../services/TodoService.js';
import type { UpdateTodoInput } from '../models/Todo.js';
import {
  createTodoSchema,
  updateTodoSchema,
  todoFiltersSchema,
} from '../validators/TodoValidator.js';

export class TodoController {
  private service: TodoService;

  constructor() {
    this.service = new TodoService();
  }

  /**
   * GET /todos
   * List all todos with pagination and filters
   */
  async index(ctx: Context): Promise<Response> {
    try {
      // Parse and validate query parameters
      const queryParams = ctx.queries();

      // Convert query strings to proper types for validation
      const parsedParams = {
        completed:
          queryParams.completed !== undefined
            ? queryParams.completed === 'true' || queryParams.completed === '1'
            : undefined,
        search: typeof queryParams.search === 'string' ? queryParams.search : undefined,
        limit: queryParams.limit ? Number(queryParams.limit) : undefined,
        offset: queryParams.offset ? Number(queryParams.offset) : undefined,
      };

      const filtersResult = todoFiltersSchema.safeParse(parsedParams);

      if (!filtersResult.success) {
        return json(
          {
            success: false,
            error: 'Invalid query parameters',
            details: filtersResult.error.format(),
          },
          { status: 400 }
        );
      }

      const result = await this.service.findAll(filtersResult.data);

      return json({
        success: true,
        data: result.data,
        pagination: {
          total: result.total,
          limit: result.limit,
          offset: result.offset,
          hasMore: result.offset + result.limit < result.total,
        },
      });
    } catch (error) {
      console.error('Error listing todos:', error);
      return json(
        {
          success: false,
          error: 'Failed to fetch todos',
        },
        { status: 500 }
      );
    }
  }

  /**
   * GET /todos/:id
   * Get a single todo by ID
   */
  async show(ctx: Context): Promise<Response> {
    try {
      const id = parseInt(ctx.params.id || '', 10);

      if (isNaN(id)) {
        return json(
          {
            success: false,
            error: 'Invalid todo ID',
          },
          { status: 400 }
        );
      }

      const todo = await this.service.findById(id);

      if (!todo) {
        return json(
          {
            success: false,
            error: 'Todo not found',
          },
          { status: 404 }
        );
      }

      return json({
        success: true,
        data: todo,
      });
    } catch (error) {
      console.error('Error fetching todo:', error);
      return json(
        {
          success: false,
          error: 'Failed to fetch todo',
        },
        { status: 500 }
      );
    }
  }

  /**
   * POST /todos
   * Create a new todo
   */
  async create(ctx: Context): Promise<Response> {
    try {
      // Parse and validate request body
      let body;
      try {
        body = await ctx.json();
      } catch (error) {
        return json(
          {
            success: false,
            error: 'Invalid JSON in request body',
            details: 'Request body must be valid JSON',
          },
          { status: 400 }
        );
      }

      // Validate with schema
      const result = createTodoSchema.safeParse(body);

      if (!result.success) {
        return json(
          {
            success: false,
            error: 'Validation failed',
            details: result.error.format(),
          },
          { status: 400 }
        );
      }

      const todo = await this.service.create(result.data);

      return json(
        {
          success: true,
          data: todo,
          message: 'Todo created successfully',
        },
        { status: 201 }
      );
    } catch (error) {
      console.error('Error creating todo:', error);
      return json(
        {
          success: false,
          error: 'Failed to create todo',
        },
        { status: 500 }
      );
    }
  }

  /**
   * PUT /todos/:id
   * Update an existing todo
   */
  async update(ctx: Context): Promise<Response> {
    try {
      const id = parseInt(ctx.params.id || '', 10);

      if (isNaN(id)) {
        return json(
          {
            success: false,
            error: 'Invalid todo ID',
          },
          { status: 400 }
        );
      }

      // Validate request body
      const result = (await ctx.validate(updateTodoSchema)) as {
        success: boolean;
        data?: UpdateTodoInput;
        error?: { format: () => Record<string, string[]> };
      };

      if (!result.success) {
        return json(
          {
            success: false,
            error: 'Validation failed',
            details: result.error!.format(),
          },
          { status: 400 }
        );
      }

      const todo = await this.service.update(id, result.data!);

      if (!todo) {
        return json(
          {
            success: false,
            error: 'Todo not found',
          },
          { status: 404 }
        );
      }

      return json({
        success: true,
        data: todo,
        message: 'Todo updated successfully',
      });
    } catch (error) {
      console.error('Error updating todo:', error);
      return json(
        {
          success: false,
          error: 'Failed to update todo',
        },
        { status: 500 }
      );
    }
  }

  /**
   * DELETE /todos/:id
   * Delete a todo
   */
  async delete(ctx: Context): Promise<Response> {
    try {
      const id = parseInt(ctx.params.id || '', 10);

      if (isNaN(id)) {
        return json(
          {
            success: false,
            error: 'Invalid todo ID',
          },
          { status: 400 }
        );
      }

      const deleted = await this.service.delete(id);

      if (!deleted) {
        return json(
          {
            success: false,
            error: 'Todo not found',
          },
          { status: 404 }
        );
      }

      return json({
        success: true,
        message: 'Todo deleted successfully',
      });
    } catch (error) {
      console.error('Error deleting todo:', error);
      return json(
        {
          success: false,
          error: 'Failed to delete todo',
        },
        { status: 500 }
      );
    }
  }

  /**
   * PATCH /todos/:id/toggle
   * Toggle todo completion status
   */
  async toggle(ctx: Context): Promise<Response> {
    try {
      const id = parseInt(ctx.params.id || '', 10);

      if (isNaN(id)) {
        return json(
          {
            success: false,
            error: 'Invalid todo ID',
          },
          { status: 400 }
        );
      }

      const todo = await this.service.toggleComplete(id);

      if (!todo) {
        return json(
          {
            success: false,
            error: 'Todo not found',
          },
          { status: 404 }
        );
      }

      return json({
        success: true,
        data: todo,
        message: 'Todo status toggled successfully',
      });
    } catch (error) {
      console.error('Error toggling todo:', error);
      return json(
        {
          success: false,
          error: 'Failed to toggle todo status',
        },
        { status: 500 }
      );
    }
  }
}
