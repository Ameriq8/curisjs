# @curisjs/db Examples

Simple, standalone examples demonstrating @curisjs/db features.

## Available Examples

### Server Examples

- **`bun-server.ts`** - Todo API with Bun runtime
- **`deno-server.ts`** - Todo API with Deno runtime
- **`node-server.ts`** - Todo API with Node.js runtime

### Feature Examples

- **`query-builder.ts`** - Advanced query building
- **`transactions.ts`** - ACID transactions with rollback
- **`model-crud.ts`** - Model CRUD operations with Active Record pattern

## Running Examples

### Bun

```bash
# From the db package directory
cd packages/db

# Run any example
bun run examples/bun-server.ts
bun run examples/query-builder.ts
bun run examples/transactions.ts
bun run examples/model-crud.ts
```

### Deno

```bash
deno run --allow-net --allow-read --allow-write examples/deno-server.ts
```

### Node.js

```bash
node --loader ts-node/esm examples/node-server.ts
```

## What Each Example Demonstrates

### Server Examples

- Basic CRUD operations (Create, Read, Update, Delete)
- Database initialization
- Schema definition
- Model usage
- CurisJS integration
- Runtime-agnostic code

### Query Builder Example

- Simple SELECT queries
- Filtered queries with WHERE
- Range queries (BETWEEN)
- Multiple conditions
- Aggregations (COUNT, AVG)
- GROUP BY and ORDER BY
- UPDATE operations
- Raw queries

### Transactions Example

- Successful transaction with commit
- Failed transaction with rollback
- Multiple operations in one transaction
- Error handling in transactions
- ACID compliance demonstration

### Model CRUD Example

- Creating records
- Finding by ID
- Finding many with filters
- Updating records
- Soft deletes
- Restoring deleted records
- Query builder integration
- Count and exists operations

## Testing the APIs

Once a server example is running, you can test it:

```bash
# List todos
curl http://localhost:3000/todos

# Create todo
curl -X POST http://localhost:3000/todos \
  -H "Content-Type: application/json" \
  -d '{"title": "Test todo", "completed": false}'

# Update todo
curl -X PUT http://localhost:3000/todos/1 \
  -H "Content-Type: application/json" \
  -d '{"completed": true}'

# Delete todo
curl -X DELETE http://localhost:3000/todos/1
```
