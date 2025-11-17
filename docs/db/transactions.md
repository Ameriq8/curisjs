# Transactions

Ensure data integrity with database transactions.

## Basic Usage

```typescript
import { db } from '@curisjs/db';

await db.transaction(async (trx) => {
  const user = await User.create({
    name: 'John',
    email: 'john@example.com',
  }, { transaction: trx });
  
  await Post.create({
    userId: user.id,
    title: 'First Post',
  }, { transaction: trx });
  
  // Automatically commits if successful
  // Automatically rolls back if error occurs
});
```

## Manual Control

```typescript
const trx = await db.transaction();

try {
  const user = await User.create({ name: 'John' }, { transaction: trx });
  await Post.create({ userId: user.id, title: 'Post' }, { transaction: trx });
  
  await trx.commit();
} catch (error) {
  await trx.rollback();
  throw error;
}
```

## Savepoints

```typescript
await db.transaction(async (trx) => {
  await User.create({ name: 'John' }, { transaction: trx });
  
  const savepoint = await trx.savepoint();
  
  try {
    await Post.create({ title: 'Post' }, { transaction: trx });
  } catch (error) {
    await savepoint.rollback();
  }
  
  await savepoint.release();
});
```

## Isolation Levels

```typescript
await db.transaction(async (trx) => {
  // Transaction code
}, {
  isolationLevel: 'read uncommitted' | 'read committed' | 'repeatable read' | 'serializable'
});
```

For more examples, see the [Models documentation](/db/models).
