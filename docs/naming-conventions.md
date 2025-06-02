# Naming Conventions

This document outlines the naming conventions used throughout the project to maintain consistency and readability.

## File and Directory Structure

### Routes

- Route files should follow the pattern: `{object-name}s.tsx` for list views
- CRUD operations should use:
  - `{object-name}.create.tsx` for creation
  - `{object-name}.edit.tsx` for editing
  - `{object-name}.detail.tsx` for detail views

### Components

- React components should be in PascalCase
- Component files should match their component name exactly
- Place components in appropriate directories:
  - `/app/components/ui` - shadcn UI components (do not modify)
  - `/app/components` - custom reusable components
  - `/app/features/{feature}/components` - feature-specific components

## Code Naming

### React Components

- Use PascalCase for component names (e.g., `ProductForm`, `NavUser`)
- Props interfaces should be named with the component name + "Props" (e.g., `ProductFormProps`)

### Functions and Variables

- Use camelCase for:
  - Function names (e.g., `handleSubmit`, `validateForm`)
  - Variable names (e.g., `userData`, `isLoading`)
  - Event handlers (e.g., `onClick`, `onChange`)

### Constants

- Use UPPER_SNAKE_CASE for constant values
- Use camelCase for constant objects/arrays

### TypeScript Types and Interfaces

- Use PascalCase for:
  - Type definitions (e.g., `SignupFormData`)
  - Interface names (e.g., `UserProfile`)
- Suffix interfaces with their purpose when appropriate (e.g., `Props`, `State`, `Config`)

### Schema Definitions

- Use camelCase for schema names with "Schema" suffix (e.g., `productSchema`, `signupSchema`)

## CSS and Styling

- Use kebab-case for CSS class names
- Follow Tailwind CSS naming conventions for utility classes
- Use semantic class names that describe the purpose rather than the appearance

## Best Practices

1. Be descriptive but concise
2. Avoid abbreviations unless widely understood
3. Use consistent casing within each category
4. Follow the established patterns in the codebase
5. When in doubt, follow the patterns used in existing similar components

## Examples

```typescript
// Component naming
function ProductForm() { ... }
interface ProductFormProps { ... }

// Function naming
function handleSubmit() { ... }
function validateForm() { ... }

// Variable naming
const userData = { ... }
const isLoading = true

// Schema naming
const productSchema = z.object({ ... })
const signupSchema = z.object({ ... })

// Type naming
type SignupFormData = z.infer<typeof signupSchema>
interface UserProfile { ... }
```
