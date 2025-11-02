/**
 * Zod-like Schema Validation System
 * Provides a fluent, type-safe validation API
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

export interface ValidationIssue {
  path: (string | number)[];
  message: string;
  code: string;
}

export interface ValidationError {
  success: false;
  error: {
    issues: ValidationIssue[];
    format: () => Record<string, string[]>;
  };
}

export interface ValidationSuccess<T> {
  success: true;
  data: T;
}

export type ValidationResult<T> = ValidationSuccess<T> | ValidationError;

/**
 * Base schema class
 */
export abstract class Schema<TInput = unknown, TOutput = TInput> {
  protected _optional = false;
  protected _nullable = false;
  protected _default?: TOutput;
  protected customValidations: Array<{
    fn: (value: TOutput) => boolean | Promise<boolean>;
    message: string;
  }> = [];

  abstract _parse(value: unknown, path: (string | number)[]): ValidationResult<TOutput>;

  /**
   * Parse and validate the value
   */
  parse(value: unknown): TOutput {
    const result = this.safeParse(value);
    if (!result.success) {
      throw new SchemaValidationError(result.error.issues);
    }
    return result.data;
  }

  /**
   * Safe parse that returns a result
   */
  safeParse(value: unknown): ValidationResult<TOutput> {
    const result = this._parse(value, []);

    // Run custom validations if parsing succeeded
    if (result.success && this.customValidations.length > 0) {
      const customIssues: ValidationIssue[] = [];

      for (const validation of this.customValidations) {
        const isValid = validation.fn(result.data);
        if (isValid instanceof Promise) {
          throw new Error(
            'Async custom validations not supported in safeParse. Use parseAsync instead.'
          );
        }
        if (!isValid) {
          customIssues.push({
            path: [],
            message: validation.message,
            code: 'custom',
          });
        }
      }

      if (customIssues.length > 0) {
        return {
          success: false,
          error: {
            issues: customIssues,
            format: () => this.formatErrors(customIssues),
          },
        };
      }
    }

    return result;
  }

  /**
   * Make schema optional
   */
  optional(): Schema<TInput | undefined, TOutput | undefined> {
    const newSchema = Object.create(Object.getPrototypeOf(this));
    Object.assign(newSchema, this);
    newSchema._optional = true;
    return newSchema;
  }

  /**
   * Make schema nullable
   */
  nullable(): Schema<TInput | null, TOutput | null> {
    const newSchema = Object.create(Object.getPrototypeOf(this));
    Object.assign(newSchema, this);
    newSchema._nullable = true;
    return newSchema;
  }

  /**
   * Set default value
   */
  default(value: TOutput): Schema<TInput, TOutput> {
    const newSchema = Object.create(Object.getPrototypeOf(this));
    Object.assign(newSchema, this);
    newSchema._default = value;
    return newSchema;
  }

  /**
   * Add custom validation
   */
  refine(
    fn: (value: TOutput) => boolean | Promise<boolean>,
    message: string | { message: string }
  ): this {
    this.customValidations.push({
      fn,
      message: typeof message === 'string' ? message : message.message,
    });
    return this;
  }

  protected createError(message: string, path: (string | number)[], code: string): ValidationError {
    return {
      success: false,
      error: {
        issues: [{ path, message, code }],
        format: () => this.formatErrors([{ path, message, code }]),
      },
    };
  }

  protected formatErrors(issues: ValidationIssue[]): Record<string, string[]> {
    const formatted: Record<string, string[]> = {};
    for (const issue of issues) {
      const key = issue.path.join('.');
      if (!formatted[key]) {
        formatted[key] = [];
      }
      formatted[key]!.push(issue.message);
    }
    return formatted;
  }

  protected async runCustomValidations(
    value: TOutput,
    path: (string | number)[]
  ): Promise<ValidationIssue[]> {
    const issues: ValidationIssue[] = [];
    for (const validation of this.customValidations) {
      const result = await validation.fn(value);
      if (!result) {
        issues.push({
          path,
          message: validation.message,
          code: 'custom',
        });
      }
    }
    return issues;
  }
}

