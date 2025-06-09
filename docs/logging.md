# Logging System

This project uses a unified logging system for both backend and frontend, designed for extensibility, observability, and ease of use.

## Folder Structure

All logging infrastructure is located in `/app/lib/logging/`:
- `logger.server.ts` (backend logger)
- `useLogger.ts` (frontend logger hook)
- `loggerAdapters/` (notification adapters for Slack, Teams, Discord, custom)

## Backend Logging

- **Library:** [pino](https://getpino.io/)
- **Location:** `/app/lib/logging/logger.server.ts`
- **Log Levels:**
  - `debug`
  - `info`
  - `notice`
  - `warning`
  - `error`
  - `critical`
  - `emergency`
- **Output:**
  - Console (pretty-printed)
  - File: `logs/app.log` (structured JSON)
- **Configuration:**
  - Log level is set via the `LOG_LEVEL` environment variable (see `docs/environment.md`).
  - Log format is structured and suitable for integration with tools like Grafana or ELK stack.
- **Identity Required:**
  - Every log must include an `identity` parameter, which must be one of:
    - The Identity object returned by `getUserInformation` (see `identity.server.ts`)
    - The string `'public'` (for anonymous/public logs)
    - The string `'system'` (for system-level logs)
  - The logger will extract and log the most useful fields (userId, email, organization, role, etc.).
- **Extensibility:**
  - Easily add new transports (e.g., Sentry, LogRocket, remote APIs) by extending the pino configuration or adding adapters in `/app/lib/logging/loggerAdapters/`.
  - **Dynamic Adapter Registration:** You can register custom adapters at runtime to send logs to additional destinations.

### Usage Example (Backend)
```ts
import logger from "@/lib/logging/logger.server";
import { getUserInformation } from "@/lib/identity.server";

const identity = await getUserInformation(request); // or 'system' or 'public'
await logger.error(identity, "Something failed", { details: "..." });
await logger.error("public", "Anonymous error", { ... });
await logger.critical("system", "Critical system issue!", { ... });
```

---

## Frontend Logging

- **Location:** `/app/lib/logging/useLogger.ts`
- **API:** React hook (`useLogger`)
- **Log Levels:** Same as backend
- **Output:**
  - Browser console (structured JSON)
- **Environment Awareness:**
  - Logs are only output in non-production environments.
- **Identity Required:**
  - Every log must include an `identity` parameter, which must be one of:
    - The Identity object returned by your auth/session context (see backend example)
    - The string `'public'` (for anonymous/public logs)
    - The string `'system'` (for system-level logs)
  - The logger will extract and log the most useful fields (userId, email, organization, role, etc.).
- **Extensibility:**
  - The hook is designed to be easily extended to send logs to remote services in the future.
  - **Dynamic Adapter Registration:** You can register adapters to send logs to custom endpoints or services.

### Usage Example (Frontend)
```tsx
import { useLogger } from "@/lib/logging/useLogger";

const logger = useLogger();
const identity = { user: { id: "userId123", email: "user@example.com" }, organization: { id: "org1", role: "admin" } };
logger.info(identity, "Button clicked", { button: "save" });
logger.error("public", "API call failed", { error });
```

---

## Registering Adapters (Backend & Frontend)

You can extend the logging system by registering custom adapters. This allows you to send logs to services like Slack, Teams, Discord, or any custom endpoint.

```ts
import { registerAdapter } from "@/lib/logging/loggerAdapters";

registerAdapter(async (log) => {
  // Send log to custom endpoint or service
});
```

Adapters can be registered at runtime and will receive every log entry, allowing for flexible integrations.

---

## Security: Redacting Sensitive Data

Sensitive fields (such as email, token, password, etc.) are automatically redacted from logs and notifications. This ensures that no sensitive information is leaked through logs, even when using adapters or external integrations.

---

## Unit-Testable Utilities

Utilities for identity extraction and sanitization are designed to be unit-testable, making it easy to verify correct behavior and ensure security best practices are followed.

---

## Adding New Log Transports or Integrations

### Backend
- To add a new log destination (e.g., Sentry, HTTP API), add an adapter in `/app/lib/logging/loggerAdapters/` and include it in your setup.
- See [pino documentation](https://getpino.io/#/docs/transports) for details.

### Frontend
- Extend the `useLogger` hook to send logs to a remote endpoint or 3rd-party service as needed.

---

## Environment Variable

- `LOG_LEVEL` (optional): Sets the minimum log level for backend logging. See `docs/environment.md` for details.

---

## Best Practices
- Use structured logging (always provide a message, identity parameter, and context object).
- Set appropriate log levels for different events.
- Never log sensitive information.
- Use the logger everywhere instead of `console.log` or `console.error` directly.

---

For questions or to extend the logging system, see `/app/lib/logging/logger.server.ts` and `/app/lib/logging/useLogger.ts` or contact the maintainers. 