# Contributing to CurisJS

Thank you for your interest in contributing to CurisJS! This document provides guidelines for contributing.

## Code of Conduct

Be respectful and inclusive. We want CurisJS to be a welcoming community for everyone.

## How to Contribute

### Reporting Bugs

- Use the GitHub issue tracker
- Include a clear title and description
- Provide code examples and steps to reproduce
- Include system information (OS, Node.js version, etc.)

### Suggesting Features

- Open a GitHub issue with the "feature request" label
- Clearly describe the feature and its use case
- Explain why this feature would be useful

### Pull Requests

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Write or update tests
5. Run the test suite (`pnpm test`)
6. Commit your changes (`git commit -m 'Add amazing feature'`)
7. Push to your branch (`git push origin feature/amazing-feature`)
8. Open a Pull Request

## Development Setup

```bash
# Clone the repository
git clone https://github.com/Ameriq8/curisjs.git
cd curisjs

# Install dependencies
pnpm install

# Run tests
pnpm test

# Build all packages
pnpm build

# Run dev mode
pnpm dev
```

## Project Structure

```
curisjs/
├── packages/
│   ├── core/          # Core framework
│   ├── db/            # Database ORM
│   └── cli/           # CLI tools
├── docs/              # Documentation
├── examples/          # Example applications
└── template/          # Project templates
```

## Coding Guidelines

### TypeScript

- Use TypeScript for all code
- Enable strict mode
- Provide type annotations for public APIs
- Avoid `any` types

### Code Style

- Use Prettier for formatting
- Follow existing code patterns
- Write descriptive variable names
- Add comments for complex logic

### Testing

- Write tests for new features
- Maintain test coverage above 80%
- Use descriptive test names
- Test edge cases

### Commits

- Use conventional commits format
- Keep commits focused and atomic
- Write clear commit messages

Example:
```
feat(core): add rate limiting middleware
fix(db): resolve transaction rollback issue
docs(cli): update command examples
```

## Testing

```bash
# Run all tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Run tests with coverage
pnpm test:coverage

# Test specific package
pnpm --filter @curisjs/core test
```

## Documentation

- Update documentation for new features
- Include code examples
- Update the changelog
- Add JSDoc comments for public APIs

## Questions?

Feel free to open a GitHub issue with your question or join our community discussions.

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
