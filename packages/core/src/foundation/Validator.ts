/**
 * Validation System - Laravel-like fluent validation
 * Provides a powerful and expressive validation API
 */

export type ValidationRule =
  | string
  | ((value: unknown, data: Record<string, unknown>) => boolean | Promise<boolean>);

export interface ValidationError {
  field: string;
  rule: string;
  message: string;
}

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
  data: Record<string, unknown>;
}

/**
 * Built-in validation rules
 */
export class Rules {
  /**
   * Value must be required (not null, undefined, or empty string)
   */
  static required(value: unknown): boolean {
    if (value === null || value === undefined) return false;
    if (typeof value === 'string' && value.trim() === '') return false;
    if (Array.isArray(value) && value.length === 0) return false;
    return true;
  }

  /**
   * Value must be a valid email
   */
  static email(value: unknown): boolean {
    if (typeof value !== 'string') return false;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(value);
  }

  /**
   * Value must be a string
   */
  static string(value: unknown): boolean {
    return typeof value === 'string';
  }

  /**
   * Value must be a number
   */
  static number(value: unknown): boolean {
    return typeof value === 'number' && !isNaN(value);
  }

  /**
   * Value must be an integer
   */
  static integer(value: unknown): boolean {
    return Number.isInteger(value);
  }

  /**
   * Value must be a boolean
   */
  static boolean(value: unknown): boolean {
    return typeof value === 'boolean';
  }

  /**
   * Value must be an array
   */
  static array(value: unknown): boolean {
    return Array.isArray(value);
  }

  /**
   * Value must be an object
   */
  static object(value: unknown): boolean {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
  }

