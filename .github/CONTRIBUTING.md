# Contributing to School Management System

First off, thank you for considering contributing to School Management System! 🎉

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [How to Contribute](#how-to-contribute)
- [Pull Request Process](#pull-request-process)
- [Coding Standards](#coding-standards)
- [Commit Guidelines](#commit-guidelines)

## 📜 Code of Conduct

This project and everyone participating in it is governed by our Code of Conduct. By participating, you are expected to uphold this code.

## 🚀 Getting Started

1. Fork the repository
2. Clone your fork locally
3. Set up the development environment (see below)
4. Create a new branch for your feature/fix
5. Make your changes
6. Submit a pull request

## 💻 Development Setup

### Prerequisites

- PHP 8.3+
- Composer 2.x
- Node.js 22+
- npm (version 10+)

### Installation

```bash
# Clone your fork
git clone https://github.com/YOUR_USERNAME/schoolmanagement.git
cd schoolmanagement

# Install PHP dependencies
composer install

# Install Node dependencies
npm install

# Copy environment file
cp .env.example .env

# Generate application key
php artisan key:generate

# Run migrations
php artisan migrate

# Start development server
composer dev
```

## 🤝 How to Contribute

### Reporting Bugs

- Check if the bug has already been reported in Issues
- If not, create a new issue using the Bug Report template
- Include as much detail as possible

### Suggesting Features

- Check if the feature has already been requested
- Create a new issue using the Feature Request template
- Explain the use case and benefits

### Code Contributions

1. Pick an issue to work on (or create one)
2. Comment on the issue to let others know you're working on it
3. Fork and clone the repository
4. Create a feature branch
5. Make your changes
6. Write/update tests if applicable
7. Submit a pull request

## 📤 Pull Request Process

1. Ensure your code follows the project's coding standards
2. Update the README.md if needed
3. Update the IMPLEMENTATION_CHECKLIST.md if you've completed a feature
4. Make sure all tests pass
5. Request review from maintainers

## 📏 Coding Standards

### PHP (Backend)

- Follow PSR-12 coding standard
- Use Laravel Pint for formatting: `./vendor/bin/pint`
- Write meaningful comments for complex logic
- Use type hints and return types

### TypeScript/React (Frontend)

- Follow the existing code style
- Use TypeScript for type safety
- Use functional components with hooks
- Run ESLint before committing

### Database

- Use descriptive migration names
- Include rollback (down) methods
- Add appropriate indexes

## 📝 Commit Guidelines

We follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

### Types

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `perf`: Performance improvements
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

### Examples

```
feat(student): add student profile page
fix(attendance): resolve date calculation bug
docs(readme): update installation instructions
```

## 🏷️ Versioning

We use [Semantic Versioning](https://semver.org/):

- MAJOR version for incompatible API changes
- MINOR version for new features (backwards compatible)
- PATCH version for bug fixes (backwards compatible)

### 🚀 Release Process

To create a new release and trigger the deployment workflow:

1. **Update Version**: Update any relevant version strings if applicable.
2. **Commit Changes**: Ensure all work is committed to `main`.
3. **Draft Release Notes**: Ensure commits follow the [Conventional Commits](#commit-guidelines) spec so release notes are categorized correctly.
4. **Create Tag**:
   ```bash
   git tag -a v0.1.0 -m "Release v0.1.0"
   ```
5. **Push Tag**:
   ```bash
   git push origin v0.1.0
   ```
   *This will automatically trigger the GitHub Action to build assets and create a GitHub Release.*

## 📞 Need Help?

- Check the [README.md](README.md) for documentation
- Review the [IMPLEMENTATION_CHECKLIST.md](IMPLEMENTATION_CHECKLIST.md) for project status
- Open an issue for questions

---

Thank you for contributing! 🙏
