# Contributing to Spider-Man Store Micro Frontend

Thank you for your interest in contributing to this project! This guide will help you understand our development process and how to contribute effectively.

## 🚀 Quick Start

1. **Fork and Clone**
   ```bash
   git clone https://github.com/your-username/micro-frontend-nextjs.git
   cd micro-frontend-nextjs
   ```

2. **Install Dependencies**
   ```bash
   pnpm install
   ```

3. **Start Development**
   ```bash
   pnpm dev
   ```

4. **Run Tests**
   ```bash
   pnpm test
   pnpm test:e2e
   ```

## 📋 Development Workflow

### Branch Strategy
- `main` - Production-ready code
- `develop` - Integration branch for features
- `feature/*` - New features
- `fix/*` - Bug fixes
- `docs/*` - Documentation updates

### Commit Convention
We follow [Conventional Commits](https://www.conventionalcommits.org/):

```bash
type(scope): description

# Examples:
feat(host): add user authentication
fix(cart): resolve quantity update bug
docs(readme): improve installation guide
test(products): add ProductCard component tests
```

**Types:**
- `feat` - New features
- `fix` - Bug fixes
- `docs` - Documentation
- `test` - Tests
- `refactor` - Code refactoring
- `perf` - Performance improvements
- `chore` - Maintenance tasks

### Code Standards

#### TypeScript
- Use strict TypeScript configuration
- Define interfaces for all data structures
- Use proper type annotations for function parameters and return values
- Avoid `any` type - use proper typing instead

#### React/Next.js
- Use functional components with hooks
- Implement proper error boundaries
- Use Next.js Image component for images
- Follow React best practices for performance

#### Module Federation
- Each micro frontend must be independently deployable
- Minimize shared dependencies
- Use proper error handling for remote loading failures
- Test each micro frontend in isolation

#### Testing
- Write unit tests for all new components and utilities
- Achieve minimum 80% test coverage for new code
- Include integration tests for critical user flows
- Use descriptive test names that explain the behavior

## 🛠️ Development Guidelines

### Adding New Features

1. **Create Feature Branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Develop with Tests**
   - Write tests first (TDD approach recommended)
   - Ensure all existing tests pass
   - Add new tests for your feature

3. **Code Review Checklist**
   - [ ] Code follows project conventions
   - [ ] Tests written and passing
   - [ ] Documentation updated
   - [ ] No console.log statements
   - [ ] Proper TypeScript types
   - [ ] Performance considerations addressed

### Adding New Micro Frontend

1. **Create Application Structure**
   ```bash
   mkdir apps/remote-new-feature
   cd apps/remote-new-feature
   # Set up Next.js with Module Federation
   ```

2. **Update Configuration**
   - Add to `pnpm-workspace.yaml`
   - Configure Module Federation in `next.config.js`
   - Update host app to consume new remote
   - Add TypeScript declarations

3. **Documentation**
   - Update README.md
   - Add architectural diagrams if needed
   - Document API contracts
   - Include usage examples

### Code Review Process

1. **Automated Checks**
   - TypeScript compilation
   - ESLint rules
   - Unit tests
   - E2E tests
   - Build process

2. **Manual Review**
   - Code quality and patterns
   - Architecture adherence
   - Performance implications
   - Security considerations
   - Documentation quality

3. **Review Criteria**
   - ✅ Functionality works as expected
   - ✅ Code is readable and maintainable
   - ✅ Tests provide adequate coverage
   - ✅ No breaking changes (or properly documented)
   - ✅ Performance impact is acceptable

## 🧪 Testing Guidelines

### Unit Tests
- Test individual components in isolation
- Mock external dependencies
- Focus on component behavior, not implementation
- Use descriptive test names

```typescript
// Good test name
test('should add product to cart when add button is clicked')

// Bad test name  
test('cart test')
```

### Integration Tests
- Test interaction between micro frontends
- Verify Module Federation loading
- Test cross-application state management
- Include error scenarios

### E2E Tests
- Test complete user journeys
- Cover critical business flows
- Include various browser scenarios
- Test responsive design

## 📚 Documentation Standards

### Code Documentation
- Use JSDoc for functions and classes
- Document complex algorithms or business logic
- Include examples for public APIs
- Keep comments up-to-date with code changes

### README Updates
- Update feature lists
- Include new setup instructions
- Add architectural changes
- Update technology stack information

### API Documentation
- Document all exposed components from remotes
- Include props and their types
- Provide usage examples
- Document error handling

## 🐛 Bug Reports

### Before Submitting
1. Check existing issues
2. Try to reproduce the bug
3. Test in different browsers/environments
4. Gather relevant information

### Bug Report Template
```markdown
## Bug Description
Clear description of the bug

## Steps to Reproduce
1. Step one
2. Step two
3. Step three

## Expected Behavior
What should happen

## Actual Behavior
What actually happens

## Environment
- Browser: Chrome 91.0
- OS: macOS 11.4
- Node.js: 18.15.0
- PNPM: 8.6.0

## Additional Context
Screenshots, logs, etc.
```

## 💡 Feature Requests

### Before Submitting
1. Check if feature exists
2. Consider if it fits project scope
3. Think about implementation complexity
4. Consider alternative solutions

### Feature Request Template
```markdown
## Feature Description
Clear description of the proposed feature

## Use Case
Why is this feature needed?

## Proposed Solution
How should this feature work?

## Alternatives Considered
Other ways to achieve the same goal

## Additional Context
Mockups, examples, references
```

## 🤝 Getting Help

- **Questions**: Use GitHub Discussions
- **Bugs**: Create GitHub Issues
- **Security**: Email maintainers privately
- **General Help**: Check documentation first

## 📄 License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

Thank you for contributing to the future of micro frontends! 🚀