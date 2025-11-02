/**
 * Error handling middleware
 */

import type { Context, Next } from '@curisjs/core';
import { json } from '@curisjs/core';
import { SchemaValidationError } from '@curisjs/core';

export async function errorHandler(_ctx: Context, next: Next): Promise<Response | void> {
  try {
    await next();
  } catch (error: unknown) {
    console.error('Unhandled error:', error);

    // Handle validation errors
    if (error instanceof SchemaValidationError) {
      return json(
        {
          success: false,
          error: 'Validation failed',
          details: error.format(),
        },
        { status: 400 }
      );
    }

    // Handle generic errors
    const isDevelopment = process.env.NODE_ENV === 'development';

    return json(
      {
        success: false,
        error: 'Internal server error',
        ...(isDevelopment && {
          message: error instanceof Error ? error.message : String(error),
          stack: error instanceof Error ? error.stack : undefined,
        }),
      },
      { status: 500 }
    );
  }
}
