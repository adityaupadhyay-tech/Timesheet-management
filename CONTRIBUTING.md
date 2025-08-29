# Contributing to TikTikTow

Thank you for your interest in contributing to TikTikTow! This document provides guidelines and information for contributors.

## Development Workflow

### 1. Fork and Clone
1. Fork the repository on GitHub
2. Clone your fork locally:
   ```bash
   git clone https://github.com/YOUR_USERNAME/TikTikTow.git
   cd TikTikTow
   ```

### 2. Set up Remote
```bash
git remote add upstream https://github.com/adityaupadhyay-tech/TikTikTow.git
```

### 3. Create Feature Branch
```bash
git checkout -b feature/your-feature-name
```

### 4. Make Changes
- Write your code
- Follow the coding standards
- Add tests if applicable
- Update documentation

### 5. Commit Changes
```bash
git add .
git commit -m "feat: add new feature description"
```

### 6. Push and Create PR
```bash
git push origin feature/your-feature-name
```
Then create a Pull Request on GitHub.

## Branch Naming Convention

- `feature/` - New features
- `bugfix/` - Bug fixes
- `hotfix/` - Critical fixes
- `docs/` - Documentation updates
- `refactor/` - Code refactoring

## Commit Message Format

We follow [Conventional Commits](https://www.conventionalcommits.org/):

```
type(scope): description

[optional body]

[optional footer]
```

Types:
- `feat` - New feature
- `fix` - Bug fix
- `docs` - Documentation
- `style` - Formatting
- `refactor` - Code refactoring
- `test` - Adding tests
- `chore` - Maintenance

## Code Standards

- Use TypeScript for all new code
- Follow ESLint rules
- Write meaningful commit messages
- Add comments for complex logic
- Keep functions small and focused

## Testing

- Write tests for new features
- Ensure all tests pass before submitting PR
- Update tests when modifying existing code

## Pull Request Process

1. Ensure your code follows the project standards
2. Update documentation if needed
3. Add tests for new functionality
4. Ensure all CI checks pass
5. Request review from maintainers
6. Address review comments
7. Merge only after approval

## Getting Help

- Open an issue for bugs or feature requests
- Join our discussions for questions
- Check existing issues before creating new ones

Thank you for contributing! 🚀
