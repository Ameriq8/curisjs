# Validation

CurisJS includes a powerful validation system powered by Zod, providing type-safe schema validation with excellent error messages.

## Installation

Validation is included in `@curisjs/core`:

```typescript
import { z } from '@curisjs/core';
```

## Basic Usage

### Defining Schemas

```typescript
import { z } from '@curisjs/core';

// Simple string
const nameSchema = z.string();

// String with constraints
const emailSchema = z.string().email();

// Number
const ageSchema = z.number().min(18).max(120);

// Boolean
const activeSchema = z.boolean();
```

### Object Schemas

```typescript
const userSchema = z.object({
  name: z.string().min(2).max(50),
  email: z.string().email(),
  age: z.number().min(18).optional(),
  role: z.enum(['user', 'admin']).default('user'),
});

// Type inference
type User = z.infer<typeof userSchema>;
// { name: string; email: string; age?: number; role: 'user' | 'admin' }
```

### Array Schemas

```typescript
// Array of strings
const tagsSchema = z.array(z.string());

// Array of objects
const usersSchema = z.array(z.object({
  id: z.string(),
  name: z.string(),
}));

// Array with constraints
const itemsSchema = z.array(z.string()).min(1).max(10);
```

## Validation in Routes

### Basic Validation

```typescript
import { createApp, json, z } from '@curisjs/core';

const app = createApp();

const userSchema = z.object({
  name: z.string(),
  email: z.string().email(),
});

app.post('/users', async (ctx) => {
  const body = await ctx.request.json();
  
  // Throws error if invalid
  const data = userSchema.parse(body);
  
  return json({ user: data });
});
```

### Safe Validation

```typescript
app.post('/users', async (ctx) => {
  const body = await ctx.request.json();
  
  // Returns { success: true, data } or { success: false, error }
  const result = userSchema.safeParse(body);
  
  if (!result.success) {
    return json({
      error: 'Validation failed',
      issues: result.error.issues
    }, { status: 422 });
  }
  
  return json({ user: result.data });
});
```

## Validator Middleware

### Using the Validator Middleware

```typescript
import { validator } from '@curisjs/core';

const userSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
});

// Validate request body
app.use(validator({
  schema: userSchema,
  source: 'body'
}));

app.post('/users', async (ctx) => {
  // Validated data available in ctx.state.validated
  const userData = ctx.state.validated;
  return json({ user: userData });
});
```

### Helper Functions

```typescript
import { validateBody, validateQuery, validateParams } from '@curisjs/core';

// Validate body
const createUserSchema = z.object({
  name: z.string(),
  email: z.string().email(),
});

app.use(validateBody(createUserSchema));

// Validate query parameters
const searchSchema = z.object({
  q: z.string().min(1),
  page: z.string().optional(),
});

app.use(validateQuery(searchSchema));

// Validate URL parameters
const paramsSchema = z.object({
  id: z.string().uuid(),
});

app.use(validateParams(paramsSchema));
```

## Schema Types

### String

```typescript
z.string()
  .min(5)                    // Minimum length
  .max(100)                  // Maximum length
  .email()                   // Email format
  .url()                     // URL format
  .uuid()                    // UUID format
  .regex(/^[a-z]+$/)        // Custom regex
  .trim()                    // Trim whitespace
  .toLowerCase()             // Convert to lowercase
  .toUpperCase()             // Convert to uppercase
  .optional()                // Make optional
  .default('default value')  // Default value
  .nullable()                // Allow null
```

### Number

```typescript
z.number()
  .min(0)                    // Minimum value
  .max(100)                  // Maximum value
  .int()                     // Integer only
  .positive()                // Positive numbers
  .negative()                // Negative numbers
  .nonnegative()            // >= 0
  .nonpositive()            // <= 0
  .multipleOf(5)            // Multiple of 5
  .finite()                  // No Infinity
  .safe()                    // Safe integer range
```

### Boolean

```typescript
z.boolean()
z.boolean().optional()
z.boolean().default(false)
```

### Date

```typescript
z.date()
z.date().min(new Date('2024-01-01'))
z.date().max(new Date('2024-12-31'))
```

### Enum