/**
 * String schema
 */
export class StringSchema extends Schema<string, string> {
  private _min?: number;
  private _max?: number;
  private _length?: number;
  private _email = false;
  private _url = false;
  private _uuid = false;
  private _regex?: { pattern: RegExp; message: string };

  _parse(value: unknown, path: (string | number)[]): ValidationResult<string> {
    // Handle optional/nullable
    if (value === undefined && this._optional) {
      return { success: true, data: this._default ?? (undefined as any) };
    }
    if (value === null && this._nullable) {
      return { success: true, data: this._default ?? (null as any) };
    }

    if (typeof value !== 'string') {
      return this.createError('Expected string', path, 'invalid_type');
    }

    // Length validations
    if (this._min !== undefined && value.length < this._min) {
      return this.createError(`String must be at least ${this._min} characters`, path, 'too_small');
    }
    if (this._max !== undefined && value.length > this._max) {
      return this.createError(`String must be at most ${this._max} characters`, path, 'too_big');
    }
    if (this._length !== undefined && value.length !== this._length) {
      return this.createError(
        `String must be exactly ${this._length} characters`,
        path,
        'invalid_length'
      );
    }

    // Format validations
    if (this._email && !this.isEmail(value)) {
      return this.createError('Invalid email address', path, 'invalid_email');
    }
    if (this._url && !this.isUrl(value)) {
      return this.createError('Invalid URL', path, 'invalid_url');
    }
    if (this._uuid && !this.isUuid(value)) {
      return this.createError('Invalid UUID', path, 'invalid_uuid');
    }
    if (this._regex && !this._regex.pattern.test(value)) {
      return this.createError(this._regex.message, path, 'invalid_string');
    }

    return { success: true, data: value };
  }

  min(length: number, _message?: string): this {
    this._min = length;
    return this;
  }

  max(length: number, _message?: string): this {
    this._max = length;
    return this;
  }

  length(length: number, _message?: string): this {
    this._length = length;
    return this;
  }

  email(_message?: string): this {
    this._email = true;
    return this;
  }

  url(_message?: string): this {
    this._url = true;
    return this;
  }

  uuid(_message?: string): this {
    this._uuid = true;
    return this;
  }

  regex(pattern: RegExp, message?: string): this {
    this._regex = {
      pattern,
      message: message || 'Invalid format',
    };
    return this;
  }

  private isEmail(value: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  }

  private isUrl(value: string): boolean {
    try {
      new URL(value);
      return true;
    } catch {
      return false;
    }
  }

  private isUuid(value: string): boolean {
    return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);
  }
}

/**
 * Number schema
 */
export class NumberSchema extends Schema<number, number> {
  private _min?: number;
  private _max?: number;
  private _int = false;
  private _positive = false;
  private _negative = false;

  _parse(value: unknown, path: (string | number)[]): ValidationResult<number> {
    // Handle optional/nullable
    if (value === undefined && this._optional) {
      return { success: true, data: this._default ?? (undefined as any) };
    }
    if (value === null && this._nullable) {
      return { success: true, data: this._default ?? (null as any) };
    }

    if (typeof value !== 'number' || isNaN(value)) {
      return this.createError('Expected number', path, 'invalid_type');
    }

    if (this._int && !Number.isInteger(value)) {
      return this.createError('Expected integer', path, 'invalid_type');
    }

    if (this._min !== undefined && value < this._min) {
      return this.createError(`Number must be at least ${this._min}`, path, 'too_small');
    }
    if (this._max !== undefined && value > this._max) {
      return this.createError(`Number must be at most ${this._max}`, path, 'too_big');
    }

    if (this._positive && value <= 0) {
      return this.createError('Number must be positive', path, 'too_small');
    }
    if (this._negative && value >= 0) {
      return this.createError('Number must be negative', path, 'too_big');
    }

    return { success: true, data: value };
  }

  min(value: number, _message?: string): this {
    this._min = value;
    return this;
  }

