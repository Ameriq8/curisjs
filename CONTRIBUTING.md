# Contributing to CurisJS

Thank you for your interest in contributing to CurisJS! This document provides guidelines and instructions for contributing.

## Code of Conduct

Be respectful, inclusive, and professional. We're building this together.

## How Can I Contribute?

### Reporting Bugs

- Use GitHub Issues
- Include: OS, runtime version (Node/Bun/Deno), code snippet, expected vs actual behavior
- Check if the issue already exists

### Suggesting Features

- Open a GitHub Issue with the "enhancement" label
- Describe the use case and proposed API
- Consider cross-runtime compatibility

### Pull Requests

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass (`pnpm test`)
6. Build successfully (`pnpm build`)
7. Commit with clear messages
8. Push to your fork
9. Open a Pull Request

## Development Setup

```bash
# Clone your fork
git clone https://github.com/YOUR_USERNAME/curisjs.git
cd curisjs

# Install dependencies
pnpm install

# Build
cd packages/framework
pnpm build

# Run tests
pnpm test

# Run example
node examples/node-server.js
```

## Project Structure

```
packages/framework/
├── src/
│   ├── core/           # Framework kernel (requires expertise)
│   ├── adapters/       # Runtime adapters (runtime-specific)
│   ├── middleware/     # Middleware (good for beginners!)
│   └── utils/          # Utilities (good for beginners!)
├── test/               # Tests
└── bench/              # Benchmarks
```

## Coding Standards

### TypeScript

- Use strict mode
- Add JSDoc comments for public APIs
- Export types alongside implementations
- Avoid `any` - use `unknown` and type guards

### Style

- 2-space indentation
- Single quotes for strings
- Semicolons required
- Max line length: 100 characters

### Naming

- PascalCase for classes and types
- camelCase for functions and variables
- UPPER_CASE for constants
- Prefix private members with `_` (sparingly)

### Performance

- Minimize allocations in hot paths
- Use lazy evaluation where possible
- Profile before optimizing
- Document performance-critical code

## Testing

### Unit Tests

```typescript
// test/my-feature.test.ts
import { describe, it, expect } from 'vitest';
import { myFeature } from '../src/my-feature.js';

describe('myFeature', () => {
  it('should do something', () => {
    expect(myFeature()).toBe(expected);
  });
});
```

### Integration Tests

Test complete request/response cycles across multiple scenarios.

### Cross-Runtime Tests

Ensure functionality works on Node.js, Bun, and Deno.

## Benchmarking

When making performance changes:

1. Run benchmarks before your change
2. Apply your change
3. Run benchmarks again
4. Document the improvement in PR

```bash
./bench/run.sh
```

## Documentation

- Update README.md for user-facing changes
- Update IMPLEMENTATION.md for architecture changes
- Add JSDoc comments for all public APIs
- Include code examples

## Commit Messages

Follow conventional commits:

```
feat: add rate limiting middleware
fix: correct router param matching
docs: update installation instructions
perf: optimize context creation
test: add tests for wildcard routes
```

## Pull Request Process

1. **Title**: Clear, descriptive
2. **Description**: What, why, how
3. **Tests**: Include tests for new features
4. **Benchmarks**: If performance-related
5. **Documentation**: Update relevant docs
6. **Breaking Changes**: Clearly marked

## Areas Needing Help

### High Priority

- [ ] Bun adapter implementation
- [ ] Deno adapter implementation
- [ ] Edge runtime adapter
- [ ] Cross-runtime test harness
- [ ] Benchmark suite

### Medium Priority

- [ ] Body parser middleware
- [ ] Cookie middleware
- [ ] Compression middleware
- [ ] Session management
- [ ] File upload handling

### Low Priority / Nice to Have

- [ ] WebSocket support
- [ ] GraphQL integration
- [ ] OpenAPI/Swagger generation
- [ ] Request validation (Zod integration)
- [ ] Template engine adapters

## Questions?

- Open a GitHub Discussion
- Check existing issues
- Read the documentation

Thank you for contributing to CurisJS! 🚀