```typescript
z.enum(['admin', 'user', 'guest'])

// With type inference
const roleSchema = z.enum(['admin', 'user']);
type Role = z.infer<typeof roleSchema>; // 'admin' | 'user'
```

### Literal

```typescript
z.literal('hello')
z.literal(123)
z.literal(true)
```

### Union

```typescript
z.union([z.string(), z.number()])

// Or shorthand
z.string().or(z.number())
```

### Intersection

```typescript
const baseUser = z.object({
  name: z.string(),
  email: z.string().email(),
});

const adminUser = baseUser.and(z.object({
  role: z.literal('admin'),
  permissions: z.array(z.string()),
}));
```

### Object

```typescript
const schema = z.object({
  name: z.string(),
  age: z.number(),
  email: z.string().email().optional(),
  metadata: z.record(z.string()), // Record<string, string>
});

// Partial (all optional)
const partialSchema = schema.partial();

// Pick specific fields
const pickSchema = schema.pick({ name: true, email: true });

// Omit specific fields
const omitSchema = schema.omit({ email: true });

// Extend
const extendedSchema = schema.extend({
  phone: z.string(),
});
```

### Array

```typescript
z.array(z.string())
z.array(z.number()).min(1).max(10)
z.array(z.object({
  id: z.string(),
  name: z.string(),
}))

// Non-empty array
z.array(z.string()).nonempty()
```

### Tuple

```typescript
z.tuple([z.string(), z.number(), z.boolean()])

// Type: [string, number, boolean]
```

### Record

```typescript
// Record<string, number>
z.record(z.number())

// Record<string, User>
z.record(z.object({
  name: z.string(),
  age: z.number(),
}))
```

### Map and Set

```typescript
// Map<string, number>
z.map(z.string(), z.number())

// Set<string>
z.set(z.string())
```

## Advanced Validation

### Custom Validation

```typescript
const passwordSchema = z.string()
  .min(8)
  .refine((val) => /[A-Z]/.test(val), {
    message: 'Password must contain at least one uppercase letter',
  })
  .refine((val) => /[0-9]/.test(val), {
    message: 'Password must contain at least one number',
  });
```

### Transform

```typescript
// Convert string to number
const schema = z.object({
  age: z.string().transform((val) => parseInt(val, 10)),
});

// Parse and transform
const result = schema.parse({ age: '25' });
// result.age is number 25
```

### Preprocess

```typescript
const schema = z.preprocess(
  (val) => String(val).trim(),
  z.string().min(1)
);

schema.parse('  hello  '); // 'hello'
```

### Conditional Validation

```typescript
const schema = z.object({
  type: z.enum(['email', 'phone']),
  contact: z.string(),
}).refine((data) => {
  if (data.type === 'email') {
    return z.string().email().safeParse(data.contact).success;
  }
  if (data.type === 'phone') {
    return /^\d{10}$/.test(data.contact);
  }
  return false;
}, {
  message: 'Invalid contact information',
  path: ['contact'],
});
```

### Dependent Fields

```typescript
const schema = z.object({
  hasAddress: z.boolean(),
  address: z.string().optional(),
}).refine((data) => {
  if (data.hasAddress) {
    return !!data.address;
  }
  return true;
}, {
  message: 'Address is required when hasAddress is true',
  path: ['address'],
});
```

## Error Handling

### Error Structure

```typescript
try {
  userSchema.parse(invalidData);
} catch (error) {
  if (error instanceof z.ZodError) {
    console.log(error.issues);
    // [
    //   {
    //     code: 'invalid_type',
    //     expected: 'string',
    //     received: 'number',
    //     path: ['name'],
    //     message: 'Expected string, received number'
    //   }
    // ]
  }
}
```

### Custom Error Messages

```typescript
const schema = z.object({
  name: z.string({
    required_error: 'Name is required',
    invalid_type_error: 'Name must be a string',
  }).min(2, { message: 'Name must be at least 2 characters' }),
  
  email: z.string().email({ message: 'Invalid email address' }),
  
  age: z.number({
    required_error: 'Age is required',
  }).min(18, { message: 'Must be 18 or older' }),
});
```

### Formatted Errors

