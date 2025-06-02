# Authentication

In this project we use `better-auth` for authentication.
https://www.better-auth.com/

## Overview

The authentication system is built with security as a top priority, implementing several layers of protection:

1. Secure cookie management
2. Email verification requirements
3. Password security measures
4. Session security
5. OAuth integration

> **Note**: For information about organization features and management, please refer to the [Organization Documentation](./organization.md).
> For information about admin features and impersonation, please refer to the [Admin Documentation](./admin.md).

## Server-Side Configuration

The main configuration is located in `app/lib/auth.ts`. This file handles all server-side authentication settings.

### Basic Configuration

```ts
const options = {
  emailAndPassword: {
    enabled: true,
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    },
  },
};
```

### Email Verification

Email verification is required for new accounts. The system will automatically send verification emails:

```ts
const options = {
  emailAndPassword: {
    requireEmailVerification: true,
  },
  emailVerification: {
    sendOnSignUp: true,
    sendVerificationEmail: async ({ user, url, token }) => {
      console.log("Sending verification email to", user.email);
    },
  },
};
```

### User Account Management

Users can change their email and delete their account, both requiring email verification:

```ts
const options = {
  user: {
    changeEmail: {
      enabled: true,
      sendChangeEmailVerification: async ({ user, url, token }) => {
        console.log("Sending change email verification email to", user.email);
      },
    },
    deleteUser: {
      enabled: true,
      sendDeleteAccountVerification: async ({ user, url, token }) => {
        console.log("Sending delete account verification email to", user.email);
      },
    },
  },
};
```

### Security Features

The authentication system implements several security measures:

1. **Cookie Security**:

   - Secure cookies in production
   - HttpOnly flag to prevent JavaScript access
   - SameSite=strict to prevent CSRF attacks
   - Partitioned cookies for additional isolation

2. **Password Security**:

   - Required email verification
   - Secure password reset functionality
   - Account deletion verification

3. **Session Security**:

   - IP and User Agent tracking
   - Session revocation on password reset

4. **OAuth Security**:
   - Google OAuth integration
   - Secure credential management via environment variables

## Client-Side Configuration

The client-side configuration is in `app/lib/auth-client.ts`. This file provides the interface for interacting with the authentication server.

```ts
import { createAuthClient } from "better-auth/react";
import { adminClient, customSessionClient, organizationClient } from "better-auth/client/plugins";

export const authClient = createAuthClient({
  plugins: [customSessionClient<typeof auth>(), adminClient(), organizationClient()],
});
```

## Session Management

Sessions are managed using secure cookies with a carefully configured setup to maximize security. Here's a detailed breakdown of the configuration:

```ts
advanced: {
  cookiePrefix: "my-ba",
  useSecureCookies: false,
  defaultCookieAttributes: {
    secure: true,
    httpOnly: true,
    sameSite: "strict",
    partitioned: true,
    prefix: process.env.NODE_ENV === "development" ? undefined : "host",
  },
}
```

### Cookie Security Configuration Explained

1. **Cookie Prefix (`cookiePrefix: "my-ba"`)**

   - Custom prefix to identify our application's cookies
   - Helps prevent cookie name collisions with other applications
   - Makes it easier to identify and manage our authentication cookies

2. **Secure Cookies (`useSecureCookies: false`)**

   - We disable the default `__secure-` prefix to implement our own more secure configuration
   - This allows us to use the `__host-` prefix in production which provides stronger security guarantees

3. **Cookie Attributes**
   - `secure: true`: Ensures cookies are only sent over HTTPS connections
   - `httpOnly: true`: Prevents JavaScript access to cookies, protecting against XSS attacks
   - `sameSite: "strict"`: Prevents the cookie from being sent in cross-site requests, protecting against CSRF attacks
   - `partitioned: true`: Enables cookie partitioning, providing additional isolation between different contexts
   - `prefix: "host"`: In production, uses the `__host-` prefix which:
     - Ensures cookies are only sent to the exact host that set them
     - Prevents subdomain attacks
     - Provides stronger security than the standard `__secure-` prefix

### Development vs Production

The configuration automatically adjusts based on the environment:

```ts
prefix: process.env.NODE_ENV === "development" ? undefined : "host";
```

- **Development**:

  - No `__host-` prefix is used
  - Allows local development without HTTPS
  - Still maintains other security features like `httpOnly` and `sameSite`

- **Production**:
  - Uses the `__host-` prefix
  - Requires HTTPS
  - Implements all security features
  - Provides maximum protection against various attacks

> **Important Note**: In development mode, the `__host-` prefix is disabled as it requires HTTPS. In production, all security features are enabled.

## Type Safety

The system is fully typed, providing type safety for sessions and authentication state:

```ts
export type Session = typeof auth.$Infer.Session;
```
