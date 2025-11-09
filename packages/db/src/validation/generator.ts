/**
 * @curisjs/db - Validation Integration
 * Generate validators from schema definitions
 */

import type { SchemaDefinition } from '../types';

/**
 * Validation rule mapping from column types
 */
const typeToValidation: Record<string, string[]> = {
  string: ['string'],
  integer: ['integer'],
  boolean: ['boolean'],
  date: ['date'],
  datetime: ['date'],
  json: ['object'],
  uuid: ['uuid'],
  text: ['string'],
  decimal: ['numeric'],
};

/**
 * Generate validation rules from schema definition
 */
export function generateValidationRules(schema: SchemaDefinition): Record<string, string[]> {
  const rules: Record<string, string[]> = {};

  for (const [columnName, columnDef] of Object.entries(schema.columns || {})) {
    const columnRules: string[] = [];

    // Required validation
    if ((columnDef as any).notNullable && !(columnDef as any).defaultTo) {
      columnRules.push('required');
    }

    // Type validation
    const baseRules = typeToValidation[(columnDef as any).type] || [];
    columnRules.push(...baseRules);

    // String length validation
    if ((columnDef as any).type === 'string' && (columnDef as any).length) {
      columnRules.push(`max:${(columnDef as any).length}`);
    }

    // Unique validation (would require database check)
    if ((columnDef as any).unique) {
      columnRules.push('unique');
    }

    // Email validation (inferred from column name)
    if (columnName.toLowerCase().includes('email') && (columnDef as any).type === 'string') {
      columnRules.push('email');
    }

    // Only add if there are rules
    if (columnRules.length > 0) {
      rules[columnName] = columnRules;
    }
  }

  return rules;
}

/**
 * Generate validator object compatible with @curisjs/core
 */
export function schemaToValidator(schema: SchemaDefinition): {
  rules: Record<string, string[]>;
  messages?: Record<string, string>;
} {
  const rules = generateValidationRules(schema);

  // Generate custom messages
  const messages: Record<string, string> = {};

  for (const [field, fieldRules] of Object.entries(rules)) {
    for (const rule of fieldRules) {
      const key = `${field}.${rule.split(':')[0]}`;
      messages[key] = generateMessage(field, rule);
    }
  }

  return { rules, messages };
}

/**
 * Generate human-readable validation message
 */
function generateMessage(field: string, rule: string): string {
  const [ruleName, ruleValue] = rule.split(':');
  const fieldName = field.replace(/_/g, ' ');

  switch (ruleName) {
    case 'required':
      return `The ${fieldName} field is required`;
    case 'email':
      return `The ${fieldName} must be a valid email address`;
    case 'string':
      return `The ${fieldName} must be a string`;
    case 'integer':
      return `The ${fieldName} must be an integer`;
    case 'numeric':
      return `The ${fieldName} must be a number`;
    case 'boolean':
      return `The ${fieldName} must be a boolean`;
    case 'date':
      return `The ${fieldName} must be a valid date`;
    case 'uuid':
      return `The ${fieldName} must be a valid UUID`;
    case 'max':
      return `The ${fieldName} may not be greater than ${ruleValue}`;
    case 'unique':
      return `The ${fieldName} has already been taken`;
    default:
      return `The ${fieldName} is invalid`;
  }
}

/**
 * Create a validator function for use with validateOrFail
 */
export function createValidator(schema: SchemaDefinition) {
  const { rules, messages } = schemaToValidator(schema);

  return {
    rules,
    messages,
  };
}
