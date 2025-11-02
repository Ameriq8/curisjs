# CurisJS Templates

This directory contains ready-to-use templates for CurisJS projects.

## Available Templates

### Backend API (`backend/`)

A complete, production-ready backend API template featuring:

- ✨ **Clean Architecture**: Controller → Service → Repository pattern
- 🛡️ **Type Safety**: Full TypeScript with strict mode
- 📦 **Todo CRUD Example**: Complete REST API with SQLite
- ✅ **Input Validation**: Zod schemas
- 🔧 **Development Ready**: Hot reload, ESLint, Prettier
- 🚀 **Production Ready**: Error handling, CORS, logging

#### Quick Start

```bash
# Copy the template
cp -r template/backend my-app
cd my-app

# Install dependencies
pnpm install

# Copy environment file
cp .env.example .env

# Start development
pnpm dev
```

#### Features

- Todo List CRUD API with SQLite
- RESTful endpoints with proper HTTP methods
- Query parameters for filtering and pagination
- Layered architecture for maintainability
- Comprehensive API documentation
- Docker support

See `backend/README.md` for complete documentation.

## Using Templates

### Option 1: Use the CLI (Recommended)

```bash
# Create a new project using the CLI
curis create my-app

# Follow the prompts to select Backend API
```

The CLI will automatically:
- Create the project structure
- Set up dependencies with correct paths
- Configure TypeScript and tooling
- Generate a complete working application

### Option 2: Manual Copy

```bash
# Copy the template you want
cp -r template/backend my-new-project
cd my-new-project

# Update package.json dependency
# Change "@curisjs/core": "workspace:*"
# To: "@curisjs/core": "file:../CurisJS/packages/core"
# Or: "@curisjs/core": "latest" (once published to npm)

# Install dependencies
pnpm install

# Start developing!
pnpm dev
```

## Template Structure

### Backend Template (`backend/`)

```
backend/
├── src/
│   ├── app/                    # Application code
│   │   ├── controllers/        # HTTP request handlers
│   │   ├── services/           # Business logic
│   │   ├── repositories/       # Data access
│   │   ├── validators/         # Input validation
│   │   └── models/            # TypeScript interfaces
│   ├── database/              # Database setup
│   ├── middleware/            # App middleware
│   ├── routes/                # Route definitions
│   └── index.ts              # Entry point
├── package.json
├── tsconfig.json
├── .env.example
└── README.md
```

## Customizing Templates

### Adding Your Own Features

The templates are designed to be starting points. You can:

1. **Add new models**: Create new files in `src/app/models/`
2. **Add new endpoints**: Add controllers, services, repositories
3. **Change database**: Swap SQLite for PostgreSQL, MySQL, etc.
4. **Add authentication**: Implement JWT or session-based auth
5. **Add file uploads**: Integrate file storage
6. **Add real-time features**: Use WebSockets

See the template's README for detailed guides on adding features.

### Example: Adding a User Feature

```bash
# In your project directory

# 1. Create model
cat > src/app/models/User.ts << 'EOF'
export interface User {
  id: number;
  name: string;
  email: string;
}
EOF

# 2. Generate other files using CLI
curis make validator User
curis make repository User
curis make service User
curis make controller User --resource
curis make route User

# 3. Register routes in src/routes/index.ts
```

## Contributing

Want to add a new template? Great!

1. Create a new directory in `template/`
2. Follow the same structure as existing templates
3. Include a comprehensive README.md
4. Add examples and documentation
5. Test thoroughly
6. Submit a PR

### Template Guidelines

- **Complete**: Should be a fully working application
- **Documented**: Comprehensive README with examples
- **Modern**: Use latest best practices
- **Typed**: Full TypeScript support
- **Tested**: Include test examples
- **Configurable**: Use environment variables
- **Production Ready**: Include error handling, logging, etc.

## License

MIT - feel free to use these templates in your projects!

## Support

- [CurisJS Documentation](https://github.com/curisjs/curisjs)
- [Report Issues](https://github.com/curisjs/curisjs/issues)
- [Discussions](https://github.com/curisjs/curisjs/discussions)