  /**
   * Value must be a valid URL
   */
  static url(value: unknown): boolean {
    if (typeof value !== 'string') return false;
    try {
      new URL(value);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Value must be a valid UUID
   */
  static uuid(value: unknown): boolean {
    if (typeof value !== 'string') return false;
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    return uuidRegex.test(value);
  }

  /**
   * Value must be at least the given length
   */
  static min(value: unknown, min: number): boolean {
    if (typeof value === 'string' || Array.isArray(value)) {
      return value.length >= min;
    }
    if (typeof value === 'number') {
      return value >= min;
    }
    return false;
  }

  /**
   * Value must not exceed the given length
   */
  static max(value: unknown, max: number): boolean {
    if (typeof value === 'string' || Array.isArray(value)) {
      return value.length <= max;
    }
    if (typeof value === 'number') {
      return value <= max;
    }
    return false;
  }

  /**
   * Value must match the given regex pattern
   */
  static regex(value: unknown, pattern: RegExp | string): boolean {
    if (typeof value !== 'string') return false;
    const regex = typeof pattern === 'string' ? new RegExp(pattern) : pattern;
    return regex.test(value);
  }

  /**
   * Value must be one of the given values
   */
  static in(value: unknown, values: unknown[]): boolean {
    return values.includes(value);
  }

  /**
   * Value must not be one of the given values
   */
  static notIn(value: unknown, values: unknown[]): boolean {
    return !values.includes(value);
  }

  /**
   * Value must be confirmed (matches another field)
   */
  static confirmed(value: unknown, data: Record<string, unknown>, field: string): boolean {
    return value === data[`${field}_confirmation`];
  }

  /**
   * Value must be a valid date
   */
  static date(value: unknown): boolean {
    const date = new Date(value as string | number | Date);
    return !isNaN(date.getTime());
  }

  /**
   * Value must be after the given date
   */
  static after(value: unknown, compareDate: string | Date): boolean {
    const date = new Date(value as string | number | Date);
    const compare = new Date(compareDate);
    return !isNaN(date.getTime()) && date > compare;
  }

  /**
   * Value must be before the given date
   */
  static before(value: unknown, compareDate: string | Date): boolean {
    const date = new Date(value as string | number | Date);
    const compare = new Date(compareDate);
    return !isNaN(date.getTime()) && date < compare;
  }

  /**
   * Value must be alpha-numeric
   */
  static alphaNumeric(value: unknown): boolean {
    if (typeof value !== 'string') return false;
    return /^[a-zA-Z0-9]+$/.test(value);
  }

  /**
   * Value must be alpha (letters only)
   */
  static alpha(value: unknown): boolean {
    if (typeof value !== 'string') return false;
    return /^[a-zA-Z]+$/.test(value);
  }
}

/**
 * Validator class for fluent validation
 */
export class Validator {
  private rules: Record<string, ValidationRule[]> = {};
  private messages: Record<string, string> = {};
  private customRules: Record<
    string,
    (
      value: unknown,
      data: Record<string, unknown>,
      ...args: unknown[]
    ) => boolean | Promise<boolean>
  > = {};

  /**
   * Set validation rules
   */
  setRules(rules: Record<string, ValidationRule[]>): this {
    this.rules = rules;
    return this;
  }

  /**
   * Set custom error messages
   */
  setMessages(messages: Record<string, string>): this {
    this.messages = messages;
    return this;
  }

  /**
   * Register a custom validation rule
   */
  addRule(
    name: string,
    validator: (
      value: unknown,
      data: Record<string, unknown>,
      ...args: unknown[]
    ) => boolean | Promise<boolean>
  ): this {
    this.customRules[name] = validator;
    return this;
  }

  /**
   * Validate data against rules
   */
  async validate(data: Record<string, unknown>): Promise<ValidationResult> {
    const errors: ValidationError[] = [];

    for (const [field, fieldRules] of Object.entries(this.rules)) {
      const value = data[field];

      for (const rule of fieldRules) {
        const result = await this.validateRule(field, value, rule, data);
        if (!result.valid) {
          errors.push(result.error!);
        }
      }
    }

    return {
      valid: errors.length === 0,
      errors,
      data,
    };
  }

  /**
   * Validate a single rule
   */
  private async validateRule(
    field: string,
    value: unknown,
    rule: ValidationRule,
    data: Record<string, unknown>
  ): Promise<{ valid: boolean; error?: ValidationError }> {
    // Handle custom function rules
    if (typeof rule === 'function') {
      const valid = await rule(value, data);
      if (!valid) {
        return {
          valid: false,
          error: {
            field,
            rule: 'custom',
            message: this.getMessage(field, 'custom'),
          },
        };
      }
      return { valid: true };
    }

    // Parse string rules (e.g., "min:5", "in:admin,user")
    const [ruleName, ...args] = rule.split(':');
    const ruleArgs = args.length > 0 && args[0] ? args[0].split(',') : [];

    // Check custom rules first
    if (ruleName && this.customRules[ruleName]) {
      const valid = await this.customRules[ruleName]!(value, data, ...ruleArgs);
      if (!valid) {
        return {
          valid: false,
          error: {
            field,
            rule: ruleName,
            message: this.getMessage(field, ruleName),
          },
        };
      }
      return { valid: true };
    }

    // Built-in rules
    let valid = false;
    switch (ruleName) {
      case 'required':
        valid = Rules.required(value);
        break;
      case 'email':
        valid = Rules.email(value);
        break;
      case 'string':
        valid = Rules.string(value);
        break;
      case 'number':
        valid = Rules.number(value);
        break;
      case 'integer':
        valid = Rules.integer(value);
        break;
      case 'boolean':
        valid = Rules.boolean(value);
        break;
      case 'array':
        valid = Rules.array(value);
        break;
      case 'object':
        valid = Rules.object(value);
        break;
      case 'url':
        valid = Rules.url(value);
        break;
      case 'uuid':
        valid = Rules.uuid(value);
        break;
      case 'min':
        valid = Rules.min(value, Number(ruleArgs[0]));
        break;
      case 'max':
        valid = Rules.max(value, Number(ruleArgs[0]));
        break;
      case 'regex':
        valid = ruleArgs[0] ? Rules.regex(value, ruleArgs[0]) : false;
        break;
      case 'in':
        valid = Rules.in(value, ruleArgs);
        break;
      case 'notIn':
        valid = Rules.notIn(value, ruleArgs);
        break;
      case 'confirmed':
        valid = Rules.confirmed(value, data, field);
        break;
      case 'date':
        valid = Rules.date(value);
        break;
      case 'after':
        valid = ruleArgs[0] ? Rules.after(value, ruleArgs[0]) : false;
        break;
      case 'before':
        valid = ruleArgs[0] ? Rules.before(value, ruleArgs[0]) : false;
        break;
      case 'alphaNumeric':
        valid = Rules.alphaNumeric(value);
        break;
      case 'alpha':
        valid = Rules.alpha(value);
        break;
      default:
        throw new Error(`Unknown validation rule: ${ruleName}`);
    }

    if (!valid) {
      return {
        valid: false,
        error: {
          field,
          rule: ruleName || 'unknown',
          message: this.getMessage(field, ruleName || 'unknown', ruleArgs),
        },
      };
    }

    return { valid: true };
  }

  /**
   * Get error message for a field and rule
   */
  private getMessage(field: string, rule: string, args: string[] = []): string {
    // Check for custom message
    const customKey = `${field}.${rule}`;
    if (this.messages[customKey]) {
      return this.messages[customKey]!;
    }

    // Default messages
    const messages: Record<string, string> = {
      required: `The ${field} field is required.`,
      email: `The ${field} must be a valid email address.`,
      string: `The ${field} must be a string.`,
      number: `The ${field} must be a number.`,
      integer: `The ${field} must be an integer.`,
      boolean: `The ${field} must be a boolean.`,
      array: `The ${field} must be an array.`,
      object: `The ${field} must be an object.`,
      url: `The ${field} must be a valid URL.`,
      uuid: `The ${field} must be a valid UUID.`,
      min: `The ${field} must be at least ${args[0]}.`,
      max: `The ${field} must not exceed ${args[0]}.`,
      regex: `The ${field} format is invalid.`,
      in: `The ${field} must be one of: ${args.join(', ')}.`,
      notIn: `The ${field} must not be one of: ${args.join(', ')}.`,
      confirmed: `The ${field} confirmation does not match.`,
      date: `The ${field} must be a valid date.`,
      after: `The ${field} must be after ${args[0]}.`,
      before: `The ${field} must be before ${args[0]}.`,
      alphaNumeric: `The ${field} must contain only letters and numbers.`,
      alpha: `The ${field} must contain only letters.`,
      custom: `The ${field} field is invalid.`,
    };

    return messages[rule] || `The ${field} field is invalid.`;
  }
}

/**
 * Helper function to create a validator
 */
export function validate(
  data: Record<string, unknown>,
  rules: Record<string, ValidationRule[]>,
  messages?: Record<string, string>
): Promise<ValidationResult> {
  const validator = new Validator();
  validator.setRules(rules);
  if (messages) {
    validator.setMessages(messages);
  }
  return validator.validate(data);
}
