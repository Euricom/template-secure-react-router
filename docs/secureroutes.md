# Secure Routes

The secure routes system provides a type-safe and secure way to handle route loaders and actions in React Router, with built-in permission checks, parameter validation, and error handling.

## Overview

The secure routes system (`app/lib/secureRoute.ts`) provides two main functions:

1. `createProtectedLoader`: For protecting route loaders
2. `createProtectedAction`: For protecting route actions

These functions wrap React Router's loader and action functions with additional security and validation layers.

## Key Features

### 1. Permission Validation

```ts
export const loader = createProtectedLoader({
  permissions: {
    action: "read",
    subject: "Organization",
  },
  function: async ({ identity }) => {
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
  formValidation: z.object({
    role: z.enum(["admin", "member", "owner"]),
  }),
  function: async ({ params, form }) => {
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

## Error Handling

The system provides comprehensive error handling:

1. **Permission Errors**

   - Throws clear error messages for unauthorized access
   - Includes user and organization context in errors

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
  permissions: {
    action: "read",
    subject: "Organization",
  },
  function: async ({ identity }) => {
    return { organization: identity.organization };
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
  function: async ({ params }) => {
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
  permissions: {
    action: "update",
    subject: "User",
  },
  formValidation: z.object({
    name: z.string().min(2),
    email: z.string().email(),
  }),
  function: async ({ form }) => {
    if (form.error) {
      return {
        success: false,
        message: form.error.message,
        fieldErrors: form.fieldErrors,
      };
    }
    await updateUser(form.data);
    return { success: true };
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

3. **Use Permission Checks**

   - Define clear permission requirements
   - Check permissions before data access
   - Include organization context

4. **Keep Functions Pure**
   - Separate validation from business logic
   - Use the provided type-safe parameters
   - Handle all edge cases
