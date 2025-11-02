import { describe, expect, it } from 'vitest';
import { Validator, Rules, validate } from '../src/foundation/Validator';

describe('Validation Rules', () => {
  it('validates required fields', () => {
    expect(Rules.required('value')).toBe(true);
    expect(Rules.required('')).toBe(false);
    expect(Rules.required(null)).toBe(false);
    expect(Rules.required(undefined)).toBe(false);
    expect(Rules.required([])).toBe(false);
  });

  it('validates email addresses', () => {
    expect(Rules.email('test@example.com')).toBe(true);
    expect(Rules.email('invalid')).toBe(false);
    expect(Rules.email(123)).toBe(false);
  });

  it('validates types', () => {
    expect(Rules.string('text')).toBe(true);
    expect(Rules.string(123)).toBe(false);

    expect(Rules.number(123)).toBe(true);
    expect(Rules.number('text')).toBe(false);

    expect(Rules.integer(123)).toBe(true);
    expect(Rules.integer(123.45)).toBe(false);

    expect(Rules.boolean(true)).toBe(true);
    expect(Rules.boolean('true')).toBe(false);

    expect(Rules.array([])).toBe(true);
    expect(Rules.array('array')).toBe(false);

    expect(Rules.object({})).toBe(true);
    expect(Rules.object([])).toBe(false);
  });

  it('validates URLs', () => {
    expect(Rules.url('https://example.com')).toBe(true);
    expect(Rules.url('not a url')).toBe(false);
  });

  it('validates UUIDs', () => {
    expect(Rules.uuid('550e8400-e29b-41d4-a716-446655440000')).toBe(true);
    expect(Rules.uuid('invalid-uuid')).toBe(false);
  });

  it('validates min/max length', () => {
    expect(Rules.min('hello', 3)).toBe(true);
    expect(Rules.min('hi', 3)).toBe(false);
    expect(Rules.min([1, 2, 3], 2)).toBe(true);
    expect(Rules.min(10, 5)).toBe(true);

    expect(Rules.max('hello', 10)).toBe(true);
    expect(Rules.max('hello world!', 5)).toBe(false);
    expect(Rules.max([1, 2], 3)).toBe(true);
    expect(Rules.max(10, 15)).toBe(true);
  });

  it('validates regex patterns', () => {
    expect(Rules.regex('hello123', /^[a-z0-9]+$/)).toBe(true);
    expect(Rules.regex('Hello!', /^[a-z0-9]+$/)).toBe(false);
  });

  it('validates in/notIn', () => {
    expect(Rules.in('admin', ['admin', 'user', 'guest'])).toBe(true);
    expect(Rules.in('moderator', ['admin', 'user', 'guest'])).toBe(false);

    expect(Rules.notIn('moderator', ['admin', 'user', 'guest'])).toBe(true);
    expect(Rules.notIn('admin', ['admin', 'user', 'guest'])).toBe(false);
  });

  it('validates confirmed fields', () => {
    const data = {
      password: '123456',
      password_confirmation: '123456',
    };
    expect(Rules.confirmed('123456', data, 'password')).toBe(true);
    expect(Rules.confirmed('654321', data, 'password')).toBe(false);
  });

  it('validates dates', () => {
    expect(Rules.date('2024-01-01')).toBe(true);
    expect(Rules.date(new Date())).toBe(true);
    expect(Rules.date('invalid date')).toBe(false);
  });

  it('validates before/after dates', () => {
    expect(Rules.after('2024-01-02', '2024-01-01')).toBe(true);
    expect(Rules.after('2024-01-01', '2024-01-02')).toBe(false);

    expect(Rules.before('2024-01-01', '2024-01-02')).toBe(true);
    expect(Rules.before('2024-01-02', '2024-01-01')).toBe(false);
  });

  it('validates alpha/alphaNumeric', () => {
    expect(Rules.alpha('hello')).toBe(true);
    expect(Rules.alpha('hello123')).toBe(false);

    expect(Rules.alphaNumeric('hello123')).toBe(true);
    expect(Rules.alphaNumeric('hello!')).toBe(false);
  });
});

describe('Validator', () => {
  it('validates data with string rules', async () => {
    const result = await validate(
      { email: 'test@example.com', age: 25 },
      {
        email: ['required', 'email'],
        age: ['required', 'number', 'min:18'],
      }
    );

    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('returns validation errors', async () => {
    const result = await validate(
      { email: 'invalid', age: 15 },
      {
        email: ['required', 'email'],
        age: ['required', 'number', 'min:18'],
      }
    );

    expect(result.valid).toBe(false);
    expect(result.errors).toHaveLength(2);
    expect(result.errors[0]?.field).toBe('email');
    expect(result.errors[0]?.rule).toBe('email');
    expect(result.errors[1]?.field).toBe('age');
    expect(result.errors[1]?.rule).toBe('min');
  });

  it('validates with custom messages', async () => {
    const result = await validate(
      { email: 'invalid' },
      { email: ['required', 'email'] },
      {
        'email.email': 'Please provide a valid email address',
      }
    );

    expect(result.valid).toBe(false);
    expect(result.errors[0]?.message).toBe('Please provide a valid email address');
  });

  it('validates with custom function rules', async () => {
    const validator = new Validator();
    validator.setRules({
      username: [
        'required',
        (value: unknown) => {
          return typeof value === 'string' && value.length >= 3;
        },
      ],
    });

    const validResult = await validator.validate({ username: 'john' });
    expect(validResult.valid).toBe(true);

    const invalidResult = await validator.validate({ username: 'jo' });
    expect(invalidResult.valid).toBe(false);
  });

  it('validates with custom named rules', async () => {
    const validator = new Validator();
    validator.addRule('strongPassword', (value: unknown) => {
      if (typeof value !== 'string') return false;
      return value.length >= 8 && /[A-Z]/.test(value) && /[a-z]/.test(value) && /[0-9]/.test(value);
    });

    validator.setRules({
      password: ['required', 'strongPassword'],
    });

    const validResult = await validator.validate({ password: 'Password123' });
    expect(validResult.valid).toBe(true);

    const invalidResult = await validator.validate({ password: 'weak' });
    expect(invalidResult.valid).toBe(false);
  });

  it('validates complex data', async () => {
    const result = await validate(
      {
        name: 'John Doe',
        email: 'john@example.com',
        age: 30,
        role: 'admin',
        website: 'https://example.com',
        bio: 'Software developer',
      },
      {
        name: ['required', 'string', 'min:3', 'max:50'],
        email: ['required', 'email'],
        age: ['required', 'integer', 'min:18', 'max:120'],
        role: ['required', 'in:admin,user,guest'],
        website: ['url'],
        bio: ['string', 'max:500'],
      }
    );

    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('validates confirmed fields', async () => {
    const result = await validate(
      {
        password: 'secret123',
        password_confirmation: 'secret123',
      },
      {
        password: ['required', 'min:6', 'confirmed'],
      }
    );

    expect(result.valid).toBe(true);
  });

  it('handles async custom rules', async () => {
    const validator = new Validator();
    validator.addRule('uniqueEmail', async (value: unknown) => {
      // Simulate async database check
      await new Promise((resolve) => setTimeout(resolve, 10));
      return value !== 'taken@example.com';
    });

    validator.setRules({
      email: ['required', 'email', 'uniqueEmail'],
    });

    const validResult = await validator.validate({
      email: 'available@example.com',
    });
    expect(validResult.valid).toBe(true);

    const invalidResult = await validator.validate({
      email: 'taken@example.com',
    });
    expect(invalidResult.valid).toBe(false);
  });
});
