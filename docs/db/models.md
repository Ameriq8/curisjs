# Models

Models provide an ActiveRecord-style interface for working with database tables.

## Defining Models

### Basic Model

```typescript
import { Model } from '@curisjs/db';

class User extends Model {
  static tableName = 'users';
  
  id!: number;
  name!: string;
  email!: string;
  createdAt!: Date;
  updatedAt!: Date;
}
```

### With Timestamps

```typescript
class User extends Model {
  static tableName = 'users';
  static timestamps = true; // Adds createdAt, updatedAt
  
  id!: number;
  name!: string;
  email!: string;
  createdAt!: Date;
  updatedAt!: Date;
}
```

### With Primary Key

```typescript
class User extends Model {
  static tableName = 'users';
  static primaryKey = 'id'; // Default is 'id'
  
  id!: number;
  name!: string;
  email!: string;
}
```

## CRUD Operations

### Create

```typescript
// Create a single record
const user = await User.create({
  name: 'John Doe',
  email: 'john@example.com',
});

console.log(user.id); // Auto-generated ID
console.log(user.createdAt); // Auto-generated timestamp
```

### Read

```typescript
// Find by ID
const user = await User.findById(1);

// Find one by condition
const user = await User.findOne({
  where: { email: 'john@example.com' }
});

// Find many
const users = await User.findMany();

// Find with conditions
const activeUsers = await User.findMany({
  where: { active: true }
});

// Find with limit and offset
const users = await User.findMany({
  limit: 10,
  offset: 0,
});
```

### Update

```typescript
// Update a model instance
const user = await User.findById(1);
await user.update({
  name: 'John Smith',
  email: 'john.smith@example.com',
});

// Update multiple records
const count = await User.updateMany(
  { active: false },  // Data to update
  { where: { lastLogin: null } }  // Condition
);
```

### Delete

```typescript
// Delete a model instance
const user = await User.findById(1);
await user.delete();

// Delete multiple records
const count = await User.deleteMany({
  where: { active: false }
});
```

## Query Methods

### findById

Find a single record by primary key:

```typescript
const user = await User.findById(1);

if (!user) {
  console.log('User not found');
}
```

### findOne

Find a single record matching conditions:

```typescript
const user = await User.findOne({
  where: { email: 'john@example.com' }
});
```

### findMany

Find multiple records:

```typescript
// All records
const users = await User.findMany();

// With conditions
const activeUsers = await User.findMany({
  where: { active: true }
});

// With ordering
const users = await User.findMany({
  orderBy: { name: 'asc' }
});

// With pagination
const users = await User.findMany({
  limit: 10,
  offset: 20,
});
```

### count

Count records:

```typescript
const total = await User.count();

const activeCount = await User.count({
  where: { active: true }
});
```

### exists

Check if a record exists:

```typescript
const exists = await User.exists({
  where: { email: 'john@example.com' }
});
```

## Relations

### hasMany

One-to-many relationship:

```typescript
class User extends Model {
  static tableName = 'users';
  
  posts() {
    return this.hasMany(Post, 'userId');
  }
}

class Post extends Model {
  static tableName = 'posts';
  
  user() {
    return this.belongsTo(User, 'userId');
  }
}

// Usage
const user = await User.findById(1);
const posts = await user.posts();
```

### belongsTo

Many-to-one relationship:

```typescript
const post = await Post.findById(1);
const author = await post.user();
```

### hasOne

One-to-one relationship:

```typescript
class User extends Model {
  static tableName = 'users';
  
  profile() {
    return this.hasOne(Profile, 'userId');
  }
}

const user = await User.findById(1);
const profile = await user.profile();
```

### belongsToMany

Many-to-many relationship:

```typescript
class User extends Model {
  static tableName = 'users';
  
  roles() {
    return this.belongsToMany(Role, 'user_roles', 'userId', 'roleId');
  }
}

const user = await User.findById(1);
const roles = await user.roles();
```

## Eager Loading

Load relations with the query:

```typescript
// Load single relation
const user = await User.findById(1, {
  with: ['posts']
});

// Load multiple relations
const user = await User.findById(1, {
  with: ['posts', 'profile', 'roles']
});

// Load nested relations
const user = await User.findById(1, {
  with: ['posts.comments', 'profile']
});
```

## Transactions

Use models within transactions:

```typescript
import { transaction } from '@curisjs/db';

await transaction(async (trx) => {
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

## Scopes

Define reusable query scopes:

```typescript
class User extends Model {
  static tableName = 'users';
  
  static active() {
    return this.query().where('active', true);
  }
  
  static recent() {
    return this.query()
      .orderBy('createdAt', 'desc')
      .limit(10);
  }
}

// Usage
const activeUsers = await User.active();
const recentUsers = await User.recent();

