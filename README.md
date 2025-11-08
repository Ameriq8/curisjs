<p align="center">
  <img src="./assets/CurisJS.png" alt="CurisJS Logo" width="200" />
</p>

<h1 align="center">CurisJS Framework</h1>

<p align="center">
  A high-performance, multi-runtime web framework built on Web Standards
</p>

<p align="center">
  <a href="https://github.com/Ameriq8/curisjs/blob/main/LICENSE">
    <img src="https://img.shields.io/badge/license-MIT-blue.svg" alt="License">
  </a>
  <a href="https://www.npmjs.com/package/@curisjs/core">
    <img src="https://img.shields.io/npm/v/@curisjs/core.svg" alt="npm version">
  </a>
  <a href="https://github.com/Ameriq8/curisjs">
    <img src="https://img.shields.io/badge/PRs-welcome-brightgreen.svg" alt="PRs Welcome">
  </a>
</p>

---

## ✨ Features

- 🚀 **Blazing Fast** - Optimized radix/trie router with minimal overhead and zero-copy streaming
- 🌐 **Multi-runtime** - Works seamlessly on Node.js, Bun, Deno, and Edge runtimes
- 📦 **Standards-based** - Built on Web Request/Response APIs for maximum compatibility
- 🛡️ **Type-safe** - Full TypeScript support with excellent IDE integration
- 🔧 **Simple & Intuitive** - Clean API that's easy to learn and use
- 🎯 **Production-ready** - Well-tested with predictable performance
- 🧩 **Modular** - Use only what you need, tree-shakeable by design

## 📦 Installation

```bash
# Using pnpm (recommended)
pnpm add @curisjs/core

# Using npm
npm install @curisjs/core

# Using yarn
yarn add @curisjs/core
```

## 🚀 Quick Start

### Basic Example

```typescript
import { createApp } from '@curisjs/core';
import { serve } from '@curisjs/core/node';

const app = createApp();

// Define routes
app.get('/', () => new Response('Hello World!'));

app.get('/users/:id', (ctx) => {
  return Response.json({
    userId: ctx.params.id,
  });
});

// Start server
await serve(app, { port: 3000 });
console.log('Server running at http://localhost:3000');
```

### Middleware Example

```typescript
import { createApp } from '@curisjs/core';
import { cors, logger } from '@curisjs/core/middleware';

const app = createApp();

// Global middleware
app.use(logger());
app.use(cors({ origin: '*' }));

// Custom middleware
app.use(async (ctx, next) => {
  const start = Date.now();
  await next();
  const duration = Date.now() - start;
  console.log(`${ctx.req.method} ${ctx.req.url} - ${duration}ms`);
});

app.get('/api/data', () => Response.json({ message: 'Hello!' }));
```

### Advanced Routing

```typescript
// Route parameters
app.get('/users/:id', (ctx) => {
  const userId = ctx.params.id;
  return Response.json({ userId });
});

// Multiple parameters
app.get('/posts/:postId/comments/:commentId', (ctx) => {
  return Response.json(ctx.params);
});

// Wildcard routes
app.get('/files/*path', (ctx) => {
  const filePath = ctx.params.path;
  return Response.json({ filePath });
});

// Handle all HTTP methods
app.all('/webhook', (ctx) => {
  return Response.json({ method: ctx.req.method });
});
```

## 🏗️ Project Structure

```
├── packages/
│   └── core/              # Core framework library
├── template/
│   └── backend/           # Backend application template
├── docs/                  # Documentation
├── assets/                # Project assets (logos, images)
└── README.md             # This file
```

## 🛠️ Development

### Prerequisites

- Node.js >= 18.0.0
- pnpm >= 8.0.0

### Setup

```bash
# Clone the repository
git clone https://github.com/Ameriq8/curisjs.git
cd curisjs

# Install dependencies
pnpm install

# Build all packages
pnpm build

# Run tests
pnpm test
```

## 📜 Available Scripts

| Command              | Description                       |
| -------------------- | --------------------------------- |
| `pnpm build`         | Build all packages                |
| `pnpm dev`           | Start development mode with watch |
| `pnpm test`          | Run all tests                     |
| `pnpm test:watch`    | Run tests in watch mode           |
| `pnpm test:coverage` | Generate test coverage report     |
| `pnpm lint`          | Lint code with ESLint             |
| `pnpm format`        | Format code with Prettier         |
| `pnpm format:check`  | Check code formatting             |
| `pnpm typecheck`     | Type-check all packages           |
| `pnpm clean`         | Clean build artifacts             |

## 📖 Documentation

For detailed documentation, see the [docs](./docs) directory or visit the [core package README](./packages/core/README.md).

## 🎨 Using the Template

Get started quickly with our pre-configured backend template:

```bash
# Navigate to the template
cd template/backend

# Install dependencies
pnpm install

# Start development server
pnpm dev
```

The template includes:

- ✅ Project structure best practices
- ✅ Example controllers and routes
- ✅ Database integration setup
- ✅ Validation examples
- ✅ Middleware configuration
- ✅ Docker support

## 🌍 Runtime Support

CurisJS works across multiple JavaScript runtimes:

### Node.js

```typescript
import { createApp } from '@curisjs/core';
import { serve } from '@curisjs/core/node';

const app = createApp();
app.get('/', () => new Response('Hello from Node!'));
await serve(app, { port: 3000 });
```

### Bun

```typescript
import { createApp } from '@curisjs/core';

const app = createApp();
app.get('/', () => new Response('Hello from Bun!'));

export default {
  port: 3000,
  fetch: app.fetch.bind(app),
};
```

### Deno

```typescript
import { createApp } from '@curisjs/core';

const app = createApp();
app.get('/', () => new Response('Hello from Deno!'));

Deno.serve({ port: 3000 }, app.fetch.bind(app));
```

## 🤝 Contributing

Contributions are welcome! We appreciate your help in making CurisJS better.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

Please read [CONTRIBUTING.md](./CONTRIBUTING.md) for detailed guidelines.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.

## 🔒 Security

Security is a top priority for CurisJS. If you discover a security vulnerability, please follow our [Security Policy](./SECURITY.md).

## 💬 Community & Support

- 📫 [GitHub Issues](https://github.com/Ameriq8/curisjs/issues) - Bug reports and feature requests
- 💡 [GitHub Discussions](https://github.com/Ameriq8/curisjs/discussions) - Questions and community discussions
- 📖 [Documentation](./docs) - Comprehensive guides and API reference

## 🙏 Acknowledgments

CurisJS is built with inspiration from modern web frameworks and the amazing JavaScript community.

---

<p align="center">Made with ❤️ by <a href="https://github.com/Ameriq8">Ameriq8</a></p>