  max(value: number, _message?: string): this {
    this._max = value;
    return this;
  }

  int(_message?: string): this {
    this._int = true;
    return this;
  }

  positive(_message?: string): this {
    this._positive = true;
    return this;
  }

  negative(_message?: string): this {
    this._negative = true;
    return this;
  }
}

/**
 * Boolean schema
 */
export class BooleanSchema extends Schema<boolean, boolean> {
  _parse(value: unknown, path: (string | number)[]): ValidationResult<boolean> {
    if (value === undefined && this._optional) {
      return { success: true, data: this._default ?? (undefined as any) };
    }
    if (value === null && this._nullable) {
      return { success: true, data: this._default ?? (null as any) };
    }

    if (typeof value !== 'boolean') {
      return this.createError('Expected boolean', path, 'invalid_type');
    }

    return { success: true, data: value };
  }
}

/**
 * Date schema
 */
export class DateSchema extends Schema<Date | string | number, Date> {
  private _min?: Date;
  private _max?: Date;

  _parse(value: unknown, path: (string | number)[]): ValidationResult<Date> {
    if (value === undefined && this._optional) {
      return { success: true, data: this._default ?? (undefined as any) };
    }
    if (value === null && this._nullable) {
      return { success: true, data: this._default ?? (null as any) };
    }

    let date: Date;
    if (value instanceof Date) {
      date = value;
    } else if (typeof value === 'string' || typeof value === 'number') {
      date = new Date(value);
    } else {
      return this.createError('Expected date, string, or number', path, 'invalid_type');
    }

    if (isNaN(date.getTime())) {
      return this.createError('Invalid date', path, 'invalid_date');
    }

    if (this._min && date < this._min) {
      return this.createError(`Date must be after ${this._min.toISOString()}`, path, 'too_small');
    }
    if (this._max && date > this._max) {
      return this.createError(`Date must be before ${this._max.toISOString()}`, path, 'too_big');
    }

    return { success: true, data: date };
  }

  min(date: Date, _message?: string): this {
    this._min = date;
    return this;
  }

  max(date: Date, _message?: string): this {
    this._max = date;
    return this;
  }
}

/**
 * Array schema
 */
export class ArraySchema<T> extends Schema<T[], T[]> {
  private _min?: number;
  private _max?: number;
  private _nonempty = false;

  constructor(private elementSchema: Schema<any, T>) {
    super();
  }

  _parse(value: unknown, path: (string | number)[]): ValidationResult<T[]> {
    if (value === undefined && this._optional) {
      return { success: true, data: this._default ?? (undefined as any) };
    }
    if (value === null && this._nullable) {
      return { success: true, data: this._default ?? (null as any) };
    }

    if (!Array.isArray(value)) {
      return this.createError('Expected array', path, 'invalid_type');
    }

    if (this._nonempty && value.length === 0) {
      return this.createError('Array cannot be empty', path, 'too_small');
    }
    if (this._min !== undefined && value.length < this._min) {
      return this.createError(`Array must have at least ${this._min} items`, path, 'too_small');
    }
    if (this._max !== undefined && value.length > this._max) {
      return this.createError(`Array must have at most ${this._max} items`, path, 'too_big');
    }

    const results: T[] = [];
    const issues: ValidationIssue[] = [];

    for (let i = 0; i < value.length; i++) {
      const result = this.elementSchema._parse(value[i], [...path, i]);
      if (!result.success) {
        issues.push(...result.error.issues);
      } else {
        results.push(result.data);
      }
    }

    if (issues.length > 0) {
      return {
        success: false,
        error: {
          issues,
          format: () => this.formatErrors(issues),
        },
      };
    }

    return { success: true, data: results };
  }

  min(length: number, _message?: string): this {
    this._min = length;
    return this;
  }

  max(length: number, _message?: string): this {
    this._max = length;
    return this;
  }

  nonempty(_message?: string): this {
    this._nonempty = true;
    return this;
  }
}

/**
 * Object schema
 */