```typescript
const result = userSchema.safeParse(data);

if (!result.success) {
  const formatted = result.error.format();
  console.log(formatted);
  // {
  //   name: { _errors: ['Name is required'] },
  //   email: { _errors: ['Invalid email'] },
  //   _errors: []
  // }
}
```

## Complete Example

```typescript
import { createApp, json, z } from '@curisjs/core';

const app = createApp();

// User schema
const createUserSchema = z.object({
  name: z.string().min(2).max(50),
  email: z.string().email(),
  password: z.string()
    .min(8)
    .regex(/[A-Z]/, 'Must contain uppercase')
    .regex(/[0-9]/, 'Must contain number'),
  age: z.number().min(18).max(120).optional(),
  role: z.enum(['user', 'admin']).default('user'),
  tags: z.array(z.string()).max(10).optional(),
});

// Update schema (all fields optional)
const updateUserSchema = createUserSchema.partial();

// Create user
app.post('/api/users', async (ctx) => {
  const body = await ctx.request.json();
  const result = createUserSchema.safeParse(body);
  
  if (!result.success) {
    return json({
      error: 'Validation failed',
      issues: result.error.issues.map(issue => ({
        path: issue.path.join('.'),
        message: issue.message,
      }))
    }, { status: 422 });
  }
  
  const user = await database.createUser(result.data);
  return json({ user }, { status: 201 });
});

// Update user
app.patch('/api/users/:id', async (ctx) => {
  const body = await ctx.request.json();
  const result = updateUserSchema.safeParse(body);
  
  if (!result.success) {
    return json({
      error: 'Validation failed',
      issues: result.error.issues
    }, { status: 422 });
  }
  
  const user = await database.updateUser(ctx.params.id, result.data);
  return json({ user });
});

// Search with query validation
const searchSchema = z.object({
  q: z.string().min(1),
  page: z.string().transform(v => parseInt(v) || 1),
  limit: z.string().transform(v => Math.min(parseInt(v) || 10, 100)),
  sort: z.enum(['asc', 'desc']).default('asc'),
});

app.get('/api/users/search', async (ctx) => {
  const params = Object.fromEntries(ctx.url.searchParams);
  const result = searchSchema.safeParse(params);
  
  if (!result.success) {
    return json({
      error: 'Invalid query parameters',
      issues: result.error.issues
    }, { status: 400 });
  }
  
  const { q, page, limit, sort } = result.data;
  const users = await database.searchUsers({ q, page, limit, sort });
  
  return json({ users, page, limit });
});

app.listen(3000);
```

## Type Safety

Zod provides full type inference:

```typescript
const userSchema = z.object({
  name: z.string(),
  email: z.string().email(),
  age: z.number().optional(),
});

// Infer TypeScript type from schema
type User = z.infer<typeof userSchema>;
// {
//   name: string;
//   email: string;
//   age?: number;
// }

// Use in functions
async function createUser(data: User) {
  // data is fully typed
  const name = data.name; // string
  const email = data.email; // string
  const age = data.age; // number | undefined
}
```

## Best Practices

1. **Define schemas near usage**

```typescript
// Good
app.post('/users', async (ctx) => {
  const schema = z.object({
    name: z.string(),
    email: z.string().email(),
  });
  
  const data = schema.parse(await ctx.request.json());
});
```

2. **Reuse common schemas**

```typescript
const emailSchema = z.string().email();
const passwordSchema = z.string().min(8);

const loginSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
});

const registerSchema = z.object({
  name: z.string(),
  email: emailSchema,
  password: passwordSchema,
});
```

3. **Use safe validation in production**

```typescript
// Prefer safeParse() over parse()
const result = schema.safeParse(data);

if (!result.success) {
  // Handle error gracefully
  return json({ error: result.error }, { status: 400 });
}

// Use validated data
const validated = result.data;
```

4. **Provide clear error messages**

```typescript
const schema = z.object({
  name: z.string({ required_error: 'Name is required' })
    .min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please provide a valid email address'),
});
```

5. **Validate at the boundary**

```typescript
// Validate incoming data immediately
app.post('/api/data', async (ctx) => {
  const body = await ctx.request.json();
  const validated = schema.parse(body); // Validate here
  
  // Now work with validated, type-safe data
  await processData(validated);
});
```
