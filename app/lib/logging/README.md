# Logging System

## Overview
This directory provides a unified, extensible logging system for both frontend (React) and backend (Node.js) in this project. It supports:
- Consistent log levels and types
- Identity/context extraction and sanitization
- Extensible notification adapters (Slack, Teams, Discord, custom)
- Secure handling of sensitive data
- Unit-testable utilities

## Usage

### Backend
```ts
import logger from './logger.server';

await logger.info(identity, 'User logged in', { action: 'login' });
await logger.error(identity, 'Something failed', { error: err });
```

### Frontend
```ts
import { useLogger } from './useLogger';
const logger = useLogger();
logger.info(identity, 'User clicked button', { button: 'save' });
```

## Extending with Adapters
```ts
import { registerAdapter } from './loggerAdapters';
registerAdapter(async (log) => {
  // Send log to custom endpoint
});
```

## Security
- Sensitive fields (email, token, password, etc.) are automatically redacted from logs and notifications.

## Testing
- Utilities for identity extraction and sanitization are unit-testable.

## Improvements
- Unified types and utilities for FE/BE
- Dynamic adapter registration
- Log sanitization
- Improved error handling
- Usage documentation 