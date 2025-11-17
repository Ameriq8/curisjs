# Database API Reference

Complete API reference for `@curisjs/db` package.

::: tip Source Code
All source code is available on [GitHub](https://github.com/Ameriq8/curisjs/tree/develop/packages/db/src)
:::

## Model

### Class: `Model`

<Badge type="tip" text="Source" /> [View on GitHub](https://github.com/Ameriq8/curisjs/blob/develop/packages/db/src/model.ts)

Base class for all database models.

#### Static Properties

##### `tableName`

**Type:** `string`

The database table name.

**Example:**
```typescript
class User extends Model {
  static tableName = 'users';
}
```

##### `timestamps`

**Type:** `boolean`

Enable automatic timestamps (default: true).

**Example:**
```typescript
class User extends Model {
  static tableName = 'users';
  static timestamps = true; // Adds createdAt, updatedAt
}
```

##### `softDelete`

**Type:** `boolean`

Enable soft deletes (default: false).

**Example:**
```typescript
class User extends Model {
  static tableName = 'users';
  static softDelete = true; // Adds deletedAt
}
```

##### `primaryKey`

**Type:** `string`

Primary key column name (default: 'id').

**Example:**
```typescript
class User extends Model {
  static tableName = 'users';
  static primaryKey = 'userId';
}
```

---

### Static Methods

#### Query Methods

##### `findById(id)`

Find a record by primary key.

**Signature:**
```typescript
static findById<T extends Model>(id: number | string): Promise<T | null>
```

**Parameters:**
- `id`: Primary key value

**Returns:** Promise resolving to model instance or null

**Example:**
```typescript
const user = await User.findById(1);
if (user) {
  console.log(user.name);
}
```

##### `findOne(conditions)`

Find a single record matching conditions.

**Signature:**
```typescript
static findOne<T extends Model>(conditions: Partial<T>): Promise<T | null>
```

**Example:**
```typescript
const user = await User.findOne({ email: 'user@example.com' });
```

##### `findMany(options?)`

Find multiple records.

**Signature:**
```typescript
static findMany<T extends Model>(options?: FindOptions): Promise<T[]>
```

**Options:**
- `where`: Query conditions
- `limit`: Maximum records
- `offset`: Skip records
- `orderBy`: Sort order
- `select`: Columns to select

**Example:**
```typescript
const users = await User.findMany({
  where: { active: true },
  limit: 10,
  offset: 0,
  orderBy: { createdAt: 'desc' }
});
```

##### `findAll()`

Find all records.

**Signature:**
```typescript
static findAll<T extends Model>(): Promise<T[]>
```

**Example:**
```typescript
const users = await User.findAll();
```

##### `count(conditions?)`

Count records matching conditions.

**Signature:**
```typescript
static count(conditions?: Record<string, any>): Promise<number>
```

**Example:**
```typescript
const total = await User.count();
const activeCount = await User.count({ active: true });
```

##### `exists(conditions)`

Check if record exists.

**Signature:**
```typescript
static exists(conditions: Record<string, any>): Promise<boolean>
```

**Example:**
```typescript
const exists = await User.exists({ email: 'user@example.com' });
```

#### CRUD Methods

##### `create(data)`

Create a new record.

**Signature:**
```typescript
static create<T extends Model>(data: Partial<T>): Promise<T>
```

**Example:**
```typescript
const user = await User.create({
  name: 'John Doe',
  email: 'john@example.com'
});
```

##### `createMany(data)`

Create multiple records.

**Signature:**
```typescript
static createMany<T extends Model>(data: Partial<T>[]): Promise<T[]>
```

**Example:**
```typescript
const users = await User.createMany([
  { name: 'John', email: 'john@example.com' },
  { name: 'Jane', email: 'jane@example.com' }
]);
```

##### `updateById(id, data)`

Update a record by ID.

**Signature:**
```typescript
static updateById<T extends Model>(
  id: number | string, 
  data: Partial<T>
): Promise<T | null>
```

**Example:**
```typescript
const user = await User.updateById(1, { name: 'Updated Name' });
```

##### `updateMany(conditions, data)`

Update multiple records.

**Signature:**
```typescript
static updateMany(
  conditions: Record<string, any>,
  data: Record<string, any>
): Promise<number>
```

**Returns:** Number of updated records

**Example:**
```typescript
const count = await User.updateMany(
  { active: false },
  { status: 'inactive' }
);
```

##### `deleteById(id)`

Delete a record by ID.

**Signature:**
```typescript
static deleteById(id: number | string): Promise<boolean>
```

**Returns:** True if deleted, false if not found

**Example:**
```typescript
const deleted = await User.deleteById(1);
```

##### `deleteMany(conditions)`

Delete multiple records.

**Signature:**
```typescript
static deleteMany(conditions: Record<string, any>): Promise<number>
```

**Returns:** Number of deleted records

**Example:**
```typescript
const count = await User.deleteMany({ active: false });
```

#### Relationship Methods

##### `hasMany(model, foreignKey?, localKey?)`

Define a one-to-many relationship.

**Signature:**
```typescript
static hasMany<T extends Model>(
  model: typeof Model,
  foreignKey?: string,
  localKey?: string
): Relationship<T[]>
```

**Example:**
```typescript
class User extends Model {
  static tableName = 'users';
  
  posts() {
    return this.hasMany(Post, 'userId', 'id');
  }
}
```

##### `belongsTo(model, foreignKey?, ownerKey?)`

Define an inverse one-to-many relationship.

**Signature:**
```typescript
belongsTo<T extends Model>(
  model: typeof Model,
  foreignKey?: string,
  ownerKey?: string
): Relationship<T>
```

**Example:**
```typescript
class Post extends Model {
  static tableName = 'posts';
  
  user() {
    return this.belongsTo(User, 'userId', 'id');
  }
}
```

##### `hasOne(model, foreignKey?, localKey?)`

Define a one-to-one relationship.

**Signature:**
```typescript
static hasOne<T extends Model>(
  model: typeof Model,
  foreignKey?: string,
  localKey?: string
): Relationship<T>
```

##### `belongsToMany(model, pivotTable, foreignKey?, relatedKey?)`

Define a many-to-many relationship.

**Signature:**
```typescript
static belongsToMany<T extends Model>(
  model: typeof Model,
  pivotTable: string,
  foreignKey?: string,
  relatedKey?: string
): Relationship<T[]>
```

**Example:**
```typescript
class User extends Model {
  roles() {
    return this.belongsToMany(Role, 'user_roles', 'userId', 'roleId');
  }
}
```

---

### Instance Methods

##### `save()`

Save changes to the database.

**Signature:**
```typescript
save(): Promise<this>
```

**Example:**
```typescript
const user = await User.findById(1);
user.name = 'Updated Name';
await user.save();
```

##### `update(data)`

Update instance properties and save.

**Signature:**
```typescript
update(data: Partial<this>): Promise<this>
```

**Example:**
```typescript
const user = await User.findById(1);
await user.update({ name: 'New Name', email: 'new@example.com' });
```

##### `delete()`

Delete the record.

**Signature:**
```typescript
delete(): Promise<boolean>
```

**Example:**
```typescript
const user = await User.findById(1);
await user.delete();
```

##### `restore()`

Restore a soft-deleted record.

**Signature:**
```typescript
restore(): Promise<this>
```

**Example:**
```typescript
const user = await User.findById(1);
await user.restore();
```

##### `fresh()`

Reload the model from database.

**Signature:**
```typescript
fresh(): Promise<this>
```

**Example:**
```typescript
const user = await User.findById(1);
// ... modifications by other processes
const refreshed = await user.fresh();
```

##### `toJSON()`

Convert model to plain object.

**Signature:**
```typescript
toJSON(): Record<string, any>
```

---

## QueryBuilder

### Class: `QueryBuilder`

<Badge type="tip" text="Source" /> [View on GitHub](https://github.com/Ameriq8/curisjs/blob/develop/packages/db/src/query-builder.ts)

Fluent query builder.

#### Methods

##### `table(tableName)`

Set the table for the query.

**Signature:**
```typescript
table(tableName: string): QueryBuilder
```

**Example:**
```typescript
import { db } from '@curisjs/db';

const users = await db.table('users').get();
```

##### `select(...columns)`

Select specific columns.

**Signature:**
```typescript
select(...columns: string[]): QueryBuilder
```

**Example:**
```typescript
const users = await db.table('users')
  .select('id', 'name', 'email')
  .get();
```

##### `where(column, operator?, value?)`

Add a WHERE clause.

**Signature:**
```typescript
where(
  column: string | Record<string, any>,
  operator?: string,
  value?: any
): QueryBuilder
```

**Example:**
```typescript
// Simple equality
await db.table('users').where('active', true).get();

// With operator
await db.table('users').where('age', '>', 18).get();

// Object syntax
await db.table('users').where({ active: true, role: 'admin' }).get();
```

##### `whereIn(column, values)`

WHERE IN clause.

**Signature:**
```typescript
whereIn(column: string, values: any[]): QueryBuilder
```

**Example:**
```typescript
await db.table('users').whereIn('id', [1, 2, 3]).get();
```

##### `whereNull(column)`

WHERE NULL clause.

**Signature:**
```typescript
whereNull(column: string): QueryBuilder
```

##### `whereNotNull(column)`

WHERE NOT NULL clause.

**Signature:**
```typescript
whereNotNull(column: string): QueryBuilder
```

##### `whereBetween(column, range)`

WHERE BETWEEN clause.

**Signature:**
```typescript
whereBetween(column: string, range: [any, any]): QueryBuilder
```

**Example:**
```typescript
await db.table('users').whereBetween('age', [18, 65]).get();
```

##### `orWhere(column, operator?, value?)`

Add an OR WHERE clause.

**Signature:**
```typescript
orWhere(column: string, operator?: string, value?: any): QueryBuilder
```

##### `orderBy(column, direction?)`

Add ORDER BY clause.

**Signature:**
```typescript
orderBy(column: string, direction?: 'asc' | 'desc'): QueryBuilder
```

**Example:**
```typescript
await db.table('users').orderBy('createdAt', 'desc').get();
```

##### `limit(count)`

Limit number of results.

**Signature:**
```typescript
limit(count: number): QueryBuilder
```

##### `offset(count)`

Skip records.

**Signature:**
```typescript
offset(count: number): QueryBuilder
```

##### `join(table, first, operator?, second?)`

Add a JOIN clause.

**Signature:**
```typescript
join(
  table: string,
  first: string,
  operator?: string,
  second?: string
): QueryBuilder
```

**Example:**
```typescript
await db.table('users')
  .join('posts', 'users.id', '=', 'posts.userId')
  .get();
```

##### `leftJoin(table, first, operator?, second?)`

Add a LEFT JOIN clause.

**Signature:**
```typescript
leftJoin(table: string, first: string, operator?: string, second?: string): QueryBuilder
```

##### `groupBy(...columns)`

Add GROUP BY clause.

**Signature:**
```typescript
groupBy(...columns: string[]): QueryBuilder
```

##### `having(column, operator, value)`

Add HAVING clause.

**Signature:**
```typescript
having(column: string, operator: string, value: any): QueryBuilder
```

##### `get()`

Execute query and get results.

**Signature:**
```typescript
get<T = any>(): Promise<T[]>
```

##### `first()`

Get first result.

**Signature:**
```typescript
first<T = any>(): Promise<T | null>
```

##### `find(id)`

Find by primary key.

**Signature:**
```typescript
find<T = any>(id: number | string): Promise<T | null>
```

##### `count(column?)`

Count records.

**Signature:**
```typescript
count(column?: string): Promise<number>
```

##### `sum(column)`

Sum column values.

**Signature:**
```typescript
sum(column: string): Promise<number>
```

##### `avg(column)`

Average of column values.

**Signature:**
```typescript
avg(column: string): Promise<number>
```

##### `min(column)`

Minimum value.

**Signature:**
```typescript
min(column: string): Promise<number>
```

##### `max(column)`

Maximum value.

**Signature:**
```typescript
max(column: string): Promise<number>
```

##### `insert(data)`

Insert record(s).

**Signature:**
```typescript
insert(data: Record<string, any> | Record<string, any>[]): Promise<number[]>
```

**Returns:** Array of inserted IDs

**Example:**
```typescript
const [id] = await db.table('users').insert({
  name: 'John',
  email: 'john@example.com'
});
```

##### `update(data)`

Update records.

**Signature:**
```typescript
update(data: Record<string, any>): Promise<number>
```

**Returns:** Number of updated records

##### `delete()`

Delete records.

**Signature:**
```typescript
delete(): Promise<number>
```

**Returns:** Number of deleted records

##### `raw(sql, bindings?)`

Execute raw SQL.

**Signature:**
```typescript
raw(sql: string, bindings?: any[]): Promise<any>
```

---

## Connection

<Badge type="tip" text="Source" /> [View on GitHub](https://github.com/Ameriq8/curisjs/blob/develop/packages/db/src/connection.ts)

### `createConnection(config)`

Create a database connection.

**Signature:**
```typescript
createConnection(config: ConnectionConfig): Connection
```

**Config:**
```typescript
interface ConnectionConfig {
  client: 'better-sqlite3' | 'pg' | 'mysql2';
  connection: {
    filename?: string;      // SQLite
    host?: string;          // PostgreSQL/MySQL
    port?: number;          // PostgreSQL/MySQL
    user?: string;          // PostgreSQL/MySQL
    password?: string;      // PostgreSQL/MySQL
    database?: string;      // PostgreSQL/MySQL
  };
  pool?: {
    min?: number;
    max?: number;
  };
}
```

**Example:**
```typescript
import { createConnection } from '@curisjs/db';

// SQLite
const db = createConnection({
  client: 'better-sqlite3',
  connection: {
    filename: './database.sqlite'
  }
});

// PostgreSQL
const db = createConnection({
  client: 'pg',
  connection: {
    host: 'localhost',
    port: 5432,
    user: 'postgres',
    password: 'password',
    database: 'myapp'
  }
});
```

---

## Transactions

<Badge type="tip" text="Source" /> [View on GitHub](https://github.com/Ameriq8/curisjs/blob/develop/packages/db/src/transaction.ts)

### `transaction(callback)`

Execute queries in a transaction.

**Signature:**
```typescript
transaction<T>(callback: (trx: Transaction) => Promise<T>): Promise<T>
```

**Example:**
```typescript
import { db } from '@curisjs/db';

await db.transaction(async (trx) => {
  await trx.table('users').insert({ name: 'John' });
  await trx.table('posts').insert({ userId: 1, title: 'Hello' });
});
```

### Transaction Object Methods

##### `commit()`

Commit the transaction.

**Signature:**
```typescript
commit(): Promise<void>
```

##### `rollback()`

Rollback the transaction.

**Signature:**
```typescript
rollback(): Promise<void>
```

##### `savepoint(name)`

Create a savepoint.

**Signature:**
```typescript
savepoint(name: string): Promise<void>
```

##### `rollbackTo(name)`

Rollback to a savepoint.

**Signature:**
```typescript
rollbackTo(name: string): Promise<void>
```

---

## Schema Builder

<Badge type="tip" text="Source" /> [View on GitHub](https://github.com/Ameriq8/curisjs/blob/develop/packages/db/src/schema/builder.ts)

### `schema.createTable(tableName, callback)`

Create a new table.

**Signature:**
```typescript
schema.createTable(
  tableName: string,
  callback: (table: TableBuilder) => void
): Promise<void>
```

**Example:**
```typescript
import { db } from '@curisjs/db';

await db.schema.createTable('users', (table) => {
  table.increments('id').primary();
  table.string('name').notNullable();
  table.string('email').notNullable().unique();
  table.timestamps(true, true);
});
```

### TableBuilder Methods

##### Column Types

```typescript
// Integers
table.increments(name)      // Auto-increment integer
table.integer(name)          // Integer
table.bigInteger(name)       // Big integer
table.tinyint(name)          // Tiny integer

// Decimals
table.decimal(name, precision?, scale?)
table.float(name, precision?, scale?)
table.double(name, precision?, scale?)

// Strings
table.string(name, length?)  // VARCHAR
table.text(name, type?)      // TEXT
table.uuid(name)             // UUID

// Dates
table.date(name)             // DATE
table.datetime(name)         // DATETIME
table.timestamp(name)        // TIMESTAMP
table.timestamps(useTimestamps?, defaultToNow?)  // created_at, updated_at

// Boolean
table.boolean(name)          // BOOLEAN

// JSON
table.json(name)             // JSON
table.jsonb(name)            // JSONB (PostgreSQL)

// Binary
table.binary(name)           // BLOB
```

##### Column Modifiers

```typescript
column.notNullable()         // NOT NULL
column.nullable()            // Allow NULL
column.defaultTo(value)      // DEFAULT value
column.unique()              // UNIQUE constraint
column.primary()             // PRIMARY KEY
column.unsigned()            // UNSIGNED (MySQL)
column.index(indexName?)     // Create index
column.comment(text)         // Column comment
```

##### Table Methods

```typescript
table.foreign(column)
  .references(column)
  .inTable(table)
  .onDelete(action)
  .onUpdate(action)

table.index(columns, indexName?, indexType?)
table.unique(columns, indexName?)
table.dropColumn(name)
table.renameColumn(from, to)
```

---

## Migrations

### `migrate.latest()`

Run all pending migrations.

**Signature:**
```typescript
migrate.latest(): Promise<void>
```

### `migrate.rollback()`

Rollback last batch of migrations.

**Signature:**
```typescript
migrate.rollback(): Promise<void>
```

### `migrate.up()`

Run next migration.

**Signature:**
```typescript
migrate.up(): Promise<void>
```

### `migrate.down()`

Rollback last migration.

**Signature:**
```typescript
migrate.down(): Promise<void>
```

---

## Types

<Badge type="tip" text="Source" /> [View on GitHub](https://github.com/Ameriq8/curisjs/blob/develop/packages/db/src/types.ts)

### `FindOptions`

Options for finding records.

```typescript
interface FindOptions {
  where?: Record<string, any>;
  select?: string[];
  limit?: number;
  offset?: number;
  orderBy?: Record<string, 'asc' | 'desc'>;
  include?: string[];
}
```

### `Relationship<T>`

Relationship definition.

```typescript
interface Relationship<T> {
  get(): Promise<T>;
  load(): Promise<T>;
}
```

---

## See Also

- [Models Guide](/db/models)
- [Query Builder Guide](/db/query-builder)
- [Relations Guide](/db/relations)
- [Transactions Guide](/db/transactions)
- [Migrations Guide](/db/migrations)
