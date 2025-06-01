# A secure react router starter

## Tech stack

- **React 19** with **React Router v7**
- **TypeScript** for type safety
- **Vite** as the build tool
- **pnpm** as the package manager
- **Prisma** as the ORM with PostgreSQL
- **TailwindCSS** for styling
- **Radix UI** for UI components
- **better-auth** for authentication
- **casl** for permissions
- **Vitest** for testing

## Architecture

The application follows a feature-based architecture:

- `/app/features` contains feature modules:

  - `admin` - Admin dashboard with user management
  - `auth` - Authentication flows
  - `dashboard` - Main application dashboard
  - `marketing` - Public-facing pages
  - `organization` - Organization management
  - `products` - Product management

- `/app/components` contains reusable UI components
- `/app/lib` contains utility functions and services
- `/app/hooks` contains custom React hooks

The application implements multi-organization support with role-based permissions.

## Commands to get started

### Development

```bash
# Install dependencies
pnpm install

# Generate Prisma client
pnpm prisma:generate

# Run database migrations
pnpm prisma:migrate

# Start development server
pnpm dev

# Open Prisma Studio (database UI)
pnpm prisma:studio
```

### Testing and Type Checking

```bash
# Run tests
pnpm test

# Type check the application
pnpm typecheck
```

### Building and Deployment

```bash
# Build for production
pnpm build

# Start production server
pnpm start
```

### Code Formatting

```bash
# Format code with Prettier
pnpm format
```

## User Account Protection

- **Account Lifecycle Management**

  - Account creation with verification
  - Account deletion with confirmation
  - Email change verification

- **Admin Account Controls**
  - Ban/unban functionality
  - Temporary account suspension with expiration dates
  - User role management
  - Account deletion by administrators
  - User impersonation
  - Manage user sessions (revoke all or specific sessions)

## Organization Security

- **Multi-organization Support**

  - Organization membership verification
  - Organization-specific access controls
  - Role-based permissions within organizations

- **Organization Access Flow**

  - Secure organization selection
  - Automatic organization assignment when appropriate
  - Access verification for organization resources

## Authentication

The app uses `better-auth` with:

- **Multiple Authentication Methods**

  - Email/password authentication with validation
  - Google OAuth integration
  - Session-based authentication with secure tokens

- **Password Security**

  - Password validation with minimum requirements
  - Secure password storage in database
  - Password reset functionality with secure tokens and email verification

- **Email Verification**

  - Required email verification for new accounts
  - Secure verification tokens with expiration
  - Email change verification for existing accounts

## Session Management

- **Secure Session Handling**

  - Session tracking with IP address and user agent
  - Session expiration with token timeouts
  - Session tokens stored securely with proper database models

- **Session Control**
  - Admin ability to view and revoke sessions
  - Automatic session revocation on password reset
  - Session impersonation tracking for admin actions

## Authorization

- **Role-Based Access Control (RBAC)**

  - Uses CASL for centralized permission management
  - Role-based policies defined in `permissions.server.ts`
  - Different permission levels for regular users vs admins

- **Server-Side Authorization**
  - `ensureCan` function to verify permissions on server actions
  - Explicit permission checks before sensitive operations

```ts
import { ensureCan } from "~/lib/permissions.server";

ensureCan(session.user, "create", "Organization");
```

- **Client-Side Authorization**
  - `Can` component to conditionally render UI elements based on permissions
  - Authorization context provider for consistent security across components

```tsx
import { Can } from "~/components/providers/permission.provider";

<Can I="create" a="Organization">
  <Button>Create Organization</Button>
</Can>;
```

## Data Protection

- **Input Validation**

  - Form validation with Zod schema
  - Type safety through TypeScript
  - Validation before server operations

- **XSS Protection**
  - React's built-in content escaping
  - Proper input handling in forms
  - Type safety to prevent injection attacks

## Security Features

- **Secure Cookie Configuration**

  - `secure: true` - Ensures cookies are only sent over HTTPS
  - `httpOnly: true` - Prevents JavaScript access to cookies
  - `sameSite: "strict"` - Prevents CSRF attacks
  - `partitioned: true` - Provides additional cookie isolation
  - Production vs development cookie security configurations

- **Content Security Policy (CSP)**
  - CSP header with nonce
  - NOTE: CSP nonce is not used for styles

## What still needs to be added

- Better-auth
  - Social Google
    - Access token and refresh token encryption
  - [ ] 2fa
  - [ ] Magic link
  - [ ] Email OTP
  - [ ] Passkey
  - [ ] Captcha
- Security
  - [x] CSP
    - [x] CSP header
    - [x] CSP nonce
    - [ ] Trusted types
    - [ ] Reporting
  - [ ] Additional security headers
  - [ ] CSRF
  - [ ] Rate limiting
    - Better auth includes rate limiting https://www.better-auth.com/docs/concepts/rate-limit
  - [ ] Honey pot
  - [ ] OWASP ASVS checklist
  - [ ] Sanitization/Serialization
- Usability
  - [ ] Breadcrumbs
- Dev experience
  - [ ] Dev tools
    - https://react-router-devtools.forge42.dev/
  - [ ] Env variables evaluation
    - https://dane.computer/blogs/type-safe-environment-variables-in-remix

Known bugs

- [ ] When logging in with google, the user is not redirected to the dashboard
