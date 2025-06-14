# Environment Configuration

This document describes how environment variables are managed and validated in the project.

## Environment Variables

The project uses Zod for runtime validation of environment variables, ensuring type safety and required values. The validation happens at application startup through the `initEnv()` function in `env.server.ts`.

### Required Environment Variables

```typescript
const envSchema = z.object({
  NODE_ENV: z.enum(["production", "development", "test"] as const),
  DATABASE_URL: z.string(),
  BETTER_AUTH_URL: z.string(),
  BETTER_AUTH_SECRET: z.string(),
  GOOGLE_CLIENT_ID: z.string(),
  GOOGLE_CLIENT_SECRET: z.string(),
});
```

### LOG_LEVEL

- **Type:** string (optional)
- **Purpose:** Sets the minimum log level for backend logging. Controls which log messages are shown in the terminal and written to the log file.
- **Possible values:** debug, info, notice, warning, error, critical, emergency
- **Default:** info

Example usage in your .env file:

```
LOG_LEVEL=debug
```

### SLACK_WEBHOOK_URL
- **Type:** string (optional)
- **Purpose:** If set, error and higher logs will be sent to this Slack webhook.
- **Example:**
```
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/XXX/YYY/ZZZ
```

### TEAMS_WEBHOOK_URL
- **Type:** string (optional)
- **Purpose:** If set, error and higher logs will be sent to this Microsoft Teams webhook.
- **Example:**
```
TEAMS_WEBHOOK_URL=https://outlook.office.com/webhook/XXX/YYY/ZZZ
```

### DISCORD_WEBHOOK_URL
- **Type:** string (optional)
- **Purpose:** If set, error and higher logs will be sent to this Discord webhook.
- **Example:**
```
DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/XXX/YYY
```

### LOG_ADAPTERS
- **Type:** string (optional)
- **Purpose:** Comma-separated list of logging adapters to enable. Controls which destinations logs are sent to.
- **Possible values:** file, slack, teams, discord, loki, prettyConsoleError
- **Default:** file,prettyConsoleError
- **Example:**
```
LOG_ADAPTERS=file,slack,teams
```

### LOKI_ENDPOINT
- **Type:** string (optional)
- **Purpose:** If set, logs will be sent to this Grafana Loki endpoint.
- **Default:** http://localhost:3100/loki/api/v1/push
- **Example:**
```
LOKI_ENDPOINT=https://loki.example.com/loki/api/v1/push
```

### LOKI_LABELS
- **Type:** string (optional, JSON)
- **Purpose:** Custom labels for logs sent to Loki, as a JSON string.
- **Default:** {"job":"app"}
- **Example:**
```
LOKI_LABELS={"job":"my-app","env":"production"}
```

## Validation

Environment variables are validated using Zod schemas to ensure type safety and required values. The validation happens at application startup through the `initEnv()` function.

### Type Safety

The project uses TypeScript to ensure type safety of environment variables:

```typescript
type ServerEnv = z.infer<typeof envSchema>;
```

This provides full type checking and autocompletion for environment variables throughout the application.

## Client-Side Access

Environment variables that need to be accessible in the frontend are handled through a controlled process:

1. Only explicitly allowed variables are exposed to the client
2. Variables are passed through the root loader
3. They are injected into the client via a script tag with proper security measures

### Implementation

The `getClientEnv()` function in `env.server.ts` controls which environment variables are exposed to the client:

```typescript
export function getClientEnv() {
  const serverEnv = getServerEnv();
  return {
    NODE_ENV: serverEnv.NODE_ENV,
  };
}
```

These variables are then made available to the client through the root loader and injected into the window object with security measures:

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
type ClientEnvVars = ReturnType<typeof getClientEnv>;

declare global {
  interface Window {
    env: ClientEnvVars;
  }
}
```

## Security Considerations

- Only non-sensitive variables are exposed to the client
- The `getClientEnv()` function explicitly controls which variables are available
- Script injection uses a nonce for additional security
- Environment validation happens at application startup
- Server-side environment variables are frozen after initialization
- Environment variables are validated at startup with detailed error messages
- Sensitive variables like database URLs and API secrets are kept server-side only

## Best Practices

1. Always use the `getClientEnv()` function to expose variables to the client
2. Keep sensitive variables server-side only
3. Use TypeScript for type safety
4. Validate all environment variables at startup
5. Use meaningful variable names
6. Document all required variables
7. Use nonces for script injection
8. Freeze environment variables after initialization
9. Provide detailed error messages for invalid environment variables