// Chain scopes
const recentActiveUsers = await User.active()
  .orderBy('createdAt', 'desc')
  .limit(10);
```

## Hooks

Lifecycle hooks for models:

```typescript
class User extends Model {
  static tableName = 'users';
  
  static async beforeCreate(data: any) {
    // Hash password before creating user
    if (data.password) {
      data.password = await hash(data.password);
    }
  }
  
  static async afterCreate(user: User) {
    // Send welcome email after user is created
    await sendWelcomeEmail(user.email);
  }
  
  static async beforeUpdate(data: any) {
    // Update modified timestamp
    data.updatedAt = new Date();
  }
  
  static async beforeDelete(user: User) {
    // Clean up related records
    await user.posts().delete();
  }
}
```

## Validation

Validate data before saving:

```typescript
import { z } from '@curisjs/core';

class User extends Model {
  static tableName = 'users';
  
  static schema = z.object({
    name: z.string().min(2).max(100),
    email: z.string().email(),
    age: z.number().min(18).optional(),
  });
  
  static async beforeCreate(data: any) {
    // Validate data
    this.schema.parse(data);
  }
}

try {
  await User.create({
    name: 'J', // Too short
    email: 'invalid-email',
  });
} catch (error) {
  // Validation error
}
```

## Soft Deletes

Enable soft deletion:

```typescript
class User extends Model {
  static tableName = 'users';
  static softDelete = true; // Enable soft deletes
  
  id!: number;
  name!: string;
  deletedAt!: Date | null;
}

// Soft delete
const user = await User.findById(1);
await user.delete(); // Sets deletedAt instead of removing

// Find only non-deleted
const users = await User.findMany(); // Excludes soft-deleted

// Find with soft-deleted
const allUsers = await User.withTrashed();

// Find only soft-deleted
const deletedUsers = await User.onlyTrashed();

// Restore soft-deleted
const user = await User.onlyTrashed().findById(1);
await user.restore();

// Force delete (permanent)
await user.forceDelete();
```

## Custom Methods

Add custom methods to models:

```typescript
class User extends Model {
  static tableName = 'users';
  
  id!: number;
  name!: string;
  email!: string;
  
  // Instance method
  async sendEmail(subject: string, body: string) {
    await emailService.send(this.email, subject, body);
  }
  
  // Static method
  static async findByEmail(email: string) {
    return this.findOne({ where: { email } });
  }
  
  // Computed property
  get displayName() {
    return this.name.toUpperCase();
  }
}

// Usage
const user = await User.findById(1);
await user.sendEmail('Hello', 'Welcome!');
console.log(user.displayName);

const user2 = await User.findByEmail('john@example.com');
```

## JSON Fields

Work with JSON columns:

```typescript
class User extends Model {
  static tableName = 'users';
  
  id!: number;
  name!: string;
  metadata!: Record<string, any>;
}

const user = await User.create({
  name: 'John',
  metadata: {
    theme: 'dark',
    language: 'en',
    notifications: true,
  },
});

// Access JSON data
console.log(user.metadata.theme); // 'dark'

// Update JSON data
await user.update({
  metadata: {
    ...user.metadata,
    theme: 'light',
  },
});
```

## Complete Example

```typescript
import { Model } from '@curisjs/db';
import { z } from '@curisjs/core';

// Define schema
const userSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  password: z.string().min(8),
  age: z.number().min(18).optional(),
});

// Define model
class User extends Model {
  static tableName = 'users';
  static timestamps = true;
  static softDelete = true;
  static schema = userSchema;
  
  id!: number;
  name!: string;
  email!: string;
  password!: string;
  age?: number;
  active!: boolean;
  createdAt!: Date;
  updatedAt!: Date;
  deletedAt!: Date | null;
  
  // Relations
  posts() {
    return this.hasMany(Post, 'userId');
  }
  
  profile() {
    return this.hasOne(Profile, 'userId');
  }
  
  // Scopes
  static active() {
    return this.query().where('active', true);
  }
  
  // Custom methods
  async sendWelcomeEmail() {
    await emailService.send(this.email, 'Welcome!', 'Thanks for joining');
  }
  
  static async findByEmail(email: string) {
    return this.findOne({ where: { email } });
  }
  
  // Hooks
  static async beforeCreate(data: any) {
    // Validate
    this.schema.parse(data);
    
    // Hash password
    if (data.password) {
      data.password = await hash(data.password);
    }
  }
  
  static async afterCreate(user: User) {
    await user.sendWelcomeEmail();
  }
}

// Usage
const user = await User.create({
  name: 'John Doe',
  email: 'john@example.com',
  password: 'secret123',
  age: 25,
});

const posts = await user.posts();
const profile = await user.profile();

const activeUsers = await User.active();
const userByEmail = await User.findByEmail('john@example.com');
```
