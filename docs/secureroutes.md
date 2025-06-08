# Secure Routes

The secure routes system provides a type-safe and secure way to handle route loaders and actions in React Router, with built-in permission checks, parameter validation, and error handling.

## Overview

The secure routes system provides four main functions:

1. `createProtectedLoader`: For protecting route loaders that require authentication
2. `createPublicLoader`: For public route loaders that don't require authentication
3. `createProtectedAction`: For protecting route actions that require authentication
4. `createPublicAction`: For public route actions that don't require authentication

These functions wrap React Router's loader and action functions with additional security and validation layers.

## Key Features

### 1. Permission Validation

```ts
// Protected route with specific permissions
export const loader = createProtectedLoader({
  permissions: {
    action: "read",
    subject: "Organization",
  },
  function: async ({ identity }) => {
    // Your loader logic
  },
});

// Protected route that only requires being logged in
export const loader = createProtectedLoader({
  permissions: "loggedIn",
  function: async ({ identity }) => {
    // Your loader logic
  },
});

// Public route
export const loader = createPublicLoader({
  permissions: "public",
  function: async () => {
    // Your loader logic
  },
});
```

### 2. Parameter Validation

```ts
export const action = createProtectedAction({
  paramValidation: z.object({
    id: z.string(),
  }),
  queryValidation: z.object({
    filter: z.string().optional(),
  }),
  formValidation: z.object({
    role: z.enum(["admin", "member", "owner"]),
  }),
  function: async ({ params, query, form }) => {
    // Your action logic
  },
});
```

### 3. Type Safety

The system is fully typed, providing:

- Type-safe parameters
- Type-safe form data
- Type-safe query parameters
- Type-safe permission checks
- Type-safe identity information

## Error Handling

The system provides comprehensive error handling:

1. **Permission Errors**
   - Throws clear error messages for unauthorized access
   - Includes user and organization context in errors
   - Handles both public and protected routes appropriately

2. **Validation Errors**
   - Parameter validation errors
   - Query parameter validation errors
   - Form data validation errors with field-level details

3. **Type Errors**
   - Compile-time type checking
   - Runtime type validation

## Usage Examples

### Basic Protected Route

```ts
export const loader = createProtectedLoader({
  permissions: "loggedIn",
  function: async ({ identity }) => {
    return { user: identity.user };
  },
});
```

### Route with Parameter Validation

```ts
export const loader = createProtectedLoader({
  permissions: {
    action: "read",
    subject: "User",
  },
  paramValidation: z.object({
    userId: z.string(),
  }),
  queryValidation: z.object({
    include: z.string().optional(),
  }),
  function: async ({ params, query }) => {
    if (params.error) {
      throw new Response(params.error.message, { status: 400 });
    }
    return { user: await getUser(params.data.userId) };
  },
});
```

### Form Submission with Validation

```ts
export const action = createProtectedAction({
  permissions: "loggedIn",
  formValidation: z.object({
    name: z.string().min(2),
    email: z.string().email(),
  }),
  function: async ({ form, identity }) => {
    if (form.error) {
      return {
        success: false,
        message: form.error.message,
        fieldErrors: form.fieldErrors,
      };
    }
    await updateUser(identity.user.id, form.data);
    return { success: true };
  },
});
```

### Public Route Example

```ts
export const loader = createPublicLoader({
  permissions: "public",
  function: async () => {
    return { publicData: await getPublicData() };
  },
});
```

## Best Practices

1. **Always Use Type Validation**
   - Define schemas for all parameters
   - Use Zod for runtime validation
   - Leverage TypeScript for compile-time checking

2. **Handle All Error Cases**
   - Check for validation errors
   - Provide meaningful error messages
   - Include field-level errors for forms

3. **Use Appropriate Permission Level**
   - Use "public" for truly public routes
   - Use "loggedIn" for routes that only require authentication
   - Use specific permission checks for fine-grained access control

4. **Keep Functions Pure**
   - Separate validation from business logic
   - Use the provided type-safe parameters
   - Handle all edge cases
