# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### 🚧 In Progress

- Bun runtime adapter
- Deno runtime adapter
- Edge runtime adapter
- Performance benchmarking suite

## [0.1.0] - 2025-11-02

### 🎉 Initial Release

#### ✨ Added

- **Core Framework**
  - High-performance radix/trie router with O(path_length) complexity
  - Context API for request/response handling
  - Middleware system with onion model and short-circuit support
  - Type-safe routing with parameter extraction
  - Wildcard route support

- **Runtime Support**
  - Node.js adapter with HTTP/HTTPS server support
  - Multi-runtime foundation (Bun, Deno, Edge coming soon)

- **Middleware**
  - CORS middleware with configurable options
  - Request logger with timing support
  - Error handling middleware
  - Custom middleware support

- **Validation System**
  - Zod-like schema validation
  - Type inference from schemas
  - SafeParse and parse methods
  - Comprehensive error messages

- **Backend Template**
  - Production-ready Todo API template
  - Clean Architecture implementation
  - JSON file storage (no native dependencies)
  - Controller → Service → Repository pattern
  - Input validation with custom schemas
  - Error handling and timing middleware
  - Complete CRUD operations example

- **Developer Experience**
  - 100% TypeScript with strict mode
  - Comprehensive type definitions
  - ESM module support
  - Hot reload in development
  - Detailed error messages

- **Testing**
  - Unit tests for router, context, validation
  - Integration tests for full request/response cycle
  - 72+ passing tests
  - Vitest test runner

- **Documentation**
  - Comprehensive README
  - API documentation
  - Quick start guide
  - Code examples
  - Contributing guidelines

- **CI/CD**
  - GitHub Actions workflows
  - Multi-runtime testing (Node.js 18, 20, 21)
  - TypeScript type checking
  - Linting and formatting
  - Test coverage reporting

- **GitHub Templates**
  - Bug report template
  - Feature request template
  - Documentation issue template
  - Performance issue template
  - Pull request template
  - Security policy
  - Code of conduct

#### 🏗️ Architecture

- Monorepo structure with pnpm workspaces
- Modular package design
- Runtime adapter pattern
- Middleware chain with short-circuit
- Zero-allocation hot paths

#### 📦 Packages

- `@curisjs/core` - Core framework package

### 🔒 Security

- Input validation system
- CORS configuration
- Error handling without information leakage
- Security best practices documentation

### 📚 Examples

- Simple HTTP server
- REST API with CRUD operations
- Middleware examples
- Validation examples

---

## Release Types

- **Major** (X.0.0): Breaking changes
- **Minor** (0.X.0): New features, backwards compatible
- **Patch** (0.0.X): Bug fixes, backwards compatible

## Links

- [GitHub Repository](https://github.com/Ameriq8/curisjs)
- [Issue Tracker](https://github.com/Ameriq8/curisjs/issues)
- [Pull Requests](https://github.com/Ameriq8/curisjs/pulls)
- [Releases](https://github.com/Ameriq8/curisjs/releases)

[Unreleased]: https://github.com/Ameriq8/curisjs/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/Ameriq8/curisjs/releases/tag/v0.1.0
