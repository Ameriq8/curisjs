# Migrations

Manage database schema changes with migrations.

## Creating Migrations

```bash
curis g migration CreateUsersTable
```

This generates a migration file:

```typescript
import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('users', (table) => {
    table.increments('id').primary();
    table.string('name').notNullable();
    table.string('email').notNullable().unique();
    table.boolean('active').defaultTo(true);
    table.timestamps(true, true);
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('users');
}
```

## Running Migrations

```bash
# Run all pending migrations
curis db:migrate

# Rollback last migration
curis db:migrate --rollback

# Reset database
curis db:migrate --reset
```

## Schema Builder

### Create Table

```typescript
export async function up(knex: Knex) {
  return knex.schema.createTable('posts', (table) => {
    table.increments('id');
    table.integer('userId').notNullable();
    table.string('title').notNullable();
    table.text('content');
    table.boolean('published').defaultTo(false);
    table.timestamps(true, true);
    
    table.foreign('userId').references('users.id').onDelete('CASCADE');
  });
}
```

### Alter Table

```typescript
export async function up(knex: Knex) {
  return knex.schema.alterTable('users', (table) => {
    table.string('phone').nullable();
    table.date('birthdate').nullable();
  });
}
```

### Drop Table

```typescript
export async function down(knex: Knex) {
  return knex.schema.dropTable('posts');
}
```

## Column Types

```typescript
table.increments('id');              // Auto-increment integer
table.integer('count');               // Integer
table.bigInteger('bigCount');        // Big integer
table.string('name', 100);           // VARCHAR(100)
table.text('description');           // TEXT
table.boolean('active');             // Boolean
table.date('createdAt');             // Date
table.datetime('updatedAt');         // DateTime
table.timestamp('deletedAt');        // Timestamp
table.decimal('price', 8, 2);        // Decimal(8,2)
table.float('rating');               // Float
table.json('metadata');              // JSON
table.uuid('id');                    // UUID
```

## Constraints

```typescript
// Not null
table.string('email').notNullable();

// Unique
table.string('email').unique();

// Default value
table.boolean('active').defaultTo(true);

// Primary key
table.increments('id').primary();

// Foreign key
table.integer('userId')
  .references('id')
  .inTable('users')
  .onDelete('CASCADE')
  .onUpdate('CASCADE');

// Index
table.index(['email', 'active']);
```

For more details, see the [CLI documentation](/cli/).
