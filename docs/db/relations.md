# Relations

Define and work with relationships between models.

## hasMany

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
}

// Usage
const user = await User.findById(1);
const posts = await user.posts();
```

## belongsTo

Many-to-one relationship:

```typescript
class Post extends Model {
  static tableName = 'posts';
  
  author() {
    return this.belongsTo(User, 'userId');
  }
}

const post = await Post.findById(1);
const author = await post.author();
```

## hasOne

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

## belongsToMany

Many-to-many relationship:

```typescript
class User extends Model {
  static tableName = 'users';
  
  roles() {
    return this.belongsToMany(
      Role,
      'user_roles',  // Pivot table
      'userId',      // Foreign key in pivot
      'roleId'       // Related key in pivot
    );
  }
}

const user = await User.findById(1);
const roles = await user.roles();
```

## Eager Loading

Load relations with the query:

```typescript
const user = await User.findById(1, {
  with: ['posts', 'profile']
});

// Nested relations
const user = await User.findById(1, {
  with: ['posts.comments', 'profile']
});
```

For more details, see the [Models documentation](/db/models).
