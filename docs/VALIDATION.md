# Validation System - Laravel-like Request Validation

CurisJS provides a powerful and expressive validation system inspired by Laravel, with fluent API, built-in rules, custom validators, and seamless Context integration.

## Table of Contents

- [Quick Start](#quick-start)
- [Built-in Rules](#built-in-rules)
- [Context Integration](#context-integration)
- [Custom Rules](#custom-rules)
- [Error Messages](#error-messages)
- [Advanced Usage](#advanced-usage)

## Quick Start

### Basic Validation

```typescript
import { validate } from '@curisjs/core';

const result = await validate(
  { email: 'test@example.com', age: 25 },
  {
    email: ['required', 'email'],
    age: ['required', 'number', 'min:18'],
  }
);

if (!result.valid) {
  console.log(result.errors);
}
```

### Context Integration (Recommended)

```typescript
import { createApp, json } from '@curisjs/core';

const app = createApp();

app.post('/users', async (ctx) => {
  // Validate and throw on error (returns 422 with validation errors)
  const data = await ctx.validateOrFail({
    name: ['required', 'string', 'min:3'],
    email: ['required', 'email'],
    age: ['required', 'integer', 'min:18', 'max:120'],
  });

  // Data is validated and typed
  return json({ message: 'User created!', data });
});

// Or manually handle validation
app.post('/login', async (ctx) => {
  const result = await ctx.validate({
    email: ['required', 'email'],
    password: ['required', 'min:8'],
  });

  if (!result.valid) {
    return json({ errors: result.errors }, 422);
  }

  return json({ message: 'Login successful' });
});
```

## Built-in Rules

### Type Validation

| Rule      | Description              | Example       |
| --------- | ------------------------ | ------------- |
| `string`  | Value must be a string   | `['string']`  |
| `number`  | Value must be a number   | `['number']`  |
| `integer` | Value must be an integer | `['integer']` |
| `boolean` | Value must be a boolean  | `['boolean']` |
| `array`   | Value must be an array   | `['array']`   |
| `object`  | Value must be an object  | `['object']`  |

### String Validation

| Rule            | Description         | Example            |
| --------------- | ------------------- | ------------------ |
| `email`         | Valid email address | `['email']`        |
| `url`           | Valid URL           | `['url']`          |
| `uuid`          | Valid UUID          | `['uuid']`         |
| `alpha`         | Letters only        | `['alpha']`        |
| `alphaNumeric`  | Letters and numbers | `['alphaNumeric']` |
| `regex:pattern` | Match regex pattern | `['regex:^[A-Z]']` |

### Size Validation

| Rule        | Description                    | Example        |
| ----------- | ------------------------------ | -------------- |
| `required`  | Cannot be null/undefined/empty | `['required']` |
| `min:value` | Minimum length/value           | `['min:3']`    |
| `max:value` | Maximum length/value           | `['max:50']`   |

### Date Validation

| Rule          | Description           | Example                 |
| ------------- | --------------------- | ----------------------- |
| `date`        | Valid date            | `['date']`              |
| `after:date`  | After specified date  | `['after:2024-01-01']`  |
| `before:date` | Before specified date | `['before:2024-12-31']` |

### Comparison Validation

| Rule              | Description                    | Example                    |
| ----------------- | ------------------------------ | -------------------------- |
| `in:val1,val2`    | Value in list                  | `['in:admin,user,guest']`  |
| `notIn:val1,val2` | Value not in list              | `['notIn:banned,deleted']` |
| `confirmed`       | Matches `{field}_confirmation` | `['confirmed']`            |

## Context Integration

### Validate Request Body

```typescript
app.post('/register', async (ctx) => {
  const data = await ctx.validateOrFail({
    username: ['required', 'string', 'min:3', 'alphaNumeric'],
    email: ['required', 'email'],
    password: ['required', 'min:8', 'confirmed'],
    age: ['required', 'integer', 'min:18'],
    role: ['in:user,admin'],
  });

  // Create user with validated data
  return json({ user: data }, 201);
});
```

### Manual Validation with Custom Response

```typescript
app.post('/settings', async (ctx) => {
  const result = await ctx.validate({
    theme: ['required', 'in:light,dark,auto'],
    notifications: ['required', 'boolean'],
    language: ['required', 'in:en,es,fr'],
  });

  if (!result.valid) {
    return json(
      {
        success: false,
        errors: result.errors.map((e) => ({
          field: e.field,
          message: e.message,
        })),
      },
      400
    );
  }

  return json({ success: true, settings: result.data });
});
```

## Custom Rules

### Function-based Custom Rules

```typescript
import { Validator } from '@curisjs/core';

const validator = new Validator();

validator.setRules({
  username: [
    'required',
    // Inline custom rule
    (value: unknown) => {
      return (
        typeof value === 'string' && value.length >= 3 && !/\s/.test(value) // no whitespace
      );
    },
  ],
  website: [
    // Async custom rule
    async (value: unknown) => {
      if (typeof value !== 'string') return false;
      // Simulate checking if URL is reachable
      return await checkUrlReachable(value);
    },
  ],
});

const result = await validator.validate(data);
```

### Named Custom Rules

```typescript
import { Validator } from '@curisjs/core';

const validator = new Validator();

// Register named custom rule
validator.addRule('strongPassword', (value: unknown) => {
  if (typeof value !== 'string') return false;
  return (
    value.length >= 8 &&
    /[A-Z]/.test(value) && // uppercase
    /[a-z]/.test(value) && // lowercase
    /[0-9]/.test(value) && // number
    /[@$!%*?&#]/.test(value) // special char
  );
});

validator.setRules({
  password: ['required', 'strongPassword'],
});
```

### Async Database Validation

```typescript
validator.addRule('uniqueEmail', async (value: unknown, data) => {
  if (typeof value !== 'string') return false;
  const exists = await db.users.findOne({ email: value });
  return !exists;
});

validator.setRules({
  email: ['required', 'email', 'uniqueEmail'],
});
```

## Error Messages

### Default Error Messages

Default messages are automatically generated:

```javascript
{
  field: 'email',
  rule: 'email',
  message: 'The email must be a valid email address.'
}
```

### Custom Error Messages

```typescript
const result = await validate(
  data,
  {
    email: ['required', 'email'],
    password: ['required', 'min:8'],
  },
  {
    // Specific field and rule
    'email.required': 'We need your email address!',
    'email.email': 'Please provide a valid email.',
    'password.min': 'Password must be at least 8 characters.',
  }
);
```

### Custom Messages with Validator

```typescript
const validator = new Validator();

validator.setRules({
  username: ['required', 'min:3'],
  age: ['required', 'integer', 'min:18'],
});

validator.setMessages({
  'username.required': 'Username is required!',
  'username.min': 'Username too short',
  'age.min': 'You must be at least 18 years old',
});

const result = await validator.validate(data);
```

## Advanced Usage

### Conditional Validation

```typescript
app.post('/payment', async (ctx) => {
  const body = await ctx.json();

  // Base rules
  const rules: Record<string, string[]> = {
    amount: ['required', 'number', 'min:1'],
    currency: ['required', 'in:USD,EUR,GBP'],
  };

  // Conditional rules based on payment method
  if (body.method === 'card') {
    rules.cardNumber = ['required', 'regex:^[0-9]{16}$'];
    rules.cvv = ['required', 'regex:^[0-9]{3,4}$'];
  } else if (body.method === 'paypal') {
    rules.paypalEmail = ['required', 'email'];
  }

  const data = await validate(body, rules);
  return json(data);
});
```

### Nested Object Validation

```typescript
// Validate nested data structure
const result = await validate(
  {
    user: {
      name: 'John',
      email: 'john@example.com',
    },
    preferences: {
      theme: 'dark',
    },
  },
  {
    'user.name': ['required', 'string'],
    'user.email': ['required', 'email'],
    'preferences.theme': ['required', 'in:light,dark'],
  }
);
```

### Password Confirmation

```typescript
app.post('/register', async (ctx) => {
  const data = await ctx.validateOrFail({
    password: ['required', 'min:8', 'confirmed'],
    // Expects password_confirmation field in request
  });

  // password and password_confirmation match
  return json({ message: 'Registration successful' });
});
```

### Complex Validation with Multiple Rules

```typescript
const result = await validate(
  userData,
  {
    name: ['required', 'string', 'min:3', 'max:50', 'alpha'],
    email: ['required', 'email'],
    age: ['required', 'integer', 'min:18', 'max:120'],
    role: ['required', 'in:admin,user,moderator'],
    website: ['url'],
    bio: ['string', 'max:500'],
    birthdate: ['required', 'date', 'before:2006-01-01'],
    tags: ['required', 'array'],
  },
  {
    'name.required': 'Name is required',
    'age.min': 'Must be at least 18 years old',
    'birthdate.before': 'Must be born before 2006',
  }
);
```

## Error Handling

### ValidationError Class

```typescript
import { ValidationError } from '@curisjs/core';

try {
  const data = await ctx.validateOrFail(rules);
} catch (error) {
  if (error instanceof ValidationError) {
    return json(
      {
        message: 'Validation failed',
        errors: error.errors,
      },
      422
    );
  }
  throw error;
}
```

### Global Error Handler

```typescript
app.use(async (ctx, next) => {
  try {
    return await next();
  } catch (error) {
    if (error instanceof ValidationError) {
      return json(
        {
          message: 'Validation failed',
          errors: error.errors,
        },
        422
      );
    }
    return json({ message: 'Internal server error' }, 500);
  }
});
```

## Best Practices

1. **Use Context Integration**: Prefer `ctx.validate()` or `ctx.validateOrFail()` for request validation
2. **Centralize Rules**: Create reusable rule sets for common validation scenarios
3. **Custom Messages**: Provide user-friendly error messages
4. **Type Safety**: Use TypeScript generics with validation results
5. **Async Rules**: Use async custom rules for database uniqueness checks
6. **Error Handling**: Always handle validation errors appropriately

## Next Steps

- [Database & ORM](./database.md) - Coming soon
- [Authentication](./authentication.md) - Coming soon
- [API Documentation](./api.md) - Complete API reference

---

**CurisJS** - Laravel-like validation for modern TypeScript/JavaScript applications! 🚀
