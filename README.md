# ⚕️ CurisJS# ⚕️ CurisJS



<div align="center">



**High-performance web framework for Node.js built on Web Standards**<div align="center">



[![CI](https://github.com/Ameriq8/curisjs/actions/workflows/ci.yml/badge.svg)](https://github.com/Ameriq8/curisjs/actions/workflows/ci.yml)

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)](https://nodejs.org/)**High-performance, multi-runtime web framework built on Web Standards**<div align="center"><div align="center">**Curis** is a modern, TypeScript-based full-stack framework that combines **Next.js** for the frontend and **Hono** for the backend — inspired by the elegance of **Laravel**, but designed for the JavaScript ecosystem.

[![TypeScript](https://img.shields.io/badge/TypeScript-5.3+-blue.svg)](https://www.typescriptlang.org/)

[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](./CONTRIBUTING.md)



*Built for performance, designed for developers.*[![CI](https://github.com/Ameriq8/curisjs/actions/workflows/ci.yml/badge.svg)](https://github.com/Ameriq8/curisjs/actions/workflows/ci.yml)



[📖 Documentation](./docs) • [🚀 Quick Start](#-quick-start) • [🛠️ API Reference](./packages/core/README.md) • [📝 Contributing](./CONTRIBUTING.md)[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)



</div>[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)](https://nodejs.org/)**High-performance, multi-runtime web framework built on Web Standards****High-performance, multi-runtime web framework built on Web Standards**Curis is built for developers who want clarity, structure, and performance — a framework that truly _cares_ for your code.



---[![TypeScript](https://img.shields.io/badge/TypeScript-5.3+-blue.svg)](https://www.typescriptlang.org/)



## ✨ Overview[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](./CONTRIBUTING.md)



CurisJS is a next-generation web framework engineered for **maximum performance** on Node.js. Built entirely on Web Standards with a foundation ready for multi-runtime support.



It's the framework that _cares for your app_ — bringing structure and sanity to modern web development.*Write once, run everywhere. Built for performance, designed for developers.*[![CI](https://github.com/curisjs/curisjs/actions/workflows/ci.yml/badge.svg)](https://github.com/curisjs/curisjs/actions/workflows/ci.yml)[![CI](https://github.com/curisjs/curisjs/actions/workflows/ci.yml/badge.svg)](https://github.com/curisjs/curisjs/actions)---



### 🚀 Key Features



- **⚡ Blazing Fast** - O(path_length) radix/trie router with zero-allocation hot paths[📖 Documentation](./docs) • [🚀 Quick Start](./QUICK-START.md) • [🛠️ API Reference](./packages/core/README.md) • [📝 Contributing](./CONTRIBUTING.md)[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

- **📏 Standards-First** - Built entirely on Web Standard APIs (Request/Response)

- **🔒 Type-Safe** - 100% TypeScript with full type inference

- **🎯 Production-Ready** - Well-tested, documented, and battle-tested architecture

- **🧩 Modular** - Clean architecture with middleware, routing, and context</div>[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)](https://nodejs.org/)[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

- **🔧 Developer Experience** - Intuitive APIs, comprehensive tooling, and excellent DX

- **🌐 Multi-Runtime Ready** - Architecture designed for future Bun, Deno, and Edge support



## 🏗️ Architecture---[![TypeScript](https://img.shields.io/badge/TypeScript-5.3+-blue.svg)](https://www.typescriptlang.org/)



```

Core Kernel

    ├─ Router (O(path_length) radix/trie)## ✨ Overview## 🧭 Vision

    ├─ Context (minimal state container)

    └─ Middleware chain (onion model with short-circuit)



Runtime AdaptersCurisJS is a next-generation web framework engineered for **maximum performance** and **universal portability**. Write once, run everywhere: Node.js, Bun, Deno, Cloudflare Workers, and Vercel Edge.*Write once, run everywhere. Built for performance, designed for developers.*

    └─ Node.js ✅ (Production Ready)

```



## 🚀 Quick StartIt's the framework that _cares for your app_ — bringing structure and sanity to modern web development.[Documentation](./packages/framework/README.md) • [Examples](./packages/framework/examples) • [Contributing](./CONTRIBUTING.md)



### Prerequisites



- Node.js 18 or higher### 🚀 Key Features[📖 Documentation](./docs) • [🚀 Quick Start](./QUICK-START.md) • [🛠️ API Reference](./packages/core/README.md) • [📝 Contributing](./CONTRIBUTING.md)

- pnpm (recommended) or npm/yarn



### Installation

- **⚡ Blazing Fast** - O(path_length) radix/trie router with zero-allocation hot pathsCuris (from the Latin _cura_, meaning _care_) brings a unified developer experience to full-stack web applications:

```bash

# Clone the repository- **🌐 Universal** - One codebase, multiple runtimes (Node.js, Bun, Deno, Edge)

git clone https://github.com/Ameriq8/curisjs.git

cd curisjs- **📏 Standards-First** - Built entirely on Web Standard APIs (Request/Response)</div>



# Install dependencies- **🔒 Type-Safe** - 100% TypeScript with full type inference

pnpm install

- **🎯 Production-Ready** - Well-tested, documented, and battle-tested architecture</div>

# Build the framework

pnpm build- **🧩 Modular** - Clean architecture with middleware, routing, and context

```

- **🔧 Developer Experience** - Intuitive APIs, comprehensive tooling, and excellent DX---

### Hello World



```typescript

// server.ts## 🏗️ Architecture- **Elegant architecture** — service providers, dependency injection, and modular design.

import { createApp } from '@curisjs/core';

import { serve } from '@curisjs/core/node';



const app = createApp();```## ✨ Overview



app.get('/', () => new Response('Hello CurisJS!'));Core Kernel



app.get('/users/:id', (ctx) => {    ├─ Router (O(path_length) radix/trie)---- **Full TypeScript support** — strong typing from backend to frontend.

  return Response.json({

    userId: ctx.params.id,    ├─ Context (minimal state container)

    timestamp: new Date().toISOString(),

  });    └─ Middleware chain (onion model with short-circuit)CurisJS is a next-generation web framework engineered for **maximum performance** and **universal portability**. Write once, run everywhere: Node.js, Bun, Deno, Cloudflare Workers, and Vercel Edge.

});



await serve(app, { port: 3000 });

```Runtime Adapters- **Performance-first** — built on Hono (one of the fastest Node.js/Edge frameworks).



**Run it:**    ├─ Node.js ✅ (Production Ready)



```bash    ├─ Bun 📋 (Coming Soon)It's the framework that _cares for your app_ — bringing structure and sanity to modern web development.

node server.ts

```    ├─ Deno 📋 (Coming Soon)



Visit: http://localhost:3000    └─ Edge 📋 (Coming Soon)## Overview- **Developer experience** — expressive CLI, simple conventions, and intuitive scaffolding.



## 📚 Examples```



### Basic Routing### 🚀 Key Features



```typescript## 🚀 Quick Start

import { createApp } from '@curisjs/core';

CurisJS is a next-generation web framework engineered for **maximum performance** and **universal portability**. Write once, run everywhere: Node.js, Bun, Deno, Cloudflare Workers, and Vercel Edge.It’s the framework that _cares for your app_ — bringing structure and sanity to modern web development.

const app = createApp();

### Prerequisites

// Static routes

app.get('/health', () => Response.json({ status: 'ok' }));- **⚡ Blazing Fast** - O(path_length) radix/trie router with zero-allocation hot paths



// Named parameters- Node.js 18+ or Bun or Deno

app.get('/users/:id', (ctx) => {

  return Response.json({ userId: ctx.params.id });- pnpm (recommended) or npm/yarn- **🌐 Universal** - One codebase, multiple runtimes (Node.js, Bun, Deno, Edge)### Key Features---

});



// Wildcard routes

app.get('/files/*path', (ctx) => {### Installation- **📏 Standards-First** - Built entirely on Web Standard APIs (Request/Response)

  return new Response(`Requested: ${ctx.params.path}`);

});



// All HTTP methods```bash- **🔒 Type-Safe** - 100% TypeScript with full type inference- 🚀 **Blazing Fast** - O(path_length) radix/trie router with zero-allocation hot paths## ⚙️ Tech Stack

app.all('/webhook', (ctx) => {

  return Response.json({ method: ctx.request.method });# Clone the repository

});

```git clone https://github.com/Ameriq8/curisjs.git- **🎯 Production-Ready** - Well-tested, documented, and battle-tested architecture



### Middlewarecd curisjs



```typescript- **🧩 Modular** - Clean architecture with middleware, routing, and context- 🌐 **Universal** - One codebase, multiple runtimes (Node.js, Bun, Deno, Edge)

import { createApp, cors, logger } from '@curisjs/core';

# Install dependencies

const app = createApp();

pnpm install- **🔧 Developer Experience** - Intuitive APIs, comprehensive tooling, and excellent DX

// Global middleware

app.use(logger({ timing: true }));

app.use(cors({

  origin: '*',# Build the framework- 📏 **Standards-First** - Built entirely on Web Standard APIs (Request/Response)| Layer | Technology | Description |

  methods: ['GET', 'POST', 'PUT', 'DELETE'],

}));pnpm build



// Custom middleware```## 🏗️ Architecture

app.use(async (ctx, next) => {

  console.log(`${ctx.request.method} ${ctx.request.url}`);

  await next();

});### Hello World- 🔒 **Type-Safe** - 100% TypeScript with full type inference| -------------- | --------------------------------------------------- | ------------------------------------------------------------------------ |



// Short-circuit middleware

app.use(async (ctx, next) => {

  const auth = ctx.header('Authorization');```typescript```

  if (!auth) {

    return new Response('Unauthorized', { status: 401 });// server.ts

  }

  await next();import { createApp } from '@curisjs/core';Core Kernel- 🎯 **Production-Ready** - Well-tested, documented, and battle-tested architecture| **Frontend** | [Next.js 15+](https://nextjs.org/) | SSR, static generation, and modern React (App Router). |

});

```import { serve } from '@curisjs/core/node';



### JSON API with Validation    ├─ Router (O(path_length) radix/trie)



```typescriptconst app = createApp();

import { createApp, json } from '@curisjs/core';

    ├─ Context (minimal state container)| **Backend** | [Hono](https://hono.dev/) | Ultra-fast web framework for Node.js, Deno, Bun, and Cloudflare Workers. |

const app = createApp();

app.get('/', () => new Response('Hello CurisJS!'));

app.post('/api/users', async (ctx) => {

  try {    └─ Middleware chain (onion model with short-circuit)

    // Parse JSON body

    const userData = await ctx.json();app.get('/users/:id', (ctx) => {



    // Basic validation  return Response.json({---| **Database** | [Prisma ORM](https://www.prisma.io/) | Type-safe database ORM and schema management. |

    if (!userData.name || !userData.email) {

      return json(    userId: ctx.params.id,

        { error: 'Name and email are required' },

        { status: 400 }    timestamp: new Date().toISOString(),Runtime Adapters

      );

    }  });



    // Process data...});    ├─ Node.js ✅ (Production Ready)| **Validation** | [Zod](https://zod.dev/) | Runtime validation and type inference. |

    const newUser = {

      id: Date.now(),

      ...userData,

      createdAt: new Date().toISOString(),await serve(app, { port: 3000 });    ├─ Bun 📋 (Coming Soon)

    };

```

    return json({ success: true, data: newUser }, { status: 201 });

  } catch (error) {    ├─ Deno 📋 (Coming Soon)## Quick Start| **Styling** | [TailwindCSS](https://tailwindcss.com/) | Utility-first CSS for the frontend. |

    return json(

      { error: 'Invalid JSON payload' },**Run it:**

      { status: 400 }

    );    └─ Edge 📋 (Coming Soon)

  }

});```bash

```

node server.ts```| **Language** | [TypeScript](https://www.typescriptlang.org/) | End-to-end type safety and scalability. |

## 🧩 Project Structure

```

```

curisjs/

├── packages/

│   └── core/                 # Framework kernelVisit: http://localhost:3000

│       ├── src/

│       │   ├── kernel.ts     # Core application logic## 🚀 Quick Start### Installation| **CLI** | [Commander.js](https://github.com/tj/commander.js/) | Foundation for Curis’s command-line interface. |

│       │   ├── router.ts     # Radix/trie router

│       │   ├── context.ts    # Request context## 📚 Examples

│       │   ├── middleware/   # Built-in middleware

│       │   ├── adapters/

│       │   │   └── node.ts   # Node.js adapter

│       │   └── types/        # TypeScript definitions### Basic Routing

│       ├── test/             # Unit tests

│       └── package.json### Prerequisites| **Testing** | [Vitest](https://vitest.dev/) | Blazing fast unit testing for monorepos. |

├── template/

│   └── backend/              # Production-ready backend template```typescript

│       ├── src/

│       │   ├── index.ts      # Server entry pointimport { createApp } from '@curisjs/core';

│       │   ├── routes/       # Route definitions

│       │   ├── middleware/   # Custom middleware

│       │   ├── app/          # Business logic

│       │   │   ├── controllers/  # HTTP handlersconst app = createApp();- Node.js 18+ or Bun or Deno```bash

│       │   │   ├── services/     # Business logic

│       │   │   ├── repositories/ # Data access

│       │   │   ├── models/       # Data models

│       │   │   └── validators/   # Input validation// Static routes- pnpm (recommended) or npm/yarn

│       │   └── database/     # Database layer

│       └── package.jsonapp.get('/health', () => Response.json({ status: 'ok' }));

├── docs/                     # Documentation

├── .github/pnpm add @curisjs/framework---

│   ├── workflows/            # CI/CD pipelines

│   ├── ISSUE_TEMPLATE/       # Issue templates// Named parameters

│   └── PULL_REQUEST_TEMPLATE.md

├── package.json              # Monorepo configurationapp.get('/users/:id', (ctx) => {### Installation

├── pnpm-workspace.yaml       # Workspace configuration

├── tsconfig.json             # TypeScript configuration  return Response.json({ userId: ctx.params.id });

└── README.md

```});```



## 🛠️ Development



### Available Scripts// Wildcard routes```bash



```bashapp.get('/files/*path', (ctx) => {

# Install dependencies

pnpm install  return new Response(`Requested: ${ctx.params.path}`);# Clone the repository## 🧩 Monorepo Structure



# Build all packages});

pnpm build

git clone https://github.com/curisjs/curisjs.git

# Run tests

pnpm test// All HTTP methods



# Run tests in watch modeapp.all('/webhook', (ctx) => {cd curisjs### Example

pnpm test:watch

  return Response.json({ method: ctx.request.method });

# Type checking

pnpm typecheck});



# Linting```

pnpm lint

# Install dependenciesCuris uses a **monorepo** managed with **pnpm workspaces** and **Turborepo** for consistency, modularity, and performance.

# Formatting

pnpm format### Middleware



# Clean build artifactspnpm install

pnpm clean

``````typescript



### Testing the Backend Templateimport { createApp, cors, logger } from '@curisjs/core';````javascript



```bash

# Navigate to template

cd template/backendconst app = createApp();# Build the framework



# Install dependencies

pnpm install

// Global middlewarepnpm buildimport { createApp } from '@curisjs/framework';```

# Start development server

pnpm devapp.use(logger({ timing: true }));



# Or build and runapp.use(cors({```

pnpm build

pnpm start  origin: '*',

```

  methods: ['GET', 'POST', 'PUT', 'DELETE'],import { serve } from '@curisjs/framework/node';

The template includes:

- ✅ Clean Architecture (Controller → Service → Repository)}));

- ✅ JSON file storage (no external dependencies)

- ✅ Zod-like validation schemas### Hello World

- ✅ Error handling middleware

- ✅ Request timing middleware// Custom middleware

- ✅ CORS support

- ✅ TypeScript throughoutapp.use(async (ctx, next) => {curis/



## 🎯 Performance  console.log(`${ctx.request.method} ${ctx.request.url}`);



CurisJS is optimized for production workloads:  await next();```typescript



- **O(path_length)** route matching with radix/trie router});

- **Zero-allocation** patterns on hot paths

- **Streaming-first** body handling// server.tsconst app = createApp();│

- **Minimal per-request overhead**

// Short-circuit middleware

### Benchmarks

app.use(async (ctx, next) => {import { createApp } from '@curisjs/core';

```bash

# Run performance benchmarks  const auth = ctx.header('Authorization');

cd packages/core

pnpm bench  if (!auth) {import { serve } from '@curisjs/core/node';├── apps/

```

    return new Response('Unauthorized', { status: 401 });

*Benchmarks coming soon - targeting competitive performance with Hono and Fastify.*

  }

## 🌐 Runtime Support

  await next();

| Runtime | Status | Notes |

|---------|--------|-------|});const app = createApp();app.get('/', () => new Response('Hello CurisJS!'));│ ├── frontend/ # Next.js frontend

| Node.js 18+ | ✅ Production Ready | Full support with `@curisjs/core/node` |

| Bun | 🚧 Planned | Architecture ready, adapter pending |```

| Deno | 🚧 Planned | Architecture ready, adapter pending |

| Cloudflare Workers | 🚧 Planned | Architecture ready, adapter pending |

| Vercel Edge | 🚧 Planned | Architecture ready, adapter pending |

### JSON API with Validation

**Currently Supported:** Node.js 18+  

**Coming Soon:** Multi-runtime adapters for Bun, Deno, and Edge runtimesapp.get('/', () => new Response('Hello CurisJS!'));app.get('/users/:id', (ctx) => Response.json({ userId: ctx.params.id }));│ └── backend/ # Hono backend API



## 📦 Packages```typescript



### `@curisjs/core`import { createApp, json } from '@curisjs/core';



The core framework package containing:



- Application kernelconst app = createApp();app.get('/users/:id', (ctx) => {│

- Router with radix/trie implementation

- Context API for request handling

- Middleware system with short-circuit support

- Node.js adapterapp.post('/api/users', async (ctx) => {  return Response.json({



```bash  try {

pnpm add @curisjs/core

```    // Parse JSON body    userId: ctx.params.id,await serve(app, { port: 3000 });├── packages/



## 🤝 Contributing    const userData = await ctx.json();



We welcome contributions! Please see our [Contributing Guide](./CONTRIBUTING.md) for details.    timestamp: new Date().toISOString(),



### Development Setup    // Basic validation



```bash    if (!userData.name || !userData.email) {  });```│ ├── core/ # Framework kernel (container, providers)

# Fork and clone

git clone https://github.com/YOUR_USERNAME/curisjs.git      return json(

cd curisjs

        { error: 'Name and email are required' },});

# Install dependencies

pnpm install        { status: 400 }



# Build      );│ ├── cli/ # Curis CLI tool

pnpm build

    }

# Run tests

pnpm testawait serve(app, { port: 3000 });



# Start developing    // Process data...

pnpm dev

```    const newUser = {```**Try it:**│ └── ui/ # Shared UI components (optional)



### Areas Needing Help      id: Date.now(),



- 🚀 **Runtime Adapters** - Bun, Deno, Edge implementations      ...userData,

- 🧪 **Testing** - More comprehensive test coverage

- 📚 **Documentation** - API docs, guides, examples      createdAt: new Date().toISOString(),

- 🛠️ **Tooling** - CLI tools, development experience

- 🎯 **Performance** - Benchmarks, optimizations    };**Run it:**```bash│



## 📄 License



**MIT License** - see [LICENSE](./LICENSE) file for details.    return json({ success: true, data: newUser }, { status: 201 });



Copyright (c) 2025 [Ameriq8](https://github.com/Ameriq8)  } catch (error) {



## 🙏 Acknowledgments    return json(```bashcd packages/framework├── docs/ # Documentation and developer guides



CurisJS is inspired by:      { error: 'Invalid JSON payload' },



- **[Hono](https://hono.dev/)** - Multi-runtime approach      { status: 400 }node server.ts

- **[Fastify](https://fastify.io/)** - Performance optimizations

- **[Express](https://expressjs.com/)** - Middleware patterns    );

- **Web Standards** - Request/Response APIs

  }```pnpm build├── scripts/ # Utility and automation scripts

## 📞 Community

});

- **GitHub Issues**: [Report bugs & request features](https://github.com/Ameriq8/curisjs/issues)

- **GitHub Discussions**: [Ask questions & share ideas](https://github.com/Ameriq8/curisjs/discussions)```

- **GitHub Repo**: [Star & Watch](https://github.com/Ameriq8/curisjs)



## 🗺️ Roadmap

## 🧩 Project StructureVisit: http://localhost:3000node examples/simple-server.js└── .github/ # CI/CD and templates

### ✅ Phase 1 - MVP (Current)

- [x] Core kernel with middleware chain

- [x] Fast radix/trie router

- [x] Node.js adapter```

- [x] Basic middleware (CORS, logger)

- [x] Type-safe contextcurisjs/

- [x] Backend template with Clean Architecture

- [x] JSON storage (no native dependencies)├── packages/## 📚 Examples````

- [x] Validation system

- [x] Comprehensive documentation│   └── core/                 # Framework kernel



### 🚧 Phase 2 - Multi-Runtime (Planned)│       ├── src/

- [ ] Bun adapter implementation

- [ ] Deno adapter implementation│       │   ├── kernel.ts     # Core application logic

- [ ] Edge runtime adapter

- [ ] Cross-runtime test harness│       │   ├── router.ts     # Radix/trie router### Basic Routing````

- [ ] Performance benchmarking suite

│       │   ├── context.ts    # Request context

### 📋 Phase 3 - Ecosystem (Future)

- [ ] Advanced middleware library│       │   ├── middleware/   # Built-in middleware

- [ ] WebSocket support

- [ ] File upload handling│       │   ├── adapters/     # Runtime adapters

- [ ] Plugin ecosystem

- [ ] CLI tooling│       │   │   ├── node.ts   # Node.js adapter```typescriptVisit: http://localhost:3333

- [ ] Documentation website

- [ ] Video tutorials│       │   │   ├── bun.ts    # Bun adapter (planned)



---│       │   │   ├── deno.ts   # Deno adapter (planned)import { createApp } from '@curisjs/core';



<div align="center">│       │   │   └── edge.ts   # Edge adapter (planned)



**Built with ❤️ and TypeScript for Node.js**│       │   └── types/        # TypeScript definitions### 🏗 Apps



**[⭐ Star us on GitHub](https://github.com/Ameriq8/curisjs)** • **[🐛 Report Issues](https://github.com/Ameriq8/curisjs/issues)** • **[📖 Read the Docs](./docs)**│       ├── test/             # Unit tests



</div>│       └── package.jsonconst app = createApp();


├── template/

│   └── backend/              # Production-ready backend template---

│       ├── src/

│       │   ├── index.ts      # Server entry point// Static routes

│       │   ├── routes/       # Route definitions

│       │   ├── middleware/   # Custom middlewareapp.get('/health', () => Response.json({ status: 'ok' }));| Folder          | Description                                            |

│       │   ├── app/          # Business logic

│       │   │   ├── controllers/  # HTTP handlers

│       │   │   ├── services/     # Business logic

│       │   │   ├── repositories/ # Data access// Named parameters## Project Structure| --------------- | ------------------------------------------------------ |

│       │   │   ├── models/       # Data models

│       │   │   └── validators/   # Input validationapp.get('/users/:id', (ctx) => {

│       │   └── database/     # Database layer

│       └── package.json  return Response.json({ userId: ctx.params.id });| `apps/frontend` | Next.js app serving UI, using App Router and Tailwind. |

├── docs/                     # Documentation

├── .github/});

│   ├── workflows/            # CI/CD pipelines

│   ├── ISSUE_TEMPLATE/       # Issue templates```| `apps/backend`  | Hono app with routes, controllers, and middleware.     |

│   └── PULL_REQUEST_TEMPLATE.md

├── package.json              # Monorepo configuration// Wildcard routes

├── pnpm-workspace.yaml       # Workspace configuration

├── tsconfig.json             # TypeScript configurationapp.get('/files/*path', (ctx) => {curisjs/

└── README.md

```  return new Response(`Requested: ${ctx.params.path}`);



## 🛠️ Development});├── packages/### 📦 Packages



### Available Scripts



```bash// All HTTP methods│   └── framework/        # Web framework

# Install dependencies

pnpm installapp.all('/webhook', (ctx) => {



# Build all packages  return Response.json({ method: ctx.request.method });├── .github/              # CI/CD workflows| Package | Description                                                                         |

pnpm build

});

# Run tests

pnpm test```├── docs/                 # Documentation| ------- | ----------------------------------------------------------------------------------- |



# Run tests in watch mode

pnpm test:watch

### Middleware├── CONTRIBUTING.md       # Contribution guidelines| `core`  | Framework kernel: dependency injection, service providers, configuration system.    |

# Type checking

pnpm typecheck



# Linting```typescript└── README.md            # This file| `cli`   | Command-line interface (e.g., `curis new`, `curis serve`, `curis make:controller`). |

pnpm lint

import { createApp, cors, logger } from '@curisjs/core';

# Formatting

pnpm format```| `ui`    | Optional shared React components for multi-app projects.                            |



# Clean build artifactsconst app = createApp();

pnpm clean

```



### Testing the Backend Template// Global middleware



```bashapp.use(logger({ timing: true }));------

# Navigate to template

cd template/backendapp.use(cors({



# Install dependencies  origin: '*',

pnpm install

  methods: ['GET', 'POST', 'PUT', 'DELETE'],

# Start development server

pnpm dev}));## Framework Architecture## 🚀 Getting Started



# Or build and run

pnpm build

pnpm start// Custom middleware

```

app.use(async (ctx, next) => {

The template includes:

- ✅ Clean Architecture (Controller → Service → Repository)  console.log(`${ctx.request.method} ${ctx.request.url}`);```### 1. Clone the Repository

- ✅ JSON file storage (no external dependencies)

- ✅ Zod-like validation schemas  await next();

- ✅ Error handling middleware

- ✅ Request timing middleware});Core Kernel

- ✅ CORS support

- ✅ TypeScript throughout



## 🎯 Performance// Short-circuit middleware  ├─ Router (O(path_length) radix/trie)```bash



CurisJS is optimized for production workloads:app.use(async (ctx, next) => {



- **O(path_length)** route matching with radix/trie router  const auth = ctx.header('Authorization');  ├─ Context (minimal state container)git clone https://github.com/yourusername/curis.git

- **Zero-allocation** patterns on hot paths

- **Streaming-first** body handling  if (!auth) {

- **Minimal per-request overhead**

    return new Response('Unauthorized', { status: 401 });  └─ Middleware (onion model with short-circuit)cd curis

### Benchmarks

  }

```bash

# Run performance benchmarks  await next();````

cd packages/core

pnpm bench});

```

```Runtime Adapters

*Benchmarks coming soon - targeting competitive performance with Hono and Fastify.*



## 🌐 Runtime Support

### JSON API with Validation├─ Node.js ✅### 2. Install Dependencies

| Runtime | Status | Adapter |

|---------|--------|---------|

| Node.js 18+ | ✅ Production Ready | `@curisjs/core/node` |

| Bun | 📋 Coming Soon | `@curisjs/core/bun` |```typescript├─ Bun 📋

| Deno | 📋 Coming Soon | `@curisjs/core/deno` |

| Cloudflare Workers | 📋 Coming Soon | `@curisjs/core/edge` |import { createApp, json } from '@curisjs/core';

| Vercel Edge | 📋 Coming Soon | `@curisjs/core/edge` |

├─ Deno 📋Use [pnpm](https://pnpm.io/) for workspace management:

## 📦 Packages

const app = createApp();

### `@curisjs/core`

└─ Edge 📋

The core framework package containing:

app.post('/api/users', async (ctx) => {

- Application kernel

- Router with radix/trie implementation  try {````bash

- Context API for request handling

- Middleware system with short-circuit support    // Parse JSON body

- Runtime adapters for different platforms

    const userData = await ctx.json();pnpm install

```bash

pnpm add @curisjs/core

```

    // Basic validation---```

## 🤝 Contributing

    if (!userData.name || !userData.email) {

We welcome contributions! Please see our [Contributing Guide](./CONTRIBUTING.md) for details.

      return json(

### Development Setup

        { error: 'Name and email are required' },

```bash

# Fork and clone        { status: 400 }## Development### 3. Start Development

git clone https://github.com/YOUR_USERNAME/curisjs.git

cd curisjs      );



# Install dependencies    }

pnpm install



# Build

pnpm build    // Process data...```bashRun both frontend and backend with Turborepo:



# Run tests    const newUser = {

pnpm test

      id: Date.now(),# Clone repository

# Start developing

pnpm dev      ...userData,

```

      createdAt: new Date().toISOString(),git clone https://github.com/curisjs/curisjs.git```bash

### Areas Needing Help

    };

- 🚀 **Runtime Adapters** - Bun, Deno, Edge implementations

- 🧪 **Testing** - More comprehensive test coveragecd curisjspnpm dev

- 📚 **Documentation** - API docs, guides, examples

- 🛠️ **Tooling** - CLI tools, development experience    return json({ success: true, data: newUser }, { status: 201 });

- 🎯 **Performance** - Benchmarks, optimizations

  } catch (error) {```

## 📄 License

    return json(

**MIT License** - see [LICENSE](./LICENSE) file for details.

      { error: 'Invalid JSON payload' },# Install dependencies

Copyright (c) 2025 [Ameriq8](https://github.com/Ameriq8)

      { status: 400 }

## 🙏 Acknowledgments

    );pnpm installOr start each manually:

CurisJS is inspired by:

  }

- **[Hono](https://hono.dev/)** - Multi-runtime approach

- **[Fastify](https://fastify.io/)** - Performance optimizations});

- **[Express](https://expressjs.com/)** - Middleware patterns

- **Web Standards** - Request/Response APIs```



## 📞 Community# Build all packages```bash



- **GitHub Issues**: [Report bugs & request features](https://github.com/Ameriq8/curisjs/issues)## 🧩 Project Structure

- **GitHub Discussions**: [Ask questions & share ideas](https://github.com/Ameriq8/curisjs/discussions)

- **GitHub Repo**: [Star & Watch](https://github.com/Ameriq8/curisjs)pnpm build# Frontend



## 🗺️ Roadmap```



### ✅ Phase 1 - MVP (Current)curisjs/pnpm --filter frontend dev

- [x] Core kernel with middleware chain

- [x] Fast radix/trie router├── packages/

- [x] Node.js adapter

- [x] Basic middleware (CORS, logger)│   └── core/                 # Framework kernel# Run tests

- [x] Type-safe context

- [x] Backend template with Clean Architecture│       ├── src/

- [x] JSON storage (no native dependencies)

- [x] Validation system│       │   ├── kernel.ts     # Core application logicpnpm test# Backend



### 🚧 Phase 2 - Multi-Runtime (In Progress)│       │   ├── router.ts     # Radix/trie router

- [ ] Bun adapter implementation

- [ ] Deno adapter implementation│       │   ├── context.ts    # Request contextpnpm --filter backend dev

- [ ] Edge runtime adapter

- [ ] Cross-runtime test harness│       │   ├── middleware.ts # Middleware system

- [ ] Performance benchmarking suite

│       │   ├── adapters/     # Runtime adapters# Run example```

### 📋 Phase 3 - Ecosystem (Planned)

- [ ] Advanced middleware library│       │   │   ├── node.ts   # Node.js adapter

- [ ] WebSocket support

- [ ] File upload handling│       │   │   ├── bun.ts    # Bun adapter (planned)cd packages/framework

- [ ] Plugin ecosystem

- [ ] CLI tooling│       │   │   ├── deno.ts   # Deno adapter (planned)

- [ ] Documentation website

- [ ] Video tutorials│       │   │   └── edge.ts   # Edge adapter (planned)node examples/simple-server.js### 4. Run the CLI



---│       │   └── types/        # TypeScript definitions



<div align="center">│       ├── test/             # Unit tests```



**Built with ❤️ and TypeScript for the modern web**│       └── package.json



**[⭐ Star us on GitHub](https://github.com/Ameriq8/curisjs)** • **[🐛 Report Issues](https://github.com/Ameriq8/curisjs/issues)** • **[📖 Read the Docs](./docs)**├── template/Curis includes a CLI for generating boilerplate code:



</div>│   └── backend/              # Production-ready backend template


│       ├── src/---

│       │   ├── index.ts      # Server entry point

│       │   ├── routes/       # Route definitions```bash

│       │   ├── middleware/   # Custom middleware

│       │   ├── app/          # Business logic## Performance Goalspnpm curis make:controller user

│       │   │   ├── controllers/  # HTTP handlers

│       │   │   ├── services/     # Business logic```

│       │   │   ├── repositories/ # Data access

│       │   │   ├── models/       # Data models| Runtime | Target | Status |

│       │   │   └── validators/   # Input validation

│       │   └── database/     # Database layer|---------|--------|--------|---

│       └── package.json

├── docs/                     # Documentation| Node.js | Within 10-20% of Fastify | 🚧 In Progress |

├── .github/

│   └── workflows/            # CI/CD pipelines| Bun | Competitive with Hono | 📋 Planned |## 🧱 Core Concepts

├── package.json              # Monorepo configuration

├── pnpm-workspace.yaml       # Workspace configuration| Deno | Near-native performance | 📋 Planned |

├── tsconfig.json             # TypeScript configuration

├── vitest.config.ts          # Test configuration| Edge | Match Hono edge performance | 📋 Planned |### 🩺 Service Container

└── README.md

```



## 🛠️ Development---The Curis `ApplicationContainer` manages dependencies, similar to Laravel’s IoC container.



### Available Scripts



```bash## Roadmap```ts

# Install dependencies

pnpm installimport { Container } from '@curis/core';



# Build all packages### ✅ Phase 1 - MVP (Complete)

pnpm build

- Core kernel with middleware chainconst app = new Container();

# Run tests

pnpm test- Fast radix/trie routerapp.bind('config', { appName: 'Curis' });



# Run tests in watch mode- Node.js adapterapp.resolve('config'); // → { appName: "Curis" }

pnpm test:watch

- Basic middleware (CORS, logger)```

# Type checking

pnpm typecheck- Type-safe context



# Linting### 🧬 Service Providers

pnpm lint

### 🚧 Phase 2 - Multi-Runtime (In Progress)

# Formatting

pnpm format- Bun adapterProviders register and bootstrap services like database connections, loggers, and queues.



# Clean build artifacts- Deno adapter

pnpm clean

```- Edge runtime adapter```ts



### Testing the Backend Template- Cross-runtime test harnessexport class DatabaseProvider {



```bash- Performance optimization  register(app) {

# Navigate to template

cd template/backend    app.bind('db', new PrismaClient());



# Install dependencies### 📋 Phase 3 - Ecosystem (Planned)  }

pnpm install

- Advanced middleware library  boot(app) {

# Start development server

pnpm dev- WebSocket support    app.resolve('db').$connect();



# Or build and run- File upload handling  }

pnpm build

pnpm start- Plugin ecosystem}

```

- Documentation site```

The template includes:

- ✅ Clean Architecture (Controller → Service → Repository)

- ✅ JSON file storage (no external dependencies)

- ✅ Zod validation schemas---### 🧩 Modular Architecture

- ✅ Error handling middleware

- ✅ Request timing middleware

- ✅ CORS support

- ✅ TypeScript throughout## ContributingCuris follows clean architecture:



## 🎯 Performance



CurisJS is optimized for production workloads:We welcome contributions! Please see [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines.```



- **O(path_length)** route matching with radix/trie routerController → Service → Repository → Model

- **Zero-allocation** patterns on hot paths

- **Streaming-first** body handling### Good First Issues```

- **Minimal per-request overhead**

- Add new middleware

### Benchmarks

- Improve error messagesEach layer is clearly separated for testability and maintainability.

```bash

# Run performance benchmarks- Add more tests

cd packages/core

pnpm bench- Write documentation---

```

- Create examples

*Benchmarks coming soon - targeting competitive performance with Hono and Fastify.*

## 🧠 Design Philosophy

## 🌐 Runtime Support

---

| Runtime | Status | Adapter |

|---------|--------|---------|- **Carefully Designed** — Simplicity without sacrificing power.

| Node.js 18+ | ✅ Production Ready | `@curisjs/core/node` |

| Bun | 📋 Coming Soon | `@curisjs/core/bun` |## Inspiration- **Convention over Configuration** — Sensible defaults, minimal setup.

| Deno | 📋 Coming Soon | `@curisjs/core/deno` |

| Cloudflare Workers | 📋 Coming Soon | `@curisjs/core/edge` |- **Type-Safe Everywhere** — End-to-end safety with TypeScript.

| Vercel Edge | 📋 Coming Soon | `@curisjs/core/edge` |

CurisJS is inspired by:- **Edge-Ready** — Built to deploy on Vercel, Cloudflare, or Node.js.

## 📦 Packages

- **[Hono](https://hono.dev/)** - Multi-runtime approach

### `@curisjs/core`

- **[Fastify](https://fastify.io/)** - Performance optimization---

The core framework package containing:

- **[Express](https://expressjs.com/)** - Middleware pattern

- Application kernel

- Router with radix/trie implementation## 🧪 Example Routes (Hono Backend)

- Context API for request handling

- Middleware system with short-circuit support---

- Runtime adapters for different platforms

```ts

```bash

pnpm add @curisjs/core## Licenseimport { Hono } from 'hono';

```

import { appContainer } from '@curis/core';

## 🤝 Contributing

MIT © CurisJS Team

We welcome contributions! Please see our [Contributing Guide](./CONTRIBUTING.md) for details.

const app = new Hono();

### Development Setup

---

```bash

# Fork and cloneapp.get('/api/health', (c) => c.json({ status: 'healthy' }));

git clone https://github.com/YOUR_USERNAME/curisjs.git

cd curisjs<div align="center">app.get('/api/config', (c) => c.json(appContainer.resolve('config')));



# Install dependencies

pnpm install

**[⭐ Star us on GitHub](https://github.com/curisjs/curisjs)** • **[📖 Read the Docs](./packages/framework/README.md)** • **[🐛 Report Issues](https://github.com/curisjs/curisjs/issues)**export default app;

# Build

pnpm build```



# Run tests</div>

pnpm test

---

# Start developing

pnpm dev## 🧰 Developer Commands

```

| Command                             | Description                  |

### Areas Needing Help| ----------------------------------- | ---------------------------- |

| `pnpm dev`                          | Run development servers.     |

- 🚀 **Runtime Adapters** - Bun, Deno, Edge implementations| `pnpm build`                        | Build all apps and packages. |

- 🧪 **Testing** - More comprehensive test coverage| `pnpm test`                         | Run tests with Vitest.       |

- 📚 **Documentation** - API docs, guides, examples| `pnpm lint`                         | Run ESLint checks.           |

- 🛠️ **Tooling** - CLI tools, development experience| `pnpm curis make:controller <name>` | Scaffold a new controller.   |

- 🎯 **Performance** - Benchmarks, optimizations| `pnpm curis serve`                  | Start backend server.        |



## 📄 License---



**MIT License** - see [LICENSE](./LICENSE) file for details.## 📖 Documentation



## 🙏 AcknowledgmentsAll documentation lives in the `/docs` folder.



CurisJS is inspired by:- `docs/introduction.md` – overview of the project

- `docs/architecture.md` – explanation of Curis kernel design

- **[Hono](https://hono.dev/)** - Multi-runtime approach- `docs/getting-started.md` – setup guide

- **[Fastify](https://fastify.io/)** - Performance optimizations

- **[Express](https://expressjs.com/)** - Middleware patternsDocumentation site (coming soon): [https://curis.dev](https://curis.dev)

- **Web Standards** - Request/Response APIs

---

## 📞 Community

## 🌐 Deployment

- **GitHub Issues**: [Report bugs & request features](https://github.com/curisjs/curisjs/issues)

- **GitHub Discussions**: [Ask questions & share ideas](https://github.com/curisjs/curisjs/discussions)Curis can be deployed on:

- **Twitter**: Follow [@curisjs](https://twitter.com/curisjs) (coming soon)

- **Vercel** – for frontend and serverless backend.

## 🗺️ Roadmap- **Cloudflare Workers** – with Hono edge compatibility.

- **Node.js / Docker** – for self-hosted environments.

### ✅ Phase 1 - MVP (Current)

- Core kernel with middleware chainA `Dockerfile` and deployment guide will be added soon.

- Fast radix/trie router

- Node.js adapter---

- Basic middleware (CORS, logger)

- Type-safe context## 🧩 Roadmap

- Backend template with Clean Architecture

| Phase       | Goal                                                  | Status         |

### 🚧 Phase 2 - Multi-Runtime (In Progress)| ----------- | ----------------------------------------------------- | -------------- |

- Bun adapter implementation| **Phase 1** | Base monorepo setup (Next.js + Hono + Core + CLI)     | 🟢 In progress |

- Deno adapter implementation| **Phase 2** | Add service providers, ORM layer, and CLI scaffolding | ⚪ Planned     |

- Edge runtime adapter| **Phase 3** | Plugin ecosystem and testing utilities                | ⚪ Planned     |

- Cross-runtime test harness| **Phase 4** | Documentation website + community templates           | ⚪ Planned     |

- Performance benchmarking suite

---

### 📋 Phase 3 - Ecosystem (Planned)

- Advanced middleware library## 🤝 Contributing

- WebSocket support

- File upload handlingWe welcome all contributions!

- Plugin ecosystemPlease read the [Contributing Guide](./CONTRIBUTING.md) before submitting a PR.

- CLI tooling

- Documentation website1. Fork the repo

2. Create a feature branch: `git checkout -b feature/new-module`

---3. Commit changes: `git commit -m "Add new module"`

4. Push: `git push origin feature/new-module`

<div align="center">5. Open a Pull Request 🚀



**Built with ❤️ and TypeScript for the modern web**---



**[⭐ Star us on GitHub](https://github.com/curisjs/curisjs)** • **[🐛 Report Issues](https://github.com/curisjs/curisjs/issues)** • **[📖 Read the Docs](./docs)**## 🧬 License



</div>Curis Framework is open-source software licensed under the [MIT License](./LICENSE).

---

### 💖 Built with care and precision for the open-source community.
````
