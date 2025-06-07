# Environment Configuration

This document describes how environment variables are managed and validated in the project.

## Environment Variables

The project uses Zod for runtime validation of environment variables, ensuring type safety and required values. The validation happens at application startup through the `init()` function in `env.server.ts`.

### Required Environment Variables

```typescript
const schema = z.object({
  NODE_ENV: z.enum(["production", "development", "test"] as const),
  DATABASE_URL: z.string(),
  BETTER_AUTH_URL: z.string(),
  BETTER_AUTH_SECRET: z.string(),
  GOOGLE_CLIENT_ID: z.string(),
  GOOGLE_CLIENT_SECRET: z.string(),
});
```

## Validation

Environment variables are validated using Zod schemas to ensure type safety and required values. The validation happens at application startup through the `init()` function.

### Type Safety

The project uses TypeScript to ensure type safety of environment variables:

```typescript
declare global {
  namespace NodeJS {
    interface ProcessEnv extends z.infer<typeof schema> {}
  }
}
```

This provides full type checking and autocompletion for environment variables throughout the application.

## Client-Side Access

Environment variables that need to be accessible in the frontend are handled through a controlled process:

1. Only explicitly allowed variables are exposed to the client
2. Variables are passed through the root loader
3. They are injected into the client via a script tag with proper security measures

### Implementation

The `getEnv()` function in `env.server.ts` controls which environment variables are exposed to the client:

```typescript
export function getEnv() {
  return {
    MODE: process.env.NODE_ENV,
  };
}
```

These variables are then made available to the client through the root loader and injected into the window object:

```typescript
// In root.tsx
<script
  nonce={nonce}
  dangerouslySetInnerHTML={{
    __html: `window.ENV = ${JSON.stringify(ENV)}`,
  }}
/>
```

### Type Safety for Client-Side

The client-side environment variables are also typed:

```typescript
type ENV = ReturnType<typeof getEnv>;

declare global {
  let ENV: ENV;
  interface Window {
    ENV: ENV;
  }
}
```

## Security Considerations

- Only non-sensitive variables are exposed to the client
- The `getEnv()` function explicitly controls which variables are available
- Script injection uses a nonce for additional security
- Environment validation happens at application startup

## Best Practices

1. Always use the `getEnv()` function to expose variables to the client
2. Keep sensitive variables server-side only
3. Use TypeScript for type safety
4. Validate all environment variables at startup
5. Use meaningful variable names
6. Document all required variables
