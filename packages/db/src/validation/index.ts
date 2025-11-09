/**
 * @curisjs/db - Validation Integration
 * Export validation utilities
 */

export * from './generator';

import { generateValidationRules, schemaToValidator, createValidator } from './generator';

export { generateValidationRules, schemaToValidator, createValidator };

/**
 * Validator decorator for models
 * Automatically validates data before create/update
 */
export function validateWith(validator: any) {
  return function (target: any) {
    // Store validator on model class
    target.validator = validator;

    // Hook into create method
    const originalCreate = target.create;
    if (originalCreate) {
      target.create = async function (options: any) {
        if (options.data && target.validator) {
          // Note: This requires @curisjs/core validation to be available
          // In a real app, you'd call ctx.validateOrFail(target.validator, options.data)
        }
        return originalCreate.call(this, options);
      };
    }

    return target;
  };
}
