# Contributing to OpenCode Plugin Template

Thank you for your interest in contributing! This document provides guidelines for contributing to this template.

## How to Contribute

### Reporting Issues

- Use the GitHub issue tracker
- Check if the issue already exists
- Provide clear reproduction steps
- Include relevant environment information

### Suggesting Enhancements

- Open an issue with the "enhancement" label
- Describe the use case clearly
- Explain why this would be useful
- Provide examples if possible

### Pull Requests

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/my-feature`)
3. Make your changes
4. Run tests and linting
5. Commit with conventional commits format
6. Push to your fork
7. Open a pull request

## Development Setup

### Prerequisites

- [Bun](https://bun.sh/) >= 1.0.0
- Git

### Getting Started

```bash
# Clone your fork
git clone https://github.com/YOUR_USERNAME/opencode-plugin-template.git
cd opencode-plugin-template

# Install dependencies
bun install

# Set up git hooks
bun run prepare
```

## Code Style

### Naming Conventions

- **Files**: Use `kebab-case.ts` for TypeScript files
- **Components**: Use `PascalCase.tsx` for TSX files
- **Directories**: Use `kebab-case`
- **Variables/Functions**: Use `camelCase`
- **Types/Interfaces**: Use `PascalCase`
- **Constants**: Use `UPPER_SNAKE_CASE`

### TypeScript

- Use TypeScript for all new code
- Provide proper type definitions
- Avoid `any` when possible
- Export types that might be useful to users

### Code Formatting

- Code will be checked by pre-commit hooks
- Use consistent indentation (2 spaces)
- Add blank lines between logical sections
- Keep lines under 100 characters when reasonable

## Commit Messages

We use [Conventional Commits](https://www.conventionalcommits.org/):

```
type(scope): subject

body

footer
```

### Types

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `perf`: Performance improvements
- `test`: Test changes
- `chore`: Build process or auxiliary tool changes
- `ci`: CI configuration changes

### Examples

```
feat(tools): add custom validation tool

Adds a new tool for validating file contents against schemas.

Closes #123
```

```
fix(hooks): prevent race condition in tool.execute.before

Previously, concurrent tool executions could cause state corruption.
Now using proper async locking.
```

## Testing

### Running Tests

```bash
# Run all tests
bun test

# Run specific test file
bun test hooks.test.ts

# Run with coverage
bun test --coverage
```

### Writing Tests

- Add tests for new features
- Update tests when changing functionality
- Test edge cases and error conditions
- Use descriptive test names

## Documentation

### README

- Keep README up to date
- Add examples for new features
- Update table of contents if needed

### Code Comments

- Add JSDoc comments for public APIs
- Explain complex logic
- Don't comment obvious code
- Keep comments up to date

### BEST_PRACTICES.md

- Add guidelines for new patterns
- Include examples
- Update when adding new features

## Pull Request Process

1. **Update Documentation**: Ensure README and other docs are updated
2. **Add Tests**: Include tests for new functionality
3. **Run Linting**: Ensure `bun run lint` passes
4. **Check Build**: Ensure `bun run build` succeeds
5. **Update CHANGELOG**: Add entry for your changes
6. **Describe Changes**: Write a clear PR description
7. **Link Issues**: Reference related issues

### PR Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
How was this tested?

## Checklist
- [ ] Tests pass
- [ ] Linting passes
- [ ] Documentation updated
- [ ] CHANGELOG updated
```

## Code Review

### For Reviewers

- Be respectful and constructive
- Focus on code quality and functionality
- Suggest improvements
- Approve when ready

### For Contributors

- Address feedback promptly
- Ask questions if unclear
- Update PR based on feedback
- Be patient during review

## Release Process

Maintainers will:

1. Review and merge PRs
2. Update version using `bun run version:bump`
3. Update CHANGELOG
4. Create git tag
5. Publish to npm (if applicable)

## Questions?

- Open an issue for questions
- Check existing documentation first
- Be specific about your question

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

## Code of Conduct

- Be respectful and inclusive
- Welcome newcomers
- Focus on constructive feedback
- Help others learn and grow
- Report unacceptable behavior

Thank you for contributing! 🎉
