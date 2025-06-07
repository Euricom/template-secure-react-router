# Development Tools

This document outlines the development tools and setup used in the project.

## Biome

[Biome](https://biomejs.dev/) is used as our all-in-one toolchain for JavaScript/TypeScript development. It provides:

- Linting
- Formatting
- Type checking
- Import sorting

### Configuration

The Biome configuration is located in `biome.json` at the root of the project. Key features:

- Strict TypeScript checking
- Consistent code formatting
- Import sorting and organization
- React-specific rules

### Usage

```bash
# Format code
biome format .

# Check code
biome check .

# Format and check in one command
biome check --apply .
```

## Development Tools

### React Router DevTools

The project uses `react-router-devtools` for enhanced debugging of React Router:

- Visual representation of the router state
- Route matching visualization
- Navigation history tracking
- Route parameter inspection

The devtools are automatically enabled in development mode through the Vite configuration.

### VS Code Extensions

Recommended extensions for development:

- Biome
- TypeScript and JavaScript Language Features
- GitLens
- Error Lens

## Development Workflow

1. Install dependencies:
   ```bash
   pnpm install
   ```

2. Start development server:
   ```bash
   pnpm dev
   ```

3. Run type checking:
   ```bash
   pnpm typecheck
   ```

4. Run tests:
   ```bash
   pnpm test
   ```

## Common Issues and Solutions

### TypeScript Errors

- Ensure all dependencies are properly installed
- Run `pnpm typecheck` to identify type issues
- Check for proper type definitions in `@types` packages

### Build Issues

- Clear the `.next` directory if experiencing build issues
- Ensure all environment variables are properly set
- Check for conflicting dependencies

### Performance Issues

- Use React DevTools Profiler to identify performance bottlenecks
- Monitor bundle size using `@next/bundle-analyzer`
- Implement proper code splitting and lazy loading 