export class ObjectSchema<T extends Record<string, any>> extends Schema<T, T> {
  constructor(private shape: { [K in keyof T]: Schema<any, T[K]> }) {
    super();
  }

  _parse(value: unknown, path: (string | number)[]): ValidationResult<T> {
    if (value === undefined && this._optional) {
      return { success: true, data: this._default ?? (undefined as any) };
    }
    if (value === null && this._nullable) {
      return { success: true, data: this._default ?? (null as any) };
    }

    if (typeof value !== 'object' || value === null || Array.isArray(value)) {
      return this.createError('Expected object', path, 'invalid_type');
    }

    const result: any = {};
    const issues: ValidationIssue[] = [];

    for (const key in this.shape) {
      const fieldSchema = this.shape[key];
      const fieldValue = (value as any)[key];
      const fieldResult = fieldSchema._parse(fieldValue, [...path, key]);

      if (!fieldResult.success) {
        issues.push(...fieldResult.error.issues);
      } else {
        result[key] = fieldResult.data;
      }
    }

    if (issues.length > 0) {
      return {
        success: false,
        error: {
          issues,
          format: () => this.formatErrors(issues),
        },
      };
    }

    return { success: true, data: result as T };
  }
}

/**
 * Enum schema
 */
export class EnumSchema<T extends readonly [string, ...string[]]> extends Schema<
  T[number],
  T[number]
> {
  constructor(private values: T) {
    super();
  }

  _parse(value: unknown, path: (string | number)[]): ValidationResult<T[number]> {
    if (value === undefined && this._optional) {
      return { success: true, data: this._default ?? (undefined as any) };
    }
    if (value === null && this._nullable) {
      return { success: true, data: this._default ?? (null as any) };
    }

    if (!this.values.includes(value as any)) {
      return this.createError(
        `Expected one of: ${this.values.join(', ')}`,
        path,
        'invalid_enum_value'
      );
    }

    return { success: true, data: value as T[number] };
  }
}

/**
 * Coerce schema - converts strings to other types
 */
export class CoerceSchema<T> extends Schema<string | T, T> {
  constructor(private innerSchema: Schema<T, T>) {
    super();
  }

  _parse(value: unknown, path: (string | number)[]): ValidationResult<T> {
    // Try to coerce if it's a string
    if (typeof value === 'string' && this.innerSchema instanceof DateSchema) {
      value = new Date(value);
    } else if (typeof value === 'string' && this.innerSchema instanceof NumberSchema) {
      value = Number(value);
    } else if (typeof value === 'string' && this.innerSchema instanceof BooleanSchema) {
      value = value === 'true' || value === '1';
    }

    return this.innerSchema._parse(value, path);
  }
}

/**
 * Schema validation error
 */
export class SchemaValidationError extends Error {
  constructor(public issues: ValidationIssue[]) {
    super('Validation failed');
    this.name = 'SchemaValidationError';
  }

  format(): Record<string, string[]> {
    const formatted: Record<string, string[]> = {};
    for (const issue of this.issues) {
      const key = issue.path.join('.');
      if (!formatted[key]) {
        formatted[key] = [];
      }
      formatted[key]!.push(issue.message);
    }
    return formatted;
  }
}

/**
 * Main z object for creating schemas
 */
export const z = {
  string: () => new StringSchema(),
  number: () => new NumberSchema(),
  boolean: () => new BooleanSchema(),
  date: () => new DateSchema(),
  array: <T>(schema: Schema<any, T>) => new ArraySchema(schema),
  object: <T extends Record<string, any>>(shape: { [K in keyof T]: Schema<any, T[K]> }) =>
    new ObjectSchema(shape),
  enum: <T extends readonly [string, ...string[]]>(values: T) => new EnumSchema(values),
  coerce: {
    string: () => new CoerceSchema(new StringSchema()),
    number: () => new CoerceSchema(new NumberSchema()),
    boolean: () => new CoerceSchema(new BooleanSchema()),
    date: () => new CoerceSchema(new DateSchema()),
  },
};
