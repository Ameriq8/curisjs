/**
 * Todo validation schemas using CurisJS validation (Zod-like)
 */

import { z } from '@curisjs/core';

export const createTodoSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title is too long'),
  description: z.string().max(1000, 'Description is too long').optional(),
  completed: z.boolean().optional().default(false),
});

export const updateTodoSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title is too long').optional(),
  description: z.string().max(1000, 'Description is too long').optional(),
  completed: z.boolean().optional(),
});

export const todoIdSchema = z.object({
  id: z.number().int().positive('Invalid todo ID'),
});

export const todoFiltersSchema = z.object({
  completed: z.coerce.boolean().optional(),
  search: z.string().optional(),
  limit: z.number().int().positive().max(100).optional().default(20),
  offset: z.number().int().min(0).optional().default(0),
});
