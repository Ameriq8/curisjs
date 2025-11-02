import { describe, expect, it } from 'vitest';
import { z, SchemaValidationError } from '../src/validation/schema';

describe('Schema Validation (Zod-like)', () => {
  describe('String Schema', () => {
    it('validates string type', () => {
      const schema = z.string();
      expect(schema.parse('hello')).toBe('hello');

      expect(() => schema.parse(123)).toThrow(SchemaValidationError);
      expect(() => schema.parse(null)).toThrow(SchemaValidationError);
    });

    it('validates string length', () => {
      const schema = z.string().min(3).max(10);

      expect(schema.parse('hello')).toBe('hello');
      expect(() => schema.parse('hi')).toThrow(SchemaValidationError);
      expect(() => schema.parse('verylongstring')).toThrow(SchemaValidationError);
    });

    it('validates email format', () => {
      const schema = z.string().email();

      expect(schema.parse('test@example.com')).toBe('test@example.com');
      expect(() => schema.parse('invalid')).toThrow(SchemaValidationError);
    });

    it('validates UUID format', () => {
      const schema = z.string().uuid();

      expect(schema.parse('550e8400-e29b-41d4-a716-446655440000')).toBe(
        '550e8400-e29b-41d4-a716-446655440000'
      );
      expect(() => schema.parse('invalid-uuid')).toThrow(SchemaValidationError);
    });

    it('validates regex pattern', () => {
      const schema = z.string().regex(/^\d{2,3}\/\d{2,3}$/, 'Invalid BP format');

      expect(schema.parse('120/80')).toBe('120/80');
      expect(() => schema.parse('120-80')).toThrow(SchemaValidationError);
    });

    it('supports optional strings', () => {
      const schema = z.string().optional();

      expect(schema.parse('hello')).toBe('hello');
      expect(schema.parse(undefined)).toBeUndefined();
    });
  });

  describe('Number Schema', () => {
    it('validates number type', () => {
      const schema = z.number();

      expect(schema.parse(42)).toBe(42);
      expect(() => schema.parse('42')).toThrow(SchemaValidationError);
    });

    it('validates min/max values', () => {
      const schema = z.number().min(0).max(100);

      expect(schema.parse(50)).toBe(50);
      expect(() => schema.parse(-1)).toThrow(SchemaValidationError);
      expect(() => schema.parse(101)).toThrow(SchemaValidationError);
    });

    it('validates integer', () => {
      const schema = z.number().int();

      expect(schema.parse(42)).toBe(42);
      expect(() => schema.parse(42.5)).toThrow(SchemaValidationError);
    });

    it('validates positive/negative', () => {
      const positive = z.number().positive();
      const negative = z.number().negative();

      expect(positive.parse(1)).toBe(1);
      expect(() => positive.parse(-1)).toThrow(SchemaValidationError);

      expect(negative.parse(-1)).toBe(-1);
      expect(() => negative.parse(1)).toThrow(SchemaValidationError);
    });
  });

  describe('Boolean Schema', () => {
    it('validates boolean type', () => {
      const schema = z.boolean();

      expect(schema.parse(true)).toBe(true);
      expect(schema.parse(false)).toBe(false);
      expect(() => schema.parse('true')).toThrow(SchemaValidationError);
    });
  });

  describe('Date Schema', () => {
    it('validates date type', () => {
      const schema = z.date();

      const date = new Date('2024-01-01');
      expect(schema.parse(date)).toEqual(date);
      expect(schema.parse('2024-01-01')).toBeInstanceOf(Date);
    });

    it('validates min/max dates', () => {
      const schema = z.date().min(new Date('2024-01-01')).max(new Date('2024-12-31'));

      expect(schema.parse('2024-06-15')).toBeInstanceOf(Date);
      expect(() => schema.parse('2023-12-31')).toThrow(SchemaValidationError);
      expect(() => schema.parse('2025-01-01')).toThrow(SchemaValidationError);
    });
  });

  describe('Array Schema', () => {
    it('validates array of strings', () => {
      const schema = z.array(z.string());

      expect(schema.parse(['a', 'b', 'c'])).toEqual(['a', 'b', 'c']);
      expect(() => schema.parse([1, 2, 3])).toThrow(SchemaValidationError);
    });

    it('validates nonempty arrays', () => {
      const schema = z.array(z.string()).nonempty('At least one item required');

      expect(schema.parse(['a'])).toEqual(['a']);
      expect(() => schema.parse([])).toThrow(SchemaValidationError);
    });

    it('validates array length', () => {
      const schema = z.array(z.string()).min(2).max(5);

      expect(schema.parse(['a', 'b'])).toEqual(['a', 'b']);
      expect(() => schema.parse(['a'])).toThrow(SchemaValidationError);
      expect(() => schema.parse(['a', 'b', 'c', 'd', 'e', 'f'])).toThrow(SchemaValidationError);
    });

    it('supports optional arrays', () => {
      const schema = z.array(z.string()).optional();

      expect(schema.parse(['a'])).toEqual(['a']);
      expect(schema.parse(undefined)).toBeUndefined();
    });
  });

  describe('Object Schema', () => {
    it('validates object shape', () => {
      const schema = z.object({
        name: z.string(),
        age: z.number(),
      });

      const data = { name: 'John', age: 30 };
      expect(schema.parse(data)).toEqual(data);

      expect(() => schema.parse({ name: 'John' })).toThrow(SchemaValidationError);
      expect(() => schema.parse({ name: 'John', age: 'thirty' })).toThrow(SchemaValidationError);
    });

    it('validates nested objects', () => {
      const schema = z.object({
        user: z.object({
          name: z.string(),
          email: z.string().email(),
        }),
        vitals: z.object({
          pulse: z.number().min(30).max(200),
          temperature: z.number().min(35).max(42),
        }),
      });

      const data = {
        user: {
          name: 'John',
          email: 'john@example.com',
        },
        vitals: {
          pulse: 72,
          temperature: 37.2,
        },
      };

      expect(schema.parse(data)).toEqual(data);
    });
  });

  describe('Enum Schema', () => {
    it('validates enum values', () => {
      const schema = z.enum(['card', 'paypal', 'cash']);

      expect(schema.parse('card')).toBe('card');
      expect(schema.parse('paypal')).toBe('paypal');
      expect(() => schema.parse('crypto')).toThrow(SchemaValidationError);
    });
  });

  describe('Coerce Schema', () => {
    it('coerces string to date', () => {
      const schema = z.coerce.date();

      expect(schema.parse('2024-01-01')).toBeInstanceOf(Date);
      expect(schema.parse(new Date('2024-01-01'))).toBeInstanceOf(Date);
    });
  });

  describe('Schema Refinements', () => {
    it('supports custom refinements', () => {
      const schema = z.string().refine((value) => value.length >= 3, { message: 'Too short' });

      expect(schema.parse('hello')).toBe('hello');

      try {
        schema.parse('hi');
        throw new Error('Should have thrown');
      } catch (error) {
        if (error instanceof SchemaValidationError) {
          expect(error.issues[0]?.message).toBe('Too short');
        }
      }
    });

    it('supports conditional refinements', () => {
      const PaymentSchema = z
        .object({
          method: z.enum(['card', 'paypal', 'cash']),
          cardNumber: z.string().optional(),
        })
        .refine(
          (data) => data.method !== 'card' || !!(data.cardNumber && data.cardNumber.length === 16),
          { message: 'Card number is required for card payments' }
        );

      expect(
        PaymentSchema.parse({
          method: 'paypal',
        })
      ).toEqual({ method: 'paypal' });

      expect(
        PaymentSchema.parse({
          method: 'card',
          cardNumber: '1234567890123456',
        })
      ).toEqual({ method: 'card', cardNumber: '1234567890123456' });

      expect(() =>
        PaymentSchema.parse({
          method: 'card',
        })
      ).toThrow(SchemaValidationError);
    });
  });

  describe('safeParse', () => {
    it('returns success result', () => {
      const schema = z.string();
      const result = schema.safeParse('hello');

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBe('hello');
      }
    });

    it('returns error result', () => {
      const schema = z.string();
      const result = schema.safeParse(123);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues.length).toBeGreaterThan(0);
      }
    });
  });

  describe('Complex Example - Medical Record', () => {
    it('validates medical record schema', () => {
      const MedicalRecordSchema = z.object({
        patientId: z.string().uuid('Invalid patient ID'),
        diagnosis: z.string().min(5),
        medications: z.array(z.string()).nonempty('At least one medication required'),
        allergies: z.array(z.string()).optional(),
        vitals: z.object({
          bloodPressure: z.string().regex(/^\d{2,3}\/\d{2,3}$/, 'Invalid BP format'),
          pulse: z.number().min(30).max(200),
          temperature: z.number().min(35).max(42),
        }),
        visitDate: z.coerce.date(),
      });

      const validData = {
        patientId: '550e8400-e29b-41d4-a716-446655440000',
        diagnosis: 'Common cold',
        medications: ['Paracetamol', 'Ibuprofen'],
        allergies: ['Penicillin'],
        vitals: {
          bloodPressure: '120/80',
          pulse: 72,
          temperature: 37.2,
        },
        visitDate: '2024-01-15',
      };

      const result = MedicalRecordSchema.parse(validData);
      expect(result.patientId).toBe(validData.patientId);
      expect(result.diagnosis).toBe(validData.diagnosis);
      expect(result.medications).toEqual(validData.medications);
      expect(result.visitDate).toBeInstanceOf(Date);
    });

    it('rejects invalid medical record', () => {
      const MedicalRecordSchema = z.object({
        patientId: z.string().uuid(),
        medications: z.array(z.string()).nonempty(),
        vitals: z.object({
          pulse: z.number().min(30).max(200),
        }),
      });

      expect(() =>
        MedicalRecordSchema.parse({
          patientId: 'invalid-uuid',
          medications: [],
          vitals: { pulse: 300 },
        })
      ).toThrow(SchemaValidationError);
    });
  });

  describe('Error Formatting', () => {
    it('formats validation errors', () => {
      const schema = z.object({
        email: z.string().email(),
        age: z.number().min(18),
      });

      try {
        schema.parse({ email: 'invalid', age: 15 });
      } catch (error) {
        if (error instanceof SchemaValidationError) {
          const formatted = error.format();
          expect(formatted['email']).toBeDefined();
          expect(formatted['age']).toBeDefined();
        }
      }
    });
  });
});
