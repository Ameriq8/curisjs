# Changelog

All notable changes to CurisJS are documented here.

::: info Version Format
This project follows [Semantic Versioning](https://semver.org/):
- **Major** (X.0.0): Breaking changes
- **Minor** (0.X.0): New features, backwards compatible  
- **Patch** (0.0.X): Bug fixes, backwards compatible
:::

## [Unreleased]

### 🚧 In Progress

- **Runtime Adapters**
  - Bun runtime adapter
  - Deno runtime adapter
  - Cloudflare Workers adapter
  - Vercel Edge adapter

- **Performance**
  - Performance benchmarking suite
  - Optimization profiling tools

- **Database**
  - Database package (`@curisjs/db`)
  - Model system with ActiveRecord pattern
  - Query builder
  - Migrations
  - Relationships (hasMany, belongsTo, etc.)

- **CLI**
  - CLI package (`@curisjs/cli`)
  - Code generators
  - Project scaffolding
  - Development server

## [0.1.0] - 2025-11-02

### 🎉 Initial Release

The first public release of CurisJS! A modern, runtime-agnostic TypeScript framework.

#### ✨ Features

**Core Framework**

- 🚀 **High-Performance Router**
  - Radix/trie-based router with O(path_length) complexity
  - Type-safe parameter extraction
  - Wildcard route support
  - Route priority system
  - Zero-allocation hot paths

- 🎯 **Context API**
  - Request/response handling
  - URL and query parameters
  - Headers management
  - State management
  - Cookie support
  - JSON, text, HTML responses
  - Streaming and SSE support

- 🔌 **Middleware System**
  - Onion model architecture
  - Short-circuit support
  - Type-safe middleware
  - Error boundary handling
  - Request/response transformation

**Built-in Middleware**

- 🛡️ **CORS** - Cross-Origin Resource Sharing configuration
- 📝 **Logger** - Request logging with timing
- ⚠️ **Error Handler** - Centralized error handling

**Validation System**

- ✅ **Zod-like Schema Validation**
  - Type inference
  - SafeParse and parse methods
  - Comprehensive error messages
  - All common data types
  - Custom validation rules

**Runtime Support**

- 🌐 **Node.js Adapter**
  - HTTP/HTTPS server support
  - Stream handling
  - Native Node.js optimization
  
- 🏗️ **Multi-Runtime Foundation**
  - Runtime adapter pattern
  - Pluggable runtime system
  - Shared core logic

**Developer Experience**

- 📘 **100% TypeScript**
  - Strict mode enabled
  - Comprehensive type definitions
  - Full IntelliSense support
  - Type-safe routing

- 📦 **Modern Module System**
  - ESM modules
  - Tree-shakeable exports
  - Optimized bundle size

- 🔥 **Development Tools**
  - Hot reload in development
  - Detailed error messages
  - Request/response inspection

**Backend Template**

- 📋 **Todo API Template**
  - Clean Architecture
  - Controller → Service → Repository pattern
  - JSON file storage (zero native dependencies)
  - Input validation
  - Error handling middleware
  - Timing middleware
  - Complete CRUD example

#### 🧪 Testing

- **Test Suite**
  - 72+ passing tests
  - Router tests
  - Context tests
  - Validation tests
  - Integration tests
  - Vitest test runner

- **CI/CD**
  - GitHub Actions workflows
  - Multi-version Node.js testing (18, 20, 21)
  - TypeScript type checking
  - ESLint linting
  - Test coverage reporting

#### 📚 Documentation

- **Guides**
  - Comprehensive README
  - Quick start guide
  - API reference
  - Code examples
  - Runtime-specific guides

- **GitHub Templates**
  - Bug report template
  - Feature request template
  - Documentation template
  - Performance issue template
  - Pull request template

- **Community**
  - Contributing guidelines
  - Code of conduct
  - Security policy

#### 🏗️ Architecture

- **Monorepo Structure**
  - pnpm workspaces
  - Modular package design
  - Shared tooling configuration

- **Design Patterns**
  - Runtime adapter pattern
  - Middleware chain
  - Dependency injection foundation
  - Repository pattern in templates

#### 🔒 Security

- Input validation system
- CORS configuration
- Secure error handling
- Security best practices documentation

#### 📦 Packages

- `@curisjs/core` - Core framework (v0.1.0)

---

## Version History

### Versioning Strategy

CurisJS uses [Semantic Versioning](https://semver.org/spec/v2.0.0.html):

**Major Version (X.0.0)**
- Breaking API changes
- Removed features
- Major architecture changes
- Migration guide provided

**Minor Version (0.X.0)**
- New features
- Backwards compatible
- Deprecation notices
- Enhancement to existing features

**Patch Version (0.0.X)**
- Bug fixes
- Security patches
- Performance improvements
- Documentation updates

### Release Schedule

- **Stable Releases**: Every 4-6 weeks
- **Patch Releases**: As needed for critical fixes
- **Pre-releases**: Available for testing new features

### Breaking Changes Policy

When we introduce breaking changes:

1. **Deprecation Notice** - Announced in advance (usually one minor version)
2. **Migration Guide** - Detailed upgrade instructions
3. **Changelog Entry** - Clear documentation of changes
4. **Version Bump** - Major version increment

### Feature Requests

Have an idea for CurisJS? We track feature requests through:

- [GitHub Discussions](https://github.com/Ameriq8/curisjs/discussions)
- [GitHub Issues](https://github.com/Ameriq8/curisjs/issues)

### Staying Updated

- ⭐ **Star the repo** on [GitHub](https://github.com/Ameriq8/curisjs)
- 👀 **Watch releases** for notifications
- 📰 **Follow** [@curisjs](https://twitter.com/curisjs) on Twitter
- 💬 **Join** our [Discord community](https://discord.gg/curisjs)

---

## Migration Guides

### Upgrading to 0.1.0

This is the initial release, no migration needed!

---

## Links

- 📦 [npm Package](https://www.npmjs.com/package/@curisjs/core)
- 🐙 [GitHub Repository](https://github.com/Ameriq8/curisjs)
- 🐛 [Issue Tracker](https://github.com/Ameriq8/curisjs/issues)
- 🔀 [Pull Requests](https://github.com/Ameriq8/curisjs/pulls)
- 🏷️ [Releases](https://github.com/Ameriq8/curisjs/releases)
- 📖 [Documentation](https://curisjs.dev)

---

::: tip Contributing
Found a bug or have a feature request? Check out our [Contributing Guide](/contributing) to get started!
:::

[Unreleased]: https://github.com/Ameriq8/curisjs/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/Ameriq8/curisjs/releases/tag/v0.1.0
