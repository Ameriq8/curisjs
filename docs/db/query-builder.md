# Query Builder

Build complex database queries with a fluent, type-safe API.

## Basic Usage

```typescript
import { User } from './models/User';

// Select all users
const users = await User.query();

// Select with conditions
const activeUsers = await User.query()
  .where('active', true);

// Select specific columns
const users = await User.query()
  .select('id', 'name', 'email');
```

## WHERE Clauses

### Basic WHERE

```typescript
// Simple equality
await User.query().where('name', 'John');

// With operator
await User.query().where('age', '>', 18);

// Multiple conditions (AND)
await User.query()
  .where('active', true)
  .where('age', '>=', 18);
```

### OR WHERE

```typescript
await User.query()
  .where('role', 'admin')
  .orWhere('role', 'moderator');
```

### WHERE IN

```typescript
await User.query()
  .whereIn('status', ['active', 'pending']);

await User.query()
  .whereNotIn('role', ['guest', 'banned']);
```

### WHERE NULL

```typescript
await User.query().whereNull('deletedAt');
await User.query().whereNotNull('emailVerifiedAt');
```

### WHERE BETWEEN

```typescript
await User.query()
  .whereBetween('age', [18, 65]);
```

### Raw WHERE

```typescript
await User.query()
  .whereRaw('LOWER(email) = ?', ['john@example.com']);
```

## Ordering

```typescript
// Order by single column
await User.query().orderBy('createdAt', 'desc');

// Order by multiple columns
await User.query()
  .orderBy('role', 'asc')
  .orderBy('name', 'asc');

// Raw order
await User.query()
  .orderByRaw('RAND()');
```

## Limiting & Pagination

```typescript
// Limit results
await User.query().limit(10);

// Offset
await User.query().offset(20).limit(10);

// Pagination helper
await User.query().paginate(page: 2, perPage: 20);
```

## Aggregates

```typescript
// Count
const count = await User.query().count();

// Count with condition
const activeCount = await User.query()
  .where('active', true)
  .count();

// Sum
const totalAge = await User.query().sum('age');

// Average
const avgAge = await User.query().avg('age');

// Min/Max
const youngest = await User.query().min('age');
const oldest = await User.query().max('age');
```

## Joins

```typescript
// Inner join
await User.query()
  .join('posts', 'users.id', 'posts.userId')
  .select('users.*', 'posts.title');

// Left join
await User.query()
  .leftJoin('posts', 'users.id', 'posts.userId');

// Multiple joins
await User.query()
  .join('posts', 'users.id', 'posts.userId')
  .join('comments', 'posts.id', 'comments.postId');
```

## Grouping

```typescript
await User.query()
  .select('role', db.raw('COUNT(*) as count'))
  .groupBy('role');

await User.query()
  .groupBy('role')
  .having('count', '>', 5);
```

## Subqueries

```typescript
const subquery = Post.query()
  .select('userId')
  .where('published', true);

await User.query()
  .whereIn('id', subquery);
```

## Raw Queries

```typescript
import { db } from '@curisjs/db';

// Raw select
const users = await db.raw('SELECT * FROM users WHERE active = ?', [true]);

// Raw with query builder
await User.query()
  .whereRaw('YEAR(createdAt) = ?', [2024]);
```

## Complete Example

```typescript
const results = await User.query()
  .select('id', 'name', 'email', 'role')
  .where('active', true)
  .where('age', '>=', 18)
  .whereIn('role', ['user', 'admin'])
  .whereNotNull('emailVerifiedAt')
  .orderBy('createdAt', 'desc')
  .limit(20)
  .offset(0);
```

For more examples, see the [Models documentation](/db/models).
